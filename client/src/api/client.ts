import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = import.meta.env.BASE_URL + 'login';
    }
    return Promise.reject(error);
  }
);

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.post('/upload/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadMessageFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/upload/message', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadProjectFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/upload/project', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export default api;
