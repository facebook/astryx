// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTouchTrigger.test.ts
 * @input Uses vitest, isActionTrigger
 * @output Unit tests for the action-trigger rule behind touchTrigger="auto"
 * @position Testing; validates useTouchTrigger.ts implementation
 *
 * SYNC: When useTouchTrigger.ts changes, update tests to match new behavior
 *
 * The tap-versus-suppress decision rests entirely on this predicate, and it is
 * the part a new element type silently falls through. The per-component tests
 * (Tooltip.test.tsx, HoverCard.test.tsx) cover the gestures it feeds.
 */

import {describe, it, expect} from 'vitest';
import {isActionTrigger} from './useTouchTrigger';

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
