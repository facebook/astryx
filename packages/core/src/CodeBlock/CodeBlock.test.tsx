// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlock.test.tsx
 * @input Uses vitest, @testing-library/react, CodeBlock component
 * @output Unit tests for CodeBlock (copy button, collapse, scroll region a11y, syntaxTheme)
 * @position Testing; validates CodeBlock implementation
 *
 * SYNC: When CodeBlock.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {CodeBlock} from './CodeBlock';
import {dracula} from '../theme/syntax';

// A code sample long enough to exceed the default collapsible threshold (10).
const LONG_CODE = Array.from(
  {length: 15},
  (_, i) => `const line${i} = ${i};`,
).join('\n');

describe('CodeBlock', () => {
  beforeEach(() => {
    // jsdom does not implement the async Clipboard API.
    Object.assign(navigator, {
      clipboard: {writeText: vi.fn().mockResolvedValue(undefined)},
    });
  });

  it('renders the code', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('makes the scroll container keyboard-focusable', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const region = screen.getByRole('group');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAttribute('aria-label', 'javascript');
  });

  it('labels the scroll region "Code" when no language label is shown', () => {
    render(<CodeBlock code="hello" hasLanguageLabel={false} />);
    const region = screen.getByRole('group');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAttribute('aria-label', 'Code');
  });

  it('copies code when the copy button is clicked', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('does NOT collapse the block when the copy button is clicked', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    // The collapsible header exposes aria-expanded.
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'));
    expect(header).toBeTruthy();
    expect(header).toHaveAttribute('aria-expanded', 'true');

    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    fireEvent.click(copyButton);

    // Clicking Copy must not toggle the collapsible header.
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('does not nest the copy button inside the collapsible header role="button"', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'));
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    expect(header).toBeTruthy();
    // The copy button must be a sibling, not a descendant of the interactive
    // header — nested interactive controls are invalid ARIA.
    expect(header!.contains(copyButton)).toBe(false);
  });

  it('still toggles collapse when the header itself is clicked', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('links the collapsible header to its code region via aria-controls', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    const controlsId = header.getAttribute('aria-controls');
    // aria-controls must be present and point at the real code region.
    expect(controlsId).toBeTruthy();
    const region = document.getElementById(controlsId as string);
    expect(region).not.toBeNull();
    // The region contains the scrollable code body (role="group").
    expect(region).toContainElement(screen.getByRole('group'));
  });

  it('keeps aria-controls resolvable when collapsed (region stays mounted)', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // The code region uses a CSS grid animation to collapse, so it stays in
    // the DOM — aria-controls stays a valid, resolvable reference (unlike a
    // conditionally-mounted region, which would need a conditional attribute).
    const controlsId = header.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId as string)).not.toBeNull();
  });

  it('applies a per-instance syntax theme via the syntaxTheme prop', () => {
    const {container} = render(
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        syntaxTheme={dracula}
      />,
    );
    const wrapper = container.querySelector('[data-astryx-syntax-theme]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-astryx-syntax-theme', 'dracula');
    expect(wrapper!.querySelector('pre')).not.toBeNull();
  });

  it('renders no syntax theme wrapper when syntaxTheme is not set', () => {
    const {container} = render(
      <CodeBlock code="const x = 1;" language="javascript" />,
    );
    expect(container.querySelector('[data-astryx-syntax-theme]')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('PRE');
  });
});
