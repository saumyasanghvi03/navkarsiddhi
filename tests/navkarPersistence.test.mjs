import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeUpdatedHistory,
  loadInitialState,
  parseSafeJson,
} from '../src/lib/navkarPersistence.js';

test('parseSafeJson returns fallback on invalid json', () => {
  assert.deepEqual(parseSafeJson('{', { fallback: true }), { fallback: true });
});

test('loadInitialState normalizes persisted values', () => {
  const state = loadInitialState({
    totalRaw: '25',
    historyRaw: '[{"date":"2026-01-01","navkars":3}]',
    prefsRaw: '{"mode":"RING","malaSize":27}',
  });

  assert.equal(state.totalNavkars, 25);
  assert.equal(state.mode, 'RING');
  assert.equal(state.malaSize, 27);
  assert.equal(state.history.length, 1);
});

test('computeUpdatedHistory increments existing day and updates malas at 108 boundary', () => {
  const history = [{
    date: '2026-01-02',
    navkars: 107,
    malas: 0,
    stabilitySum: 500,
    samples: 10,
  }];

  const updated = computeUpdatedHistory({
    history,
    focus: 80,
    calm: 60,
    date: new Date('2026-01-02T10:00:00.000Z'),
  });

  assert.equal(updated[0].navkars, 108);
  assert.equal(updated[0].malas, 1);
  assert.equal(updated[0].stabilitySum, 570);
  assert.equal(updated[0].samples, 11);
});

test('computeUpdatedHistory appends a new day entry when date is missing', () => {
  const updated = computeUpdatedHistory({
    history: [],
    focus: 40,
    calm: 20,
    date: new Date('2026-01-03T10:00:00.000Z'),
  });

  assert.equal(updated.length, 1);
  assert.equal(updated[0].date, '2026-01-03');
  assert.equal(updated[0].stabilitySum, 30);
  assert.equal(updated[0].samples, 1);
});
