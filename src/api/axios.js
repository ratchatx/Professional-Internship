import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: baseURL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a mock adapter or interceptor for demo purposes if needed
// For this specific task, we are relying on localStorage for data persistence
// so the axios calls might be placeholders or need to be wrapped.

export default api;
