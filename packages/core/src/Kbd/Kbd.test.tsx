// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Kbd.test.tsx
 * @input Uses React Testing Library, Kbd
 * @output Tests for Kbd component
 *
 * Note: Tests run in jsdom which reports a non-Mac platform,
 * so `mod` resolves to "Ctrl" rather than "\u2318" after the layout effect.
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect, afterEach, vi} from 'vitest';
import {Kbd} from './Kbd';

describe('Kbd', () => {
  const originalPlatform = navigator.platform;

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore platform after any test that spoofs it \u2014 ensures no
    // test pollution even if an assertion fails mid-test.
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });

  it('renders a single key', () => {
    render(<Kbd keys="k" />);
    const kbd = screen.getByText('K');
    expect(kbd.tagName).toBe('KBD');
  });

  it('renders multiple keys separated by +', () => {
    render(<Kbd keys="mod+k" />);
    // In jsdom (non-Mac), mod renders as "Ctrl"
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders mod as Ctrl on non-Mac platforms', () => {
    // jsdom is a non-Mac environment, so mod \u2192 Ctrl
    render(<Kbd keys="mod" />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('renders mod as \u2318 on Mac platforms', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    render(<Kbd keys="mod" />);
    expect(screen.getByText('\u2318')).toBeInTheDocument(); // \u2318
  });

  it('maps modifier keys to symbols', () => {
    render(<Kbd keys="ctrl+alt+shift+k" />);
    expect(screen.getByText('\u2303')).toBeInTheDocument(); // \u2303
    expect(screen.getByText('\u2325')).toBeInTheDocument(); // \u2325
    expect(screen.getByText('\u21E7')).toBeInTheDocument(); // \u21E7
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('maps special keys', () => {
    render(<Kbd keys="enter" />);
    expect(screen.getByText('\u21B5')).toBeInTheDocument(); // \u21B5
  });

  it('renders escape as text', () => {
    render(<Kbd keys="escape" />);
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it.each([
    {alias: 'esc', display: 'Esc', label: 'Escape'},
    {alias: 'return', display: '\u21B5', label: 'Enter'},
  ])('normalizes the $alias key alias', ({alias, display, label}) => {
    render(<Kbd keys={alias} />);
    expect(screen.getByText(display)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', label);
  });

  it.each([
    {alias: 'esc', canonical: 'escape'},
    {alias: 'return', canonical: 'enter'},
  ])('$alias renders identically to $canonical', ({alias, canonical}) => {
    const {container, rerender} = render(<Kbd keys={canonical} />);
    const text = container.textContent;
    const label = screen.getByRole('img').getAttribute('aria-label');
    rerender(<Kbd keys={alias} />);
    expect(container.textContent).toBe(text);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(label);
  });

  it.each([
    {keys: 'ctrl + ESC', display: 'Esc', label: 'Control + Escape'},
    {keys: 'shift + RETURN', display: '\u21B5', label: 'Shift + Enter'},
  ])('normalizes aliases inside the $keys combo', ({keys, display, label}) => {
    render(<Kbd keys={keys} />);
    expect(screen.getByText(display)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', label);
  });

  it('keeps child keys unique after alias normalization', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const {container} = render(
      <Kbd keys="escape+esc+ESC+enter+return+return" />,
    );
    expect(consoleError).not.toHaveBeenCalled();
    expect(
      Array.from(container.querySelectorAll('kbd'), key => key.textContent),
    ).toEqual(['Esc', 'Esc', 'Esc', '↵', '↵', '↵']);
  });

  it.each(['constructor', '__proto__'])(
    'renders the unknown %s key without consulting object prototypes',
    key => {
      render(<Kbd keys={key} />);
      expect(screen.getByText(key.toUpperCase())).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        key.toUpperCase(),
      );
    },
  );

  it('exposes a spoken accessible name and hides the glyphs (obs-1)', () => {
    render(<Kbd keys="mod+shift+k" />);
    // The wrapper carries a screen-reader name built from spoken key labels
    // (jsdom is non-Mac, so mod → "Control").
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'Control + Shift + K');
    // The visual glyph elements are hidden from assistive tech.
    const glyphs = img.querySelectorAll('kbd');
    glyphs.forEach(g => expect(g).toHaveAttribute('aria-hidden', 'true'));
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('uses "Command" in the accessible name for mod on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });
    render(<Kbd keys="mod+k" />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Command + K',
    );
  });

  it('uppercases unknown keys', () => {
    render(<Kbd keys="f1" />);
    expect(screen.getByText('F1')).toBeInTheDocument();
  });

  it('handles whitespace around keys', () => {
    render(<Kbd keys="mod + k" />);
    // In jsdom (non-Mac), mod renders as "Ctrl"
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders astryx-* class names for theme targeting', () => {
    const {container} = render(<Kbd keys="k" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('astryx-kbd');
  });

  it('renders "plus" as a literal + key', () => {
    render(<Kbd keys="shift+plus" />);
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('keeps the computed role and aria-label when unrelated rest props are spread', () => {
    render(<Kbd keys="mod+k" data-testid="kbd" id="shortcut" />);
    const el = screen.getByTestId('kbd');
    // Pass-through attributes land on the wrapper...
    expect(el).toHaveAttribute('id', 'shortcut');
    // ...without disturbing the computed accessibility contract.
    expect(el).toHaveAttribute('role', 'img');
    expect(el).toHaveAttribute('aria-label', 'Control + K');
  });

  it('computed role and aria-label win over consumer-passed overrides', () => {
    // Contract props the component computes must not be clobbered by
    // pass-through attributes: {...rest} is spread before role/aria-label.
    render(
      <Kbd
        keys="mod+k"
        role="presentation"
        aria-label="custom"
        data-testid="kbd"
      />,
    );
    const el = screen.getByTestId('kbd');
    expect(el).toHaveAttribute('role', 'img');
    expect(el).toHaveAttribute('aria-label', 'Control + K');
  });
});
