import { getDb } from './connection';
import crypto from 'crypto';

/**
 * Hash a sensitive value like a registration plate using SHA-256
 */
export function hashRegistration(registration) {
  if (!registration) return '';
  const cleaned = registration.replace(/\s+/g, '').toUpperCase();
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

/**
 * Log a server-side analytics event in SQLite
 */
export function logEvent(eventName, metadata = {}, sessionId = null, abVariant = null) {
  try {
    const db = getDb();
    
    // Hash plate if it exists in metadata to protect user privacy
    const processedMetadata = { ...metadata };
    if (processedMetadata.registration) {
      processedMetadata.registration_hash = hashRegistration(processedMetadata.registration);
      delete processedMetadata.registration; // Ensure raw plate is never logged
    }

    db.prepare(`
      INSERT INTO analytics_events (event_name, event_metadata, session_id, ab_variant)
      VALUES (?, ?, ?, ?)
    `).run(
      eventName,
      JSON.stringify(processedMetadata),
      sessionId,
      abVariant
    );

    return true;
  } catch (err) {
    console.error('[Analytics Event Error] Failed to log event:', err);
    return false;
  }
}
