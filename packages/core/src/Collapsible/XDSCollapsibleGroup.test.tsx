/**
 * @file XDSCollapsibleGroup.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCollapsible, XDSCollapsibleGroup
 * @output Unit tests for XDSCollapsible and XDSCollapsibleGroup
 * @position Testing; validates collapsible primitive and group coordination
 *
 * SYNC: When XDSCollapsible.tsx or XDSCollapsibleGroup.tsx changes, update tests
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSCollapsible} from './XDSCollapsible';
import {XDSCollapsibleGroup} from './XDSCollapsibleGroup';

// =============================================================================
// XDSCollapsible — standalone behavior
// =============================================================================

describe('XDSCollapsible', () => {
  it('renders trigger and children', () => {
    render(
      <XDSCollapsible trigger="My Trigger">
        <p>Content</p>
      </XDSCollapsible>,
    );
    expect(screen.getByText('My Trigger')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('starts open by default', () => {
    render(
      <XDSCollapsible trigger="Details">
        <p>Visible content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('toggles content on click', async () => {
    const user = userEvent.setup();
    render(
      <XDSCollapsible trigger="Details">
        <p>Collapsible content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Collapsible content')).toBeVisible();

    // Click to collapse
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Collapsible content')).not.toBeVisible();

    // Click to expand
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Collapsible content')).toBeVisible();
  });

  it('starts collapsed when defaultIsOpen is false', () => {
    render(
      <XDSCollapsible trigger="Details" defaultIsOpen={false}>
        <p>Hidden content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden content')).not.toBeVisible();
  });

  it('respects controlled isOpen/onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const {rerender} = render(
      <XDSCollapsible
        trigger="Controlled"
        isOpen={true}
        onOpenChange={onOpenChange}>
        <p>Controlled content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Controlled/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Controlled content')).toBeVisible();

    // Click should call onOpenChange, not change internal state
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Rerender with isOpen=false to actually close
    rerender(
      <XDSCollapsible
        trigger="Controlled"
        isOpen={false}
        onOpenChange={onOpenChange}>
        <p>Controlled content</p>
      </XDSCollapsible>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Controlled content')).not.toBeVisible();
  });

  it('renders chevron indicator', () => {
    render(
      <XDSCollapsible trigger="With Chevron">
        <p>Content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /With Chevron/});
    const svg = trigger.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden');
  });

  it('activates via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(
      <XDSCollapsible trigger="Keyboard">
        <p>Content</p>
      </XDSCollapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Keyboard/});
    trigger.focus();

    // Enter key
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Space key
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

// =============================================================================
// XDSCollapsibleGroup — coordination context
// =============================================================================

describe('XDSCollapsibleGroup', () => {
  it('renders children without wrapper DOM', () => {
    render(
      <XDSCollapsibleGroup>
        <XDSCollapsible trigger="Item 1" value="1">
          <p>Content 1</p>
        </XDSCollapsible>
      </XDSCollapsibleGroup>,
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  describe('single mode', () => {
    it('only allows one item open at a time', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item C" value="c">
            <p>Content C</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      // A starts open
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();

      // Open B — A should close
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();

      // Open C — B should close
      await user.click(screen.getByRole('button', {name: /Item C/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).toBeVisible();
    });

    it('closes the open item when clicking it again', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      await user.click(screen.getByRole('button', {name: /Item A/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
    });
  });

  describe('multiple mode', () => {
    it('allows multiple items to be open simultaneously', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="multiple" defaultValue={['a']}>
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      // Open B — A should stay open
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();

      // Close A — B should stay open
      await user.click(screen.getByRole('button', {name: /Item A/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });
  });

  describe('controlled mode', () => {
    it('respects value and onValueChange', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(
        <XDSCollapsibleGroup
          type="single"
          value="a"
          onValueChange={onValueChange}>
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      // Click B — should call onValueChange
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(onValueChange).toHaveBeenCalledWith('b');

      // Rerender with new value
      rerender(
        <XDSCollapsibleGroup
          type="single"
          value="b"
          onValueChange={onValueChange}>
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });
  });

  describe('defaultValue', () => {
    it('opens the specified item by default', () => {
      render(
        <XDSCollapsibleGroup defaultValue="b">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('opens multiple items by default in multiple mode', () => {
      render(
        <XDSCollapsibleGroup type="multiple" defaultValue={['a', 'c']}>
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item C" value="c">
            <p>Content C</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).toBeVisible();
    });
  });

  describe('standalone vs group', () => {
    it('collapsible inside group defers to group context', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      // Opening B should close A (group coordinates)
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('collapsible outside group manages its own state', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsible trigger="Standalone">
          <p>Standalone content</p>
        </XDSCollapsible>,
      );

      const trigger = screen.getByRole('button', {name: /Standalone/});
      expect(screen.getByText('Standalone content')).toBeVisible();

      await user.click(trigger);
      expect(screen.getByText('Standalone content')).not.toBeVisible();

      await user.click(trigger);
      expect(screen.getByText('Standalone content')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('sets aria-expanded on triggers', () => {
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
          <XDSCollapsible trigger="Item B" value="b">
            <p>Content B</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByRole('button', {name: /Item A/})).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('button', {name: /Item B/})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('supports keyboard activation', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single">
          <XDSCollapsible trigger="Item A" value="a">
            <p>Content A</p>
          </XDSCollapsible>
        </XDSCollapsibleGroup>,
      );

      const trigger = screen.getByRole('button', {name: /Item A/});
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
