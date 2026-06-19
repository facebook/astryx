// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CollapsibleGroup.test.tsx
 * @input Uses vitest, @testing-library/react, Collapsible, CollapsibleGroup
 * @output Unit tests for Collapsible and CollapsibleGroup
 * @position Testing; validates collapsible primitive and group coordination
 *
 * SYNC: When Collapsible.tsx or CollapsibleGroup.tsx changes, update tests
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Collapsible} from './Collapsible';
import {CollapsibleGroup} from './CollapsibleGroup';

// =============================================================================
// Collapsible — standalone behavior
// =============================================================================

describe('Collapsible', () => {
  it('renders trigger and children', () => {
    render(
      <Collapsible trigger="My Trigger">
        <p>Content</p>
      </Collapsible>,
    );
    expect(screen.getByText('My Trigger')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('starts open by default', () => {
    render(
      <Collapsible trigger="Details">
        <p>Visible content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('toggles content on click', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible trigger="Details">
        <p>Collapsible content</p>
      </Collapsible>,
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
      <Collapsible trigger="Details" defaultIsOpen={false}>
        <p>Hidden content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden content')).not.toBeVisible();
  });

  it('respects controlled isOpen/onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const {rerender} = render(
      <Collapsible
        trigger="Controlled"
        isOpen={true}
        onOpenChange={onOpenChange}>
        <p>Controlled content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Controlled/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Controlled content')).toBeVisible();

    // Click should call onOpenChange, not change internal state
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Rerender with isOpen=false to actually close
    rerender(
      <Collapsible
        trigger="Controlled"
        isOpen={false}
        onOpenChange={onOpenChange}>
        <p>Controlled content</p>
      </Collapsible>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Controlled content')).not.toBeVisible();
  });

  it('renders chevron indicator', () => {
    render(
      <Collapsible trigger="With Chevron">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /With Chevron/});
    const svg = trigger.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden');
  });

  it('activates via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible trigger="Keyboard">
        <p>Content</p>
      </Collapsible>,
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
// CollapsibleGroup — coordination context
// =============================================================================

describe('CollapsibleGroup', () => {
  it('renders children without wrapper DOM', () => {
    render(
      <CollapsibleGroup>
        <Collapsible trigger="Item 1" value="1">
          <p>Content 1</p>
        </Collapsible>
      </CollapsibleGroup>,
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  describe('single mode', () => {
    it('only allows one item open at a time', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
          <Collapsible trigger="Item C" value="c">
            <p>Content C</p>
          </Collapsible>
        </CollapsibleGroup>,
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
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
        </CollapsibleGroup>,
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
        <CollapsibleGroup type="multiple" defaultValue={['a']}>
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
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
    it('respects value and onChange', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(
        <CollapsibleGroup type="single" value="a" onChange={onChange}>
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      // Click B — should call onChange
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(onChange).toHaveBeenCalledWith('b');

      // Rerender with new value
      rerender(
        <CollapsibleGroup type="single" value="b" onChange={onChange}>
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
      );
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });
  });

  describe('defaultValue', () => {
    it('opens the specified item by default', () => {
      render(
        <CollapsibleGroup defaultValue="b">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
      );

      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('opens multiple items by default in multiple mode', () => {
      render(
        <CollapsibleGroup type="multiple" defaultValue={['a', 'c']}>
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
          <Collapsible trigger="Item C" value="c">
            <p>Content C</p>
          </Collapsible>
        </CollapsibleGroup>,
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
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
      );

      // Opening B should close A (group coordinates)
      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('collapsible outside group manages its own state', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="Standalone">
          <p>Standalone content</p>
        </Collapsible>,
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
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
          <Collapsible trigger="Item B" value="b">
            <p>Content B</p>
          </Collapsible>
        </CollapsibleGroup>,
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
        <CollapsibleGroup type="single">
          <Collapsible trigger="Item A" value="a">
            <p>Content A</p>
          </Collapsible>
        </CollapsibleGroup>,
      );

      const trigger = screen.getByRole('button', {name: /Item A/});
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
