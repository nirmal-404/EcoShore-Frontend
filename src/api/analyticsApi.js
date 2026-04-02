import API from '@/api/index.js';

export const getDashboardOverview = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await API.get(`/analytics/dashboard?${params.toString()}`);
  return response.data; // Expected { success: true, data: { dashboard: { summary: {...}, ... } } }
};

export const getWasteByPlasticType = async () => {
  const response = await API.get('/waste-records/analytics/plastic-type');
  return response.data; // Expected { success: true, data: { plasticTypeData: [...] } }
};

export const getCarbonOffsetSummary = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await API.get(
    `/analytics/carbon-offset?${params.toString()}`
  );
  return response.data;
};

export const getSeverityRanking = async (limit = 10) => {
  const response = await API.get(`/analytics/severity-ranking?limit=${limit}`);
  return response.data;
};

export const getTrendPrediction = async (beachId, months = 3) => {
  const params = new URLSearchParams({ months });
  if (beachId) params.append('beachId', beachId);
  const response = await API.get(
    `/analytics/trend-prediction?${params.toString()}`
  );
  return response.data;
};

export const exportAnalyticsJSON = async (startDate, endDate, beachId) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (beachId) params.append('beachId', beachId);
  const response = await API.get(`/analytics/export/json?${params.toString()}`);
  return response.data;
};

export const exportAnalyticsCSV = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await API.get(`/analytics/export/csv?${params.toString()}`);
  return response.data;
};

export const getMLHealth = async () => {
  try {
    const response = await fetch('http://localhost:5001/health', {
      method: 'GET',
    });
    // Just hitting the direct ML sub-service
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const recalculateSeverity = async () => {
  const response = await API.post('/analytics/severity/recalculate');
  return response.data;
};

export const recalculateCarbonOffsets = async () => {
  const response = await API.post('/analytics/carbon/recalculate');
  return response.data;
};
