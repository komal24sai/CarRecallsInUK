/**
 * Analytics Dashboard API Route
 * GET /api/analytics — Returns Gold layer dashboard metrics
 */

import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/data/gold';

export async function GET() {
  try {
    const metrics = getDashboardMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('[API] Analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
