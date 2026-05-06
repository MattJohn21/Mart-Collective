import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('medcore_token');
    const savedUser = localStorage.getItem('medcore_user');
    const savedPerms = localStorage.getItem('medcore_permissions');
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPerms));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user, permissions } = res.data;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('medcore_token', token);
    localStorage.setItem('medcore_user', JSON.stringify(user));
    localStorage.setItem('medcore_permissions', JSON.stringify(permissions));
    setUser(user);
    setPermissions(permissions);
    return user;
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('medcore_token');
    localStorage.removeItem('medcore_user');
    localStorage.removeItem('medcore_permissions');
    setUser(null);
    setPermissions(null);
  };

  // Check if current user can access a module
  const canAccess = (module) => permissions?.modules?.includes(module) || false;

  // Check if current user has a specific permission on a module
  const hasPermission = (module, permission) =>
    permissions?.[module]?.includes(permission) || false;

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, canAccess, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
