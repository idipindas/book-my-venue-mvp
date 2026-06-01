import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Let the browser set Content-Type + boundary for multipart requests
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Dynamically get token to avoid stale closure
  const stored = localStorage.getItem('bmv-auth');
  if (stored) {
    try {
      const state = JSON.parse(stored) as { state?: { accessToken?: string } };
      const token = state?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const stored = localStorage.getItem('bmv-auth');
        const refreshToken = stored
          ? (JSON.parse(stored) as { state?: { refreshToken?: string } })?.state?.refreshToken
          : null;

        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          // Update localStorage directly so subsequent requests pick it up
          const parsed = JSON.parse(stored!) as { state: Record<string, unknown> };
          parsed.state.accessToken = data.data.accessToken;
          parsed.state.refreshToken = data.data.refreshToken;
          localStorage.setItem('bmv-auth', JSON.stringify(parsed));

          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('bmv-auth');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
