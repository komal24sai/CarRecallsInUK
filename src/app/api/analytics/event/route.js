import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/db/analytics';

/**
 * Assign a variant A, B, or C based on session ID
 */
function getAbVariant(sessionId) {
  if (!sessionId) return 'A';
  // Deterministic assign based on character codes
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % 3;
  return ['A', 'B', 'C'][idx];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, metadata = {}, sessionId } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const abVariant = getAbVariant(sessionId);

    // Call server-side sqlite event logger
    logEvent(eventName, metadata, sessionId, abVariant);

    return NextResponse.json({
      success: true,
      abVariant
    });
  } catch (error) {
    console.error('[Analytics API] Failed to log event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
