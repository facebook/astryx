// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Collapsible.test.tsx
 * @input Uses vitest, @testing-library/react, Collapsible + CollapsibleGroup
 * @output Characterization and regression coverage for Collapsible behavior
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

/** Resolves the padded element that owns the public content theme target. */
function themedContentFor(trigger: HTMLElement): HTMLElement {
  const content = contentFor(trigger).querySelector(
    '.astryx-collapsible-content',
  );
  expect(content).toBeInstanceOf(HTMLElement);
  return content as HTMLElement;
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

    it('renders the stable astryx-collapsible-trigger class on the trigger button', () => {
      render(<Collapsible trigger="T">c</Collapsible>);
      expect(screen.getByRole('button')).toHaveClass(
        'astryx-collapsible-trigger',
      );
    });

    it('renders the stable astryx-collapsible-content class on the padded content element', () => {
      render(<Collapsible trigger="T">c</Collapsible>);
      const trigger = screen.getByRole('button');
      const track = contentFor(trigger);
      expect(track).not.toHaveClass('astryx-collapsible-content');
      expect(themedContentFor(trigger)).toHaveClass(
        'astryx-collapsible-content',
      );
    });

    it('keeps themed padding inside the clipping wrapper while closed', () => {
      render(
        <>
          <style>{`.astryx-collapsible-content { padding: 16px; }`}</style>
          <Collapsible trigger="T" defaultIsOpen={false}>
            Body
          </Collapsible>
        </>,
      );
      const trigger = screen.getByRole('button');
      const track = contentFor(trigger);
      const content = themedContentFor(trigger);
      const clip = content.parentElement as HTMLElement;

      expect(clip.parentElement).toBe(track);
      expect(getComputedStyle(content).paddingTop).toBe('16px');
      expect(getComputedStyle(track).paddingTop).not.toBe('16px');
      expect(getComputedStyle(track).gridTemplateRows).toBe('0fr');
      expect(getComputedStyle(clip).overflow).toBe('hidden');
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

    it('marks collapsed content inert and aria-hidden', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T">
          <a href="#answer">Answer link</a>
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      const content = contentFor(button);

      // Open: interactive, not hidden.
      expect(content).not.toHaveAttribute('inert');
      expect(content).toHaveAttribute('aria-hidden', 'false');

      await user.click(button);

      // Closed: inert + aria-hidden, grid collapses to 0fr.
      expect(content).toHaveAttribute('inert');
      expect(content).toHaveAttribute('aria-hidden', 'true');
    });

    it('removes inert and aria-hidden when opened', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T" defaultIsOpen={false}>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      const content = contentFor(button);

      expect(content).toHaveAttribute('inert');
      expect(content).toHaveAttribute('aria-hidden', 'true');

      await user.click(button);

      expect(content).not.toHaveAttribute('inert');
      expect(content).toHaveAttribute('aria-hidden', 'false');
    });

    it("releases the open clip for the final child's focus outline", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T" defaultIsOpen={false}>
          <span>First child</span>
          <button type="button" style={{outline: '5px solid currentColor'}}>
            Final action
          </button>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', {name: /T/});
      const content = themedContentFor(trigger);
      const clip = content.parentElement as HTMLElement;
      const finalChild = screen.getByRole('button', {
        name: 'Final action',
        hidden: true,
      });

      expect(getComputedStyle(clip).overflow).toBe('hidden');
      await user.click(trigger);
      finalChild.focus();

      expect(content.lastElementChild).toBe(finalChild);
      expect(finalChild).toHaveFocus();
      expect(finalChild.getAttribute('style')).toContain('outline: 5px');
      expect(getComputedStyle(clip).overflow).toBe('visible');
    });

    it('floors the full-width trigger at the WCAG 2.5.8 target size', () => {
      render(<Collapsible trigger="T">Body</Collapsible>);
      expect(screen.getByRole('button')).toHaveStyle({minHeight: '24px'});
    });

    it('rotates the chevron indicator between open and closed states', async () => {
      const user = userEvent.setup();
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');
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
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <Collapsible trigger="T" isOpen={true} onOpenChange={onOpenChange}>
          Body
        </Collapsible>,
      );
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('disabled state', () => {
    it('marks the trigger aria-disabled and drops it from the tab order', () => {
      render(
        <Collapsible trigger="T" isDisabled>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabindex', '-1');
      expect(button).not.toBeDisabled();
    });

    it('is enabled by default (no aria-disabled, stays in tab order)', () => {
      render(<Collapsible trigger="T">Body</Collapsible>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    it('does not toggle when the trigger is clicked while disabled', async () => {
      const user = userEvent.setup();
      render(
        <Collapsible trigger="T" isDisabled defaultIsOpen>
          Body
        </Collapsible>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not fire onOpenChange while disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Collapsible trigger="T" isDisabled onOpenChange={onOpenChange}>
          Body
        </Collapsible>,
      );
      await user.click(screen.getByRole('button'));
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('does not collapse an already-open item — content stays visible', () => {
      render(
        <Collapsible trigger="T" isDisabled defaultIsOpen>
          Body
        </Collapsible>,
      );
      const content = contentFor(screen.getByRole('button'));
      expect(content).not.toHaveAttribute('inert');
    });

    it('does not toggle its group item when disabled', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleGroup type="single">
          <Collapsible trigger="A" value="a" isDisabled>
            Body A
          </Collapsible>
          <Collapsible trigger="B" value="b">
            Body B
          </Collapsible>
        </CollapsibleGroup>,
      );
      const triggerA = screen.getByRole('button', {name: /A/});
      await user.click(triggerA);
      expect(triggerA).toHaveAttribute('aria-expanded', 'false');
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
