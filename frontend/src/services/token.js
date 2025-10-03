// services/token.js
const TOKEN = 'auth_token';

export const getToken = () => localStorage.getItem(TOKEN);
export const setToken = (token) => localStorage.setItem(TOKEN, token);
export const removeToken = () => localStorage.removeItem(TOKEN);
export const hasToken = () => !!getToken();
