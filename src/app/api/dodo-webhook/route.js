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
import { createDealer, resetChecksUsed, updateDealerPlan } from '@/lib/db/dealers';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: 'live_mode',
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
});

// In-memory store for paid registrations (replace with DB in production)
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

  const headersObj = {
    'webhook-id': webhookId ?? '',
    'webhook-signature': webhookSignature ?? '',
    'webhook-timestamp': webhookTimestamp ?? '',
  };

  let event;
  try {
    event = dodo.webhooks.unwrap(rawBody, {
      headers: headersObj,
    });
  } catch (err) {
    console.error('[Webhook Error] Signature verification failed:', err.message);
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
      }
      break;
    }

    case 'payment.failed': {
      const payment = event.data;
      console.warn(`[Webhook] ❌ Payment failed for: ${payment.metadata?.registration}`);
      break;
    }

    case 'subscription.created': {
      const sub = event.data;
      const email = sub.customer?.email;
      const businessName = sub.metadata?.business_name || 'Used Car Dealer';
      const plan = sub.metadata?.plan || 'basic';
      const subId = sub.subscription_id;

      if (email) {
        const result = createDealer(businessName, email, plan, subId);
        console.log(`[Webhook] Dealer created via sub: ${email}`, result);
      }
      break;
    }

    case 'subscription.renewed': {
      const sub = event.data;
      const subId = sub.subscription_id;
      if (subId) {
        resetChecksUsed(subId);
        console.log(`[Webhook] Checks reset for subscription: ${subId}`);
      }
      break;
    }

    case 'subscription.updated': {
      const sub = event.data;
      const subId = sub.subscription_id;
      const newPlan = sub.metadata?.plan || 'basic';
      if (subId) {
        updateDealerPlan(subId, newPlan);
        console.log(`[Webhook] Subscription plan updated to ${newPlan} for sub: ${subId}`);
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
