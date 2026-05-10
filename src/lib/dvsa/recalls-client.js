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
        'Accept': 'application/json', // Sometimes v6 is too strict
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401 && retryCount < 1) {
      invalidateToken();
      return recallsRequest(endpoint, options, retryCount + 1);
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      // Special case: API Key or Auth issues often return 403 or 400
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
 */
export async function checkRecallsByMakeModel(make, model) {
  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();
  
  // Try the most common endpoint patterns
  const paths = [
    `/recalls/recall-type/vehicle/make/${encodeURIComponent(makeUpper)}/model/${encodeURIComponent(modelUpper)}`,
    `/recalls/vehicle/make/${encodeURIComponent(makeUpper)}/model/${encodeURIComponent(modelUpper)}`,
    `/recalls/make/${encodeURIComponent(makeUpper)}/model/${encodeURIComponent(modelUpper)}`
  ];

  for (const path of paths) {
    try {
      const data = await recallsRequest(path);
      if (data) {
        return {
          make: makeUpper,
          model: modelUpper,
          recalls: Array.isArray(data) ? data : (data.recalls || [])
        };
      }
    } catch (e) {
      console.warn(`[Recalls Client] Path failed: ${path}`, e.message);
    }
  }
  
  return null;
}

/**
 * Search recalls by make
 */
export async function getRecallsByMake(make) {
  const makeUpper = make.toUpperCase();
  const paths = [
    `/recalls/recall-type/vehicle/make/${encodeURIComponent(makeUpper)}`,
    `/recalls/vehicle/make/${encodeURIComponent(makeUpper)}`,
    `/recalls/make/${encodeURIComponent(makeUpper)}`
  ];

  for (const path of paths) {
    try {
      const data = await recallsRequest(path);
      if (data) return data;
    } catch (e) {
      console.warn(`[Recalls Client] Path failed: ${path}`, e.message);
    }
  }
  
  return null;
}

/**
 * Get all available vehicle makes
 */
export async function getRecallMakes() {
  const paths = ['/recalls/recall-type/vehicle', '/recalls/vehicle', '/recalls/makes'];
  for (const path of paths) {
    try {
      const data = await recallsRequest(path);
      if (data) return data;
    } catch (e) {
      console.warn(`[Recalls Client] Path failed: ${path}`, e.message);
    }
  }
  return null;
}

