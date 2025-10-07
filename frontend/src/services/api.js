import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const ML_SERVICE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
};

// Job APIs
export const jobAPI = {
  list: (params) => api.get('/jobs/', { params }),
  create: (data) => api.post('/jobs/', data),
  get: (id) => api.get(`/jobs/${id}/`),
  update: (id, data) => api.patch(`/jobs/${id}/`, data),
  delete: (id) => api.delete(`/jobs/${id}/`),
};


 // Candidate APIs
export const candidateAPI = {
  list: (params) => api.get('/candidates/', { params }),
  get: (id) => api.get(`/candidates/${id}/`),
  update: (id, data) => api.patch(`/candidates/${id}/`, data),
};

// Resume APIs
export const resumeAPI = {
  list: () => api.get('/resumes/'),
  upload: (formData) => api.post('/resumes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get: (id) => api.get(`/resumes/${id}/`),
  findMatches: (id) => api.post(`/resumes/${id}/find_matches/`),
};

// Match APIs
export const matchAPI = {
  list: (params) => api.get('/matches/', { params }),
  get: (id) => api.get(`/matches/${id}/`),
  updateStatus: (id, status) => api.patch(`/matches/${id}/`, { status }),
};

export default api;