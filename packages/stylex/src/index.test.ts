import { describe, expect, it } from 'vitest';
import { tokenToCssVar } from '@jedi/tokens';
import { tokenVar, STYLING_ENGINE, colors, spacing } from './index';

describe('@jedi/stylex', () => {
  it('declares StyleX as current engine', () => {
    expect(STYLING_ENGINE).toBe('stylex');
  });

  it('binds token paths to CSS var references', () => {
    expect(tokenVar('spacing.4')).toBe(`var(${tokenToCssVar('spacing.4')})`);
    expect(tokenVar('semantic.surface.primary')).toBe(
      `var(${tokenToCssVar('semantic.surface.primary')})`,
    );
  });

  it('exposes semantic color tokens', () => {
    expect(colors.surfacePrimary).toContain('--jedi-semantic-surface-primary');
  });

  it('exposes spacing tokens', () => {
    expect(spacing[4]).toContain('--jedi-spacing-4');
  });
});
