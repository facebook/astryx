// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useKeyboardHint.test.tsx
 * @input Uses React Testing Library, useKeyboardHint
 * @output Unit tests for keyboard hint rendering
 */

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useKeyboardHint, type KeyboardHintOrientation} from './useKeyboardHint';
import {InternationalizationProvider} from '../i18n';

function TestHint({orientation}: {orientation?: KeyboardHintOrientation}) {
  const {hintElement} = useKeyboardHint({orientation});
  return <div>{hintElement}</div>;
}

function getKeyLabels(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('.astryx-kbd')).map(key =>
    key.getAttribute('aria-label'),
  );
}

function getKeyText(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('kbd')).map(
    key => key.textContent ?? '',
  );
}

describe('useKeyboardHint', () => {
  it('renders horizontal arrow keys with Kbd', () => {
    const {container} = render(<TestHint orientation="horizontal" />);

    expect(getKeyLabels(container)).toEqual(['Left arrow', 'Right arrow']);
    expect(getKeyText(container)).toEqual(['←', '→']);
  });

  it('renders vertical arrow keys with Kbd', () => {
    const {container} = render(<TestHint orientation="vertical" />);

    expect(getKeyLabels(container)).toEqual(['Up arrow', 'Down arrow']);
    expect(getKeyText(container)).toEqual(['↑', '↓']);
  });

  it('renders all arrow keys for both-axis navigation', () => {
    const {container} = render(<TestHint orientation="both" />);

    expect(getKeyLabels(container)).toEqual([
      'Left arrow',
      'Right arrow',
      'Up arrow',
      'Down arrow',
    ]);
    expect(getKeyText(container)).toEqual(['←', '→', '↑', '↓']);
  });

  it('positions the hint farther from the anchor', () => {
    const {container} = render(<TestHint />);
    const hint = container.querySelector('[popover="manual"]') as HTMLElement;

    expect(hint.style.marginBlockStart).toBe('var(--spacing-2)');
  });

  it('keeps the hint surface padding after useLayer reset styles', () => {
    const {container} = render(<TestHint />);
    const hint = container.querySelector('[popover="manual"]') as HTMLElement;

    expect(hint.className).toContain('useKeyboardHint__styles.hint');
  });

  it('renders the "to navigate" label from the i18n catalog', () => {
    const {container} = render(<TestHint />);
    const hint = container.querySelector('[popover="manual"]') as HTMLElement;

    expect(hint.textContent).toContain('to navigate');
  });

  it('localizes the "to navigate" label through the i18n catalog', () => {
    const {container} = render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.keyboardHint.toNavigate': 'pour naviguer'}}}>
        <TestHint />
      </InternationalizationProvider>,
    );
    const hint = container.querySelector('[popover="manual"]') as HTMLElement;

    expect(hint.textContent).toContain('pour naviguer');
    expect(hint.textContent).not.toContain('to navigate');
  });
});
