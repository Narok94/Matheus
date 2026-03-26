const API_URL = ''; // Relative to the same origin

export const api = {
  async post(endpoint: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }
    return response.json();
  },

  async get(endpoint: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }
    return response.json();
  },
};
