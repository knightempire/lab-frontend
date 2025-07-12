import axios from 'axios';

export async function refreshAccessToken() {
  const endpoint = `/api/refresh-token`;
  try {
    const res = await axios.post(endpoint, {}, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    // Use 'ok' property for consistency
    if (res.ok && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      return res.data.token;
    } else {
      localStorage.removeItem('token');
      window.location.href = "/auth/login";
      return null;
    }
  } catch (err) {
    localStorage.removeItem('token');
    window.location.href = "/auth/login";
    return null;
  }
}

export async function apiRequest(url, options = {}) {
  const proxyUrl = `/api${url}`;
  let token = localStorage.getItem('token');

  // Prepare axios config
  const axiosConfig = {
    url: proxyUrl,
    method: options.method || 'GET',
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    data: options.body ? JSON.parse(options.body) : undefined,
    withCredentials: true,
  };

  let res;
  try {
    res = await axios(axiosConfig);
    return {
      ok: true,
      status: res.status,
      json: async () => res.data,
      statusText: res.statusText,
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        throw new Error('Session expired. Could not refresh token.');
      }
      // Retry with new token
      axiosConfig.headers.Authorization = `Bearer ${newToken}`;
      try {
        res = await axios(axiosConfig);
        return {
          ok: true,
          status: res.status,
          json: async () => res.data,
          statusText: res.statusText,
        };
      } catch (retryError) {
        return {
          ok: false,
          status: retryError.response?.status || 500,
          json: async () => retryError.response?.data || {},
          statusText: retryError.response?.statusText || 'Unknown error',
        };
      }
    }
    return {
      ok: false,
      status: error.response?.status || 500,
      json: async () => error.response?.data || {},
      statusText: error.response?.statusText || 'Unknown error',
    };
  }
}
