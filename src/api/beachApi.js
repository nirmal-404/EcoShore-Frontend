import API from '@/api/index.js';

export const getBeaches = async () => {
  const response = await API.get('/beaches');
  return response.data;
};
