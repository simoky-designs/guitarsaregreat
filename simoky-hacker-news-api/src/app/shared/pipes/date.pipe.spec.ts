import '@angular/compiler';
import { describe, expect, it } from 'vitest';

import { PostedAtDatePipe } from './date.pipe';

describe('PostedAtDatePipe', () => {
  const pipe = new PostedAtDatePipe();

  it('transforms a timestamp into a date', () => {
    expect(pipe.transform('2026-09-17T17:00:59')).toBe('Sep 17, 2026');
  });

  it('supports a custom date format', () => {
    expect(pipe.transform('2026-09-17T17:00:59', 'yyyy-MM-dd')).toBe('2026-09-17');
  });

  it('returns a placeholder for missing or invalid values', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform('not-a-date')).toBe('-');
  });
});