// src/services/api.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Ensure this is the correct URL for your backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle token if you are using authentication
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Assuming token is stored in local storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
