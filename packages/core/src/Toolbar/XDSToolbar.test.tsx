/**
 * @file XDSToolbar.test.tsx
 * @input Uses vitest, @testing-library/react, XDSToolbar
 * @output Unit tests for XDSToolbar component
 * @position Testing; validates XDSToolbar implementation
 *
 * SYNC: When Toolbar component changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSToolbar} from './XDSToolbar';

describe('XDSToolbar', () => {
  it('renders with toolbar role', () => {
    render(<XDSToolbar label="Actions" />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders aria-label from label prop', () => {
    render(<XDSToolbar label="Formatting actions" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-label',
      'Formatting actions',
    );
  });

  it('renders startContent slot', () => {
    render(
      <XDSToolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders endContent slot', () => {
    render(
      <XDSToolbar
        label="Actions"
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders centerContent slot', () => {
    render(
      <XDSToolbar
        label="Actions"
        centerContent={<span data-testid="center">Center</span>}
      />,
    );
    expect(screen.getByTestId('center')).toBeInTheDocument();
  });

  it('renders all three slots together', () => {
    render(
      <XDSToolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
        centerContent={<span data-testid="center">Center</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();

    // Three-slot layout produces 3 child divs
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.children).toHaveLength(3);
  });

  it('renders two-slot layout without centerContent', () => {
    render(
      <XDSToolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();

    // Two-slot layout produces 2 child divs
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.children).toHaveLength(2);
  });

  it('renders start-only layout', () => {
    render(
      <XDSToolbar
        label="Actions"
        startContent={<span data-testid="start">Start</span>}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.children).toHaveLength(1);
  });

  it('renders end-only layout', () => {
    render(
      <XDSToolbar
        label="Actions"
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.children).toHaveLength(1);
  });

  it('sets aria-orientation to horizontal by default', () => {
    render(<XDSToolbar label="Actions" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  it('sets aria-orientation to vertical', () => {
    render(<XDSToolbar label="Actions" orientation="vertical" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('applies size class', () => {
    render(<XDSToolbar label="Actions" size="sm" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('sm');
  });

  it('defaults to md size', () => {
    render(<XDSToolbar label="Actions" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('md');
  });

  it('applies lg size class', () => {
    render(<XDSToolbar label="Actions" size="lg" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.className).toContain('lg');
  });

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(<XDSToolbar label="Actions" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes variant to XDSSection', () => {
    const {container} = render(<XDSToolbar label="Actions" variant="muted" />);
    // XDSSection renders with xds-section class containing the variant
    const sectionInner = container.querySelector('.xds-section');
    expect(sectionInner).toBeInTheDocument();
    expect(sectionInner?.className).toContain('muted');
  });

  it('defaults to transparent variant', () => {
    const {container} = render(<XDSToolbar label="Actions" />);
    const sectionInner = container.querySelector('.xds-section');
    expect(sectionInner).toBeInTheDocument();
    expect(sectionInner?.className).toContain('transparent');
  });

  it('navigates with ArrowRight/ArrowLeft in horizontal orientation', async () => {
    const user = userEvent.setup();
    render(
      <XDSToolbar
        label="Actions"
        startContent={
          <>
            <button>Cut</button>
            <button>Copy</button>
            <button>Paste</button>
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
      <XDSToolbar
        label="Actions"
        orientation="vertical"
        startContent={
          <>
            <button>Cut</button>
            <button>Copy</button>
            <button>Paste</button>
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
      <XDSToolbar
        label="Actions"
        startContent={
          <>
            <button>Cut</button>
            <button>Copy</button>
            <button>Paste</button>
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
    render(<XDSToolbar label="Actions" data-testid="my-toolbar" />);
    expect(screen.getByTestId('my-toolbar')).toBe(screen.getByRole('toolbar'));
  });
});
