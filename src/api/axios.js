import axios from 'axios';

// Create axios instance
const api = axios.create({
  // baseURL: 'http://localhost:3000/api', // Comment out if no backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a mock adapter or interceptor for demo purposes if needed
// For this specific task, we are relying on localStorage for data persistence
// so the axios calls might be placeholders or need to be wrapped.

export default api;
