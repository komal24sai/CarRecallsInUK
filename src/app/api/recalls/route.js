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
    let recalls = getBronzeRecallData(make.toUpperCase(), model.toUpperCase());

    // 3. Filter by year if provided
    if (year && recalls.length > 0) {
      const targetYear = parseInt(year, 10);
      recalls = recalls.filter(recall => {
        // If there's no build date, we can't filter, so keep it to be safe
        if (!recall.build_start && !recall.build_end) return true;
        
        let inRange = false;
        
        if (recall.build_start && recall.build_end) {
          const startYear = new Date(recall.build_start).getFullYear();
          const endYear = new Date(recall.build_end).getFullYear();
          if (targetYear >= startYear && targetYear <= endYear) inRange = true;
        } else if (recall.build_start) {
          const startYear = new Date(recall.build_start).getFullYear();
          if (targetYear >= startYear) inRange = true;
        } else if (recall.build_end) {
          const endYear = new Date(recall.build_end).getFullYear();
          if (targetYear <= endYear) inRange = true;
        }

        return inRange;
      });
    }

    return Response.json({
      make: make.toUpperCase(),
      model: model.toUpperCase(),
      year: year || 'All',
      totalRecalls: recalls.length,
      recalls
    });
  } catch (error) {
    console.error('Recalls API Error:', error);
    return Response.json({ error: 'Failed to fetch recall data' }, { status: 500 });
  }
}
