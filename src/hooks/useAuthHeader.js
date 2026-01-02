// src/hooks/useAuthHeader.js
import { useAuth } from '../context/AuthContext';

export const useAuthHeader = () => {
  const { user } = useAuth();
  const headers = {};
  if (user?.token) headers.Authorization = `Bearer ${user.token}`;
  return headers;
};
