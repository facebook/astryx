// Copyright (c) Meta Platforms, Inc. and affiliates.
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AvatarGroup} from './AvatarGroup';
import {AvatarGroupOverflow} from './AvatarGroupOverflow';
import {Avatar} from '../Avatar';

describe('AvatarGroup', () => {
  it('renders all avatar children', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
      </AvatarGroup>,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
  });

  it('renders with role="group" and default aria-label', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Avatars');
  });

  it('accepts a custom aria-label', () => {
    render(
      <AvatarGroup aria-label="Team members">
        <Avatar name="Alice" />
      </AvatarGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Team members',
    );
  });

  it('applies data-testid', () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar name="Alice" />
      </AvatarGroup>,
    );

    expect(screen.getByTestId('avatar-group')).toBeInTheDocument();
  });

  it('applies size class to the group', () => {
    render(
      <AvatarGroup size="lg">
        <Avatar name="Alice" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group.className).toContain('astryx-avatar-group');
    expect(group.className).toContain('lg');
  });

  it('renders empty group when no children', () => {
    render(<AvatarGroup data-testid="empty">{[]}</AvatarGroup>);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('AvatarGroupOverflow', () => {
  it('renders overflow count as span by default', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={5} />
      </AvatarGroup>,
    );

    const overflow = screen.getByLabelText('5 more');
    expect(overflow.tagName).toBe('SPAN');
    expect(overflow).toHaveTextContent('+5');
  });

  it('renders as button when onClick is provided', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={3} onClick={() => {}} />
      </AvatarGroup>,
    );

    const overflow = screen.getByLabelText('3 more');
    expect(overflow.tagName).toBe('BUTTON');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={3} onClick={handleClick} />
      </AvatarGroup>,
    );

    await user.click(screen.getByLabelText('3 more'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders custom children instead of default label', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={5}>
          <span data-testid="custom">more</span>
        </AvatarGroupOverflow>
      </AvatarGroup>,
    );

    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('works with sliced avatar list and server-side count', () => {
    const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const serverTotal = 47;
    const visibleCount = 3;

    render(
      <AvatarGroup size="lg">
        {users.slice(0, visibleCount).map(name => (
          <Avatar key={name} name={name} />
        ))}
        <AvatarGroupOverflow count={serverTotal - visibleCount} />
      </AvatarGroup>,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
    expect(screen.getByLabelText('44 more')).toBeInTheDocument();
    expect(screen.getByText('+44')).toBeInTheDocument();
  });
});

describe('AvatarGroupOverflow — hardening', () => {
  it('forwards ref to the span element', () => {
    const ref = {current: null} as React.RefObject<HTMLElement | null>;

    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={3} ref={ref} />
      </AvatarGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards ref to the button element when onClick provided', () => {
    const ref = {current: null} as React.RefObject<HTMLElement | null>;

    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={3} onClick={() => {}} ref={ref} />
      </AvatarGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies className prop', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={3} className="custom-class" />
      </AvatarGroup>,
    );

    const overflow = screen.getByLabelText('3 more');
    expect(overflow.className).toContain('custom-class');
  });

  it('handles count of zero gracefully', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={0} />
      </AvatarGroup>,
    );

    expect(screen.getByText('+0')).toBeInTheDocument();
    expect(screen.getByLabelText('0 more')).toBeInTheDocument();
  });

  it('handles very large count', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={999} />
      </AvatarGroup>,
    );

    expect(screen.getByText('+999')).toBeInTheDocument();
  });

  it('renders the full "+N" text for wide multi-digit counts', () => {
    // The indicator grows into a pill for long counts, so the entire number
    // must remain present (nothing clipped away in the DOM).
    render(
      <AvatarGroup>
        <Avatar name="Alice" />
        <AvatarGroupOverflow count={4912} />
      </AvatarGroup>,
    );

    expect(screen.getByText('+4912')).toBeInTheDocument();
    expect(screen.getByLabelText('4912 more')).toBeInTheDocument();
  });
});

describe('AvatarGroup — roving focus + keyboard hint', () => {
  it('is a single tab stop over interactive avatars (one tabindex=0, rest -1)', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" href="/alice" />
        <Avatar name="Bob" href="/bob" />
        <Avatar name="Charlie" href="/charlie" />
      </AvatarGroup>,
    );

    const alice = screen.getByRole('link', {name: 'Alice'});
    const bob = screen.getByRole('link', {name: 'Bob'});
    const charlie = screen.getByRole('link', {name: 'Charlie'});

    expect(alice).toHaveAttribute('tabindex', '0');
    expect(bob).toHaveAttribute('tabindex', '-1');
    expect(charlie).toHaveAttribute('tabindex', '-1');
  });

  it('roves focus with ArrowRight/ArrowLeft across interactive avatars', async () => {
    const user = userEvent.setup();
    render(
      <AvatarGroup>
        <Avatar name="Alice" href="/alice" />
        <Avatar name="Bob" onClick={() => {}} />
        <Avatar name="Charlie" href="/charlie" />
      </AvatarGroup>,
    );

    const alice = screen.getByRole('link', {name: 'Alice'});
    const bob = screen.getByRole('button', {name: 'Bob'});
    const charlie = screen.getByRole('link', {name: 'Charlie'});

    alice.focus();
    expect(alice).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(bob).toHaveFocus();
    expect(bob).toHaveAttribute('tabindex', '0');
    expect(alice).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowRight}');
    expect(charlie).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(bob).toHaveFocus();
  });

  it('includes the overflow button as the last roving item', async () => {
    const user = userEvent.setup();
    render(
      <AvatarGroup>
        <Avatar name="Alice" href="/alice" />
        <AvatarGroupOverflow count={3} onClick={() => {}} />
      </AvatarGroup>,
    );

    const alice = screen.getByRole('link', {name: 'Alice'});
    const overflow = screen.getByRole('button', {name: '3 more'});
    expect(overflow).toHaveAttribute('data-avatar-item');

    alice.focus();
    await user.keyboard('{ArrowRight}');
    expect(overflow).toHaveFocus();
  });

  it('does NOT rove over a non-avatar button in a status slot', async () => {
    const user = userEvent.setup();
    render(
      <AvatarGroup>
        <Avatar
          name="Alice"
          href="/alice"
          status={<button type="button">badge</button>}
        />
        <Avatar name="Bob" href="/bob" />
      </AvatarGroup>,
    );

    const alice = screen.getByRole('link', {name: 'Alice'});
    const bob = screen.getByRole('link', {name: 'Bob'});
    const statusButton = screen.getByRole('button', {name: 'badge'});

    // The status button carries no data-avatar-item marker.
    expect(statusButton).not.toHaveAttribute('data-avatar-item');

    alice.focus();
    await user.keyboard('{ArrowRight}');
    // Arrow moves to the next avatar, skipping the nested status button.
    expect(bob).toHaveFocus();
    expect(statusButton).not.toHaveFocus();
  });

  it('attaches an aria-describedby keyboard hint when interactive children exist', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" href="/alice" />
        <Avatar name="Bob" href="/bob" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    const describedBy = group.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const hint = document.getElementById(describedBy!);
    expect(hint).not.toBeNull();
    expect(hint).toHaveTextContent('Use arrow keys to move between avatars');
  });

  it('a purely static group has no tab stop and no keyboard hint', () => {
    render(
      <AvatarGroup>
        <Avatar name="Alice" data-testid="alice" />
        <Avatar name="Bob" data-testid="bob" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-describedby');
    // Static avatars are not focusable — no roving tabindex stamped.
    expect(screen.getByTestId('alice')).not.toHaveAttribute('tabindex');
    expect(screen.getByTestId('bob')).not.toHaveAttribute('tabindex');
  });
});
