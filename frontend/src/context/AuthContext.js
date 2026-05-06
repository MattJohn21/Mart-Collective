import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem('mc_token');
    const savedUser  = localStorage.getItem('mc_user');
    const savedPerms = localStorage.getItem('mc_permissions');
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPerms));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token, user, permissions } = res.data;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('mc_token', token);
    localStorage.setItem('mc_user', JSON.stringify(user));
    localStorage.setItem('mc_permissions', JSON.stringify(permissions));
    setUser(user);
    setPermissions(permissions);
    return user;
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
    localStorage.removeItem('mc_permissions');
    setUser(null);
    setPermissions(null);
  };

  const canAccess     = (module)             => permissions?.modules?.includes(module) || false;
  const hasPermission = (module, permission) => permissions?.[module]?.includes(permission) || false;

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, canAccess, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
