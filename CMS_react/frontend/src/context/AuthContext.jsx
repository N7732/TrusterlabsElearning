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
      return data;
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
    return await fetchProfile();
  };

  const updateProfile = async (formData) => {
    // Determine if we need to send as FormData (for file uploads) or JSON
    const isFormData = formData instanceof FormData;
    
    // apiClient might be configured to send JSON by default. 
    // We can use standard fetch with the token if apiClient doesn't support FormData out of the box, 
    // or configure headers specifically.
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
      throw new Error('Failed to update profile');
    }
    
    const data = await response.json();
    setUser(data);
    localStorage.setItem('truster_lab_user', JSON.stringify(data));
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
  };

  // Django backend uses user_type
  const isInstructor = user?.user_type === 'instructor' || user?.user_type === 'admin';
  const isAdmin = user?.user_type === 'admin' || user?.is_superuser;

  const googleLogin = async (credential) => {
    const data = await apiClient.post('/auth/api/auth/google/', { token: credential });
    localStorage.setItem('truster_lab_token', data.access);
    localStorage.setItem('truster_lab_refresh', data.refresh);
    return await fetchProfile();
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
