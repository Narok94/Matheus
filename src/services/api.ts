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
    
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na API');
      } else {
        const text = await response.text();
        throw new Error(`Erro do Servidor: ${text.substring(0, 100)}...`);
      }
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
    
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na API');
      } else {
        const text = await response.text();
        throw new Error(`Erro do Servidor: ${text.substring(0, 100)}...`);
      }
    }
    return response.json();
  },
};
