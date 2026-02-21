import { describe, expect, it } from 'vitest';
import neuroPlugin, { neuroPlugin as namedExport } from './index';

describe('@neuroui/tailwind', () => {
  it('exports default plugin', () => {
    expect(neuroPlugin).toBeDefined();
    expect(typeof neuroPlugin).toBe('object');
  });

  it('exports named neuroPlugin', () => {
    expect(namedExport).toBeDefined();
    expect(namedExport).toBe(neuroPlugin);
  });

  it('plugin has handler property', () => {
    expect(neuroPlugin).toHaveProperty('handler');
    expect(typeof neuroPlugin.handler).toBe('function');
  });
});
