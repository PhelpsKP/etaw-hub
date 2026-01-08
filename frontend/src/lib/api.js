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
    // Read body once as text to avoid "body already consumed" error
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error(JSON.stringify(errorData));
    } catch (e) {
      // If not valid JSON, use text directly
      if (e instanceof SyntaxError) {
        throw new Error(`API Error ${response.status}: ${text}`);
      }
      throw e;
    }
  }
  return response.json();
}
