import API from '@/api/index.js';
import Cookies from 'js-cookie';

const getAuthHeaders = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createMeeting = async (payload) => {
  const response = await API.post('/meetings/create', payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getMyMeetings = async () => {
  const response = await API.get('/meetings/my-meetings', {
    headers: getAuthHeaders(),
  });
  return response.data?.data || [];
};

export const startMeeting = async (meetingId) => {
  const response = await API.post(
    `/meetings/start/${meetingId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const endMeeting = async (meetingId) => {
  const response = await API.post(
    `/meetings/end/${meetingId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const getMeetingUsers = async () => {
  const response = await API.get('/auth/users', {
    headers: getAuthHeaders(),
  });
  return response.data?.data || [];
};
