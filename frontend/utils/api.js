import axios from 'axios';
import config from './config';

const api = axios.create({
  baseURL: config.API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

export const login = (email, password) => api.post('/users/login', { email, password });
export const register = (email, password, role) => api.post('/users/register', { email, password, role });
export const getProjects = () => api.get('/projects');
export const createProject = (projectData) => api.post('/projects', projectData);
export const getProject = (id) => api.get(`/projects/${id}`);
export const startQuiz = (projectId) => api.post('/quizzes/start', { projectId });
export const submitQuiz = (quizId, answers) => api.put(`/quizzes/${quizId}/submit`, { answers });
export const getQuizResults = (quizId) => api.get(`/quizzes/${quizId}/results`);
export const getAdminAnalytics = () => api.get('/admin/analytics');

export default api;
