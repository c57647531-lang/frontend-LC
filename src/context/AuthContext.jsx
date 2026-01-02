// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const AUTH_KEY = 'longrich_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { token, role, user: {...} }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (payload) => {
    const authData = {
      token: payload.token,
      role: payload.role,
      user: payload.superadmin || payload.admin || payload.adminSecondaire || null,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    setUser(authData);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
