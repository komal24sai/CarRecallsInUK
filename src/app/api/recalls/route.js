import { ingestRecallData, getBronzeRecallData } from '@/lib/data/bronze';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const year = searchParams.get('year'); // Optional

  if (!make || !model) {
    return Response.json({ error: 'Make and model are required' }, { status: 400 });
  }

  try {
    const makeUpper = make.toUpperCase();
    const modelUpper = model.toUpperCase();

    // 1. Validate Make first (Get all recalls for this make)
    const makeData = await getRecallsByMake(makeUpper);
    
    if (!makeData || (Array.isArray(makeData) && makeData.length === 0)) {
      return Response.json({ 
        error: 'Invalid Make', 
        message: `The vehicle manufacturer "${makeUpper}" was not found in the DVSA recall database. Please check the spelling and try again.` 
      }, { status: 404 });
    }

    // 2. Validate Model within that Make
    const allMakeRecalls = Array.isArray(makeData) ? makeData : (makeData.recalls || []);
    const availableModels = [...new Set(allMakeRecalls.map(r => r.model?.toUpperCase()))];
    const modelExists = availableModels.some(m => m === modelUpper || m?.includes(modelUpper) || modelUpper.includes(m));

    if (!modelExists) {
      return Response.json({
        error: 'Model Mismatch',
        message: `We found records for "${makeUpper}", but the model "${modelUpper}" does not appear to match their database. Please re-enter the correct model name.`,
        availableModels: availableModels.slice(0, 10) // Optional: give hints
      }, { status: 404 });
    }

    // 3. Try to ingest fresh data from DVSA for this specific model (updates DB)
    await ingestRecallData(makeUpper, modelUpper);
    
    // 4. Fetch from DB
    const allRecalls = getBronzeRecallData(makeUpper, modelUpper);
    let filteredRecalls = [...allRecalls];

    // 5. Filter by year if provided
    if (year && allRecalls.length > 0) {
      const targetYear = parseInt(year, 10);
      filteredRecalls = allRecalls.filter(recall => {
        if (!recall.build_start && !recall.build_end) return true;
        const startYear = recall.build_start ? new Date(recall.build_start).getFullYear() : 1900;
        const endYear = recall.build_end ? new Date(recall.build_end).getFullYear() : new Date().getFullYear() + 1;
        return (targetYear >= startYear && targetYear <= endYear);
      });
    }

    // 6. Partition by year if NO year is provided
    let partitioned = null;
    if (!year && allRecalls.length > 0) {
      partitioned = {};
      allRecalls.forEach(recall => {
        const startYear = recall.build_start ? new Date(recall.build_start).getFullYear() : null;
        const endYear = recall.build_end ? new Date(recall.build_end).getFullYear() : null;
        
        if (startYear && endYear) {
          for (let y = startYear; y <= endYear; y++) {
            if (!partitioned[y]) partitioned[y] = [];
            if (!partitioned[y].find(r => r.recall_number === recall.recall_number)) {
              partitioned[y].push(recall);
            }
          }
        } else if (startYear || endYear) {
          const y = startYear || endYear;
          if (!partitioned[y]) partitioned[y] = [];
          partitioned[y].push(recall);
        } else {
          if (!partitioned['Unknown']) partitioned['Unknown'] = [];
          partitioned['Unknown'].push(recall);
        }
      });
    }

    return Response.json({
      make: makeUpper,
      model: modelUpper,
      year: year || 'All',
      totalRecalls: filteredRecalls.length,
      recalls: filteredRecalls,
      partitioned: partitioned
    });
  } catch (error) {
    console.error('Recalls API Error:', error);
    return Response.json({ error: 'Failed to fetch recall data' }, { status: 500 });
  }
}
