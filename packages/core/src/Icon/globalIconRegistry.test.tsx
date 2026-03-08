import {describe, it, expect, beforeEach} from 'vitest';
import {registerIcons, getIcon, resetIcons} from './globalIconRegistry';

describe('iconRegistry (global, RSC-compatible)', () => {
  beforeEach(() => {
    resetIcons();
  });

  it('returns default icons when nothing is registered', () => {
    const icon = getIcon('close');
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it('returns registered icons over defaults', () => {
    const customClose = 'custom-close-icon';
    registerIcons({close: customClose});
    expect(getIcon('close')).toBe(customClose);
  });

  it('falls back to defaults for unregistered names', () => {
    registerIcons({close: 'custom-close'});
    // 'selector.check' was not registered, should fall back to default
    const checkIcon = getIcon('selector.check');
    expect(checkIcon).toBeDefined();
    expect(checkIcon).not.toBe('custom-close');
  });

  it('merges multiple registerIcons calls', () => {
    registerIcons({close: 'close-v1'});
    registerIcons({'selector.check': 'check-v1'});
    expect(getIcon('close')).toBe('close-v1');
    expect(getIcon('selector.check')).toBe('check-v1');
  });

  it('later registrations override earlier ones', () => {
    registerIcons({close: 'close-v1'});
    registerIcons({close: 'close-v2'});
    expect(getIcon('close')).toBe('close-v2');
  });

  it('resetIcons clears the global registry', () => {
    registerIcons({close: 'custom'});
    expect(getIcon('close')).toBe('custom');
    resetIcons();
    // Should fall back to default
    expect(getIcon('close')).not.toBe('custom');
  });

  it('supports namespaced icon names', () => {
    registerIcons({
      'status.warning': 'custom-warning',
      'selector.chevron': 'custom-chevron',
    });
    expect(getIcon('status.warning')).toBe('custom-warning');
    expect(getIcon('selector.chevron')).toBe('custom-chevron');
  });

  it('supports marketplace component icons via extensible naming', () => {
    registerIcons({
      'ratingWidget.star': 'star-icon',
      'ratingWidget.starEmpty': 'star-empty-icon',
    });
    expect(getIcon('ratingWidget.star')).toBe('star-icon');
    expect(getIcon('ratingWidget.starEmpty')).toBe('star-empty-icon');
  });
});
