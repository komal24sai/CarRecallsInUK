/**
 * DVSA OAuth2 Authentication Service
 * Manages token lifecycle using Client Credentials flow via Microsoft Entra ID
 */

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get a valid access token, refreshing if expired
 */
export async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.DVSA_CLIENT_ID,
    client_secret: process.env.DVSA_CLIENT_SECRET,
    scope: process.env.DVSA_SCOPE,
  });

  try {
    const response = await fetch(process.env.DVSA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = now + (data.expires_in * 1000);

    console.log('[DVSA Auth] Token acquired, expires in', data.expires_in, 'seconds');
    return cachedToken;
  } catch (error) {
    console.error('[DVSA Auth] Failed to acquire token:', error.message);
    throw error;
  }
}

/**
 * Get the standard headers for DVSA API requests
 */
export async function getDVSAHeaders() {
  const token = await getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'x-api-key': process.env.DVSA_API_KEY,
    'Accept': 'application/json+v6',
  };
}

/**
 * Invalidate the cached token (useful if a 401 is received)
 */
export function invalidateToken() {
  cachedToken = null;
  tokenExpiry = 0;
  console.log('[DVSA Auth] Token invalidated');
}
