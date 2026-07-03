import { describe, expect, it } from 'vitest';

describe('@jedi/react', () => {
  it('package exports are defined', async () => {
    const mod = await import('./index');
    expect(mod.Button).toBeDefined();
    expect(mod.Card).toBeDefined();
    expect(mod.Dialog).toBeDefined();
    expect(mod.Input).toBeDefined();
    expect(mod.Badge).toBeDefined();
  });
});
