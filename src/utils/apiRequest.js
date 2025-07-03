export async function refreshAccessToken() {
  const endpoint = `/api/refresh-token`;

  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data.token;
  } else {
    localStorage.removeItem('token');
    window.location.href = "/auth/login"; // Redirect to login
    return null;
  }
}

export async function apiRequest(url, options = {}) {
  const proxyUrl = `/api${url}`;
  let token = localStorage.getItem('token');

  let res = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error('Session expired. Could not refresh token.');
      // window.location.href = "/auth/login"; // Already handled above
    }

    res = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return res;
}