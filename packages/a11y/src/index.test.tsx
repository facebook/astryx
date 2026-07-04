import { describe, expect, it } from 'vitest';

describe('@jedi/a11y', () => {
  it('exports accessibility utilities', async () => {
    const mod = await import('./index');
    expect(mod.SkipLink).toBeDefined();
    expect(mod.focusRingStyle).toBeDefined();
    expect(mod.visuallyHiddenStyle).toBeDefined();
  });
});
