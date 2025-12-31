export const SUPERADMIN_TOKEN_KEY = 'superadmin_token';

export const setSuperAdminToken = (token) => {
  localStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
};

export const getSuperAdminToken = () => {
  return localStorage.getItem(SUPERADMIN_TOKEN_KEY) || '';
};

export const getAuthHeader = () => {
  const token = getSuperAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
