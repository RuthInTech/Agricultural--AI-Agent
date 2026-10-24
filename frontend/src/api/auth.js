import API from './axios';

export const loginUser = async (identifier, password) => {
  const response = await API.post('/auth/login/', {
    identifier,
    username: identifier,
    password,
  });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register/', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me/');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);

    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]));
      return {
        username: payload.username || 'User',
        email: payload.email || '',
      };
    }
  } catch {
    return null;
  }
  return null;
};
