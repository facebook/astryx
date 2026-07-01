// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Selector.test.tsx
 * @input Uses vitest, @testing-library/react, @testing-library/user-event
 * @output Unit tests for Selector
 * @position Tests; validates Selector behavior
 *
 * SYNC: When Selector.tsx API changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Selector} from './Selector';
import {SelectorOption} from './SelectorOption';

// Mock showPopover and hidePopover methods since they're not implemented in jsdom
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

// Helper: jsdom popover content is in the DOM but may not be
// "visible" in the accessibility tree. Use hidden: true to find it.
const h = {hidden: true} as const;

const OPTIONS = ['Apple', 'Banana', 'Cherry'];

function rect({
  top,
  bottom,
  left = 0,
  right = 100,
  width = right - left,
  height = bottom - top,
}: {
  top: number;
  bottom: number;
  left?: number;
  right?: number;
  width?: number;
  height?: number;
}): DOMRect {
  return {
    x: left,
    y: top,
    top,
    bottom,
    left,
    right,
    width,
    height,
    toJSON: () => ({}),
  };
}

function mockSelectorRects() {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect;
  const originalInnerHeight = Object.getOwnPropertyDescriptor(
    window,
    'innerHeight',
  );
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.getAttribute('role') === 'combobox') {
      return rect({top: 160, bottom: 190, height: 30});
    }
    if (this.getAttribute('role') === 'listbox') {
      return rect({top: 190, bottom: 310, height: 120});
    }
    if (this.id.endsWith('-item-1')) {
      return rect({top: 220, bottom: 250, height: 30});
    }
    return originalGetBoundingClientRect.call(this);
  };
  Object.defineProperty(window, 'innerHeight', {
    value: 200,
    configurable: true,
  });
  return () => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    if (originalInnerHeight) {
      Object.defineProperty(window, 'innerHeight', originalInnerHeight);
    }
  };
}

describe('Selector', () => {
  it('renders with placeholder when no value', () => {
    render(
      <Selector label="Fruit" options={OPTIONS} placeholder="Pick one" />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one');
  });

  it('renders selected value label', () => {
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        value="Banana"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });

  it('renders custom option endContent', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        label="Role"
        options={[{value: 'admin', label: 'Admin'}]}
        value={undefined}
        onChange={() => {}}
        renderOption={option => (
          <SelectorOption
            label={option.label}
            endContent={<span data-testid="option-badge">Owner</span>}
          />
        )}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByTestId('option-badge')).toHaveTextContent('Owner');
  });

  it('supports explicit menu placement', () => {
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        value="Banana"
        onChange={() => {}}
        placement="above"
      />,
    );
    const popover = screen
      .getByRole('listbox', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: top span-right',
    );
  });

  it('clamps the default selected-item overlay to the viewport', async () => {
    const restoreRects = mockSelectorRects();
    const user = userEvent.setup();
    try {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
        />,
      );

      await user.click(screen.getByRole('combobox'));
      const popover = screen
        .getByRole('listbox', {hidden: true})
        .closest('[popover]');
      await waitFor(() => {
        expect(popover?.getAttribute('style')).toContain(
          'margin-block-start: -110px',
        );
      });
    } finally {
      restoreRects();
    }
  });

  it('does not apply selected-item overlay offset when placement is explicit', async () => {
    const restoreRects = mockSelectorRects();
    const user = userEvent.setup();
    try {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
          placement="above"
        />,
      );

      await user.click(screen.getByRole('combobox'));
      const popover = screen
        .getByRole('listbox', {hidden: true})
        .closest('[popover]');
      await waitFor(() => {
        expect(popover?.getAttribute('style')).not.toContain(
          'margin-block-start',
        );
      });
    } finally {
      restoreRects();
    }
  });

  describe('hasClear', () => {
    it('shows selected value label when hasClear is enabled', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('shows clear button when hasClear is true and value is selected', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Fruit'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is null', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value={null}
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Fruit'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Fruit'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Fruit'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with null when clear is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Banana"
          onChange={onChange}
          hasClear
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Clear Fruit'}));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('shows placeholder after clearing', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value={null}
          onChange={() => {}}
          hasClear
          placeholder="Select a fruit..."
        />,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent(
        'Select a fruit...',
      );
    });

    it('renders selected label with object options and hasClear', () => {
      render(
        <Selector
          label="Fruit"
          options={[
            {value: 'apple', label: 'Red Apple'},
            {value: 'banana', label: 'Yellow Banana'},
          ]}
          value="banana"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('Yellow Banana');
    });
  });

  describe('hasSearch', () => {
    it('renders search input when hasSearch is true', async () => {
      const user = userEvent.setup();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('searchbox', h)).toBeInTheDocument();
    });

    it('does not render search input when hasSearch is false', async () => {
      const user = userEvent.setup();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('searchbox', h)).not.toBeInTheDocument();
    });

    it('filters options by search query', async () => {
      const user = userEvent.setup();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.type(screen.getByRole('searchbox', h), 'ban');
      const options = screen.getAllByRole('option', h);
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Banana');
    });

    it('shows empty state when no options match', async () => {
      const user = userEvent.setup();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.type(screen.getByRole('searchbox', h), 'xyz');
      expect(screen.queryAllByRole('option', h)).toHaveLength(0);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('calls onChange when selecting a filtered option', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={onChange}
          hasSearch
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.type(screen.getByRole('searchbox', h), 'ban');
      await user.click(screen.getByRole('option', {name: /Banana/, ...h}));
      expect(onChange).toHaveBeenCalledWith('Banana');
    });

    it('closes dropdown on Tab without preventing default focus movement', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Selector
            label="Fruit"
            options={OPTIONS}
            value="Apple"
            onChange={() => {}}
            hasSearch
          />
          <button type="button">Next</button>
        </>,
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Tab}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('uses custom search placeholder', async () => {
      const user = userEvent.setup();
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
          hasSearch
          searchPlaceholder="Find a fruit..."
        />,
      );
      await user.click(screen.getByRole('combobox'));
      expect(
        screen.getByPlaceholderText('Find a fruit...'),
      ).toBeInTheDocument();
    });
  });

  describe('keyboard accessibility', () => {
    it('trigger is focusable via Tab when enabled', async () => {
      const user = userEvent.setup();
      render(<Selector label="Fruit" options={OPTIONS} />);

      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('trigger is not focusable when disabled', () => {
      render(<Selector label="Fruit" options={OPTIONS} isDisabled />);
      expect(screen.getByRole('combobox')).toHaveAttribute('tabIndex', '-1');
    });

    it('opens the listbox with ArrowDown from a focused trigger', async () => {
      const user = userEvent.setup();
      render(<Selector label="Fruit" options={OPTIONS} />);

      const trigger = screen.getByRole('combobox');
      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens and selects an option with Enter (no mouse)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Selector label="Fruit" options={OPTIONS} onChange={onChange} />,
      );

      await user.tab();
      await user.keyboard('{Enter}'); // open
      await user.keyboard('{ArrowDown}'); // move highlight
      await user.keyboard('{Enter}'); // select

      expect(onChange).toHaveBeenCalled();
    });

    it('clear button is reachable by keyboard', () => {
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          value="Apple"
          onChange={() => {}}
          hasClear
        />,
      );
      const clear = screen.getByRole('button', {name: 'Clear Fruit'});
      expect(clear).not.toHaveAttribute('tabIndex', '-1');
    });
  });
});
