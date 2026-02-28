import React, { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'wongkhao_user';
const USERS_KEY = 'wongkhao_users';
const runtimeEnv = /** @type {Record<string, string | undefined>} */ ((/** @type {any} */ (import.meta)).env || {});
const API_HOST = (runtimeEnv.VITE_BACKEND_BASE_URL || '').replace(/\/+$/, '');
const API = API_HOST ? `${API_HOST}/api/auth` : '';

/**
 * Check if backend is available.
 * If VITE_BACKEND_BASE_URL is empty or points to localhost while running on a
 * different origin (e.g. Vercel), we use client-side auth instead.
 */
function shouldUseLocalAuth() {
  if (!API_HOST) return true;
  if (typeof window === 'undefined') return false;
  const isLocalhost = API_HOST.includes('localhost') || API_HOST.includes('127.0.0.1');
  const siteIsRemote = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
  return isLocalhost && siteIsRemote;
}

/** Simple hash for client-side password storage (NOT for production security) */
async function simpleHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;

  const login = useCallback(async (email, password) => {
    // Try backend first if available
    if (!shouldUseLocalAuth()) {
      try {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } catch (err) {
        // If it's a network error (backend unreachable), fall through to local auth
        if (!err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('ERR_FAILED')) {
          throw err;
        }
        console.warn('Backend unreachable, using local auth fallback');
      }
    }

    // Client-side auth fallback
    const users = getLocalUsers();
    const hashed = await simpleHash(password);
    const found = users.find(u => u.email === email && u.passwordHash === hashed);
    if (!found) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    const userData = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (email, password, name) => {
    // Try backend first if available
    if (!shouldUseLocalAuth()) {
      try {
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } catch (err) {
        if (!err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('ERR_FAILED')) {
          throw err;
        }
        console.warn('Backend unreachable, using local auth fallback');
      }
    }

    // Client-side auth fallback
    const users = getLocalUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('อีเมลนี้ถูกใช้แล้ว');
    }
    const hashed = await simpleHash(password);
    const newUser = {
      id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      name: name || email.split('@')[0],
      passwordHash: hashed,
    };
    users.push(newUser);
    saveLocalUsers(users);

    const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: {},
      login,
      register,
      logout,
      navigateToLogin: () => { },
      checkAppState: async () => { },
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
