import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:4000/api/chat';
const AUTH_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Groups
export const createChatGroup = async (groupData) => {
  const response = await axios.post(`${BASE_URL}/groups`, groupData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const addMemberToGroup = async (groupId, userId) => {
  const response = await axios.post(
    `${BASE_URL}/groups/${groupId}/members`,
    { userId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const response = await axios.delete(
    `${BASE_URL}/groups/${groupId}/members/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getUserChatGroups = async () => {
  const response = await axios.get(`${BASE_URL}/groups`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getChatGroupById = async (groupId) => {
  const response = await axios.get(`${BASE_URL}/groups/${groupId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Fetch all volunteers and organizers for the group member picker.
 * Calls GET /api/chat/users?roles=volunteer,organizer (organizer/admin only).
 * Returns: { volunteers: [{_id, name, email, role}], organizers: [{_id, name, email, role}] }
 */
export const getUsersByRole = async () => {
  const response = await axios.get(`${BASE_URL}/users`, {
    params: { roles: 'volunteer,organizer' },
    headers: getAuthHeaders(),
  });

  const allUsers = response.data?.data || [];
  return {
    volunteers: allUsers.filter((u) => u.role === 'volunteer'),
    organizers: allUsers.filter((u) => u.role === 'organizer'),
  };
};

/**
 * Fetch all users for direct messaging.
 * Calls GET /api/auth/users (excludes current user).
 * Returns: [{_id, name, email, role}]
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${AUTH_URL}/auth/users`, {
      headers: getAuthHeaders(),
    });
    console.log('getAllUsers response:', response);
    return response.data?.data || [];
  } catch (error) {
    console.error(
      'getAllUsers error:',
      error.response?.status,
      error.response?.data,
      error.message
    );
    throw error;
  }
};

// Messages
export const getMessages = async (groupId, params = {}) => {
  const response = await axios.get(`${BASE_URL}/groups/${groupId}/messages`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const sendMessage = async (groupId, text) => {
  const response = await axios.post(
    `${BASE_URL}/groups/${groupId}/messages`,
    { text },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const markMessageSeen = async (groupId, messageId) => {
  const response = await axios.patch(
    `${BASE_URL}/groups/${groupId}/messages/${messageId}/seen`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};
