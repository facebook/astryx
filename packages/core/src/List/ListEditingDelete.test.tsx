// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditingDelete.test.tsx
 * @input vitest, List with `isEditing` and `editingControl="delete"`, rows
 *   with and without trailing swipe actions, a stubbed pointer (a finger,
 *   iOS and Android alike, or a mouse) and the list table
 *   (motion/uikit/list.ts)
 * @output Unit tests for edit mode's delete control: under a finger each row
 *   with trailing swipe actions shows UIKit's delete control (the theme's
 *   error colour, a bar across it) in its leading column, a row without
 *   them keeps the indent alone; with a mouse there is no delete control
 *   (desktop unchanged, swipe actions being touch-only); the control slides
 *   in and out with edit mode like every editing control; tapping it
 *   reveals the row's trailing actions through the row's own swipe, and
 *   tapping it again closes them; a row whose swipe gives it nothing to open
 *   (a commit row: Item hands it no swipe seam) keeps the indent alone
 * @position Beside List/List.tsx; the reveal's motion is the swipe's own
 *   (Item), proven in List/__tests__/ListEditingDelete.interaction.browser.spec.ts
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {list} from '../motion/uikit/list';
import {motionOf, presentation, type RowMotion} from '../utils/rowMotion';
import type {ItemSwipeActions} from '../Item';
import type * as RevealModule from '../Item/ItemSwipeRevealContext';
import {List} from './List';
import {ListItem} from './ListItem';

const TRAVEL = list.metrics.editingControlTravel;

// The row's own swipe, as Item hands it to a control in its subtree
// (Item/ItemSwipeRevealContext.tsx): the delete control only calls it.
const swipe = vi.hoisted(() => ({
  side: null as 'leading' | 'trailing' | null,
  reveal: vi.fn(),
  close: vi.fn(),
}));
// A row whose actions never rest open (a commit row) gets no seam from Item.
const seam = vi.hoisted(() => ({present: true}));
vi.mock('../Item/ItemSwipeRevealContext', async importOriginal => ({
  ...(await importOriginal<typeof RevealModule>()),
  useItemSwipeReveal: () => (seam.present ? swipe : null),
}));

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
  seam.present = true;
});

const TRAILING: ItemSwipeActions = {
  trailing: [
    {label: 'Delete', variant: 'destructive', onActivate: () => undefined},
  ],
};

const ignoreClick = () => undefined;

function Rows({
  isEditing,
  onClick = ignoreClick,
}: {
  isEditing?: boolean;
  onClick?: () => void;
}) {
  return (
    <List isEditing={isEditing} editingControl="delete">
      <ListItem label="Inbox" onClick={() => undefined} />
      <ListItem label="Sent" onClick={onClick} swipeActions={TRAILING} />
      <ListItem
        label="Drafts"
        onClick={() => undefined}
        swipeActions={TRAILING}
      />
    </List>
  );
}

const rowOf = (label: string) =>
  screen.getByText(label).closest('li') as HTMLElement;
const controlOf = (label: string) =>
  rowOf(label).querySelector<HTMLElement>('[data-astryx-editing-control]');
/** The row is in edit mode: its own leading padding makes the indent. */
const isIndented = (label: string) =>
  rowOf(label).hasAttribute('data-astryx-editing');
/** The delete control: the editing control itself, with no wrapper. */
const discOf = (label: string) =>
  rowOf(label).querySelector<HTMLElement>(
    '[data-astryx-editing-control][data-astryx-delete-control]',
  );

describe('List edit mode, delete control', () => {
  it('under a finger, shows UIKit’s delete control on each row with trailing swipe actions', async () => {
    stubPointer('touch');
    render(<Rows isEditing />);
    await act(async () => undefined);
    for (const label of ['Sent', 'Drafts']) {
      expect(controlOf(label)).not.toBeNull();
      expect(discOf(label)).toBe(controlOf(label));
      // The bar is the disc's `::before`: no element inside.
      expect(discOf(label)?.childElementCount).toBe(0);
    }
    // No trailing actions, nothing to reveal: the indent alone, as UIKit's
    // `.none` editing style.
    expect(isIndented('Inbox')).toBe(true);
    expect(controlOf('Inbox')).toBeNull();
  });

  it('with a mouse, shows no delete control: the indent alone, desktop unchanged', async () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    render(<Rows isEditing />);
    await act(async () => undefined);
    expect(isIndented('Sent')).toBe(true);
    expect(controlOf('Sent')).toBeNull();
  });

  it('shows no delete control where the row’s swipe gives it nothing to open (a commit row): the indent alone', async () => {
    stubPointer('touch');
    // Nothing rests open under commit, so Item hands the row no swipe seam.
    seam.present = false;
    render(
      <List isEditing editingControl="delete">
        <ListItem
          label="Sent"
          onClick={ignoreClick}
          swipeActions={TRAILING}
          swipeBehavior="commit"
        />
      </List>,
    );
    await act(async () => undefined);
    expect(isIndented('Sent')).toBe(true);
    expect(controlOf('Sent')).toBeNull();
  });

  it('is a touch accelerator, like the swipe it opens: hidden from assistive technology and no tab stop', async () => {
    stubPointer('touch');
    render(<Rows isEditing />);
    await act(async () => undefined);
    const control = controlOf('Sent') as HTMLElement;
    expect(control.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(control.querySelector('input, button, [tabindex]')).toBeNull();
  });

  it('a tap opens the row’s trailing actions through its own swipe, never its action', async () => {
    stubPointer('touch');
    swipe.side = null;
    swipe.reveal.mockClear();
    const onClick = vi.fn();
    render(<Rows isEditing onClick={onClick} />);
    await act(async () => undefined);
    const disc = discOf('Sent') as HTMLElement;
    fireEvent.click(disc);
    expect(swipe.reveal).toHaveBeenCalledWith('trailing');
    expect(onClick).not.toHaveBeenCalled();
    // It takes the press itself, so the row does not light under it.
    expect(disc.hasAttribute('data-astryx-pressable')).toBe(true);
  });

  it('a tap on an open row closes its trailing actions', async () => {
    stubPointer('touch');
    swipe.side = 'trailing';
    swipe.close.mockClear();
    swipe.reveal.mockClear();
    render(<Rows isEditing />);
    await act(async () => undefined);
    fireEvent.click(discOf('Sent') as HTMLElement);
    expect(swipe.close).toHaveBeenCalledTimes(1);
    expect(swipe.reveal).not.toHaveBeenCalled();
    swipe.side = null;
  });

  it('leaving edit mode closes a row it opened, as UIKit ends editing', async () => {
    stubPointer('touch');
    swipe.side = 'trailing';
    swipe.close.mockClear();
    const {rerender} = render(<Rows isEditing />);
    await act(async () => undefined);
    expect(swipe.close).not.toHaveBeenCalled();
    rerender(<Rows isEditing={false} />);
    await act(async () => undefined);
    expect(swipe.close).toHaveBeenCalled();
    swipe.side = null;
  });

  it('under a finger, slides in and out with edit mode like every editing control', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const control = controlOf('Sent') as HTMLElement;
    const slide = motionOf(control, 'x') as RowMotion;
    expect(slide).toBeDefined();
    expect(slide.spring).toBe(list.update.tableSpring);
    const start = await slide.handle.started;
    expect(presentation(control, 'x', start)).toBeCloseTo(-TRAVEL, 6);
    expect(presentation(control, 'opacity', start)).toBeCloseTo(0, 6);
  });
});
