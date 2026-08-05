import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import useSWR, { mutate } from 'swr';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Stale-While-Revalidate: Initialize immediately from localStorage cache for 0ms startup
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('truster_lab_token');
      const saved = localStorage.getItem('truster_lab_user');
      return (token && saved) ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('truster_lab_token');
    const saved = localStorage.getItem('truster_lab_user');
    // If we already have cached profile & token, loading is instantly false!
    return !!(token && !saved);
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('truster_lab_token');

  // Background revalidation of user profile without blocking the UI
  useSWR(
    token ? '/auth/api/auth/profile/' : null,
    async (url) => await apiClient.get(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 15000,
      onSuccess: (data) => {
        if (data && typeof data === 'object') {
          setUser(data);
          localStorage.setItem('truster_lab_user', JSON.stringify(data));
        }
        setLoading(false);
      },
      onError: (error) => {
        console.error('Failed to validate profile in background:', error);
        if (error?.message && error.message.includes('Unauthorized')) {
          logout();
        }
        setLoading(false);
      }
    }
  );

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get('/auth/api/auth/profile/');
      setUser(data);
      localStorage.setItem('truster_lab_user', JSON.stringify(data));
      mutate('/auth/api/auth/profile/', data, false);
      return data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await apiClient.post('/auth/api/auth/login/', credentials);
    localStorage.setItem('truster_lab_token', data.access);
    localStorage.setItem('truster_lab_refresh', data.refresh);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('truster_lab_user', JSON.stringify(data.user));
      mutate('/auth/api/auth/profile/', data.user, false);
      setLoading(false);
      return data.user;
    }
    return await fetchProfile();
  };

  const updateProfile = async (formData) => {
    const isFormData = formData instanceof FormData;
    
    // Optimistic UI update for JSON updates before server confirms
    if (!isFormData && typeof formData === 'object' && user) {
      const optimisticUser = { ...user, ...formData };
      setUser(optimisticUser);
      localStorage.setItem('truster_lab_user', JSON.stringify(optimisticUser));
      mutate('/auth/api/auth/profile/', optimisticUser, false);
    }

    const token = localStorage.getItem('truster_lab_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${apiClient.baseURL || 'http://localhost:8000'}/auth/api/auth/profile/`, {
      method: 'PATCH',
      headers,
      body: isFormData ? formData : JSON.stringify(formData)
    });
    
    if (!response.ok) {
      // Revert optimistic update on failure
      mutate('/auth/api/auth/profile/');
      throw new Error('Failed to update profile');
    }
    
    const data = await response.json();
    setUser(data);
    localStorage.setItem('truster_lab_user', JSON.stringify(data));
    mutate('/auth/api/auth/profile/', data, false);
    return data;
  };

  const registerLearner = async (userData) => {
    const payload = { ...userData, username: userData.email };
    await apiClient.post('/auth/api/auth/register/learner/', payload);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truster_lab_user');
    localStorage.removeItem('truster_lab_token');
    localStorage.removeItem('truster_lab_refresh');
    mutate('/auth/api/auth/profile/', null, false);
    navigate('/');
  };

  // Django backend uses user_type
  const isInstructor = user?.user_type === 'instructor' || user?.user_type === 'admin';
  const isAdmin = user?.user_type === 'admin' || user?.is_superuser;

  const googleLogin = async (credential) => {
    const data = await apiClient.post('/auth/api/auth/google/', { token: credential });
    localStorage.setItem('truster_lab_token', data.access);
    localStorage.setItem('truster_lab_refresh', data.refresh);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('truster_lab_user', JSON.stringify(data.user));
      mutate('/auth/api/auth/profile/', data.user, false);
      setLoading(false);
      return data.user;
    }
    return await fetchProfile();
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      isInstructor,
      isAdmin,
      login, 
      googleLogin,
      registerLearner,
      updateProfile,
      logout,
      isProfileOpen,
      setIsProfileOpen,
      toggleProfile
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
