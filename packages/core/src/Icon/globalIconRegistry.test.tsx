// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render} from '@testing-library/react';
import {defineTheme, type DefinedTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {__resetDevWarnings} from '../utils/devWarning';
import {defaultIcons} from './defaultIcons';
import {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  getComponentIconName,
  getComponentIcon,
  resetIcons,
  type IconRegistry,
} from './globalIconRegistry';
import {Icon} from './Icon';

// Exactly what a package that owns a slot writes, aimed at the public module
// (`@astryxdesign/core/Icon` resolves to ./index). Core itself declares none.
declare module './index' {
  interface ComponentIconSlotMap {
    'fixture-card-dismiss': true;
    'fixture-card-status': true;
  }
}

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

  it('draws the default upload distinctly from arrowUp', () => {
    const {container: upload} = render(<Icon icon="upload" />);
    const {container: arrowUp} = render(<Icon icon="arrowUp" />);

    expect(getIcon('upload')).toBe(defaultIcons.upload);
    expect(upload.querySelector('svg')).not.toBeNull();
    expect(upload.querySelector('svg')?.innerHTML).not.toBe(
      arrowUp.querySelector('svg')?.innerHTML,
    );
  });

  it('keeps complete registries authored before upload assignable', () => {
    const {upload: _upload, ...legacyIcons} = defaultIcons;
    const legacyRegistry: IconRegistry = legacyIcons;

    expect(legacyRegistry.search).toBe(defaultIcons.search);
  });

  it('lets a theme draw upload without changing arrowUp', () => {
    const theme = defineTheme({
      name: 'upload-only',
      icons: {upload: 'theme-upload'},
    });

    expect(getIcon('upload', theme)).toBe('theme-upload');
    expect(getIcon('arrowUp', theme)).toBe(defaultIcons.arrowUp);
    expect(getIconRegistry(theme).arrowUp).toBe(defaultIcons.arrowUp);
  });

  it('resolves the default upload for a theme that only draws arrowUp', () => {
    const {upload: _upload, ...legacyIcons} = defaultIcons;
    const theme = defineTheme({
      name: 'legacy-complete',
      icons: {...legacyIcons, arrowUp: 'theme-arrow-up'},
    });

    expect(getIcon('arrowUp', theme)).toBe('theme-arrow-up');
    expect(getIcon('upload', theme)).toBe(defaultIcons.upload);
    expect(getIconRegistry(theme).upload).toBe(defaultIcons.upload);
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

  describe('component icon slots', () => {
    it('returns the fallback without a theme source', () => {
      expect(getComponentIconName('fixture-card-dismiss', 'close')).toBe(
        'close',
      );
      expect(getComponentIconName('fixture-card-dismiss', null)).toBeNull();
      expect(getComponentIcon('fixture-card-dismiss', 'close')).toBe(
        defaultIcons.close,
      );
      expect(getComponentIcon('fixture-card-dismiss', null)).toBeNull();
    });

    it('returns the fallback when the theme does not map the slot', () => {
      const noMap = defineTheme({
        name: 'no-map',
        icons: {close: 'theme-close'},
      });
      const otherSlot = defineTheme({
        name: 'other-slot',
        componentIcons: {'fixture-card-status': 'warning'},
      });

      expect(getComponentIconName('fixture-card-dismiss', 'close', noMap)).toBe(
        'close',
      );
      expect(getComponentIcon('fixture-card-dismiss', 'close', noMap)).toBe(
        'theme-close',
      );
      expect(
        getComponentIconName('fixture-card-dismiss', 'close', otherSlot),
      ).toBe('close');
      expect(
        getComponentIconName('fixture-card-dismiss', null, otherSlot),
      ).toBe(null);
    });

    it('treats an undefined theme entry as unmapped', () => {
      // defineTheme strips undefined entries; a hand-built theme object may not.
      const theme: DefinedTheme = {
        name: 'raw',
        tokens: {},
        componentIcons: {'fixture-card-dismiss': undefined},
      };

      expect(getComponentIconName('fixture-card-dismiss', 'close', theme)).toBe(
        'close',
      );
      expect(getComponentIcon('fixture-card-dismiss', null, theme)).toBeNull();
    });

    it('renders no icon for a null theme entry, whatever the fallback', () => {
      registerIcons({close: 'global-close'});
      const theme = defineTheme({
        name: 'hidden',
        componentIcons: {'fixture-card-dismiss': null},
        icons: {close: 'theme-close'},
      });

      expect(getComponentIconName('fixture-card-dismiss', 'close', theme)).toBe(
        null,
      );
      expect(
        getComponentIcon('fixture-card-dismiss', 'close', theme),
      ).toBeNull();
    });

    it('draws a mapped name through the shared theme, global, default order', () => {
      registerIcons({check: 'global-check', success: 'global-success'});
      const theme = defineTheme({
        name: 'mapped',
        componentIcons: {
          'fixture-card-dismiss': 'success',
          'fixture-card-status': 'check',
        },
        icons: {success: 'theme-success'},
      });

      expect(getComponentIconName('fixture-card-dismiss', 'close', theme)).toBe(
        'success',
      );
      // Theme artwork for the mapped name wins.
      expect(getComponentIcon('fixture-card-dismiss', 'close', theme)).toBe(
        'theme-success',
      );
      // No theme artwork: the global registration for the mapped name.
      expect(getComponentIcon('fixture-card-status', 'close', theme)).toBe(
        'global-check',
      );

      resetIcons();
      // Nothing registered: the built-in default for the mapped name.
      expect(getComponentIcon('fixture-card-status', 'close', theme)).toBe(
        defaultIcons.check,
      );
      // A mapped name replaces the fallback entirely, even a null one.
      expect(getComponentIcon('fixture-card-status', null, theme)).toBe(
        defaultIcons.check,
      );
    });

    it('resolves a registered theme name like getIcon does', () => {
      defineTheme({
        name: 'registered',
        componentIcons: {'fixture-card-dismiss': 'info'},
        icons: {info: 'theme-info'},
      });

      expect(
        getComponentIconName('fixture-card-dismiss', 'close', 'registered'),
      ).toBe('info');
      expect(
        getComponentIcon('fixture-card-dismiss', 'close', 'registered'),
      ).toBe('theme-info');
      expect(
        getComponentIconName('fixture-card-dismiss', 'close', 'unregistered'),
      ).toBe('close');
      expect(getComponentIconName('fixture-card-dismiss', 'close', null)).toBe(
        'close',
      );
    });

    it('leaves the shared names and extension keys untouched', () => {
      const theme = defineTheme({
        name: 'slot-only',
        componentIcons: {'fixture-card-dismiss': 'success'},
      });

      expect(getIcon('close', theme)).toBe(defaultIcons.close);
      expect(getIcon('success', theme)).toBe(defaultIcons.success);
      expect(getIconRegistry(theme)).toEqual(getIconRegistry());
      expect(Object.keys(getIconRegistry(theme))).not.toContain(
        'fixture-card-dismiss',
      );
      expect(getIcon('numberInput:stepperDown', theme)).toBe(
        defaultIcons['numberInput:stepperDown'],
      );
      expect(getExtendedIcon('richtext:bold', 'inline-svg', theme)).toBe(
        'inline-svg',
      );
    });

    it('ignores inherited object properties as slot entries', () => {
      const theme: DefinedTheme = {
        name: 'proto',
        tokens: {},
        componentIcons: Object.create({'fixture-card-dismiss': 'success'}),
      };

      expect(getComponentIconName('fixture-card-dismiss', 'close', theme)).toBe(
        'close',
      );
    });
  });
});
