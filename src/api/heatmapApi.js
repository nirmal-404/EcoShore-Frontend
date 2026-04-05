import API from '@/api/index.js';

export const getHeatmapData = async () => {
  const response = await API.get('/heatmap');
  return response.data; // Expected { success: true, data: { heatmap: { predictions: [], ... } } }
};

export const getBeachPrediction = async (beachId) => {
  const response = await API.get(`/heatmap/${beachId}`);
  return response.data;
};

export const refreshHeatmap = async () => {
  const response = await API.post('/heatmap/refresh');
  return response.data;
};
