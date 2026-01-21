/**
 * API Client
 * Handles all communication with the backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout');
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Blueprint API
export const blueprintAPI = {
  generate: async (startup_idea: string, additional_context?: any) => {
    const response = await apiClient.post('/api/blueprint/generate', {
      startup_idea,
      additional_context,
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 10) => {
    const response = await apiClient.get('/api/blueprint/', {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (blueprintId: string) => {
    const response = await apiClient.get(`/api/blueprint/${blueprintId}`);
    return response.data;
  },

  delete: async (blueprintId: string) => {
    await apiClient.delete(`/api/blueprint/${blueprintId}`);
  },

  exportPDF: async (blueprintId: string) => {
    const response = await apiClient.post(
      `/api/blueprint/${blueprintId}/export/pdf`,
      {},
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportPPT: async (blueprintId: string) => {
    const response = await apiClient.post(
      `/api/blueprint/${blueprintId}/export/ppt`,
      {},
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, blueprintId?: string) => {
    const response = await apiClient.post('/api/chat/message', {
      message,
      blueprint_id: blueprintId,
    });
    return response.data;
  },

  getHistory: async (blueprintId?: string, skip = 0, limit = 50) => {
    const response = await apiClient.get('/api/chat/history', {
      params: { blueprint_id: blueprintId, skip, limit },
    });
    return response.data;
  },

  deleteMessage: async (chatId: string) => {
    await apiClient.delete(`/api/chat/history/${chatId}`);
  },

  clearHistory: async (blueprintId?: string) => {
    await apiClient.delete('/api/chat/history', {
      params: { blueprint_id: blueprintId },
    });
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
