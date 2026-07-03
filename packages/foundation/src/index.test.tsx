import { describe, expect, it } from 'vitest';
import { resolveSpacing } from './index';

describe('@jedi/foundation', () => {
  it('resolves spacing to CSS var references', () => {
    expect(resolveSpacing(4)).toContain('--jedi-spacing-4');
  });

  it('returns undefined for missing spacing', () => {
    expect(resolveSpacing(undefined)).toBeUndefined();
  });
});
