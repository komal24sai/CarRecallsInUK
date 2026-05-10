/**
 * DVSA MOT History API Client (New API)
 * Uses the new endpoint at history.mot.api.gov.uk with OAuth2 auth
 */

import { getDVSAHeaders, invalidateToken } from './auth';

const MOT_API_BASE = process.env.MOT_API_BASE || 'https://history.mot.api.gov.uk';

/**
 * Make an authenticated request to the DVSA MOT API
 */
async function motRequest(endpoint, retryCount = 0) {
  try {
    const headers = await getDVSAHeaders();
    const url = `${MOT_API_BASE}${endpoint}`;

    console.log(`[MOT Client] GET ${url}`);

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (response.status === 401 && retryCount < 1) {
      console.log('[MOT Client] 401 received, refreshing token...');
      invalidateToken();
      return motRequest(endpoint, retryCount + 1);
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MOT Client] API ERROR for ${endpoint}: ${response.status} ${errorText}`);
      throw new Error(`MOT API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log(`[MOT Client] SUCCESS for ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`[MOT Client] REQUEST FAILED for ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Get MOT history by registration number
 * New API: GET /v1/trade/vehicles/registration/{registration}
 * @param {string} registration - Vehicle registration number (e.g., "ML58FOU")
 * @returns {Promise<Object|null>} Vehicle MOT data or null if not found
 */
export async function getByRegistration(registration) {
  const reg = registration.replace(/\s/g, '').toUpperCase();
  const data = await motRequest(`/v1/trade/vehicles/registration/${encodeURIComponent(reg)}`);
  return data;
}

/**
 * Get MOT history by VIN
 * New API: GET /v1/trade/vehicles/vin/{vin}
 * @param {string} vin - Vehicle Identification Number
 * @returns {Promise<Object|null>}
 */
export async function getByVIN(vin) {
  const data = await motRequest(`/v1/trade/vehicles/vin/${encodeURIComponent(vin)}`);
  return data;
}

/**
 * Bulk download
 * New API: GET /v1/trade/vehicles/bulk-download
 * @returns {Promise<Object|null>}
 */
export async function getBulkDownload() {
  const data = await motRequest(`/v1/trade/vehicles/bulk-download`);
  return data;
}
