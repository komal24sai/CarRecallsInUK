/**
 * Analytics Dashboard API Route
 * GET /api/analytics — Returns Gold layer dashboard metrics
 */

import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/data/gold';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const regsParam = searchParams.get('regs');
    let regs = null;
    
    if (regsParam) {
      regs = regsParam.split(',').map(r => r.trim()).filter(Boolean);
    }

    const metrics = getDashboardMetrics(regs);
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('[API] Analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
