/**
 * lib/api.ts — Merkezi Axios İstemcisi
 *
 * Cookie-based auth (HttpOnly JWT). withCredentials: true sayesinde
 * tarayıcı cookie'yi her istekte otomatik gönderir.
 * localStorage.getItem('accessToken') artık KULLANILMAZ — XSS riski giderildi.
 */
import axios from 'axios';
import { API_BASE } from './apiBase';

export { API_BASE };

export const apiClient = axios.create({
  baseURL: API_BASE,
  // headers: { 'Content-Type': 'application/json' },  // ❌ Kaldırıldı: FormData'yı block ediyor
  timeout: 10000,
  // HttpOnly cookie'nin cross-origin gönderilmesi için şart
  withCredentials: true,
});

// ── Request Interceptor — FormData'yı detect edip Content-Type'ı kaldır ───
apiClient.interceptors.request.use(
  (config) => {
    // FormData sent — let Axios set Content-Type: multipart/form-data automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor — 401 → refresh dene, başarısızsa logout ───────────
let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;
    const isAuthEndpoint = originalReq?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalReq._retry) {
      originalReq._retry = true;

      if (isRefreshing) {
        // Eş zamanlı istekler refresh bitene kadar beklesin
        return new Promise((resolve, reject) => {
          refreshQueue.push((ok) => ok ? resolve(apiClient(originalReq)) : reject(error));
        });
      }

      isRefreshing = true;

      try {
        // Refresh token cookie'si /auth/refresh'e gönderilir (path: '/auth/refresh' ayarı ile)
        await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        // Başarılı — beklleyen istekleri serbest bırak
        refreshQueue.forEach(fn => fn(true));
        refreshQueue = [];
        return apiClient(originalReq);
      } catch {
        // Refresh başarısız → tam logout
        refreshQueue.forEach(fn => fn(false));
        refreshQueue = [];

        if (typeof window !== 'undefined') {
          void fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
            .finally(() => { window.location.href = '/?auth=expired'; });
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
