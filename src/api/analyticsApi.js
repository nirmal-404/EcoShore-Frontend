import API from '@/api/index.js';

export const getDashboardOverview = async () => {
  const response = await API.get('/analytics/dashboard');
  return response.data; // Expected { success: true, data: { dashboard: { summary: {...}, ... } } }
};

export const getWasteByPlasticType = async () => {
  const response = await API.get('/waste-records/analytics/plastic-type');
  return response.data; // Expected { success: true, data: { plasticTypeData: [...] } }
};
