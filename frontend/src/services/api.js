import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${API_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User
export const fetchUserStats = () => api.get('/user/stats');
export const saveLocation = (locationData) => api.post('/location/save', locationData);
export const fetchSavedLocations = () => api.get('/location/list');
export const deleteLocation = (id) => api.delete(`/location/${id}`);

// Auth
export const register = (userData) => api.post('/auth/register', userData);
export const login = (userData) => api.post('/auth/login', userData);
export const googleAuth = (token) => api.post('/auth/google', { token });

// Chat & AI
export const sendChatMessage = (messages) => api.post('/chat', { messages });
export const generateMedicalReport = (report) => 
  api.post('/chat/generate-report', { report }, { responseType: 'blob' });
export const saveMedicalReport = (report) => api.post('/chat/save-report', { report });

// Emergency
export const createEmergencyReport = (payload) => api.post('/emergency/create-report', payload);

// Hospitals
export const hospitalLogin = (credentials) => api.post('/hospital/login', credentials);
export const fetchHospitalReports = () => api.get('/hospital/reports');
export const respondToEmergency = (payload) => api.post('/hospital/respond', payload);

// Pharmacies
export const fetchNearestPharmacies = (lat, lng) => 
  api.get(`/pharmacies/nearest?latitude=${lat}&longitude=${lng}`);

export default api;
