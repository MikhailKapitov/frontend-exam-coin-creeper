import SHA256 from 'crypto-js/sha256';

export const BASE_URL = 'http://localhost:8000';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

export function register({ email, password }) {
  password = SHA256(password).toString();
  return request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function login({ email, password }) {
  password = SHA256(password).toString();
  return request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function loadData(token) {
  return request('/data', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function saveData(token, data) {
  return request('/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}
