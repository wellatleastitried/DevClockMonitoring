import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

let currentUsername = null;

export const setUsername = (username) => {
  currentUsername = username;
};

axios.interceptors.request.use((config) => {
  if (currentUsername) {
    config.headers['X-Username'] = currentUsername;
  }
  return config;
});

export const projectService = {
  getAllProjects: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/projects`);
    return response.data;
  },

  getProject: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData, username) => {
    setUsername(username);
    const response = await axios.post(`${API_BASE_URL}/api/projects`, projectData);
    return response.data;
  },

  deleteProject: async (id, username) => {
    setUsername(username);
    const response = await axios.delete(`${API_BASE_URL}/api/projects/${id}`);
    return response.data;
  },

  startDevTimer: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/api/projects/${id}/toggle-dev`);
    return response.data;
  },

  startWaitTimer: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/api/projects/${id}/toggle-wait`);
    return response.data;
  },

  stopTimer: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/api/projects/${id}/stop`);
    return response.data;
  },

  updateActiveProjects: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/projects/update-active`);
    return response.data;
  },

  getCurrentTimes: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/projects/current-times`);
    return response.data;
  },

  assignProject: async (projectId, username) => {
    const response = await axios.put(`${API_BASE_URL}/api/projects/${projectId}/assign`, {
      username: username
    });
    return response.data;
  },

  assignProjectToAll: async (projectId) => {
    const response = await axios.put(`${API_BASE_URL}/api/projects/${projectId}/assign-all`);
    return response.data;
  },

  unassignProject: async (projectId) => {
    const response = await axios.put(`${API_BASE_URL}/api/projects/${projectId}/unassign`);
    return response.data;
  },

  getProjectTimeline: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/timeline`);
    return response.data;
  }
};

export const userService = {
  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/users`);
    return response.data;
  },

  getUser: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/api/users/${username}`);
    return response.data;
  },

  getCurrentUser: async (username) => {
    setUsername(username);
    const response = await axios.get(`${API_BASE_URL}/api/users/current`);
    return response.data;
  },

  getAvailableUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/users/available`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
    return response.data;
  }
};
