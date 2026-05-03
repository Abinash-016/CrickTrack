import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cricktrack.onrender.com/api',
});

export default api;