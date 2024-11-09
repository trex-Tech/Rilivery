// src/utils/axiosConfig.js

import axios from "axios";
import { BASE_URL } from "../config";

// Create an instance of axios
const api = axios.create({
  baseURL: BASE_URL, // Replace with your API base URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add headers or modify the request here
    const token = null; // Replace with your token logic
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful response
    return response;
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Error Response:", error.response.data);
      console.error("Error Status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
