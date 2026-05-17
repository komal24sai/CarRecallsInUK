import { getDb } from './connection';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure random API key
 */
export function generateApiKey() {
  return 'itcs_live_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Hash an API key for safe storage in the database
 */
export function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Create a new dealer record and return the unhashed API key
 */
export function createDealer(businessName, email, plan, subscriptionId = null) {
  const db = getDb();
  
  // Check if dealer already exists
  const existing = db.prepare('SELECT * FROM dealers WHERE email = ?').get(email);
  if (existing) {
    return {
      success: true,
      alreadyExists: true,
      apiKey: 'itcs_live_already_registered_check_your_records',
      dealer: existing
    };
  }

  const dealerId = 'dlr_' + crypto.randomBytes(12).toString('hex');
  const rawApiKey = generateApiKey();
  const hashedKey = hashApiKey(rawApiKey);
  const limit = plan === 'pro' ? 999999 : 50;

  db.prepare(`
    INSERT INTO dealers (
      dealer_id, business_name, email, plan, api_key, checks_used, checks_limit, subscription_id, subscription_status
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'active')
  `).run(dealerId, businessName, email, plan, hashedKey, limit, subscriptionId || 'sub_demo_' + crypto.randomBytes(8).toString('hex'));

  return {
    success: true,
    apiKey: rawApiKey,
    dealer: {
      dealer_id: dealerId,
      business_name: businessName,
      email,
      plan,
      checks_limit: limit,
      checks_used: 0
    }
  };
}

/**
 * Find a dealer by their raw API key
 */
export function getDealerByApiKey(rawApiKey) {
  if (!rawApiKey) return null;
  const db = getDb();
  const hashed = hashApiKey(rawApiKey);
  
  return db.prepare('SELECT * FROM dealers WHERE api_key = ?').get(hashed);
}

/**
 * Safely increment a dealer's checks count
 */
export function incrementChecksUsed(dealerId, count = 1) {
  const db = getDb();
  return db.prepare('UPDATE dealers SET checks_used = checks_used + ? WHERE dealer_id = ?').run(count, dealerId);
}

/**
 * Reset a dealer's checks on subscription renewal
 */
export function resetChecksUsed(subscriptionId) {
  const db = getDb();
  return db.prepare('UPDATE dealers SET checks_used = 0 WHERE subscription_id = ?').run(subscriptionId);
}

/**
 * Update plan level and corresponding check limits
 */
export function updateDealerPlan(subscriptionId, newPlan) {
  const db = getDb();
  const limit = newPlan === 'pro' ? 999999 : 50;
  return db.prepare('UPDATE dealers SET plan = ?, checks_limit = ? WHERE subscription_id = ?').run(newPlan, limit, subscriptionId);
}
