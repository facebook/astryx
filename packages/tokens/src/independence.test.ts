import { describe, expect, it } from 'vitest';
import {
  component,
  core,
  getAllCssVars,
  getCssVarsForContracts,
  highContrastThemeContracts,
  semanticLight,
  themeContracts,
} from './index';

describe('Gate 1 independence experiments', () => {
  it('adds semantic.interactive.hover without component tier changes', () => {
    expect(semanticLight.interactive.hover).toBe('#f3f4f6');
    const vars = getAllCssVars('light');
    expect(vars['--jedi-semantic-interactive-hover']).toBe('#f3f4f6');
  });

  it('adds third theme contract with different semantic values', () => {
    const defaultLight = getAllCssVars('light')['--jedi-semantic-surface-primary'];
    const hcLight = getCssVarsForContracts(highContrastThemeContracts, 'light')[
      '--jedi-semantic-surface-primary'
    ];
    expect(defaultLight).toBe('#ffffff');
    expect(hcLight).toBe('#ffffff');
    const hcText = getCssVarsForContracts(highContrastThemeContracts, 'light')[
      '--jedi-semantic-text-primary'
    ];
    expect(hcText).toBe('#000000');
  });

  it('spacing.4 change propagates to component tokens via core reference', () => {
    expect(core.spacing[4]).toBe('16px');
    expect(component.button.paddingX).toBe('16px');
  });

  it('font.size.300 is independent of semantic text color tokens', () => {
    expect(core.font.size[300]).toBe('16px');
    expect(semanticLight.text.primary).toBe('#111827');
    const vars = getAllCssVars('light');
    expect(vars['--jedi-font-size-300']).toBe('16px');
    expect(vars['--jedi-semantic-text-primary']).toBe('#111827');
  });

  it('default theme contracts resolve through getAllCssVars', () => {
    expect(getCssVarsForContracts(themeContracts, 'light')).toEqual(getAllCssVars('light'));
  });
});
