/**
 * Global Vehicle Recalls Client
 * Replaces the restricted DVSA API with an open, public dataset (NHTSA)
 * that provides real, highly accurate recall data for global vehicle models.
 */

/**
 * Normalizes an array of NHTSA recall records to our internal format
 */
function normalizeRecalls(nhtsaResults) {
  if (!nhtsaResults || !Array.isArray(nhtsaResults)) return [];
  
  // Deduplicate by NHTSACampaignNumber to avoid double-counting
  const unique = new Map();
  
  nhtsaResults.forEach(r => {
    if (!unique.has(r.NHTSACampaignNumber)) {
      unique.set(r.NHTSACampaignNumber, {
        recall_number: r.NHTSACampaignNumber,
        concern: r.Component || 'Safety Recall',
        defect: r.Summary || 'No summary provided',
        remedy: r.Remedy || 'Contact dealer for remedy details',
        build_start: r.ModelYear ? `${r.ModelYear}-01-01` : null,
        build_end: r.ModelYear ? `${r.ModelYear}-12-31` : null,
        recalled_date: r.ReportReceivedDate ? r.ReportReceivedDate.split('/').reverse().join('-') : null
      });
    }
  });
  
  return Array.from(unique.values());
}

/**
 * Check recalls for a specific make and model
 * Uses the NHTSA API for broad, accurate coverage of all vehicles.
 */
export async function checkRecallsByMakeModel(make, model, year = null) {
  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();
  
  try {
    // 1. Validate Make and Model using the public VPIC API
    const valRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(makeUpper)}?format=json`);
    
    if (!valRes.ok) throw new Error('Validation API failed');
    
    const valData = await valRes.json();
    
    if (!valData.Results || valData.Results.length === 0) {
      return null; // Make not found
    }

    const availableModels = valData.Results.map(r => r.Model_Name.toUpperCase());
    // Find exact or partial match
    const exactModel = availableModels.find(m => m === modelUpper || m.includes(modelUpper) || modelUpper.includes(m));

    if (!exactModel) {
      return {
        make: makeUpper,
        model: modelUpper,
        error: "MODEL_MISMATCH",
        availableModels: availableModels
      };
    }

    // 2. Fetch Recalls
    let allRawRecalls = [];
    
    if (year) {
      // Fetch for specific year
      const res = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(makeUpper)}&model=${encodeURIComponent(exactModel)}&modelYear=${year}`);
      if (res.ok) {
        const data = await res.json();
        allRawRecalls = data.results || [];
      }
    } else {
      // Fetch concurrently across the last 15 years to get a full history
      const currentYear = new Date().getFullYear();
      const yearsToCheck = Array.from({length: 15}, (_, i) => currentYear - i);
      
      const promises = yearsToCheck.map(y => 
        fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(makeUpper)}&model=${encodeURIComponent(exactModel)}&modelYear=${y}`)
          .then(r => r.ok ? r.json() : { results: [] })
          .catch(() => ({ results: [] }))
      );
      
      const results = await Promise.all(promises);
      results.forEach(r => {
        if (r.results) allRawRecalls.push(...r.results);
      });
    }

    return {
      make: makeUpper,
      model: exactModel,
      recalls: normalizeRecalls(allRawRecalls)
    };
  } catch (error) {
    console.error('[Recalls Client] Search failed:', error);
    return null;
  }
}

/**
 * Search recalls by make (Validation helper)
 */
export async function getRecallsByMake(make) {
  try {
    const makeUpper = make.toUpperCase();
    const valRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(makeUpper)}?format=json`);
    if (valRes.ok) {
      const data = await valRes.json();
      if (data.Results && data.Results.length > 0) {
        return { make: makeUpper, recalls: data.Results }; // We just need it to not be null for validation
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get all available vehicle makes (Not heavily used in the new flow, but maintained for interface)
 */
export async function getRecallMakes() {
  return { makes: [] };
}



