/**
 * POST /api/checkout
 * Creates a Dodo Payments checkout session for the forensic report product.
 * Returns a checkout URL that the client-side overlay SDK will open.
 */

import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: 'live_mode', // switch to 'test_mode' while testing
});

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://isthiscarsafe.co.uk';

    const payment = await dodo.payments.create({
      billing: {
        city: 'London',
        country: 'GB',
        state: 'England',
        street: '',
        zipcode: '',
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

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.payment_link,
      paymentId: payment.payment_id,
    });
  } catch (error) {
    console.error('[Checkout] Dodo Payments error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
