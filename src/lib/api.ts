import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Get CSRF cookie before login
export async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie');
}

// ── Auth ──
export const auth = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/admin/auth/logout'),
  me: () => api.get('/api/admin/auth/me'),
};

// ── Dashboard ──
export const dashboard = {
  stats: () => api.get('/api/admin/dashboard'),
};

// ── Properties ──
export const properties = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/properties', { params }),
  get: (id: number) => api.get(`/api/admin/properties/${id}`),
  create: (data: FormData) =>
    api.post('/api/admin/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) => {
    data.append('_method', 'PUT');
    return api.post(`/api/admin/properties/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/api/admin/properties/${id}`),
  toggleVisibility: (id: number) =>
    api.patch(`/api/admin/properties/${id}/toggle-visibility`),
  toggleFeatured: (id: number) =>
    api.patch(`/api/admin/properties/${id}/toggle-featured`),
  uploadImages: (id: number, data: FormData) =>
    api.post(`/api/admin/properties/${id}/images`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (id: number, imageId: number) =>
    api.delete(`/api/admin/properties/${id}/images/${imageId}`),
};

// ── Formations ──
export const formations = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/formations', { params }),
  get: (id: number) => api.get(`/api/admin/formations/${id}`),
  create: (data: FormData) =>
    api.post('/api/admin/formations', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) => {
    data.append('_method', 'PUT');
    return api.post(`/api/admin/formations/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/api/admin/formations/${id}`),
};

// ── Blog ──
export const blog = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/blog', { params }),
  get: (id: number) => api.get(`/api/admin/blog/${id}`),
  create: (data: FormData) =>
    api.post('/api/admin/blog', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) => {
    data.append('_method', 'PUT');
    return api.post(`/api/admin/blog/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/api/admin/blog/${id}`),
};

// ── Testimonials ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

export const testimonials = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/testimonials', { params }),
  get: (id: number) => api.get(`/api/admin/testimonials/${id}`),
  create: (data: AnyData) =>
    api.post('/api/admin/testimonials', data),
  update: (id: number, data: AnyData) =>
    api.put(`/api/admin/testimonials/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/testimonials/${id}`),
};

// ── Navigation ──
export const navigation = {
  list: () => api.get('/api/admin/navigation'),
  get: (id: number) => api.get(`/api/admin/navigation/${id}`),
  create: (data: AnyData) =>
    api.post('/api/admin/navigation', data),
  update: (id: number, data: AnyData) =>
    api.put(`/api/admin/navigation/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/navigation/${id}`),
  reorder: (items: { id: number; sort_order: number }[]) =>
    api.post('/api/admin/navigation/reorder', { items }),
};

// ── Contact Settings ──
export const contactSettings = {
  get: () => api.get('/api/admin/contact-settings'),
  update: (data: AnyData) =>
    api.put('/api/admin/contact-settings', data),
};

// ── Contact Messages ──
export const contactMessages = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/contact-messages', { params }),
  get: (id: number) => api.get(`/api/admin/contact-messages/${id}`),
  markAsRead: (id: number) =>
    api.patch(`/api/admin/contact-messages/${id}/read`),
  delete: (id: number) => api.delete(`/api/admin/contact-messages/${id}`),
};

// ── Users ──
export const users = {
  list: (params?: Record<string, string | number>) =>
    api.get('/api/admin/users', { params }),
  get: (id: number) => api.get(`/api/admin/users/${id}`),
  create: (data: AnyData) =>
    api.post('/api/admin/users', data),
  update: (id: number, data: AnyData) =>
    api.put(`/api/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/users/${id}`),
  toggleActive: (id: number) =>
    api.patch(`/api/admin/users/${id}/toggle-active`),
};

export default api;
