// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const makePriorityRequest = async (method, url, options = {}) => {
  const { params, data, headers = {}, isFormData = false, timeout = 15000 } = options;

  const config = {
    params: { ...params, _t: Date.now() },
    headers,
    timeout,
  };

  if (isFormData || (data instanceof FormData)) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  try {
    let response;
    switch (method.toLowerCase()) {
      case 'get':
        response = await api.get(url, config);
        break;
      case 'post':
        response = await api.post(url, data, config);
        break;
      case 'put':
        response = await api.put(url, data, config);
        break;
      case 'patch':
        response = await api.patch(url, data, config);
        break;
      case 'delete':
        response = await api.delete(url, { ...config, data });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw error;
  }
};

export default api;