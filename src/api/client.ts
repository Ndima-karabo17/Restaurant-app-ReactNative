import axios from 'axios';

const BASE_URL = 'https://restaurant-app-reactnative-backend.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Sending ${config.method?.toUpperCase()} to: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);