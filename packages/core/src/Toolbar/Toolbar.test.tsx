// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Toolbar.test.tsx
 * @input Uses vitest, @testing-library/react, Toolbar
 * @output Unit tests for Toolbar component
 * @position Testing; validates Toolbar implementation
 *
 * SYNC: When Toolbar component changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Toolbar} from './Toolbar';

describe('Toolbar', () => {
  it('renders with toolbar role', () => {
    render(<Toolbar label="Actions" />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders aria-label from label prop', () => {
    render(<Toolbar label="Formatting actions" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-label',
      'Formatting actions',
    );
  });

  it('renders startContent slot', () => {
    render(
      <Toolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders endContent slot', () => {
    render(
      <Toolbar
        label="Actions"
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders centerContent slot', () => {
    render(
      <Toolbar
        label="Actions"
        centerContent={<span data-testid="center">Center</span>}
      />,
    );
    expect(screen.getByTestId('center')).toBeInTheDocument();
  });

  it('renders all three slots together', () => {
    render(
      <Toolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
        centerContent={<span data-testid="center">Center</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();

    // Three-slot layout produces 3 child divs (plus the aria-hidden
    // keyboard-hint popover, which is excluded here as an implementation detail)
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll(':scope > :not([popover])')).toHaveLength(
      3,
    );
  });

  it('renders two-slot layout without centerContent', () => {
    render(
      <Toolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();

    // Two-slot layout produces 2 child divs (plus the aria-hidden
    // keyboard-hint popover, excluded here)
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll(':scope > :not([popover])')).toHaveLength(
      2,
    );
  });

  it('renders start-only layout', () => {
    render(
      <Toolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll(':scope > :not([popover])')).toHaveLength(
      1,
    );
  });

  it('renders end-only layout', () => {
    render(
      <Toolbar
        label="Actions"
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll(':scope > :not([popover])')).toHaveLength(
      1,
    );
  });

  it('sets aria-orientation to horizontal by default', () => {
    render(<Toolbar label="Actions" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  it('sets aria-orientation to vertical', () => {
    render(<Toolbar label="Actions" orientation="vertical" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('applies size class', () => {
    render(<Toolbar label="Actions" size="sm" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('sm');
  });

  it('defaults to md size', () => {
    render(<Toolbar label="Actions" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('md');
  });

  it('applies lg size class', () => {
    render(<Toolbar label="Actions" size="lg" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('lg');
  });

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(<Toolbar label="Actions" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes variant to Section', () => {
    const {container} = render(<Toolbar label="Actions" variant="muted" />);
    // Section renders with astryx-section class containing the variant
    const sectionInner = container.querySelector('.astryx-section');
    expect(sectionInner).toBeInTheDocument();
    expect(sectionInner?.className).toContain('muted');
  });

  it('defaults to transparent variant', () => {
    const {container} = render(<Toolbar label="Actions" />);
    const sectionInner = container.querySelector('.astryx-section');
    expect(sectionInner).toBeInTheDocument();
    expect(sectionInner?.className).toContain('transparent');
  });

  it('navigates with ArrowRight/ArrowLeft in horizontal orientation', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        label="Actions"
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
            <button type="button">Paste</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(buttons[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(buttons[2]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('navigates with ArrowDown/ArrowUp in vertical orientation', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        label="Actions"
        orientation="vertical"
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
            <button type="button">Paste</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(buttons[1]);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('supports Home and End keys', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        label="Actions"
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
            <button type="button">Paste</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons[1].focus();

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(buttons[2]);

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('spreads additional HTML attributes to toolbar element', () => {
    render(<Toolbar label="Actions" data-testid="my-toolbar" />);
    expect(screen.getByTestId('my-toolbar')).toBe(screen.getByRole('toolbar'));
  });

  it('is a single tab stop — only one item is tabbable (navigation-3)', () => {
    render(
      <Toolbar
        label="Actions"
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
            <button type="button">Paste</button>
          </>
        }
      />,
    );
    const buttons = screen.getAllByRole('button');
    const tabbable = buttons.filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('tabindex', '0');
    expect(buttons[1]).toHaveAttribute('tabindex', '-1');
    expect(buttons[2]).toHaveAttribute('tabindex', '-1');
  });

  it('does not steal caret keys from a text input mid-line (navigation-4)', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        label="Search"
        startContent={
          <>
            <input type="text" aria-label="Query" defaultValue="hello" />
            <button type="button">Go</button>
          </>
        }
      />,
    );
    const inputEl = screen.getByLabelText('Query');
    if (!(inputEl instanceof HTMLInputElement)) {
      throw new Error('expected an input');
    }
    inputEl.focus();
    inputEl.setSelectionRange(1, 1); // caret mid-line
    await user.keyboard('{ArrowRight}');
    // Caret movement stays in the input; focus is not stolen by the toolbar.
    expect(document.activeElement).toBe(inputEl);
  });

  it('composes consumer onKeyDown with internal arrow navigation', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(
      <Toolbar
        label="Actions"
        onKeyDown={onKeyDown}
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await user.keyboard('{ArrowRight}');

    expect(onKeyDown).toHaveBeenCalled();
    expect(buttons[1]).toHaveFocus();
  });

  it('respects preventDefault from consumer onKeyDown', async () => {
    const user = userEvent.setup();

    render(
      <Toolbar
        label="Actions"
        onKeyDown={e => e.preventDefault()}
        startContent={
          <>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await user.keyboard('{ArrowRight}');

    expect(buttons[0]).toHaveFocus();
  });
});
