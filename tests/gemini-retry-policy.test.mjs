import test from 'node:test';
import assert from 'node:assert/strict';
import { isNonRetryableGeminiCreditError } from '../scripts/gemini-retry-policy.mjs';

test('402 prepayment/billing denial aborts Gemini model rotation', () => {
  assert.equal(isNonRetryableGeminiCreditError({ status: 402, message: 'Payment Required' }), true);
  assert.equal(isNonRetryableGeminiCreditError({ error: { code: 402, status: 'RESOURCE_EXHAUSTED' } }), true);
  assert.equal(isNonRetryableGeminiCreditError(new Error('Your prepayment credits are depleted.')), true);
  assert.equal(isNonRetryableGeminiCreditError(new Error('{"error":{"code":402,"status":"RESOURCE_EXHAUSTED"}}')), true);
});

test('transient 429, model-specific errors and network failures may retry', () => {
  assert.equal(isNonRetryableGeminiCreditError({ status: 429, message: 'RESOURCE_EXHAUSTED: quota per minute' }), false);
  assert.equal(isNonRetryableGeminiCreditError(new Error('Model not found')), false);
  assert.equal(isNonRetryableGeminiCreditError(new Error('Network timeout')), false);
  assert.equal(isNonRetryableGeminiCreditError({ status: 503 }), false);
  assert.equal(isNonRetryableGeminiCreditError(null), false);
});
