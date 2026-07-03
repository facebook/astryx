import { describe, expect, it } from 'vitest';
import {
  core,
  getAllCssVars,
  getCoreCssVars,
  getSemanticCssVars,
  resolveToken,
  resolveCoreValue,
  tokenToCssVar,
  validateTokenName,
  validateTokenDefinition,
  flattenTokens,
  tokensToCssVars,
  semantic,
  component,
} from './index';

describe('@jedi/tokens', () => {
  describe('core tokens', () => {
    it('resolves color.blue.500', () => {
      expect(resolveCoreValue('color.blue.500')).toBe('#3b82f6');
    });

    it('resolves spacing.4', () => {
      expect(resolveCoreValue('spacing.4')).toBe('16px');
    });

    it('has font.size.300', () => {
      expect(core.font.size[300]).toBe('16px');
    });
  });

  describe('semantic tokens', () => {
    it('has light and dark modes', () => {
      expect(semantic.light.surface.primary).toBe('#ffffff');
      expect(semantic.dark.surface.primary).toBe('#030712');
    });
  });

  describe('component tokens', () => {
    it('defines button tokens', () => {
      expect(component.button.paddingX).toBe('16px');
      expect(component.button.radius).toBe('8px');
    });
  });

  describe('CSS variable generation', () => {
    it('converts token name to CSS var', () => {
      expect(tokenToCssVar('color.blue.500')).toBe('--jedi-color-blue-500');
    });

    it('generates core CSS vars', () => {
      const vars = getCoreCssVars();
      expect(vars['--jedi-color-blue-500']).toBe('#3b82f6');
      expect(vars['--jedi-spacing-4']).toBe('16px');
    });

    it('generates semantic CSS vars with prefix', () => {
      const vars = getSemanticCssVars('light');
      expect(vars['--jedi-semantic-surface-primary']).toBe('#ffffff');
    });

    it('generates all tiers for a mode', () => {
      const vars = getAllCssVars('dark');
      expect(vars['--jedi-color-blue-500']).toBeDefined();
      expect(vars['--jedi-semantic-surface-primary']).toBe('#030712');
      expect(vars['--jedi-component-button-radius']).toBe('8px');
    });
  });

  describe('token resolution', () => {
    it('resolves core path', () => {
      expect(resolveToken('color.blue.500')).toBe('#3b82f6');
    });

    it('resolves semantic path in light mode', () => {
      expect(resolveToken('semantic.surface.primary', 'light')).toBe('#ffffff');
    });
  });

  describe('validation', () => {
    it('validates token names', () => {
      expect(validateTokenName('color.blue.500')).toBe(true);
      expect(validateTokenName('Color.Blue')).toBe(false);
      expect(validateTokenName('invalid name')).toBe(false);
    });

    it('validates token definitions', () => {
      const errors = validateTokenDefinition({
        name: 'color.blue.500',
        value: '#3b82f6',
        tier: 'core',
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid tier', () => {
      const errors = validateTokenDefinition({
        name: 'test.token',
        value: 'x',
        tier: 'invalid' as 'core',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('flatten and css vars', () => {
    it('flattens nested objects', () => {
      const flat = flattenTokens({ color: { blue: { 500: '#3b82f6' } } });
      expect(flat['color.blue.500']).toBe('#3b82f6');
    });

    it('converts flat tokens to css vars', () => {
      const vars = tokensToCssVars({ 'spacing.4': '16px' });
      expect(vars['--jedi-spacing-4']).toBe('16px');
    });
  });
});
