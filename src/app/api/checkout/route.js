/**
 * POST /api/checkout
 * Creates a Dodo Payments checkout session for the forensic report product.
 * Returns a checkout URL that the client-side overlay SDK will open.
 */

import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, registration } = body;

    if (!email || !registration) {
      return NextResponse.json(
        { error: 'Email and registration are required' },
        { status: 400 }
      );
    }

    // Validate env vars are present
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      console.error('[Checkout] DODO_PAYMENTS_API_KEY is not set');
      return NextResponse.json({ error: 'Payment service not configured (API key missing)' }, { status: 500 });
    }
    if (!process.env.DODO_PAYMENTS_PRODUCT_ID) {
      console.error('[Checkout] DODO_PAYMENTS_PRODUCT_ID is not set');
      return NextResponse.json({ error: 'Payment service not configured (product ID missing)' }, { status: 500 });
    }

    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'live_mode',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://isthiscarsafe.co.uk';

    const payment = await dodo.payments.create({
      billing: {
        city: 'London',
        country: 'GB',
        state: 'England',
        street: '1 Example Street',
        zipcode: 'EC1A 1BB',
      },
      customer: {
        email,
        name: name || 'Customer',
        create_new_customer: true,
      },
      product_cart: [
        {
          product_id: process.env.DODO_PAYMENTS_PRODUCT_ID,
          quantity: 1,
        },
      ],
      payment_link: true,
      return_url: `${baseUrl}/vehicle/${registration}?payment=success`,
      metadata: {
        registration,
        source: 'isthiscarsafe.co.uk',
      },
    });

    console.log('[Checkout] Created payment session:', payment.payment_id, 'for', registration);

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.payment_link,
      paymentId: payment.payment_id,
    });
  } catch (error) {
    // Log full error details server-side always
    console.error('[Checkout] Dodo Payments error:', {
      message: error.message,
      status: error.status,
      body: error.error,
    });
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        // Show details in all environments to help diagnose
        details: error.message,
        dodoError: error.error,
      },
      { status: 500 }
    );
  }
}
