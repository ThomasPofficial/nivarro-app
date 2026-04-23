import api from '../api';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

async function completeProfile(fields) {
  const { data } = await api.patch('/auth/profile', fields);
  const stored = getStoredUser();
  localStorage.setItem('user', JSON.stringify({ ...stored, profile_complete: true }));
  return data;
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

export { login, register, completeProfile, logout, getStoredUser };
