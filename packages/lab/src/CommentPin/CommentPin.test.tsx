// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CommentPin} from './CommentPin';

const ADA = {id: 'ada', name: 'Ada Lovelace'};
const LIN = {id: 'lin', name: 'Lin Chen'};
const MIRA = {id: 'mira', name: 'Mira Patel'};
const NOAH = {id: 'noah', name: 'Noah Williams'};
const SAM = {id: 'sam', name: 'Sam Rivera'};

describe('CommentPin', () => {
  it('renders one labelled button and one representative for a single thread', () => {
    const {container} = render(
      <CommentPin label="Open annotation from Ada" participants={[ADA]} />,
    );

    expect(
      screen.getByRole('button', {name: 'Open annotation from Ada'}),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(1);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows up to three distinct participants and the exact total for a group', () => {
    const {container} = render(
      <CommentPin
        label="Open 12 grouped annotations"
        participants={[ADA, ADA, LIN, MIRA]}
        threadCount={12}
      />,
    );

    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(3);
    expect(
      container.querySelector('.astryx-avatar-group-overflow'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Open 12 grouped annotations'}),
    ).toHaveAttribute('data-grouped', 'grouped');
  });

  it('caps a group at three circles with a +N overflow beyond three people', () => {
    const {container} = render(
      <CommentPin
        label="Open 6 grouped annotations from Ada, Lin, and 3 others"
        participants={[ADA, LIN, MIRA, NOAH, SAM]}
        threadCount={6}
      />,
    );

    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(2);
    const overflow = container.querySelector('.astryx-avatar-group-overflow');
    expect(overflow).toHaveTextContent('+3');
    expect(overflow?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows the unread count in an accent badge in place of the total', () => {
    const {container} = render(
      <CommentPin
        label="Open 4 grouped annotations, 2 unread"
        participants={[ADA, LIN]}
        threadCount={4}
        unreadCount={2}
      />,
    );

    const pin = screen.getByRole('button', {
      name: 'Open 4 grouped annotations, 2 unread',
    });
    expect(pin).toHaveAttribute('data-unread', 'unread');
    expect(screen.getByText('2')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(2);
  });

  it('shows an unread badge on a single-thread pin', () => {
    render(
      <CommentPin
        label="Open unread annotation from Ada"
        participants={[ADA]}
        unreadCount={1}
      />,
    );

    const pin = screen.getByRole('button', {
      name: 'Open unread annotation from Ada',
    });
    expect(pin).toHaveAttribute('data-unread', 'unread');
    expect(pin).not.toHaveAttribute('data-grouped');
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it.each([
    [-1, null],
    [1.5, null],
    [Number.NaN, null],
    [9, '3'],
  ])(
    'normalizes unreadCount %s and warns in development',
    async (unreadCount, expectedBadge) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {container, unmount} = render(
        <CommentPin
          label="Open annotations"
          participants={[ADA, LIN]}
          threadCount={3}
          unreadCount={unreadCount}
        />,
      );

      const pin = container.querySelector('.astryx-comment-pin');
      if (expectedBadge == null) {
        expect(pin).not.toHaveAttribute('data-unread');
        expect(screen.getByText('3')).toBeInTheDocument();
      } else {
        expect(pin).toHaveAttribute('data-unread', 'unread');
        expect(screen.getByText(expectedBadge)).toBeInTheDocument();
      }
      await waitFor(() =>
        expect(warning).toHaveBeenCalledWith(
          expect.stringContaining('unreadCount` must be a finite non-negative'),
        ),
      );
      unmount();
      warning.mockRestore();
    },
  );

  it('does not expose visible Avatar or count semantics separately from the button', () => {
    const {container} = render(
      <CommentPin
        label="Open 4 annotations from Ada and Lin"
        participants={[ADA, LIN]}
        threadCount={4}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(
      container
        .querySelector('.astryx-avatar')
        ?.closest('[aria-hidden="true"]'),
    ).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('4')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps a single marker to one representative even when more are supplied', () => {
    const {container} = render(
      <CommentPin label="Open annotation" participants={[ADA, LIN, MIRA]} />,
    );

    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(1);
    expect(container.querySelector('.astryx-comment-pin')).not.toHaveAttribute(
      'data-grouped',
    );
  });

  it('reflects selected, resolved, and disabled state on the owning target', () => {
    render(
      <CommentPin
        label="Resolved selected annotation"
        participants={[ADA]}
        isSelected
        isResolved
        isDisabled
      />,
    );

    const marker = screen.getByRole('button', {
      name: 'Resolved selected annotation',
    });
    expect(marker).toHaveAttribute('aria-pressed', 'true');
    expect(marker).toHaveAttribute('aria-disabled', 'true');
    expect(marker).toHaveAttribute('data-selected', 'selected');
    expect(marker).toHaveAttribute('data-resolved', 'resolved');
    expect(marker).toHaveAttribute('data-disabled', 'disabled');
  });

  it('dims non-selected pins without disabling selection changes', () => {
    const onClick = vi.fn();
    render(
      <CommentPin
        label="Open another annotation"
        participants={[LIN]}
        isDimmed
        onClick={onClick}
      />,
    );

    const pin = screen.getByRole('button', {name: 'Open another annotation'});
    expect(pin).toHaveAttribute('data-dimmed', 'dimmed');
    expect(pin).not.toBeDisabled();
    fireEvent.click(pin);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls the forwarded click handler when enabled', () => {
    const onClick = vi.fn();
    render(
      <CommentPin
        label="Open annotation"
        participants={[ADA]}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open annotation'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates through the native button keyboard contract', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CommentPin
        label="Open annotation"
        participants={[ADA]}
        onClick={onClick}
      />,
    );

    const pin = screen.getByRole('button', {name: 'Open annotation'});
    pin.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not call the click handler when disabled', () => {
    const onClick = vi.fn();
    render(
      <CommentPin
        label="Pending annotation"
        participants={[ADA]}
        isDisabled
        onClick={onClick}
      />,
    );

    const pin = screen.getByRole('button', {name: 'Pending annotation'});
    expect(pin).not.toHaveAttribute('disabled');
    expect(pin).toHaveAttribute('aria-disabled', 'true');
    pin.focus();
    expect(pin).toHaveFocus();
    fireEvent.click(pin);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the ref and neutral button props', () => {
    const ref = {current: null as HTMLButtonElement | null};
    render(
      <CommentPin
        ref={ref}
        label="Open annotation"
        participants={[ADA]}
        data-cluster-id="cluster-1"
        aria-controls="thread-panel"
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('type', 'button');
    expect(ref.current).toHaveAttribute('data-cluster-id', 'cluster-1');
    expect(ref.current).toHaveAttribute('aria-controls', 'thread-panel');
  });

  it('combines the stable target with a caller class and style', () => {
    render(
      <CommentPin
        label="Open annotation"
        participants={[ADA]}
        className="host-position"
        style={{insetInlineStart: 24}}
      />,
    );

    const marker = screen.getByRole('button', {name: 'Open annotation'});
    expect(marker.className).toContain('astryx-comment-pin');
    expect(marker.className).toContain('host-position');
    expect(marker).toHaveStyle({insetInlineStart: '24px'});
  });

  it('falls back to a single anonymous Avatar and warns for no representatives', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {container} = render(
      <CommentPin
        label="Open annotation"
        participants={[] as unknown as [typeof ADA]}
      />,
    );

    expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(1);
    await waitFor(() =>
      expect(warning).toHaveBeenCalledWith(
        expect.stringContaining('participants` should contain at least one'),
      ),
    );
    warning.mockRestore();
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to a single-thread marker for invalid threadCount %s',
    async threadCount => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {container, unmount} = render(
        <CommentPin
          label="Open annotation"
          participants={[ADA, LIN]}
          threadCount={threadCount}
        />,
      );

      expect(container.querySelectorAll('.astryx-avatar')).toHaveLength(1);
      expect(
        container.querySelector('.astryx-comment-pin'),
      ).not.toHaveAttribute('data-grouped');
      await waitFor(() =>
        expect(warning).toHaveBeenCalledWith(
          expect.stringContaining(
            'threadCount` must be a finite positive integer',
          ),
        ),
      );
      unmount();
      warning.mockRestore();
    },
  );

  it('shows its action label as a visual tooltip on hover', async () => {
    const showPopover = vi.spyOn(HTMLElement.prototype, 'showPopover');
    render(
      <CommentPin label="Open annotation from Ada" participants={[ADA]} />,
    );

    const marker = screen.getByRole('button', {
      name: 'Open annotation from Ada',
    });
    fireEvent.pointerEnter(marker, {pointerType: 'mouse'});
    fireEvent.mouseEnter(marker);

    await waitFor(() => expect(showPopover).toHaveBeenCalled());
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Open annotation from Ada',
    );
    showPopover.mockRestore();
  });
});
