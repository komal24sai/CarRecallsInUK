/**
 * UK Vehicle Registration Validation
 * Supports:
 * - Current (AB12 CDE)
 * - Prefix (A123 BCD)
 * - Suffix (ABC 123D)
 * - Northern Ireland (ABC 1234)
 * - Dateless (1234 ABC, AB 1234, etc.)
 */
export function isValidUKRegistration(reg) {
  if (!reg) return false;
  
  // Clean input: remove spaces and convert to uppercase
  const cleaned = reg.replace(/\s/g, '').toUpperCase();
  
  // Length check (UK plates are between 2 and 7 characters)
  if (cleaned.length < 2 || cleaned.length > 7) return false;
  
  /**
   * REGEX EXPLAINED:
   * 1. Current: [A-Z]{2}[0-9]{2}[A-Z]{3}
   * 2. Prefix: [A-Z][0-9]{1,3}[A-Z]{3}
   * 3. Suffix: [A-Z]{3}[0-9]{1,3}[A-Z]
   * 4. NI/Dateless: [A-Z]{1,3}[0-9]{1,4} or [0-9]{1,4}[A-Z]{1,3}
   */
  const currentRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/;
  const prefixRegex = /^[A-Z][0-9]{1,3}[A-Z]{3}$/;
  const suffixRegex = /^[A-Z]{3}[0-9]{1,3}[A-Z]$/;
  const datelessRegex1 = /^[A-Z]{1,3}[0-9]{1,4}$/;
  const datelessRegex2 = /^[0-9]{1,4}[A-Z]{1,3}$/;
  
  return (
    currentRegex.test(cleaned) ||
    prefixRegex.test(cleaned) ||
    suffixRegex.test(cleaned) ||
    datelessRegex1.test(cleaned) ||
    datelessRegex2.test(cleaned)
  );
}

/**
 * Format registration with a space (Standard UK format)
 * E.g., ML58FOU -> ML58 FOU
 */
export function formatRegistration(reg) {
  const cleaned = reg.replace(/\s/g, '').toUpperCase();
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return cleaned;
}
