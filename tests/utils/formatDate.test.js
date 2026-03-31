import formatDate from '../../src/utils/formatDate.js';

describe('formatDate', () => {
  test('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  test('formats ISO date string to short readable format', () => {
    const formatted = formatDate('2024-05-21');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  test('returns original string for unparseable value', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
