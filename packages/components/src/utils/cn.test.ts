import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns empty string for all falsy values', () => {
    expect(cn(undefined, null, false, '')).toBe('');
  });

  it('joins multiple class names with space', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filters out undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('filters out null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('filters out false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('filters out empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('handles single class name', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('supports conditional expressions', () => {
    const isActive = true as boolean;
    const isDisabled = false as boolean;
    expect(cn('btn', isActive && 'active', isDisabled && 'disabled')).toBe(
      'btn active',
    );
  });

  it('merges conflicting Tailwind classes with tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });
});
