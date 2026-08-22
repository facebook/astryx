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

    expect(Object.keys(registry)).toEqual(Object.keys(defaultIcons));
    expect(registry).toEqual(defaultIcons);
    expect(registry).not.toBe(defaultIcons);
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

  it('keeps theme extension keys out of the typed registry snapshot', () => {
    // Themes may carry extension keys (e.g. 'richtext:bold'); the snapshot is
    // typed Record<IconName, ReactNode>, so only built-in names may enter it.
    const registry = getIconRegistry({
      icons: {'richtext:bold': 'themed-bold', close: 'themed-close'},
    } as unknown as Parameters<typeof getIconRegistry>[0]);
    expect(Object.keys(registry)).not.toContain('richtext:bold');
    expect(registry.close).toBe('themed-close');
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
      expect(Object.keys(getIconRegistry())).toEqual(Object.keys(defaultIcons));
    });

    it('extension keys are cleared by resetIcons', () => {
      registerIcons({'richtext:bold': 'my-bold'});
      resetIcons();
      expect(getExtendedIcon('richtext:bold', 'fallback')).toBe('fallback');
    });

    it('resolves theme icons over global registrations over the caller fallback', () => {
      // Layer 0: nothing registered — the caller fallback wins.
      expect(getExtendedIcon('richtext:bold', 'fallback-bold')).toBe(
        'fallback-bold',
      );

      // Layer 1: a global registration beats the fallback.
      registerIcons({'richtext:bold': 'global-bold'});
      expect(getExtendedIcon('richtext:bold', 'fallback-bold')).toBe(
        'global-bold',
      );

      // Layer 2: theme icons beat the global registration.
      const theme = defineTheme({
        name: 'brand',
        icons: {'richtext:bold': 'theme-bold'},
      });
      expect(getExtendedIcon('richtext:bold', 'fallback-bold', theme)).toBe(
        'theme-bold',
      );

      // Dropping the theme source falls back to the global layer…
      expect(getExtendedIcon('richtext:bold', 'fallback-bold')).toBe(
        'global-bold',
      );

      // …and clearing the global layer restores the caller fallback while the
      // theme source keeps resolving from its own icons.
      resetIcons();
      expect(getExtendedIcon('richtext:bold', 'fallback-bold', theme)).toBe(
        'theme-bold',
      );
      expect(getExtendedIcon('richtext:bold', 'fallback-bold')).toBe(
        'fallback-bold',
      );
    });

    it('keeps extension keys out of the snapshot for a registered theme name', () => {
      defineTheme({
        name: 'brand',
        icons: {'richtext:bold': 'themed-bold', close: 'themed-close'},
      });

      const registry = getIconRegistry('brand');
      expect(Object.keys(registry)).toEqual(Object.keys(defaultIcons));
      expect(Object.keys(registry)).not.toContain('richtext:bold');
      expect(registry.close).toBe('themed-close');
    });

    it('defineTheme extends-merge keeps base extension keys and overrides shared ones', () => {
      const base = defineTheme({
        name: 'base-brand',
        icons: {'richtext:bold': 'base-bold', close: 'base-close'},
      });
      const child = defineTheme({
        name: 'child-brand',
        extends: base,
        icons: {'richtext:bold': 'child-bold'},
      });

      expect(child.icons?.['richtext:bold']).toBe('child-bold');
      expect(child.icons?.close).toBe('base-close');
      // The merged icons resolve the same way through the icon APIs.
      expect(getExtendedIcon('richtext:bold', 'fallback', child)).toBe(
        'child-bold',
      );
      expect(getIcon('close', child)).toBe('base-close');
    });

    it('a child theme with no icons of its own inherits the base extension keys', () => {
      const base = defineTheme({
        name: 'base-brand',
        icons: {'richtext:bold': 'base-bold', close: 'base-close'},
      });
      defineTheme({name: 'child-brand', extends: base});

      // The toolbar resolves through useThemeName, i.e. the string-name
      // lookup path — a child that declares no icons must still reach the
      // base's extension keys there, not just via the theme object.
      expect(getExtendedIcon('richtext:bold', 'fallback', 'child-brand')).toBe(
        'base-bold',
      );
      expect(getIcon('close', 'child-brand')).toBe('base-close');
      expect(getIconRegistry('child-brand').close).toBe('base-close');
    });

    it('a nullish theme icon restores the fallback rather than blanking it', () => {
      registerIcons({close: 'global-close'});
      const nullTheme = defineTheme({
        name: 'null-icons',
        icons: {'richtext:bold': null, close: null},
      });

      // `themeIcons[name] ?? next` means a theme cannot blank a glyph by
      // setting it null — the next source in the chain wins instead.
      expect(getExtendedIcon('richtext:bold', 'bundled', nullTheme)).toBe(
        'bundled',
      );
      expect(getIcon('close', nullTheme)).toBe('global-close');
      // The snapshot and the resolver must agree about that.
      expect(getIconRegistry(nullTheme).close).toBe(
        getIcon('close', nullTheme),
      );
    });
  });

  // `name in obj` and a bare `obj[name]` both walk the prototype chain, so an
  // icon key that collides with an Object.prototype member used to resolve to
  // a built-in function. `getIcon('constructor')` handing back the `Object`
  // constructor is worse than a miss: the icon slot sees a function and tries
  // to render it as a component.
  describe('Object.prototype key collisions', () => {
    it.each(['toString', 'constructor', 'valueOf', 'hasOwnProperty'])(
      'does not resolve the inherited %s member as an icon',
      name => {
        expect(getExtendedIcon(name, 'bundled-fallback')).toBe(
          'bundled-fallback',
        );
        expect(getIcon(name)).toBeUndefined();
      },
    );

    it('keeps an inherited key out of the typed registry snapshot', () => {
      // How such a key actually arrives: icons assembled from a plain
      // string-keyed config (theme JSON, a CMS payload) rather than a literal
      // the IconName union could check.
      const icons: Record<string, string> = {toString: 'themed-toString'};
      const theme = defineTheme({name: 'proto-brand', icons});

      const registry = getIconRegistry(theme);
      // Not a built-in IconName, so it must be skipped exactly like any other
      // extension key — and the snapshot must stay stringifiable.
      expect(Object.keys(registry)).toEqual(Object.keys(defaultIcons));
      expect(Object.prototype.hasOwnProperty.call(registry, 'toString')).toBe(
        false,
      );
    });

    it('still resolves a genuine registration for such a key', () => {
      // Own properties are honored — only *inherited* members are ignored.
      const icons: Record<string, string> = {toString: 'real-icon'};
      registerIcons(icons);
      expect(getExtendedIcon('toString', 'bundled-fallback')).toBe('real-icon');
    });
  });
});
