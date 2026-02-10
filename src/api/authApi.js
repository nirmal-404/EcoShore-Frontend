import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Attach token automatically
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Login request
export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data; // { user, token }
};

// Register request
export const registerUser = async (email, password) => {
  // role is handled by backend default or can be sent as 'volunteer'
  const response = await API.post('/auth/register', {
    email,
    password,
    role: 'volunteer',
  });
  return response.data; // { user, token }
};

export const getMe = async () => {
  const res = await API.get('/auth/me');
  return res.data; // { user, token }
};

export default API;
