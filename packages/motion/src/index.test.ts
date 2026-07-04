import { describe, expect, it } from 'vitest';

describe('@jedi/motion', () => {
  it('exports motion tokens', async () => {
    const mod = await import('./index');
    expect(mod.duration).toBeDefined();
    expect(mod.easing).toBeDefined();
    expect(mod.transition).toBeDefined();
    expect(typeof mod.motionStyleSheet).toBe('function');
  });
});
