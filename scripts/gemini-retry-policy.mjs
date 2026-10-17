/**
 * Gemini may report RESOURCE_EXHAUSTED for both transient throttling (429)
 * and permanent depleted prepayment balance (402).
 * Only the latter should abort all model retries immediately.
 */
export function isNonRetryableGeminiCreditError(error) {
  const codes = [error?.status, error?.code, error?.error?.code];
  if (codes.some((code) => Number(code) === 402)) return true;

  const raw = String(error?.message || error?.error?.message || error || '').toLowerCase();
  return raw.includes('prepayment credits are depleted')
    || (/"code"\s*:\s*402/.test(raw)
      && /credit|billing|prepay|resource_exhausted/.test(raw));
}


/**
 * A per-process safety valve. After a non-retryable billing denial, use the
 * already-implemented local fallback until the cooldown expires. A new
 * request probes Gemini automatically when the window expires.
 *
 * This state is deliberately ephemeral: no persistent billing data, no
 * automatic payments, and no suppression of transient 429 responses.
 */
export function createGeminiCreditCircuit({
  cooldownMs = 5 * 60 * 1000,
  now = () => Date.now(),
} = {}) {
  if (!Number.isFinite(cooldownMs) || cooldownMs <= 0) {
    throw new RangeError('cooldownMs must be a positive number');
  }

  let retryAfterMs = 0;
  return {
    isOpen() {
      return retryAfterMs > now();
    },
    remainingMs() {
      return Math.max(0, retryAfterMs - now());
    },
    recordFailure(error) {
      if (!isNonRetryableGeminiCreditError(error)) return false;
      retryAfterMs = now() + cooldownMs;
      return true;
    },
    recordSuccess() {
      retryAfterMs = 0;
    },
  };
}
