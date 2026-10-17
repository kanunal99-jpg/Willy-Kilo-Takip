import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeminiCreditCircuit } from '../scripts/gemini-retry-policy.mjs';

test('permanent 402 blocks subsequent requests until cooldown expires', () => {
  let currentTime = 1_000_000;
  const circuit = createGeminiCreditCircuit({ cooldownMs: 300_000, now: () => currentTime });
  assert.equal(circuit.isOpen(), false);
  assert.equal(circuit.recordFailure({ code: 402, message: 'Prepayment depleted' }), true);
  assert.equal(circuit.isOpen(), true);
  assert.equal(circuit.remainingMs(), 300_000);

  currentTime += 299_999;
  assert.equal(circuit.isOpen(), true);
  assert.equal(circuit.remainingMs(), 1);

  currentTime += 1;
  assert.equal(circuit.isOpen(), false);
  assert.equal(circuit.remainingMs(), 0);
});

test('transient rate limits and network errors never open billing circuit', () => {
  const circuit = createGeminiCreditCircuit();
  assert.equal(circuit.recordFailure({ status: 429, message: 'RESOURCE_EXHAUSTED rate limit' }), false);
  assert.equal(circuit.recordFailure(new Error('Timeout')), false);
  assert.equal(circuit.isOpen(), false);
});

test('a successful Gemini response resets credit circuit early', () => {
  const circuit = createGeminiCreditCircuit({ cooldownMs: 300_000 });
  circuit.recordFailure(new Error('Your prepayment credits are depleted'));
  assert.equal(circuit.isOpen(), true);
  circuit.recordSuccess();
  assert.equal(circuit.isOpen(), false);
});

test('a non-positive billing cooldown fails safely during configuration', () => {
  assert.throws(() => createGeminiCreditCircuit({ cooldownMs: 0 }), RangeError);
  assert.throws(() => createGeminiCreditCircuit({ cooldownMs: Number.NaN }), RangeError);
});
