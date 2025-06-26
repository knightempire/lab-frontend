export async function refreshAccessToken() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const endpoint = `${baseUrl}/api/refresh-token`;

  // Debug: log endpoint and check if running in browser
  console.log("Calling refresh token endpoint:", endpoint);
  console.log("Is browser:", typeof window !== "undefined");
  console.log("Current cookies (document.cookie):", typeof document !== "undefined" ? document.cookie : "N/A");

  const res = await fetch(endpoint, {
  method: 'POST',
  credentials: 'include', // REQUIRED!
  headers: { 'Content-Type': 'application/json' },
  });


  // Debug: log response status and headers
  console.log("Refresh response status:", res.status);
  console.log("Refresh response headers:", Array.from(res.headers.entries()));

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data.token;
  } else {
    localStorage.removeItem('token');
    // window.location.href = '/auth/login';
    return null;
  }
}

export async function apiRequest(url, options = {}) {
  let token = localStorage.getItem('token');
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // Try to refresh the token
    token = await refreshAccessToken();
    if (!token) throw new Error('Session expired');
    // Retry the original request with the new token
    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return res;
}