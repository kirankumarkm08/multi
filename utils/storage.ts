import { deleteCookie, getCookie, setCookie } from 'cookies-next';

const AUTH_TOKEN_KEY = 'customer_token';
const USER_DATA_KEY = 'customer_data';

export const AuthStorage = {
  setAuth: (token: string, user: any) => {
    setCookie(AUTH_TOKEN_KEY, token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }
  },

  getAuth: () => {
    const token = getCookie(AUTH_TOKEN_KEY);
    let user = null;
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (e) {
          console.error('Error parsing user data', e);
        }
      }
    }
    return { token, user };
  },

  isAuthenticated: () => {
    const token = getCookie(AUTH_TOKEN_KEY);
    return !!token;
  },

  clearAuth: () => {
    deleteCookie(AUTH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_DATA_KEY);
    }
  },
  
  getToken: () => {
    return getCookie(AUTH_TOKEN_KEY);
  }
};
