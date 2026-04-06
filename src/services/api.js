import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

const getAuthToken = () => {
  return Cookies.get('token') || localStorage.getItem('token') || '';
};

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeCreatePostInput = (postDataOrPayload, filesArg = []) => {
  if (postDataOrPayload && typeof postDataOrPayload === 'object') {
    if (Array.isArray(postDataOrPayload.files)) {
      return {
        text: postDataOrPayload.text || '',
        files: postDataOrPayload.files,
        visibility: postDataOrPayload.visibility || 'public',
      };
    }

    return {
      text: postDataOrPayload.text || '',
      files: Array.isArray(filesArg) ? filesArg : [],
      visibility: postDataOrPayload.visibility || 'public',
    };
  }

  return {
    text: '',
    files: Array.isArray(filesArg) ? filesArg : [],
    visibility: 'public',
  };
};

export const createPost = async (postDataOrPayload, filesArg = []) => {
  const { text, files, visibility } = normalizeCreatePostInput(
    postDataOrPayload,
    filesArg
  );

  const formData = new FormData();
  formData.append('text', text || '');
  formData.append(
    'visibility',
    visibility === 'community' ? 'community' : 'public'
  );

  files.forEach((file) => {
    formData.append('media', file);
  });

  const response = await apiClient.post('/posts/create', formData);
  return response.data;
};

export const getPosts = async ({ page = 1, limit = 10, visibility } = {}) => {
  const params = { page, limit };

  if (visibility) {
    params.visibility = visibility;
  }

  const response = await apiClient.get('/posts', {
    params,
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await apiClient.post(`/posts/${postId}/like`);
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}/like`);
  return response.data;
};

export const createComment = async (postId, payload) => {
  const response = await apiClient.post(`/posts/${postId}/comments`, payload);
  return response.data;
};

export const getComments = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}/comments`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
};

export const updatePost = async (postId, payload) => {
  const response = await apiClient.patch(`/posts/${postId}`, payload);
  return response.data;
};

export default apiClient;
