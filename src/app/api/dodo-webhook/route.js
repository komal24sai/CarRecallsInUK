/**
 * POST /api/webhook
 * Receives and verifies Dodo Payments webhook events.
 * Handles payment.succeeded to grant forensic report access.
 * 
 * Configure in Dodo Dashboard → Developer → Webhooks:
 * URL: https://isthiscarsafe.co.uk/api/webhook
 * Events: payment.succeeded, payment.failed
 */

import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: 'live_mode',
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
});

// In-memory store for paid registrations (replace with DB in production)
// This persists for the lifetime of the server process
const paidRegistrations = new Set();
const processedWebhookIds = new Set();

export function isPaidRegistration(registration) {
  return paidRegistrations.has(registration?.toUpperCase());
}

export function grantAccess(registration) {
  if (registration) {
    paidRegistrations.add(registration.toUpperCase());
  }
}

export async function POST(request) {
  // Webhook verification requires the raw body
  const rawBody = await request.text();

  const webhookId = request.headers.get('webhook-id');
  const webhookSignature = request.headers.get('webhook-signature');
  const webhookTimestamp = request.headers.get('webhook-timestamp');

  // Idempotency — ignore duplicate deliveries
  if (webhookId && processedWebhookIds.has(webhookId)) {
    console.log(`[Webhook] Duplicate event ignored: ${webhookId}`);
    return NextResponse.json({ received: true });
  }

  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  console.log(`[Webhook Debug] Secret configured: ${!!secret}, Length: ${secret?.length}, Prefix: ${secret?.substring(0, 5)}`);

  const headersObj = {
    'webhook-id': webhookId ?? '',
    'webhook-signature': webhookSignature ?? '',
    'webhook-timestamp': webhookTimestamp ?? '',
  };

  console.log(`[Webhook Debug] Headers:`, JSON.stringify(headersObj));

  let event;
  try {
    event = dodo.webhooks.unwrap(rawBody, {
      headers: headersObj,
    });
  } catch (err) {
    console.error('[Webhook Error] Signature verification failed:', err.message);
    console.error('[Webhook Error] Raw Body Length:', rawBody.length);
    return NextResponse.json({ error: 'Invalid signature', details: err.message }, { status: 401 });
  }

  // Acknowledge immediately, process async
  if (webhookId) processedWebhookIds.add(webhookId);

  // Handle events
  processEventAsync(event).catch(console.error);

  return NextResponse.json({ received: true });
}

async function processEventAsync(event) {
  console.log(`[Webhook] Processing event: ${event.type}`);

  switch (event.type) {
    case 'payment.succeeded': {
      const payment = event.data;
      const registration = payment.metadata?.registration;

      if (registration) {
        grantAccess(registration);
        console.log(`[Webhook] ✅ Access granted for registration: ${registration}`);
        console.log(`[Webhook] Payment ID: ${payment.payment_id}, Customer: ${payment.customer?.email}`);
      } else {
        console.warn('[Webhook] payment.succeeded without registration metadata');
      }
      break;
    }

    case 'payment.failed': {
      const payment = event.data;
      console.warn(`[Webhook] ❌ Payment failed for: ${payment.metadata?.registration} (${payment.payment_id})`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
