import API from './axios';

export const getFarms = async () => {
  const response = await API.get('/farms/');
  return response.data;
};

export const createFarm = async (farmData) => {
  const response = await API.post('/farms/', farmData);
  return response.data;
};

export const updateFarm = async (farmId, farmData) => {
  const response = await API.put(`/farms/${farmId}/`, farmData);
  return response.data;
};
