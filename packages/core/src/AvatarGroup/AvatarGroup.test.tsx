// Copyright (c) Meta Platforms, Inc. and affiliates.
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AvatarGroup} from './AvatarGroup';
import {AvatarGroupOverflow} from './AvatarGroupOverflow';
import {Avatar, AvatarStatusDot} from '../Avatar';

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

  it('composes a labelled status into a grouped avatar accessible name (WCAG 4.1.2)', () => {
    render(
      <AvatarGroup>
        <Avatar
          name="Alice"
          status={<AvatarStatusDot variant="success" label="Online" />}
        />
        <Avatar name="Bob" />
      </AvatarGroup>,
    );

    expect(screen.getByLabelText('Alice, Online')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
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

describe('AvatarGroup — size cascade', () => {
  const sizeClasses = (el: HTMLElement) => el.className.split(/\s+/);

  it("the group's size overrides a child's own size prop", () => {
    render(
      <AvatarGroup size="lg">
        <Avatar name="Alice" size="xsm" data-testid="alice" />
      </AvatarGroup>,
    );

    const classes = sizeClasses(screen.getByTestId('alice'));
    expect(classes).toContain('lg');
    expect(classes).not.toContain('xsm');
  });

  it("the group's default size also overrides a child's own size prop", () => {
    // Known open finding: the group always publishes a size on its context, so
    // a group that never set one still imposes md on children that did set one.
    // Pinned here so the behaviour cannot change without a deliberate edit.
    render(
      <AvatarGroup>
        <Avatar name="Alice" size="xl" data-testid="alice" />
      </AvatarGroup>,
    );

    const classes = sizeClasses(screen.getByTestId('alice'));
    expect(classes).toContain('md');
    expect(classes).not.toContain('xl');
  });

  it("outside a group the avatar's own size applies", () => {
    render(<Avatar name="Alice" size="xl" data-testid="alice" />);

    expect(sizeClasses(screen.getByTestId('alice'))).toContain('xl');
  });
});
