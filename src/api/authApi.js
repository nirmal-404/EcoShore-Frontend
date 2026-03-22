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
