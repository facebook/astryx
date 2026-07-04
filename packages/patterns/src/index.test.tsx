import { describe, expect, it } from 'vitest';

describe('@jedi/patterns', () => {
  it('exports layout patterns', async () => {
    const mod = await import('./index');
    expect(mod.DocLayout).toBeDefined();
    expect(mod.SideNav).toBeDefined();
    expect(mod.CommandPalette).toBeDefined();
    expect(mod.PageHeader).toBeDefined();
  });
});
