import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// F10 fix: handle token expiry — clear stale token on 401 so the UI
// doesn't keep silently failing on every admin request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear the token, don't force-redirect here so
      // customer-facing pages aren't affected.
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  },
);

export default api;
