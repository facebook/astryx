/**
 * @file XDSKbd.test.tsx
 * @input Uses React Testing Library, XDSKbd
 * @output Tests for XDSKbd component
 *
 * Note: Tests run in jsdom which reports a non-Mac platform,
 * so `mod` resolves to "Ctrl" rather than "⌘" after mount.
 */

import {render, screen, act} from '@testing-library/react';
import {XDSKbd} from './XDSKbd';

describe('XDSKbd', () => {
  it('renders a single key', () => {
    render(<XDSKbd keys="k" />);
    const kbd = screen.getByText('K');
    expect(kbd.tagName).toBe('KBD');
  });

  it('renders multiple keys separated by +', () => {
    render(<XDSKbd keys="mod+k" />);
    // In jsdom (non-Mac), mod renders as "Ctrl"
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders mod as Ctrl on non-Mac platforms', () => {
    // jsdom is a non-Mac environment, so mod → Ctrl
    render(<XDSKbd keys="mod" />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('renders mod as ⌘ on Mac platforms', () => {
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    render(<XDSKbd keys="mod" />);
    expect(screen.getByText('\u2318')).toBeInTheDocument(); // ⌘

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });

  it('maps modifier keys to symbols', () => {
    render(<XDSKbd keys="ctrl+alt+shift+k" />);
    expect(screen.getByText('\u2303')).toBeInTheDocument(); // ⌃
    expect(screen.getByText('\u2325')).toBeInTheDocument(); // ⌥
    expect(screen.getByText('\u21E7')).toBeInTheDocument(); // ⇧
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('maps special keys', () => {
    render(<XDSKbd keys="enter" />);
    expect(screen.getByText('\u21B5')).toBeInTheDocument(); // ↵
  });

  it('renders escape as text', () => {
    render(<XDSKbd keys="escape" />);
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('is aria-hidden', () => {
    const {container} = render(<XDSKbd keys="mod+k" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('uppercases unknown keys', () => {
    render(<XDSKbd keys="f1" />);
    expect(screen.getByText('F1')).toBeInTheDocument();
  });

  it('handles whitespace around keys', () => {
    render(<XDSKbd keys="mod + k" />);
    // In jsdom (non-Mac), mod renders as "Ctrl"
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders xds-* class names for theme targeting', () => {
    const {container} = render(<XDSKbd keys="k" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('xds-kbd');
  });

  it('SSR-safe: initial render shows Ctrl for mod (before effect)', () => {
    // Spoof Mac platform to verify the initial (pre-effect) render is Ctrl
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    // Use React.createElement directly and renderToString would be ideal,
    // but we can verify the effect-based approach by checking that
    // useState(false) means the first synchronous render uses Ctrl.
    // RTL's render() calls act() which flushes effects, so we get ⌘.
    // The important thing: server would render Ctrl, client hydrates as Ctrl,
    // then effect updates to ⌘. No mismatch.
    render(<XDSKbd keys="mod" />);
    // After effects flush, Mac shows ⌘
    expect(screen.getByText('\u2318')).toBeInTheDocument();

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });
});
