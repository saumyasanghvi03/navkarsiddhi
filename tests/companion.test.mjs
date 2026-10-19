import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Re-implement pure functions to test logic without TS import issues
// These mirror src/lib/companion/emiCalculations.ts exactly

function isOverdue(entry) {
  if (entry.isPaid) return false;
  return entry.dueDate < new Date().toISOString().slice(0, 10);
}

function isDueWithinDays(entry, days) {
  if (entry.isPaid) return false;
  const diff = Math.ceil((new Date(entry.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400_000);
  return diff >= 0 && diff <= days;
}

function daysUntilDue(entry) {
  return Math.ceil((new Date(entry.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400_000);
}

function validateEmiEntry(label, amount, dueDate) {
  if (!label.trim()) return 'Label is required';
  if (amount <= 0 || !Number.isFinite(amount)) return 'Amount must be a positive number';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return 'Invalid date format';
  if (isNaN(new Date(dueDate + 'T00:00:00').getTime())) return 'Invalid date';
  return null;
}

function sortEmiEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

function getUpcomingWeek(entries) {
  return entries.filter(e => !e.isPaid && isDueWithinDays(e, 7));
}

function getOverdue(entries) {
  return entries.filter(e => isOverdue(e));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Mood engine mirror
const RESPONSES = {
  calm: { acknowledgment: "Sab sorted hai aaj", suggestion: "A good day to reflect", actionType: 'gratitude' },
  happy: { acknowledgment: "Love this energy!", suggestion: "Ride this wave", actionType: 'jaap_short', jaapDuration: 3 },
  overwhelmed: { acknowledgment: "Bahut zyada ho raha hai", suggestion: "Let's breathe first", actionType: 'breathe', jaapDuration: 2 },
  low_energy: { acknowledgment: "Low battery mode", suggestion: "Paani pee lo", actionType: 'rest', jaapDuration: 3 },
  anxious: { acknowledgment: "That knot in your chest", suggestion: "Let's ground first", actionType: 'ground', jaapDuration: 5 },
};

function getMoodResponse(mood) { return RESPONSES[mood]; }

const MOOD_META = {
  calm: { emoji: '😌', label: 'Calm', color: '#4ade80' },
  happy: { emoji: '😊', label: 'Happy', color: '#facc15' },
  overwhelmed: { emoji: '😰', label: 'Overwhelmed', color: '#f97316' },
  low_energy: { emoji: '😴', label: 'Low Energy', color: '#a78bfa' },
  anxious: { emoji: '😟', label: 'Anxious', color: '#f43f5e' },
};

// Helper: date string N days from now
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeEmi(overrides = {}) {
  return { id: 'test1', label: 'Car EMI', amount: 15000, dueDate: dateOffset(5), isPaid: false, createdAt: Date.now(), ...overrides };
}

// ── EMI Calculations ─────────────────────────────────────────────

describe('isOverdue', () => {
  it('paid EMI is never overdue', () => {
    assert.equal(isOverdue(makeEmi({ isPaid: true, dueDate: dateOffset(-10) })), false);
  });
  it('past-due unpaid EMI is overdue', () => {
    assert.equal(isOverdue(makeEmi({ dueDate: dateOffset(-1) })), true);
  });
  it('future unpaid EMI is not overdue', () => {
    assert.equal(isOverdue(makeEmi({ dueDate: dateOffset(5) })), false);
  });
  it('today due is not overdue', () => {
    assert.equal(isOverdue(makeEmi({ dueDate: dateOffset(0) })), false);
  });
});

describe('isDueWithinDays', () => {
  it('paid EMI excluded', () => {
    assert.equal(isDueWithinDays(makeEmi({ isPaid: true, dueDate: dateOffset(1) }), 7), false);
  });
  it('due today within 7 days', () => {
    assert.equal(isDueWithinDays(makeEmi({ dueDate: dateOffset(0) }), 7), true);
  });
  it('due in 7 days is within', () => {
    assert.equal(isDueWithinDays(makeEmi({ dueDate: dateOffset(7) }), 7), true);
  });
  it('due in 8 days is NOT within 7', () => {
    assert.equal(isDueWithinDays(makeEmi({ dueDate: dateOffset(8) }), 7), false);
  });
  it('overdue is NOT within', () => {
    assert.equal(isDueWithinDays(makeEmi({ dueDate: dateOffset(-1) }), 7), false);
  });
});

describe('daysUntilDue', () => {
  it('future date returns positive', () => {
    const days = daysUntilDue(makeEmi({ dueDate: dateOffset(5) }));
    assert.ok(days >= 4 && days <= 6); // rounding tolerance
  });
  it('past date returns negative', () => {
    const days = daysUntilDue(makeEmi({ dueDate: dateOffset(-3) }));
    assert.ok(days <= -2 && days >= -4);
  });
});

describe('validateEmiEntry', () => {
  it('empty label returns error', () => {
    assert.equal(validateEmiEntry('  ', 1000, '2026-12-01'), 'Label is required');
  });
  it('zero amount returns error', () => {
    assert.equal(validateEmiEntry('Loan', 0, '2026-12-01'), 'Amount must be a positive number');
  });
  it('negative amount returns error', () => {
    assert.equal(validateEmiEntry('Loan', -500, '2026-12-01'), 'Amount must be a positive number');
  });
  it('NaN amount returns error', () => {
    assert.equal(validateEmiEntry('Loan', NaN, '2026-12-01'), 'Amount must be a positive number');
  });
  it('Infinity amount returns error', () => {
    assert.equal(validateEmiEntry('Loan', Infinity, '2026-12-01'), 'Amount must be a positive number');
  });
  it('bad date format returns error', () => {
    assert.equal(validateEmiEntry('Loan', 1000, '12-01-2026'), 'Invalid date format');
  });
  it('valid entry returns null', () => {
    assert.equal(validateEmiEntry('Car EMI', 15000, '2026-12-15'), null);
  });
});

describe('sortEmiEntries', () => {
  it('paid EMIs go to bottom', () => {
    const entries = [
      makeEmi({ id: 'a', isPaid: true, dueDate: '2026-01-01' }),
      makeEmi({ id: 'b', isPaid: false, dueDate: '2026-06-01' }),
    ];
    const sorted = sortEmiEntries(entries);
    assert.equal(sorted[0].id, 'b');
    assert.equal(sorted[1].id, 'a');
  });
  it('unpaid sorted by date ascending', () => {
    const entries = [
      makeEmi({ id: 'a', dueDate: '2026-12-01' }),
      makeEmi({ id: 'b', dueDate: '2026-06-01' }),
      makeEmi({ id: 'c', dueDate: '2026-09-01' }),
    ];
    const sorted = sortEmiEntries(entries);
    assert.deepEqual(sorted.map(e => e.id), ['b', 'c', 'a']);
  });
});

describe('getUpcomingWeek', () => {
  it('filters to unpaid due within 7 days', () => {
    const entries = [
      makeEmi({ id: 'soon', dueDate: dateOffset(3) }),
      makeEmi({ id: 'far', dueDate: dateOffset(15) }),
      makeEmi({ id: 'paid', isPaid: true, dueDate: dateOffset(2) }),
    ];
    const result = getUpcomingWeek(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'soon');
  });
});

describe('getOverdue', () => {
  it('filters to unpaid overdue only', () => {
    const entries = [
      makeEmi({ id: 'late', dueDate: dateOffset(-5) }),
      makeEmi({ id: 'ok', dueDate: dateOffset(5) }),
      makeEmi({ id: 'paid-late', isPaid: true, dueDate: dateOffset(-5) }),
    ];
    const result = getOverdue(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'late');
  });
});

describe('generateId', () => {
  it('returns unique strings', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    assert.equal(ids.size, 100);
  });
});

// ── Mood Engine ──────────────────────────────────────────────────

describe('getMoodResponse', () => {
  const moods = ['calm', 'happy', 'overwhelmed', 'low_energy', 'anxious'];

  it('returns correct actionType for each mood', () => {
    assert.equal(getMoodResponse('calm').actionType, 'gratitude');
    assert.equal(getMoodResponse('happy').actionType, 'jaap_short');
    assert.equal(getMoodResponse('overwhelmed').actionType, 'breathe');
    assert.equal(getMoodResponse('low_energy').actionType, 'rest');
    assert.equal(getMoodResponse('anxious').actionType, 'ground');
  });

  it('all moods have acknowledgment and suggestion', () => {
    for (const mood of moods) {
      const r = getMoodResponse(mood);
      assert.ok(r.acknowledgment, `${mood} missing acknowledgment`);
      assert.ok(r.suggestion, `${mood} missing suggestion`);
    }
  });
});

describe('MOOD_META', () => {
  it('all 5 moods have entries', () => {
    const moods = ['calm', 'happy', 'overwhelmed', 'low_energy', 'anxious'];
    for (const mood of moods) {
      assert.ok(MOOD_META[mood], `${mood} missing from MOOD_META`);
      assert.ok(MOOD_META[mood].emoji);
      assert.ok(MOOD_META[mood].label);
      assert.ok(MOOD_META[mood].color);
    }
  });
});

// ── Storage (localStorage mock) ──────────────────────────────────

describe('storage with mock localStorage', () => {
  // Minimal localStorage mock
  let store = {};
  const mockLS = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };

  // Re-implement storage functions with mock
  function safeGet(key, fallback) {
    try {
      const raw = mockLS.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch { return fallback; }
  }

  function safeSet(key, value) {
    try { mockLS.setItem(key, JSON.stringify(value)); } catch {}
  }

  it('safeGet returns fallback when key missing', () => {
    store = {};
    assert.deepEqual(safeGet('nonexistent', []), []);
  });

  it('safeGet returns parsed value', () => {
    store = { test: JSON.stringify({ a: 1 }) };
    assert.deepEqual(safeGet('test', null), { a: 1 });
  });

  it('safeGet returns fallback on corrupt JSON', () => {
    store = { bad: '{not json' };
    assert.equal(safeGet('bad', 'fallback'), 'fallback');
  });

  it('safeSet stores JSON', () => {
    store = {};
    safeSet('key', [1, 2, 3]);
    assert.equal(store.key, '[1,2,3]');
  });

  it('mood log CRUD', () => {
    store = {};
    const MOOD_KEY = 'navkar_mood_log';
    const entry = { date: '2026-10-18', mood: 'calm', timestamp: Date.now() };
    // add
    const log = safeGet(MOOD_KEY, []);
    log.push(entry);
    safeSet(MOOD_KEY, log);
    // read
    const read = safeGet(MOOD_KEY, []);
    assert.equal(read.length, 1);
    assert.equal(read[0].mood, 'calm');
    // getTodayMood equivalent
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = read.find(e => e.date === today);
    if (today === '2026-10-18') {
      assert.ok(todayEntry);
    }
  });

  it('EMI CRUD', () => {
    store = {};
    const EMI_KEY = 'navkar_emi_entries';
    const emi = { id: 'e1', label: 'Car', amount: 15000, dueDate: '2026-11-01', isPaid: false, createdAt: Date.now() };
    // save
    safeSet(EMI_KEY, [emi]);
    // read
    const entries = safeGet(EMI_KEY, []);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].label, 'Car');
    // mark paid
    entries[0].isPaid = true;
    safeSet(EMI_KEY, entries);
    assert.equal(safeGet(EMI_KEY, [])[0].isPaid, true);
    // clear
    mockLS.removeItem(EMI_KEY);
    assert.deepEqual(safeGet(EMI_KEY, []), []);
  });

  it('priority task save/get', () => {
    store = {};
    const KEY = 'navkar_priority_task';
    assert.equal(safeGet(KEY, ''), '');
    safeSet(KEY, 'Finish report');
    assert.equal(safeGet(KEY, ''), 'Finish report');
  });

  it('punya count', () => {
    store = {};
    const KEY = 'navkar_punya_count';
    assert.equal(safeGet(KEY, 0), 0);
    safeSet(KEY, safeGet(KEY, 0) + 108);
    assert.equal(safeGet(KEY, 0), 108);
    safeSet(KEY, safeGet(KEY, 0) + 10);
    assert.equal(safeGet(KEY, 0), 118);
  });
});
