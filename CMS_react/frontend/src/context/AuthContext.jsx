import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage or session for existing token/user on load
    const token = localStorage.getItem('truster_lab_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get('/auth/api/auth/profile/');
      setUser(data);
      localStorage.setItem('truster_lab_user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await apiClient.post('/auth/api/auth/login/', credentials);
    localStorage.setItem('truster_lab_token', data.access);
    localStorage.setItem('truster_lab_refresh', data.refresh);
    await fetchProfile();
  };

  const registerLearner = async (userData) => {
    await apiClient.post('/auth/api/auth/register/learner/', userData);
    // After registration, login automatically
    await login({ username: userData.email, password: userData.password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truster_lab_user');
    localStorage.removeItem('truster_lab_token');
    localStorage.removeItem('truster_lab_refresh');
  };

  // Django backend uses user_type
  const isInstructor = user?.user_type === 'instructor' || user?.user_type === 'admin';
  const isAdmin = user?.user_type === 'admin' || user?.is_superuser;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      isInstructor,
      isAdmin,
      login, 
      registerLearner,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
