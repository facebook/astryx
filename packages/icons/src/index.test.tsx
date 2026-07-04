import { describe, expect, it } from 'vitest';

describe('@jedi/icons', () => {
  it('exports icon components', async () => {
    const mod = await import('./index');
    expect(mod.IconCheck).toBeDefined();
    expect(mod.IconSearch).toBeDefined();
    expect(mod.IconX).toBeDefined();
    expect(mod.IconInfo).toBeDefined();
  });
});
