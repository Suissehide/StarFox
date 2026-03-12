import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('db.js', () => {
    it('exports getClicks as a function', async () => {
        const mod = await import('./db.js');
        assert.strictEqual(typeof mod.getClicks, 'function');
    });

    it('getClicks returns a Promise', async () => {
        const { getClicks } = await import('./db.js');
        const result = getClicks();
        assert.ok(result instanceof Promise, 'getClicks() must return a Promise');
        // Let it reject (no DB in test env) — we only verify the contract
        result.catch(() => {});
    });

    it('exports persistClicks as a function', async () => {
        const { persistClicks } = await import('./db.js');
        assert.strictEqual(typeof persistClicks, 'function');
    });
});
