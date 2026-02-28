const runtimeEnv = /** @type {Record<string, string | undefined>} */ ((/** @type {any} */ (import.meta)).env || {});

const configuredBaseUrl = (runtimeEnv.VITE_BACKEND_BASE_URL || '').trim().replace(/\/+$/, '');

function getDefaultBackendBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  const hostname = window.location.hostname;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isLocalHost) {
    return 'http://localhost:3001';
  }

  // In deployed frontend (Vercel/other static host), use same-origin /api
  // and let hosting rewrites/proxy route to backend service.
  return '';
}

export const BACKEND_BASE_URL = configuredBaseUrl || getDefaultBackendBaseUrl();
