// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Collapsible.test.tsx
 * @input Uses vitest, @testing-library/react, Collapsible + CollapsibleGroup
 * @output Characterization coverage for Collapsible behavior
 * @position Testing; validates Collapsible.tsx (disclosure primitive)
 *
 * SYNC: When Collapsible.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Collapsible} from './Collapsible';
import {CollapsibleGroup} from './CollapsibleGroup';

/**
 * Resolves the content region a trigger controls via aria-controls, so tests
 * assert the real disclosure linkage rather than guessing at DOM structure.
 */
function contentFor(trigger: HTMLElement): HTMLElement {
  const id = trigger.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  const el = document.getElementById(id as string);
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

describe('Collapsible', () => {
  describe('structure and rendering', () => {
    it('renders the trigger content inside a button', () => {
      render(
        <Collapsible trigger="Details">
          <p>Body</p>
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Details');
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders the trigger button with an explicit type="button"', () => {
      // Prevents implicit form submission when used inside a <form>.
      render(<Collapsible trigger="T">c</Collapsible>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('renders children inside the controlled content region', () => {
      render(
        <Collapsible trigger="Section">
          <span data-testid="child">Hello</span>
        </Collapsible>,
      );
      const content = contentFor(screen.getByRole('button'));
      expect(within(content).getByTestId('child')).toBeInTheDocument();
    });

    it('links the trigger to its content via aria-controls', () => {
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');
      const content = contentFor(button);
      expect(button.getAttribute('aria-controls')).toBe(content.id);
    });

    it('renders the stable astryx-collapsible class on the root', () => {
      render(
        <Collapsible trigger="T" data-testid="root">
          c
        </Collapsible>,
      );
      expect(screen.getByTestId('root')).toHaveClass('astryx-collapsible');
    });

    it('renders a ReactNode trigger, not just a string', () => {
      render(
        <Collapsible trigger={<span data-testid="rich">Rich</span>}>
          c
        </Collapsible>,
      );
      expect(screen.getByTestId('rich')).toBeInTheDocument();
    });
  });

  describe('uncontrolled open state', () => {
    it('is open by default (aria-expanded="true")', () => {
      render(<Collapsible trigger="T">Body</Collapsible>);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('honors defaultIsOpen={false} (starts collapsed)', () => {
      render(
        <Collapsible trigger="T" defaultIsOpen={false}>
          Body
        </Collapsible>,
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('toggles open/closed when the trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-expanded', 'true');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens a default-collapsed instance on click', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T" defaultIsOpen={false}>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles via keyboard activation (Enter and Space)', async () => {
      const user = userEvent.setup();
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      await user.keyboard(' ');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides the content region (display:none) only when collapsed', async () => {
      const user = userEvent.setup();
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');
      const content = contentFor(button);

      // Open: not display:none.
      expect(content).not.toHaveStyle({display: 'none'});
      await user.click(button);
      // Collapsed: hidden via the contentHidden style.
      expect(content).toHaveStyle({display: 'none'});
    });

    it('rotates the chevron indicator between open and closed states', async () => {
      const user = userEvent.setup();
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');
      // The chevron lives in the last span of the trigger button.
      const chevron = button.querySelectorAll('span')[1];
      const openClass = chevron.getAttribute('class');

      await user.click(button);
      const closedClass = chevron.getAttribute('class');
      expect(closedClass).not.toEqual(openClass);
    });
  });

  describe('controlled open state', () => {
    it('reflects the isOpen prop', () => {
      const {rerender} = render(
        <Collapsible trigger="T" isOpen={false}>
          Body
        </Collapsible>,
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false',
      );

      rerender(
        <Collapsible trigger="T" isOpen={true}>
          Body
        </Collapsible>,
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('calls onOpenChange with the negated state on click', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Collapsible trigger="T" isOpen={false} onOpenChange={onOpenChange}>
          Body
        </Collapsible>,
      );
      await user.click(screen.getByRole('button'));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('does not self-update when controlled without onOpenChange', async () => {
      // A controlled instance is driven entirely by the isOpen prop; a click
      // must not flip the visual state on its own.
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T" isOpen={false}>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('stays put until the parent updates isOpen', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const {rerender} = render(
        <Collapsible trigger="T" isOpen={false} onOpenChange={onOpenChange}>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      await user.click(button);
      // Still closed — parent hasn't re-rendered with the new value yet.
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <Collapsible trigger="T" isOpen={true} onOpenChange={onOpenChange}>
          Body
        </Collapsible>,
      );
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('prop forwarding', () => {
    it('forwards a ref to the root element', () => {
      const ref = vi.fn();
      render(
        <Collapsible ref={ref} trigger="T">
          c
        </Collapsible>,
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('passes through data-testid and other DOM props to the root', () => {
      render(
        <Collapsible trigger="T" data-testid="root" data-custom="x">
          c
        </Collapsible>,
      );
      const root = screen.getByTestId('root');
      expect(root).toHaveAttribute('data-custom', 'x');
    });

    it('exposes a displayName for devtools', () => {
      expect(Collapsible.displayName).toBe('Collapsible');
    });
  });

  describe('inside CollapsibleGroup (single mode)', () => {
    it('opens the item matching defaultValue and closes the rest', () => {
      render(
        <CollapsibleGroup type="single" defaultValue="b">
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
          <Collapsible trigger="B" value="b">
            Body B
          </Collapsible>
        </CollapsibleGroup>,
      );
      const [a, b] = screen.getAllByRole('button');
      expect(a).toHaveAttribute('aria-expanded', 'false');
      expect(b).toHaveAttribute('aria-expanded', 'true');
    });

    it('opening one item closes the previously open item', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
          <Collapsible trigger="B" value="b">
            Body B
          </Collapsible>
        </CollapsibleGroup>,
      );
      const [a, b] = screen.getAllByRole('button');
      expect(a).toHaveAttribute('aria-expanded', 'true');

      await user.click(b);
      expect(a).toHaveAttribute('aria-expanded', 'false');
      expect(b).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking the open item closes it (single mode allows all-closed)', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleGroup type="single" defaultValue="a">
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
        </CollapsibleGroup>,
      );
      const a = screen.getByRole('button');
      await user.click(a);
      expect(a).toHaveAttribute('aria-expanded', 'false');
    });

    it('fires the group onChange with the newly opened value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CollapsibleGroup type="single" onChange={onChange}>
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
        </CollapsibleGroup>,
      );
      await user.click(screen.getByRole('button'));
      expect(onChange).toHaveBeenCalledWith('a');
    });
  });

  describe('inside CollapsibleGroup (multiple mode)', () => {
    it('allows several items open at once', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleGroup type="multiple" defaultValue={['a']}>
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
          <Collapsible trigger="B" value="b">
            Body B
          </Collapsible>
        </CollapsibleGroup>,
      );
      const [a, b] = screen.getAllByRole('button');
      expect(a).toHaveAttribute('aria-expanded', 'true');
      expect(b).toHaveAttribute('aria-expanded', 'false');

      await user.click(b);
      // Opening B does not close A in multiple mode.
      expect(a).toHaveAttribute('aria-expanded', 'true');
      expect(b).toHaveAttribute('aria-expanded', 'true');
    });

    it('fires onChange with the full array of open values', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CollapsibleGroup
          type="multiple"
          defaultValue={['a']}
          onChange={onChange}>
          <Collapsible trigger="A" value="a">
            Body A
          </Collapsible>
          <Collapsible trigger="B" value="b">
            Body B
          </Collapsible>
        </CollapsibleGroup>,
      );
      const [, b] = screen.getAllByRole('button');
      await user.click(b);
      expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    });
  });

  describe('group presentation (dividers + density)', () => {
    it('reflects group density as a data attribute on items when dividers are enabled', () => {
      render(
        <CollapsibleGroup type="single" hasDividers density="compact">
          <Collapsible trigger="A" value="a" data-testid="item-a">
            Body A
          </Collapsible>
        </CollapsibleGroup>,
      );
      const item = screen.getByTestId('item-a');
      expect(item).toHaveAttribute('data-density', 'compact');
    });

    it('omits density data attribute when standalone (no group)', () => {
      render(
        <Collapsible trigger="A" data-testid="item">
          Body
        </Collapsible>,
      );
      const item = screen.getByTestId('item');
      expect(item).not.toHaveAttribute('data-density');
    });
  });
});
