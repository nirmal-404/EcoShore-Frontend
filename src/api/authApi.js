import API from '@/api/index.js';

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

// Register request — accepts full form data object from registerFormControls
export const registerUser = async (formData) => {
  const { name, email, phoneNumber, password } = formData;
  const response = await API.post('/auth/register', {
    name,
    email,
    phoneNumber,
    password,
    role: 'volunteer',
  });
  return response.data; // { user, token }
};

export const getMe = async () => {
  const res = await API.get('/auth/me');
  return res.data; // { user, token }
};

export const getAllUsers = async () => {
  const res = await API.get('/auth/users/all');
  return res.data; // { success, count, data }
};

export const activateUser = async (userId) => {
  const res = await API.put(`/auth/users/${userId}/activate`);
  return res.data; // { success, message, data }
};

export const deactivateUser = async (userId) => {
  const res = await API.put(`/auth/users/${userId}/deactivate`);
  return res.data; // { success, message, data }
};

export const deleteUser = async (userId) => {
  const res = await API.delete(`/auth/users/${userId}/delete`);
  return res.data; // { success, message, data }
};
