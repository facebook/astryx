// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTouchTrigger.test.ts
 * @input Uses vitest, isActionTrigger, tapHasDestination
 * @output Unit tests for the action rules behind touchTrigger="auto": the
 *   trigger's own action, and a control the trigger sits inside
 * @position Testing; validates useTouchTrigger.ts implementation
 *
 * SYNC: When useTouchTrigger.ts changes, update tests to match new behavior
 *
 * The tap-versus-suppress decision rests entirely on this predicate, and it is
 * the part a new element type silently falls through. The per-component tests
 * (Tooltip.test.tsx, HoverCard.test.tsx) cover the gestures it feeds.
 */

import {describe, it, expect} from 'vitest';
import {isActionTrigger, tapHasDestination} from './useTouchTrigger';

function element(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host.firstElementChild as HTMLElement;
}

describe('isActionTrigger', () => {
  it.each([
    ['<button type="button">Save</button>'],
    ['<input type="text" />'],
    ['<select></select>'],
    ['<textarea></textarea>'],
    ['<summary>More</summary>'],
    ['<label>Name</label>'],
    ['<a href="/somewhere">Link</a>'],
  ])('treats %s as an action', html => {
    expect(isActionTrigger(element(html))).toBe(true);
  });

  it.each([
    ['<span>Plain text</span>'],
    ['<svg></svg>'],
    ['<abbr title="what">WCAG</abbr>'],
    // An anchor without href is a link that goes nowhere.
    ['<a>Not a link</a>'],
  ])('treats %s as inert', html => {
    expect(isActionTrigger(element(html))).toBe(false);
  });

  it('reads an explicit role over the tag it sits on', () => {
    expect(isActionTrigger(element('<span role="button">Go</span>'))).toBe(
      true,
    );
    // Scenery: the role says this button is not the control it looks like.
    expect(
      isActionTrigger(element('<button role="presentation">x</button>')),
    ).toBe(false);
  });

  it('does not treat mere focusability as an action', () => {
    // The wrapper a text-only Tooltip renders: reachable by keyboard so the
    // hint is not mouse-only, and it still does nothing when activated.
    expect(isActionTrigger(element('<span tabindex="0">Term</span>'))).toBe(
      false,
    );
  });

  it('treats a contenteditable surface as an action', () => {
    const editable = element('<div contenteditable="true"></div>');
    expect(isActionTrigger(editable)).toBe(true);
  });
});

/** The innermost element of `html`, marked with `data-trigger`. */
function triggerIn(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host.querySelector('[data-trigger]') as HTMLElement;
}

describe('tapHasDestination', () => {
  it.each([
    // A truncated Link: the label is a span inside the anchor.
    ['<a href="/doc"><span data-trigger>A very long title</span></a>'],
    ['<button type="button"><span data-trigger>Label</span></button>'],
    // An option or a menu item with a truncated label.
    ['<div role="option"><span data-trigger>Option</span></div>'],
    ['<div role="menuitem"><span><span data-trigger>Item</span></span></div>'],
    // A checkbox row: tapping its label toggles the box.
    [
      '<label><input type="checkbox" /><span data-trigger>Notify</span></label>',
    ],
    // A row or card that useClickableContainer made clickable, with no role.
    ['<div data-pressable-container="true"><span data-trigger>ID</span></div>'],
    // The trigger itself is still covered.
    ['<button type="button" data-trigger>Save</button>'],
  ])('gives the tap to the control around %s', html => {
    expect(tapHasDestination(triggerIn(html))).toBe(true);
  });

  it.each([
    ['<p>Read the <span data-trigger>WCAG</span> notes.</p>'],
    ['<ul><li><span data-trigger>A static row</span></li></ul>'],
    // An anchor without href goes nowhere.
    ['<a><span data-trigger>Not a link</span></a>'],
    // Scenery: the role says this is not the control it looks like.
    ['<button role="presentation"><span data-trigger>x</span></button>'],
  ])('leaves the tap to the trigger in %s', html => {
    expect(tapHasDestination(triggerIn(html))).toBe(false);
  });
});
