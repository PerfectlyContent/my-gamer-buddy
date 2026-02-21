import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to all requests
api.interceptors.request.use((config) => {
  const sessionId = getOrCreateSessionId();
  config.headers['x-session-id'] = sessionId;
  return config;
});

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('gamer-buddy-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('gamer-buddy-session-id', sessionId);
  }
  return sessionId;
}

// API methods
export const gamesApi = {
  list: () => api.get('/games').then((r) => r.data),
};

export const conversationsApi = {
  list: () => api.get('/conversations').then((r) => r.data),
  create: (gameId?: string) =>
    api.post('/conversations', { game_id: gameId }).then((r) => r.data),
  get: (id: string) => api.get(`/conversations/${id}`).then((r) => r.data),
  delete: (id: string) => api.delete(`/conversations/${id}`).then((r) => r.data),
};

export const messagesApi = {
  list: (conversationId: string) =>
    api.get(`/conversations/${conversationId}/messages`).then((r) => r.data),
  send: (conversationId: string, message: string, image?: File) => {
    if (image) {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('image', image);
      return api
        .post(`/conversations/${conversationId}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    }
    return api
      .post(`/conversations/${conversationId}/messages`, { message })
      .then((r) => r.data);
  },
};

export const cheatCodesApi = {
  list: (slug: string, params?: { category?: string; platform?: string }) =>
    api.get(`/games/${slug}/cheat-codes`, { params }).then((r) => r.data),
};

export const mapsApi = {
  listMaps: (slug: string) => api.get(`/games/${slug}/maps`).then((r) => r.data),
  getMarkers: (mapId: string, type?: string) =>
    api.get(`/maps/${mapId}/markers`, { params: { type } }).then((r) => r.data),
};

export const questsApi = {
  list: (slug: string, category?: string) =>
    api.get(`/games/${slug}/quests`, { params: { category } }).then((r) => r.data),
  getProgress: (slug: string) =>
    api.get(`/games/${slug}/quest-progress`).then((r) => r.data),
  updateProgress: (questId: string, data: { completed?: boolean; notes?: string }) =>
    api.post(`/quests/${questId}/progress`, data).then((r) => r.data),
};

export default api;
