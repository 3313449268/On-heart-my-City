// API 请求封装
const API_BASE = '/api';

async function request<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '网络请求失败' }));
    throw new Error(error.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

// 城市相关 API
export const cityApi = {
  getAll: () => request('/cities'),
  getById: (id: string) => request(`/cities/${id}`),
  create: (data: any) =>
    request('/cities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/cities/${id}`, { method: 'DELETE' }),
};

// 用户相关 API
export const userApi = {
  getAll: () => request('/users'),
  getById: (id: string) => request(`/users/${id}`),
  toggleStatus: (id: string) =>
    request(`/users/${id}/toggle-status`, { method: 'PATCH' }),
  update: (id: string, data: any) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  register: (data: any) =>
    request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (phone: string) =>
    request('/users/login', { method: 'POST', body: JSON.stringify({ phone }) }),
};

// 评价相关 API
export const reviewApi = {
  getAll: () => request('/reviews'),
  getByCity: (cityId: string) => request(`/reviews/city/${cityId}`),
  getByUser: (userId: string) => request(`/reviews/user/${userId}`),
  create: (data: any) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) =>
    request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  update: (id: string, data: any) =>
    request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/reviews/${id}`, { method: 'DELETE' }),
};

// 公告相关 API
export const announcementApi = {
  getAll: () => request('/announcements'),
  getActive: () => request('/announcements/active'),
  create: (data: any) =>
    request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleActive: (id: string) =>
    request(`/announcements/${id}/toggle-active`, { method: 'PATCH' }),
  delete: (id: string) =>
    request(`/announcements/${id}`, { method: 'DELETE' }),
};

// 管理员相关 API
export const adminApi = {
  login: (username: string, password: string) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getDashboard: () => request('/admin/dashboard'),
  // 笔记管理
  listNotes: (params: {
    keyword?: string;
    status?: 'all' | 'approved' | 'pending';
    cityId?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.status) search.set('status', params.status);
    if (params.cityId) search.set('cityId', params.cityId);
    if (params.page) search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    const qs = search.toString();
    return request(`/admin/notes${qs ? `?${qs}` : ''}`);
  },
  approveNote: (id: string) =>
    request(`/admin/notes/${id}/approve`, { method: 'POST' }),
  deleteNote: (id: string) =>
    request(`/admin/notes/${id}`, { method: 'DELETE' }),
  batchDeleteNotes: (ids: string[]) =>
    request('/admin/notes/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  batchApproveNotes: (ids: string[]) =>
    request('/admin/notes/batch-approve', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// 社区笔记 API
export const noteApi = {
  list: (params: {
    cityId?: string;
    sort?: 'latest' | 'hot' | 'popular';
    page?: number;
    pageSize?: number;
    userId?: string;
  }) => {
    const search = new URLSearchParams();
    if (params.cityId) search.set('cityId', params.cityId);
    if (params.sort) search.set('sort', params.sort);
    if (params.page) search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    if (params.userId) search.set('userId', params.userId);
    const qs = search.toString();
    return request(`/notes${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string, userId?: string) =>
    request(`/notes/${id}${userId ? `?userId=${userId}` : ''}`),
  create: (data: {
    userId: string;
    username: string;
    userAvatar?: string;
    cityId: string;
    cityName: string;
    title: string;
    content: string;
    images?: string[];
  }) =>
    request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await fetch('/api/notes/upload-images', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: '图片上传失败' }));
      throw new Error(error.error || `上传失败 (${res.status})`);
    }
    const data = await res.json();
    return data.urls || [];
  },
  toggleLike: (noteId: string, userId: string) =>
    request(`/notes/${noteId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  delete: (noteId: string, userId: string) =>
    request(`/notes/${noteId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),
};

// 聊天 AI API
export const chatApi = {
  sendMessage: (
    messages: { role: 'user' | 'assistant'; content: string }[],
    cityId?: string
  ) =>
    request<{ reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, cityId }),
    }),
};

// 图片上传 API
export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: '上传失败' }));
      throw new Error(error.error || `上传失败 (${res.status})`);
    }
    const data = await res.json();
    return data.url;
  },
};
