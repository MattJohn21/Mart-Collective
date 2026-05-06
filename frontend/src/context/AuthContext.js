import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const savedUser  = localStorage.getItem('mc_user');
    const savedPerms = localStorage.getItem('mc_permissions');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPerms));
    }
    setLoading(false);
  }, []);

  const login = (user, permissions) => {
    setUser(user);
    setPermissions(permissions);
  };

  const logout = () => {
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
