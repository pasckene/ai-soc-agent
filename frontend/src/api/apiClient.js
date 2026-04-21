import axios from 'axios';

// Use relative URLs so all requests go through Vite's dev proxy -> backend
// This avoids CORS issues and works on any host/IP
const API_BASE_URL = '/api';
const WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for tokens if they exist
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('soc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Standardizes error messages from the backend
 */
export const parseError = (err) => {
  // Network/Connection error
  if (!err.response) {
    if (err.code === 'ECONNABORTED') return "Connection timed out. Please try again.";
    return "Network error: Security backend unreachable. Please ensure the server is running.";
  }

  const { data, status } = err.response;

  // FastAPI Validation Errors (often a list of objects)
  if (data?.detail && Array.isArray(data.detail)) {
    return data.detail.map(d => {
      const field = d.loc && d.loc.length > 1 ? d.loc[1] : 'Error';
      return `${field}: ${d.msg}`;
    }).join(' | ');
  }

  // Standard API errors with 'detail' string
  if (data?.detail && typeof data.detail === 'string') {
    return data.detail;
  }

  // Fallbacks based on status code
  if (status === 401) return "Session expired or invalid credentials.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429) return "Too many requests. Please slow down.";
  if (status >= 500) return "Internal Server Error. Security team has been notified.";

  return "An unexpected error occurred. Please try again later.";
};


export const clearAlerts = async (alertIds) => {
  return apiClient.post('/alerts/clear', { alert_ids: alertIds });
};

export { API_BASE_URL, WS_BASE_URL };
export default apiClient;
