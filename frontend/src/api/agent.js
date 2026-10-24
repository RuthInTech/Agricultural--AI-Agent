import API from './axios';

/**
 * Agent API Service — Directly connects to Django REST backend agent views.
 */

export const getLocations = async () => {
  const response = await API.get('/locations/');
  return response.data;
};

export const getCases = async (locationId = '') => {
  const params = locationId ? { location_id: locationId } : {};
  const response = await API.get('/cases/', { params });
  return response.data;
};

export const searchGuidance = async (query = '', crop = 'Maize') => {
  const response = await API.get('/guidance/search/', {
    params: { q: query, crop },
  });
  return response.data;
};

export const previewAdvisory = async (reportData) => {
  const response = await API.post('/advisories/preview/', reportData);
  return response.data;
};

export const confirmAdvisory = async (confirmPayload) => {
  const response = await API.post('/advisories/confirm/', confirmPayload);
  return response.data;
};

export const getSavedAdvisories = async () => {
  const response = await API.get('/advisories/');
  return response.data;
};

export const getSavedAdvisoryDetail = async (id) => {
  const response = await API.get(`/advisories/${id}/`);
  return response.data;
};
