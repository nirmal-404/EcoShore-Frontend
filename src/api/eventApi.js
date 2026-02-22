import API from '@/api/index.js';

export const getEvents = async () => {
  const response = await API.get('/events');
  return response.data;
};
