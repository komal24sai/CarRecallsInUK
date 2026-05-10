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
    // 1. Try to ingest fresh data from DVSA (updates DB)
    await ingestRecallData(make.toUpperCase(), model.toUpperCase());
    
    // 2. Fetch from DB
    const allRecalls = getBronzeRecallData(make.toUpperCase(), model.toUpperCase());
    let filteredRecalls = [...allRecalls];

    // 3. Filter by year if provided
    if (year && allRecalls.length > 0) {
      const targetYear = parseInt(year, 10);
      filteredRecalls = allRecalls.filter(recall => {
        if (!recall.build_start && !recall.build_end) return true;
        
        let inRange = false;
        const startYear = recall.build_start ? new Date(recall.build_start).getFullYear() : 1900;
        const endYear = recall.build_end ? new Date(recall.build_end).getFullYear() : new Date().getFullYear() + 1;
        
        if (targetYear >= startYear && targetYear <= endYear) inRange = true;
        return inRange;
      });
    }

    // 4. Partition by year if NO year is provided
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
      make: make.toUpperCase(),
      model: model.toUpperCase(),
      year: year || 'All',
      totalRecalls: filteredRecalls.length,
      recalls: filteredRecalls,
      partitioned: partitioned // Will be null if year was provided
    });
  } catch (error) {
    console.error('Recalls API Error:', error);
    return Response.json({ error: 'Failed to fetch recall data' }, { status: 500 });
  }
}
