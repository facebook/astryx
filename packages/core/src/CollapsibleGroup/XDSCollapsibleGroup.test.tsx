/**
 * @file XDSCollapsibleGroup.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCard, XDSCollapsibleGroup
 * @output Unit tests for XDSCollapsibleGroup and XDSCard isCollapsible behavior
 * @position Testing; validates collapsible group coordination and card collapsible behavior
 *
 * SYNC: When XDSCollapsibleGroup.tsx or XDSCard.tsx changes, update tests to match
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSCard} from '../Card/XDSCard';
import {XDSCollapsibleGroup} from './XDSCollapsibleGroup';

// =============================================================================
// XDSCard — isCollapsible behavior (standalone, no collapsible group)
// =============================================================================

describe('XDSCard isCollapsible', () => {
  it('renders title and children when not collapsible', () => {
    render(
      <XDSCard title="My Card">
        <p>Card content</p>
      </XDSCard>,
    );
    expect(screen.getByText('My Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    // No button trigger when not collapsible
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders without title (backwards compatible)', () => {
    render(
      <XDSCard>
        <p>Just content</p>
      </XDSCard>,
    );
    expect(screen.getByText('Just content')).toBeInTheDocument();
  });

  it('toggles content on click when isCollapsible={true}', async () => {
    const user = userEvent.setup();
    render(
      <XDSCard title="Details" isCollapsible>
        <p>Collapsible content</p>
      </XDSCard>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toBeInTheDocument();
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

  it('starts collapsed when initialIsOpen is false', () => {
    render(
      <XDSCard title="Details" isCollapsible={{initialIsOpen: false}}>
        <p>Hidden content</p>
      </XDSCard>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden content')).not.toBeVisible();
  });

  it('respects controlled isOpen/onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const {rerender} = render(
      <XDSCard title="Controlled" isCollapsible={{isOpen: true, onOpenChange}}>
        <p>Controlled content</p>
      </XDSCard>,
    );

    const trigger = screen.getByRole('button', {name: /Controlled/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Controlled content')).toBeVisible();

    // Click should call onOpenChange, not change internal state
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Rerender with isOpen=false to actually close
    rerender(
      <XDSCard title="Controlled" isCollapsible={{isOpen: false, onOpenChange}}>
        <p>Controlled content</p>
      </XDSCard>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Controlled content')).not.toBeVisible();
  });

  it('renders chevron indicator that rotates', () => {
    render(
      <XDSCard title="With Chevron" isCollapsible>
        <p>Content</p>
      </XDSCard>,
    );

    const trigger = screen.getByRole('button', {name: /With Chevron/});
    const svg = trigger.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden');
  });

  it('activates via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(
      <XDSCard title="Keyboard" isCollapsible>
        <p>Content</p>
      </XDSCard>,
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
        <XDSCard title="Item 1" value="1" isCollapsible>
          <p>Content 1</p>
        </XDSCard>
      </XDSCollapsibleGroup>,
    );

    // CollapsibleGroupContext.Provider doesn't render wrapper DOM
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  describe('single mode', () => {
    it('only allows one card open at a time', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
          <XDSCard title="Card C" value="c" isCollapsible>
            <p>Content C</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      // A starts open
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();

      // Open B — A should close
      await user.click(screen.getByRole('button', {name: /Card B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();

      // Open C — B should close
      await user.click(screen.getByRole('button', {name: /Card C/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).toBeVisible();
    });

    it('closes the open item when clicking it again', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      await user.click(screen.getByRole('button', {name: /Card A/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
    });
  });

  describe('multiple mode', () => {
    it('allows multiple cards to be open simultaneously', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="multiple" defaultValue={['a']}>
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      // Open B — A should stay open
      await user.click(screen.getByRole('button', {name: /Card B/}));
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();

      // Close A — B should stay open
      await user.click(screen.getByRole('button', {name: /Card A/}));
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
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      // Click B — should call onValueChange
      await user.click(screen.getByRole('button', {name: /Card B/}));
      expect(onValueChange).toHaveBeenCalledWith('b');

      // Rerender with new value
      rerender(
        <XDSCollapsibleGroup
          type="single"
          value="b"
          onValueChange={onValueChange}>
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
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
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('opens multiple items by default in multiple mode', () => {
      render(
        <XDSCollapsibleGroup type="multiple" defaultValue={['a', 'c']}>
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
          <XDSCard title="Card C" value="c" isCollapsible>
            <p>Content C</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).toBeVisible();
    });
  });

  describe('card inside vs outside collapsible group', () => {
    it('card inside group defers to group context', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single" defaultValue="a">
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      // Opening B should close A (group coordinates)
      await user.click(screen.getByRole('button', {name: /Card B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('card outside group manages its own state', async () => {
      const user = userEvent.setup();
      render(
        <>
          <XDSCard title="Standalone" isCollapsible>
            <p>Standalone content</p>
          </XDSCard>
        </>,
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
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
          <XDSCard title="Card B" value="b" isCollapsible>
            <p>Content B</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      expect(screen.getByRole('button', {name: /Card A/})).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('button', {name: /Card B/})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('supports keyboard activation', async () => {
      const user = userEvent.setup();
      render(
        <XDSCollapsibleGroup type="single">
          <XDSCard title="Card A" value="a" isCollapsible>
            <p>Content A</p>
          </XDSCard>
        </XDSCollapsibleGroup>,
      );

      const trigger = screen.getByRole('button', {name: /Card A/});
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
