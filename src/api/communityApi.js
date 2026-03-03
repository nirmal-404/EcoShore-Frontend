import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:4000/api/community';

const getAuthHeaders = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Posts
export const getPosts = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/posts`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axios.get(`${BASE_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createPost = async (postData, files = []) => {
  const formData = new FormData();
  formData.append('text', postData.text || '');
  if (postData.visibility) formData.append('visibility', postData.visibility);

  // Attach actual image files under the field name 'images' (multer expects this)
  files.forEach((file) => formData.append('images', file));

  const response = await axios.post(`${BASE_URL}/posts`, formData, {
    headers: {
      ...getAuthHeaders(),
      // Let browser/axios set Content-Type with the correct multipart boundary
    },
  });
  return response.data;
};

export const updatePost = async (id, postData) => {
  const response = await axios.patch(`${BASE_URL}/posts/${id}`, postData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Comments
export const getComments = async (postId, params = {}) => {
  const response = await axios.get(`${BASE_URL}/posts/${postId}/comments`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createComment = async (postId, commentData) => {
  const response = await axios.post(
    `${BASE_URL}/posts/${postId}/comments`,
    commentData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Interactions
export const likePost = async (id) => {
  const response = await axios.post(
    `${BASE_URL}/posts/${id}/like`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const unlikePost = async (id) => {
  const response = await axios.delete(`${BASE_URL}/posts/${id}/like`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const sharePost = async (id) => {
  const response = await axios.post(
    `${BASE_URL}/posts/${id}/share`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Generic delete (post or comment based on ID)
export const deleteContent = async (id) => {
  const response = await axios.delete(`${BASE_URL}/content/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
