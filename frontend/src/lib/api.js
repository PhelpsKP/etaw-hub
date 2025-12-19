// API base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

/**
 * Make an authenticated API request
 * @param {string} path - API path (e.g., '/api/admin/sessions')
 * @param {RequestInit} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make an authenticated API request and parse JSON response
 * @param {string} path - API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequestJson(path, options = {}) {
  const response = await apiRequest(path, options);
  if (!response.ok) {
    // Try to parse backend error JSON
    try {
      const errorData = await response.json();
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error(JSON.stringify(errorData));
    } catch (e) {
      // If not JSON, fall back to text
      if (e instanceof SyntaxError) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
      }
      throw e;
    }
  }
  return response.json();
}
