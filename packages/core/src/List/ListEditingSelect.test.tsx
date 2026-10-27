// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditingSelect.test.tsx
 * @input vitest, List with `isEditing` and `editingControl="select"`, a stubbed
 *   pointer (a finger, iOS and Android alike, or a mouse) and the list table
 *   (motion/uikit/list.ts)
 * @output Unit tests for edit mode's selection control: each row shows the
 *   theme's checkbox indicator in its leading column, checked when the row
 *   is selected, decorative (the row keeps its state and its one tab stop);
 *   activating a row still calls its `onClick`; under a finger the control
 *   slides in from UIKit's travel and fades in on the table spring, and on
 *   leaving slides out and fades, staying until it has faded while the
 *   content moves back at once; a toggle mid-transition turns it around;
 *   with a mouse it comes and goes at once
 * @position Beside List/List.tsx; the motion itself is proven in a real
 *   engine by List/__tests__/ListEditingSelect.interaction.browser.spec.ts
 */

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {list} from '../motion/uikit/list';
import {motionOf, presentation, type RowMotion} from '../utils/rowMotion';
import {List} from './List';
import {ListItem} from './ListItem';

const TRAVEL = list.metrics.editingControlTravel;

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

const SENT_SELECTED = ['Sent'];
const ignoreClick = () => undefined;

function Rows({
  isEditing,
  editingControl = 'select',
  selected = SENT_SELECTED,
  onClick = ignoreClick,
}: {
  isEditing?: boolean;
  editingControl?: 'select';
  selected?: string[];
  onClick?: (label: string) => void;
}) {
  return (
    <List isEditing={isEditing} editingControl={editingControl}>
      {['Inbox', 'Sent', 'Drafts'].map(label => (
        <ListItem
          key={label}
          label={label}
          isSelected={selected.includes(label)}
          onClick={() => onClick(label)}
        />
      ))}
    </List>
  );
}

const rowOf = (label: string) =>
  screen.getByText(label).closest('li') as HTMLElement;
const controlOf = (label: string) =>
  rowOf(label).querySelector<HTMLElement>('[data-astryx-editing-control]');
/** The theme's checkbox indicator: the control itself, with no wrapper. */
const indicatorOf = (label: string) => {
  const control = controlOf(label);
  return control?.matches('.astryx-checkbox-indicator') === true
    ? control
    : null;
};

describe('List edit mode, selection control', () => {
  it('adds the control alone, the theme’s indicator with no wrapper: the room is the row’s own padding', () => {
    stubPointer('mouse');
    const Plain = ({isEditing}: {isEditing: boolean}) => (
      <List isEditing={isEditing} editingControl="select">
        <ListItem label="Sent" onClick={() => undefined} />
      </List>
    );
    const {rerender} = render(<Plain isEditing={false} />);
    const count = rowOf('Sent').querySelectorAll('*').length;
    rerender(<Plain isEditing />);
    const control = controlOf('Sent') as HTMLElement;
    expect(control.parentElement).toBe(rowOf('Sent'));
    expect(indicatorOf('Sent')).toBe(control);
    expect(rowOf('Sent').querySelectorAll('*').length).toBe(
      count + 1 + control.querySelectorAll('*').length,
    );
  });

  it('shows nothing outside edit mode', () => {
    stubPointer('mouse');
    render(<Rows isEditing={false} />);
    expect(controlOf('Sent')).toBeNull();
  });

  it('shows the theme’s checkbox indicator in each row, checked when the row is selected', () => {
    stubPointer('mouse');
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    render(<Rows isEditing />);
    for (const label of ['Inbox', 'Sent', 'Drafts']) {
      expect(indicatorOf(label)).not.toBeNull();
    }
    expect(indicatorOf('Sent')?.getAttribute('data-checked')).toBe('checked');
    expect(indicatorOf('Inbox')?.hasAttribute('data-checked')).toBe(false);
  });

  it('is decorative: the row’s activation is a checkbox that carries the selection, and the row keeps its one tab stop', () => {
    stubPointer('mouse');
    render(<Rows isEditing />);
    const control = controlOf('Sent') as HTMLElement;
    expect(control.getAttribute('aria-hidden')).toBe('true');
    expect(control.querySelector('input, button, [tabindex]')).toBeNull();
    // The row's activation is a checkbox whose checked state is the row's
    // selection (`component:List` AR3); the row's aria-current gives way.
    expect(screen.getByRole('checkbox', {name: 'Sent'})).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('checkbox', {name: 'Inbox'})).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(rowOf('Sent').hasAttribute('aria-current')).toBe(false);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('outside edit mode, a row’s semantics are unchanged', () => {
    stubPointer('mouse');
    render(<Rows isEditing={false} />);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(rowOf('Sent').getAttribute('aria-current')).toBe('true');
    expect(rowOf('Inbox').hasAttribute('aria-current')).toBe(false);
  });

  it('activating a row still calls its onClick, for the app to toggle its selection', () => {
    stubPointer('mouse');
    const onClick = vi.fn();
    render(<Rows isEditing onClick={onClick} />);
    fireEvent.click(screen.getByText('Drafts'));
    expect(onClick).toHaveBeenCalledWith('Drafts');
  });

  it('with a mouse, comes and goes with edit mode at once', () => {
    stubPointer('mouse');
    const {rerender} = render(<Rows isEditing={false} />);
    rerender(<Rows isEditing />);
    expect(controlOf('Sent')).not.toBeNull();
    expect(motionOf(controlOf('Sent') as HTMLElement, 'x')).toBeUndefined();
    rerender(<Rows isEditing={false} />);
    expect(controlOf('Sent')).toBeNull();
  });

  it('under a finger, slides in from UIKit’s travel and fades in on the table spring', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const control = controlOf('Sent') as HTMLElement;
    const slide = motionOf(control, 'x') as RowMotion;
    expect(slide).toBeDefined();
    expect(slide.spring).toBe(list.update.tableSpring);
    expect(motionOf(control, 'opacity')).toBeDefined();
    const start = await slide.handle.started;
    expect(presentation(control, 'x', start)).toBeCloseTo(-TRAVEL, 6);
    expect(presentation(control, 'opacity', start)).toBeCloseTo(0, 6);
    expect(presentation(control, 'x', start + 700)).toBeCloseTo(0, 1);
    expect(presentation(control, 'opacity', start + 700)).toBeCloseTo(1, 1);
  });

  it('under a finger, leaving slides it out and fades it while the content moves back at once, then it leaves', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing />);
    await act(async () => undefined);
    rerender(<Rows isEditing={false} />);
    const control = controlOf('Sent') as HTMLElement;
    expect(control).not.toBeNull();
    // The indent left layout at once: the content springs back from it.
    const content = screen.getByText('Sent').closest('button') as HTMLElement;
    expect(motionOf(content, 'x')).toBeDefined();
    const slide = motionOf(control, 'x') as RowMotion;
    const start = await slide.handle.started;
    expect(presentation(control, 'x', start)).toBeCloseTo(0, 6);
    expect(presentation(control, 'x', start + 700)).toBeCloseTo(-TRAVEL, 1);
    expect(presentation(control, 'opacity', start + 700)).toBeCloseTo(0, 1);
    await slide.handle.finished;
    await waitFor(() => expect(controlOf('Sent')).toBeNull());
  });

  it('a toggle mid-transition turns the control around from where it is', async () => {
    stubPointer('touch');
    const {rerender} = render(<Rows isEditing={false} />);
    await act(async () => undefined);
    rerender(<Rows isEditing />);
    const control = controlOf('Sent') as HTMLElement;
    const slide = motionOf(control, 'x') as RowMotion;
    // 100 ms in: the clock reads that frame, whatever the wall clock says
    // (a loaded machine runs timers late).
    const at = (await slide.handle.started) + 100;
    const before = presentation(control, 'x', at);
    expect(before).toBeGreaterThan(-TRAVEL);
    expect(before).toBeLessThan(0);
    const clock = vi.spyOn(performance, 'now').mockReturnValue(at);
    rerender(<Rows isEditing={false} />);
    clock.mockRestore();
    // The same element, from the same place, now heading out.
    expect(controlOf('Sent')).toBe(control);
    expect(presentation(control, 'x', at)).toBeCloseTo(before, 3);
    expect(presentation(control, 'x', at + 900)).toBeCloseTo(-TRAVEL, 1);
  });
});
