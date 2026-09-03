// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {defineTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {__resetDevWarnings} from '../utils/devWarning';
import {defaultIcons} from './defaultIcons';
import {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  resetIcons,
} from './globalIconRegistry';

describe('iconRegistry (global, RSC-compatible)', () => {
  beforeEach(() => {
    resetIcons();
    resetThemes();
    __resetDevWarnings();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a default icon registry snapshot', () => {
    const registry = getIconRegistry();
    const builtInDefaults = Object.fromEntries(
      Object.entries(defaultIcons).filter(([name]) => !name.includes(':')),
    );

    expect(registry).toEqual(builtInDefaults);
    expect(registry).not.toBe(defaultIcons);
  });

  it('provides a distinct default for the NumberInput stepper icon', () => {
    const icon = getIcon('numberInput:stepperDown');

    expect(icon).toBe(defaultIcons['numberInput:stepperDown']);
    expect(icon).toBeDefined();
    expect(icon).not.toBe(defaultIcons.chevronDown);
  });

  it('returns default icons when nothing is registered', () => {
    const icon = getIcon('close');
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it('warns once that registerIcons applies global overrides', () => {
    const warnSpy = vi.mocked(console.warn);

    registerIcons({close: 'custom-close'});
    registerIcons({check: 'custom-check'});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      '`registerIcons()` applies icon overrides globally',
    );
  });

  it('returns registered icons over defaults', () => {
    const customClose = 'custom-close-icon';
    registerIcons({close: customClose});

    expect(getIcon('close')).toBe(customClose);
    expect(getIconRegistry().close).toBe(customClose);
    expect(getIconRegistry().check).toBe(defaultIcons.check);
  });

  it('falls back to defaults for unregistered names', () => {
    registerIcons({close: 'custom-close'});
    // 'check' was not registered, should fall back to default
    const checkIcon = getIcon('check');
    expect(checkIcon).toBeDefined();
    expect(checkIcon).not.toBe('custom-close');
  });

  it('keeps registry snapshots aligned with getIcon fallback behavior', () => {
    registerIcons({close: null});

    expect(getIcon('close')).toBe(defaultIcons.close);
    expect(getIconRegistry().close).toBe(defaultIcons.close);
  });

  it('merges multiple registerIcons calls', () => {
    registerIcons({close: 'close-v1'});
    registerIcons({check: 'check-v1'});
    expect(getIcon('close')).toBe('close-v1');
    expect(getIcon('check')).toBe('check-v1');
  });

  it('later registrations override earlier ones', () => {
    registerIcons({close: 'close-v1'});
    registerIcons({close: 'close-v2'});
    expect(getIcon('close')).toBe('close-v2');
  });

  it('resolves icons from an explicit theme object over global registrations', () => {
    registerIcons({close: 'global-close'});
    const theme = defineTheme({
      name: 'brand',
      icons: {close: 'theme-close'},
    });

    expect(getIcon('close', theme)).toBe('theme-close');
    expect(getIconRegistry(theme).close).toBe('theme-close');
  });

  it('resolves icons from a registered theme name for SSR-friendly lookups', () => {
    defineTheme({
      name: 'brand',
      icons: {close: 'theme-close'},
    });

    expect(getIcon('close', 'brand')).toBe('theme-close');
    expect(getIconRegistry('brand').close).toBe('theme-close');
  });

  it('falls back through global registrations when a theme omits a name', () => {
    registerIcons({close: 'global-close'});
    const theme = defineTheme({name: 'brand', icons: {check: 'theme-check'}});

    expect(getIcon('close', theme)).toBe('global-close');
    expect(getIcon('check', theme)).toBe('theme-check');
  });

  it('resetIcons clears the global registry', () => {
    registerIcons({close: 'custom'});
    expect(getIcon('close')).toBe('custom');
    resetIcons();
    // Should fall back to default
    expect(getIcon('close')).not.toBe('custom');
  });

  describe('extension keys', () => {
    it('registers and resolves library-contributed keys', () => {
      registerIcons({'richtext:bold': 'my-bold'});
      expect(getIcon('richtext:bold')).toBe('my-bold');
      expect(getExtendedIcon('richtext:bold')).toBe('my-bold');
    });

    it('getExtendedIcon returns the caller fallback when unregistered', () => {
      expect(getExtendedIcon('richtext:bold', 'inline-svg')).toBe('inline-svg');
    });

    it('getExtendedIcon prefers a registered icon over the fallback', () => {
      registerIcons({'richtext:bold': 'theme-bold'});
      expect(getExtendedIcon('richtext:bold', 'inline-svg')).toBe('theme-bold');
    });

    it('getExtendedIcon still resolves built-in defaults', () => {
      expect(getExtendedIcon('close', 'fallback')).toBe(defaultIcons.close);
    });

    it('extension keys do not leak into the built-in registry snapshot', () => {
      registerIcons({'richtext:bold': 'my-bold'});
      // getIconRegistry() is the built-in IconName snapshot; extension keys
      // are resolved via getIcon/getExtendedIcon, not surfaced here.
      expect(Object.keys(getIconRegistry())).not.toContain('richtext:bold');
      expect(Object.keys(getIconRegistry())).not.toContain(
        'numberInput:stepperDown',
      );
    });

    it('extension keys are cleared by resetIcons', () => {
      registerIcons({'richtext:bold': 'my-bold'});
      resetIcons();
      expect(getExtendedIcon('richtext:bold', 'fallback')).toBe('fallback');
    });
  });
});
