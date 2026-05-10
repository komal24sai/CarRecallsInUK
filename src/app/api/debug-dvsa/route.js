import { NextResponse } from 'next/server';
import { getDVSAHeaders } from '@/lib/dvsa/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reg = searchParams.get('reg') || 'ML58FOU';
  
  try {
    const headers = await getDVSAHeaders();
    const url = `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${reg}`;
    
    console.log(`[Debug API] Fetching ${url} with headers:`, {
      ...headers,
      'Authorization': 'Bearer [REDACTED]'
    });
    
    const response = await fetch(url, { headers });
    const status = response.status;
    const body = await response.json().catch(() => null) || await response.text();
    
    return NextResponse.json({
      url,
      status,
      headers: {
        'x-api-key': headers['x-api-key'] ? 'PRESENT' : 'MISSING',
        'Accept': headers['Accept']
      },
      response: body
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
