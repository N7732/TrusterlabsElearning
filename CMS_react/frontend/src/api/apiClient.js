const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let headers = {
      ...options.headers,
    };

    // Only set application/json if we are not sending FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const token = localStorage.getItem('truster_lab_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (Token Expiration or Invalid Token)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('truster_lab_refresh');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseURL}/auth/api/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('truster_lab_token', data.access);
            
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${data.access}`;
            response = await fetch(url, { ...options, headers });
          } else {
            // Refresh failed, user needs to login again
            this.forceLogout();
            throw new Error('Session expired. Please log in again.');
          }
        } catch (error) {
          this.forceLogout();
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        // No refresh token available, force logout
        this.forceLogout();
        throw new Error('Unauthorized. Please log in.');
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    // Check if the response is JSON or empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  forceLogout() {
    localStorage.removeItem('truster_lab_token');
    localStorage.removeItem('truster_lab_refresh');
    localStorage.removeItem('truster_lab_user');
    window.location.href = '/login';
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, { 
      method: 'POST', 
      headers, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  }

  put(endpoint, body, headers = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, { 
      method: 'PUT', 
      headers, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  }

  patch(endpoint, body, headers = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, { 
      method: 'PATCH', 
      headers, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new APIClient(BASE_URL);

export const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
  if (path.startsWith('http')) return path;
  
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};
