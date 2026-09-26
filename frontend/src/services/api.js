import axios from 'axios';

// Centralized API URL using Vite environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create base Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inka_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Authentication Endpoints
 */
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

/**
 * Posts CRUD Endpoints
 */
export const getPosts = () => {
  return api.get('/posts');
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const createPost = (postData) => {
  if (typeof FormData !== 'undefined' && postData instanceof FormData) {
    return api.post('/posts', postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/posts', postData);
};

export const updatePost = (id, postData) => {
  if (typeof FormData !== 'undefined' && postData instanceof FormData) {
    return api.put(`/posts/${id}`, postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.put(`/posts/${id}`, postData);
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};

export default api;
