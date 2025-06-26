// Keep your refreshAccessToken function exactly as it is. It's perfect.
export async function refreshAccessToken() {
  const endpoint = `/api/refresh-token`;
  console.log("Calling refresh token endpoint VIA PROXY:", endpoint);
  
  const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
  });
  
  console.log("Refresh response status:", res.status);

  if (res.ok) {
    const data = await res.json();
    // This is important: save the new token to localStorage
    localStorage.setItem('token', data.token);
    return data.token;
  } else {
    // If refresh fails, clear the token and trigger a logout/redirect
    localStorage.removeItem('token');
    // For example: window.location.href = '/auth/login';
    return null;
  }
}



export async function apiRequest(url, options = {}) {
  const proxyUrl = `/api${url}`;
  let token = localStorage.getItem('token');

  console.log(`1. Initial request to ${proxyUrl} with token:`, token ? 'Exists' : 'NULL');

  // 1. Make the initial request
  let res = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });


  if (res.status === 401) {
    console.log("2. Received 401 Unauthorized. Attempting to refresh token...");

    // 3. Call the refreshAccessToken function
    const newToken = await refreshAccessToken();

    // 4. Check if the refresh was successful
    if (!newToken) {
      console.error("3. Token refresh failed. Session expired.");
      throw new Error('Session expired. Could not refresh token.');
    }

    console.log("3. Token refreshed successfully. Retrying the original request...");

    // 5. Retry the original request with the NEW token
    res = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`, 
      },
    });
    
    console.log(`4. Retry request to ${proxyUrl} status:`, res.status);
  }

  return res;
}