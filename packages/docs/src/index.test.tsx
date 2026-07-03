import { describe, expect, it } from 'vitest';

describe('@jedi/docs', () => {
  it('exports documentation components', async () => {
    const mod = await import('./index');
    expect(mod.EvidencePanel).toBeDefined();
    expect(mod.ADRViewer).toBeDefined();
    expect(mod.MetricsCard).toBeDefined();
    expect(mod.ResearchCallout).toBeDefined();
    expect(mod.TokenViewer).toBeDefined();
  });
});
