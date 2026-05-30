import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api', timeout: 10000 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    if (window.location.hash !== '#/login') window.location.hash = '#/login';
  }
  return Promise.reject(error);
});

export const authAPI = { register: d => api.post('/auth/register', d), login: d => api.post('/auth/login', d), getMe: () => api.get('/auth/me'), updateProfile: d => api.put('/auth/profile', d) };
export const postsAPI = { getList: p => api.get('/posts', { params: p }), getDetail: id => api.get(`/posts/${id}`), getUserPosts: uid => api.get(`/posts/user/${uid}`), create: d => api.post('/posts', d), delete: id => api.delete(`/posts/${id}`), like: id => api.post(`/posts/${id}/like`), addComment: (id, d) => api.post(`/posts/${id}/comments`, d), deleteComment: (pid, cid) => api.delete(`/posts/${pid}/comments/${cid}`) };
export const uploadAPI = { uploadImage: fd => api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) };
export default api;
