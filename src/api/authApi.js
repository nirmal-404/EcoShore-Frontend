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
  const response = await API.post('/login', { email, password });
  return response.data; // { user, token }
};

export const getMe = async () => {
  const res = await API.get('/auth/me'); // backend route
  return res.data;
};

export default API;
