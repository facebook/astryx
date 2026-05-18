// Copyright (c) Meta Platforms, Inc. and affiliates.
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSAvatarGroup} from './XDSAvatarGroup';

const AVATARS = [
  {name: 'Alice', src: '/alice.jpg', key: 'alice'},
  {name: 'Bob', src: '/bob.jpg', key: 'bob'},
  {name: 'Charlie', src: '/charlie.jpg', key: 'charlie'},
  {name: 'Diana', src: '/diana.jpg', key: 'diana'},
  {name: 'Eve', src: '/eve.jpg', key: 'eve'},
];

describe('XDSAvatarGroup', () => {
  it('renders all avatars when no maxVisibleCount is set', () => {
    render(<XDSAvatarGroup avatars={AVATARS.slice(0, 3)} />);

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
  });

  it('limits visible avatars when maxVisibleCount is set', () => {
    render(
      <XDSAvatarGroup avatars={AVATARS.slice(0, 3)} maxVisibleCount={2} />,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
  });

  it('shows overflow indicator with hidden count', () => {
    render(
      <XDSAvatarGroup avatars={AVATARS.slice(0, 4)} maxVisibleCount={2} />,
    );

    expect(screen.getByLabelText('2 more')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('adds overflowCount to hidden count', () => {
    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 3)}
        maxVisibleCount={2}
        overflowCount={10}
      />,
    );

    expect(screen.getByLabelText('11 more')).toBeInTheDocument();
    expect(screen.getByText('+11')).toBeInTheDocument();
  });

  it('shows overflowCount even when all avatars are visible', () => {
    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 3)}
        maxVisibleCount={5}
        overflowCount={44}
      />,
    );

    expect(screen.getByLabelText('44 more')).toBeInTheDocument();
    expect(screen.getByText('+44')).toBeInTheDocument();
  });

  it('renders overflow as span when onClickOverflow is not set', () => {
    render(
      <XDSAvatarGroup avatars={AVATARS.slice(0, 2)} maxVisibleCount={1} />,
    );

    const overflow = screen.getByLabelText('1 more');
    expect(overflow.tagName).toBe('SPAN');
  });

  it('renders overflow as button when onClickOverflow is set', () => {
    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 2)}
        maxVisibleCount={1}
        onClickOverflow={() => {}}
      />,
    );

    const overflow = screen.getByLabelText('1 more');
    expect(overflow.tagName).toBe('BUTTON');
  });

  it('calls onClickOverflow when overflow indicator is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 2)}
        maxVisibleCount={1}
        onClickOverflow={handleClick}
      />,
    );

    await user.click(screen.getByLabelText('1 more'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders with role="group" and default aria-label', () => {
    render(<XDSAvatarGroup avatars={AVATARS.slice(0, 1)} />);

    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Avatars');
  });

  it('accepts a custom aria-label', () => {
    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 1)}
        aria-label="Team members"
      />,
    );

    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Team members',
    );
  });

  it('applies data-testid', () => {
    render(
      <XDSAvatarGroup
        avatars={AVATARS.slice(0, 1)}
        data-testid="avatar-group"
      />,
    );

    expect(screen.getByTestId('avatar-group')).toBeInTheDocument();
  });

  it('does not show overflow when maxVisibleCount exceeds avatar count', () => {
    render(
      <XDSAvatarGroup avatars={AVATARS.slice(0, 2)} maxVisibleCount={10} />,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it('applies size class to the group', () => {
    render(<XDSAvatarGroup avatars={AVATARS.slice(0, 1)} size="medium" />);

    const group = screen.getByRole('group');
    expect(group.className).toContain('xds-avatar-group');
    expect(group.className).toContain('medium');
  });

  it('renders empty group when avatars is empty', () => {
    render(<XDSAvatarGroup avatars={[]} data-testid="empty" />);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
