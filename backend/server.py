import json
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
import jwt
import time

users = {}
SECRET_KEY = os.urandom(64)
ph = PasswordHasher()

def create_token(email):
    expiration_time = 60 * 60
    token = jwt.encode(
        {'email': email, 'exp': int(time.time()) + expiration_time},
        SECRET_KEY,
        algorithm='HS256'
    )
    return token

def parse_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        email = decoded.get('email')
        if email in users:
            return email
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    return None

class SimpleHandler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            return

        if self.path == '/register':
            email = data.get('email')
            # salt = base64.b64encode(os.urandom(48)).decode('utf-8')
            print('User sent: ', data.get('password'), sep='')
            pwd = ph.hash(data.get('password'))
            print('Gonna store: ', pwd, sep='')
            if not isinstance(email, str) or not isinstance(pwd, str):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid email or password"}).encode())
                return
            if email in users:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "User already exists"}).encode())
                return
            users[email] = {
                "password": pwd,
                "data": {
                    "balance": 0,
                    "transactions": [],
                    "tags": []
                },
                # 'salt': salt
            }
            token = create_token(email)
            self._set_headers(200)
            self.wfile.write(json.dumps({"token": token}).encode())

        elif self.path == '/login':
            email = data.get('email')
            print('User sent: ', data.get('password'), sep='')
            if email not in users:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode())
                return
            pwd = data.get('password') # + users[email]['salt']
            if not isinstance(email, str) or not isinstance(pwd, str):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid email or password"}).encode())
                return
            try:
                ph.verify(users[email]['password'], pwd)
            except VerificationError:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode())
                return
            token = create_token(email)
            self._set_headers(200)
            self.wfile.write(json.dumps({"token": token}).encode())

        elif self.path == '/data':
            auth = self.headers.get('Authorization', '')
            if not auth.startswith("Bearer "):
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "No token"}).encode())
                return

            token = auth.split(" ", 1)[1]
            email = parse_token(token)
            if not email:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid token"}).encode())
                return
            users[email]["data"] = data
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True}).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode())

    def do_GET(self):
        if self.path == '/data':
            auth = self.headers.get('Authorization', '')
            if not auth.startswith("Bearer "):
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "No token"}).encode())
                return
            token = auth.split(" ", 1)[1]
            email = parse_token(token)
            if not email:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid token"}).encode())
                return
            self._set_headers(200)
            self.wfile.write(json.dumps(users[email]["data"]).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode())

def run(port=8000):
    print(f"Backend running at http://localhost:{port}")
    HTTPServer(('localhost', port), SimpleHandler).serve_forever()

if __name__ == '__main__':
    run()
