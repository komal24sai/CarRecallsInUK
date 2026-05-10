/**
 * DVSA Vehicle Recalls Client
 * Uses the check-vehicle-recalls service to check recall status
 */

import { getDVSAHeaders, invalidateToken } from './auth';

const RECALLS_API_BASE = 'https://tapi.dvsa.gov.uk';

/**
 * Make an authenticated request to the DVSA Recalls API
 */
async function recallsRequest(endpoint, options = {}, retryCount = 0) {
  try {
    const headers = await getDVSAHeaders();
    const url = `${RECALLS_API_BASE}${endpoint}`;

    console.log(`[Recalls Client] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401 && retryCount < 1) {
      console.log('[Recalls Client] 401 received, refreshing token...');
      invalidateToken();
      return recallsRequest(endpoint, options, retryCount + 1);
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Recalls API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[Recalls Client] Request failed:`, error.message);
    throw error;
  }
}

/**
 * Check recalls for a specific make and model
 * @param {string} make 
 * @param {string} model 
 * @returns {Promise<Object|null>}
 */
export async function checkRecallsByMakeModel(make, model) {
  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();
  
  try {
    const data = await recallsRequest(
      `/recalls/recall-type/vehicle/make/${encodeURIComponent(makeUpper)}/model/${encodeURIComponent(modelUpper)}`
    );
    
    if (!data) return null;

    // Normalize the response to match the expected Bronze layer shape
    // The API might return an array of recalls or an object containing a recalls array
    return {
      make: makeUpper,
      model: modelUpper,
      recalls: Array.isArray(data) ? data : (data.recalls || [])
    };
  } catch (error) {
    console.error(`[Recalls Client] Failed to fetch recalls for ${make} ${model}:`, error.message);
    // If the API fails or is offline, we return null so the system knows no REAL data was found
    return null;
  }
}

/**
 * Search recalls by make
 * @param {string} make - Vehicle manufacturer
 * @returns {Promise<Object|null>}
 */
export async function getRecallsByMake(make) {
  const data = await recallsRequest(
    `/recalls/recall-type/vehicle/make/${encodeURIComponent(make)}`
  );
  return data;
}

/**
 * Get all available vehicle makes with recall data
 * @returns {Promise<Object|null>}
 */
export async function getRecallMakes() {
  const data = await recallsRequest('/recalls/recall-type/vehicle');
  return data;
}
