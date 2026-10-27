// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditing.test.tsx
 * @input vitest, List with `isEditing`, a stubbed pointer (a finger, iOS and
 *   Android alike, or a mouse) and the list table (motion/uikit/list.ts)
 * @output Unit tests for List's edit mode: every row indents its content by
 *   UIKit's edit-mode indent and its trailing content leaves; under a finger
 *   the content slides on the table spring from where it was, the trailing
 *   content fades out in place and leaves once faded, and leaving edit mode
 *   runs it back; a toggle mid-transition continues from the frame on screen
 *   with its velocity; with a mouse the switch is at once; off by default
 * @position Beside List/List.tsx; the motion itself is proven in a real
 *   engine by List/__tests__/ListEditing.interaction.browser.spec.ts
 */

import {act, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {list} from '../motion/uikit/list';
import {
  animatorFor,
  motionOf,
  presentation,
  type RowMotion,
} from '../utils/rowMotion';
import {List} from './List';
import {ListItem} from './ListItem';

const INDENT = list.metrics.editingIndent;

/**
 * The page under a finger (a coarse primary pointer: one touch model, iOS
 * and Android alike) or a mouse.
 */
function stubPointer(pointer: 'touch' | 'mouse') {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: pointer === 'touch' && query.includes('pointer: coarse'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function Rows({isEditing}: {isEditing?: boolean}) {
  return (
    <List isEditing={isEditing}>
      {['Inbox', 'Sent', 'Drafts'].map(label => (
        <ListItem
          key={label}
          label={label}
          onClick={() => undefined}
          endContent={<span data-testid={`chevron-${label}`}>›</span>}
        />
      ))}
    </List>
  );
}

const rowOf = (label: string) =>
  screen.getByText(label).closest('li') as HTMLElement;
/** The row's label part: the element the indent moves. */
const contentOf = (label: string) =>
  screen.getByText(label).closest('button') as HTMLElement;
/** The row is in edit mode: its own leading padding makes the indent. */
const isIndented = (label: string) =>
  rowOf(label).hasAttribute('data-astryx-editing');
const chevronOf = (label: string) => screen.queryByTestId(`chevron-${label}`);
/** The row's trailing part: the element the accessory fade moves. */
const trailingOf = (label: string) =>
  chevronOf(label)?.closest<HTMLElement>('[data-astryx-item-end]') ?? null;

describe('List edit mode', () => {
  it('is off by default: no indent, the trailing content shows', () => {
    stubPointer('touch');
    render(<Rows />);
    expect(isIndented('Inbox')).toBe(false);
    expect(chevronOf('Inbox')).not.toBeNull();
  });

  it('with a mouse, indents every row and removes its trailing content in the same commit, and leaving restores both', () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    const {rerender} = render(<Rows isEditing={false} />);
    rerender(<Rows isEditing />);
    for (const label of ['Inbox', 'Sent', 'Drafts']) {
      expect(isIndented(label)).toBe(true);
      expect(chevronOf(label)).toBeNull();
      expect(motionOf(contentOf(label), 'x')).toBeUndefined();
    }
    rerender(<Rows isEditing={false} />);
    for (const label of ['Inbox', 'Sent', 'Drafts']) {
      expect(isIndented(label)).toBe(false);
      expect(chevronOf(label)).not.toBeNull();
    }
  });

  it('makes the room on the row itself, with no element of its own: its leading padding grows by UIKit’s indent beyond the inset it applies', () => {
    stubPointer('mouse');
    const Plain = ({isEditing}: {isEditing: boolean}) => (
      <List isEditing={isEditing}>
        <ListItem label="Inbox" onClick={() => undefined} />
      </List>
    );
    const {rerender} = render(<Plain isEditing={false} />);
    const count = rowOf('Inbox').querySelectorAll('*').length;
    rerender(<Plain isEditing />);
    expect(isIndented('Inbox')).toBe(true);
    expect(rowOf('Inbox').querySelectorAll('*').length).toBe(count);
    // UIKit's edit-mode indent: the visible text's shift in a plain table.
    expect(INDENT).toBe(40);
    // An inline style, beyond the inset the row applies (the theme's when it
    // sets one): a theme's row padding sits in the theme's cascade layer,
    // above every component class, so a class could not add to it.
    expect(rowOf('Inbox').style.getPropertyValue('padding-inline-start')).toBe(
      `calc(var(--_item-inset-inline) + ${INDENT}px)`,
    );
    rerender(<Plain isEditing={false} />);
    expect(rowOf('Inbox').style.getPropertyValue('padding-inline-start')).toBe(
      '',
    );
  });

  it('under `edge="bleed"`, the room adds to the bleed inset', () => {
    stubPointer('mouse');
    render(
      <List isEditing edge="bleed">
        <ListItem label="Inbox" onClick={() => undefined} />
      </List>,
    );
    expect(rowOf('Inbox').style.getPropertyValue('padding-inline-start')).toBe(
      `calc(max(var(--container-padding-inline-start, 0px), var(--_item-inset-inline)) + ${INDENT}px)`,
    );
  });

  it('under a finger, the content slides in from where it was on the table spring', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const content = contentOf('Sent');
    const slide = motionOf(content, 'x') as RowMotion;
    expect(slide).toBeDefined();
    expect(slide.spring).toBe(list.update.tableSpring);
    // From rest: it starts when the browser commits it, where layout put
    // the content before the indent (an indent to the start).
    const start = await slide.handle.started;
    expect(presentation(content, 'x', start)).toBeCloseTo(-INDENT, 6);
    expect(presentation(content, 'x', start + 700)).toBeCloseTo(0, 1);
    // Every row's content moves alike.
    expect(motionOf(contentOf('Inbox'), 'x')).toBeDefined();
    expect(motionOf(contentOf('Drafts'), 'x')).toBeDefined();
  });

  it('under a finger, the trailing content fades out in place and leaves once faded', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const trailing = trailingOf('Sent') as HTMLElement;
    expect(trailing).not.toBeNull();
    const fade = motionOf(trailing, 'opacity') as RowMotion;
    expect(fade).toBeDefined();
    // In place: the trailing content does not slide.
    expect(motionOf(trailing, 'x')).toBeUndefined();
    const start = await fade.handle.started;
    expect(presentation(trailing, 'opacity', start)).toBeCloseTo(1, 6);
    expect(presentation(trailing, 'opacity', start + 700)).toBeCloseTo(0, 1);
    // Still there while it fades; gone once every row's has faded.
    expect(chevronOf('Sent')).not.toBeNull();
    await fade.handle.finished;
    await waitFor(() => expect(chevronOf('Sent')).toBeNull());
  });

  it('under a finger, leaving slides the content back and fades the trailing content in, in place', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing />);
    await act(async () => undefined);
    rerender(<Rows isEditing={false} />);
    expect(isIndented('Sent')).toBe(false);
    const content = contentOf('Sent');
    const slide = motionOf(content, 'x') as RowMotion;
    expect(slide).toBeDefined();
    const start = await slide.handle.started;
    expect(presentation(content, 'x', start)).toBeCloseTo(INDENT, 6);
    expect(presentation(content, 'x', start + 700)).toBeCloseTo(0, 1);
    // The trailing content is back at once, fading in where it rests.
    const trailing = trailingOf('Sent') as HTMLElement;
    expect(trailing).not.toBeNull();
    const fade = motionOf(trailing, 'opacity') as RowMotion;
    expect(fade).toBeDefined();
    expect(presentation(trailing, 'opacity', start)).toBeCloseTo(0, 6);
    expect(presentation(trailing, 'opacity', start + 700)).toBeCloseTo(1, 1);
  });

  it('keeps each row’s marker through edit mode, sliding it with the text', async () => {
    stubPointer('touch');
    const Bulleted = ({isEditing}: {isEditing: boolean}) => (
      <List listStyle="disc" isEditing={isEditing}>
        {['Inbox', 'Sent'].map(label => (
          <ListItem key={label} label={label} onClick={() => undefined} />
        ))}
      </List>
    );
    const {rerender} = render(<Bulleted isEditing={false} />);
    await act(async () => undefined);
    const marker = rowOf('Sent').firstElementChild as HTMLElement;
    rerender(<Bulleted isEditing />);
    // The same element, moving with the text: a toggle mid-transition
    // never restarts it from rest.
    expect(rowOf('Sent').firstElementChild).toBe(marker);
    expect(motionOf(marker, 'x')).toBeDefined();
    rerender(<Bulleted isEditing={false} />);
    expect(rowOf('Sent').firstElementChild).toBe(marker);
  });

  it('a toggle mid-transition continues from the frame on screen, keeping its velocity', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const content = contentOf('Sent');
    const slide = motionOf(content, 'x') as RowMotion;
    const start = await slide.handle.started;
    // 100 ms in, the user taps Done: the clock reads that frame, whatever
    // the wall clock says (a loaded machine runs timers late).
    const at = start + 100;
    const before = presentation(content, 'x', at);
    const speed = animatorFor(content).getVelocity('x', at);
    expect(before).toBeGreaterThan(-INDENT);
    expect(before).toBeLessThan(0);
    expect(speed).toBeGreaterThan(0);
    const clock = vi.spyOn(performance, 'now').mockReturnValue(at);
    rerender(<Rows isEditing={false} />);
    clock.mockRestore();
    // The indent left layout (the content's place moved back by it): the
    // same frame shows the content where it was, still moving the same way.
    expect(presentation(content, 'x', at)).toBeCloseTo(before + INDENT, 3);
    expect(animatorFor(content).getVelocity('x', at)).toBeCloseTo(speed, 0);
    // The same element, never remounted, and it rests at its old place.
    expect(contentOf('Sent')).toBe(content);
    expect(presentation(content, 'x', at + 900)).toBeCloseTo(0, 1);
    expect(start).toBeLessThan(at);
  });
});
