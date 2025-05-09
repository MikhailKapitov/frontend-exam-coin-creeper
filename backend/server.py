import json
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer

users = {}

def parse_token(token):
    try:
        email = base64.b64decode(token).decode()
        if email in users:
            return email
    except Exception:
        pass
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
            pwd = data.get('password')
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
                }
            }
            token = base64.b64encode(email.encode()).decode()
            self._set_headers(200)
            self.wfile.write(json.dumps({"token": token}).encode())

        elif self.path == '/login':
            email = data.get('email')
            pwd = data.get('password')
            if not isinstance(email, str) or not isinstance(pwd, str):
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid email or password"}).encode())
                return
            if email not in users or users[email]['password'] != pwd:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode())
                return
            token = base64.b64encode(email.encode()).decode()
            self._set_headers(200)
            self.wfile.write(json.dumps({"token": token}).encode())

        elif self.path == '/data':
            auth = self.headers.get('Authorization', '')
            if not auth.startswith("Bearer "):
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "No token"}).encode())
                return
            email = parse_token(auth.split(" ",1)[1])
            if not email:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid token"}).encode())
                return
            # overwrite entire user data
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
            email = parse_token(auth.split(" ",1)[1])
            if not email:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid token"}).encode())
                return
            # return full user data
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
