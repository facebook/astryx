import { describe, expect, it } from 'vitest';
import { getAllCssVars } from '@jedi/tokens';
import { createTheme, defaultTheme } from './index';

describe('@jedi/themes', () => {
  it('creates default theme', () => {
    const theme = createTheme();
    expect(theme.name).toBe('jedi-default');
    expect(theme.contract.modes).toContain('light');
    expect(theme.contract.modes).toContain('dark');
  });

  it('generates light CSS vars', () => {
    const vars = defaultTheme.getCssVars('light');
    expect(vars['--jedi-semantic-surface-primary']).toBe('#ffffff');
  });

  it('generates dark CSS vars', () => {
    const vars = defaultTheme.getCssVars('dark');
    expect(vars['--jedi-semantic-surface-primary']).toBe('#030712');
  });

  it('produces style block', () => {
    const block = defaultTheme.toStyleBlock('light');
    expect(block).toContain('--jedi-semantic-surface-primary: #ffffff');
  });

  it('produces style tag', () => {
    const tag = defaultTheme.toStyleTag('dark');
    expect(tag).toContain(':root {');
    expect(tag).toContain('--jedi-semantic-surface-primary: #030712');
  });

  it('getAllCssVars matches theme output', () => {
    expect(defaultTheme.getCssVars('light')).toEqual(getAllCssVars('light'));
  });
});
