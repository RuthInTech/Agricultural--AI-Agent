import API from './axios';

/**
 * Weather API Service — Calls the Django proxy endpoint to keep keys secure.
 */
export const getWeather = async (location = 'Addis Ababa') => {
  const response = await API.get('/weather/', {
    params: { location },
  });
  return response.data;
};
