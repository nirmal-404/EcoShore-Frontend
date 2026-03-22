import API from '@/api/index.js';

export const getActiveCarbonConfig = async () => {
  const response = await API.get('/carbon-config/active');
  return response.data; // Expected { success: true, data: { config: { ... } } }
};
