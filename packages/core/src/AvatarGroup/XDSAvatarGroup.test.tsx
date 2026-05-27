// Copyright (c) Meta Platforms, Inc. and affiliates.
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSAvatarGroup} from './XDSAvatarGroup';
import {XDSAvatarGroupOverflow} from './XDSAvatarGroupOverflow';
import {XDSAvatar} from '../Avatar';

describe('XDSAvatarGroup', () => {
  it('renders all avatar children', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatar name="Bob" />
        <XDSAvatar name="Charlie" />
      </XDSAvatarGroup>,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
  });

  it('renders with role="group" and default aria-label', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
      </XDSAvatarGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Avatars');
  });

  it('accepts a custom aria-label', () => {
    render(
      <XDSAvatarGroup aria-label="Team members">
        <XDSAvatar name="Alice" />
      </XDSAvatarGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Team members',
    );
  });

  it('applies data-testid', () => {
    render(
      <XDSAvatarGroup data-testid="avatar-group">
        <XDSAvatar name="Alice" />
      </XDSAvatarGroup>,
    );

    expect(screen.getByTestId('avatar-group')).toBeInTheDocument();
  });

  it('applies size class to the group', () => {
    render(
      <XDSAvatarGroup size="medium">
        <XDSAvatar name="Alice" />
      </XDSAvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group.className).toContain('xds-avatar-group');
    expect(group.className).toContain('medium');
  });

  it('renders empty group when no children', () => {
    render(<XDSAvatarGroup data-testid="empty">{[]}</XDSAvatarGroup>);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('XDSAvatarGroupOverflow', () => {
  it('renders overflow count as span by default', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={5} />
      </XDSAvatarGroup>,
    );

    const overflow = screen.getByLabelText('5 more');
    expect(overflow.tagName).toBe('SPAN');
    expect(overflow).toHaveTextContent('+5');
  });

  it('renders as button when onClick is provided', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={3} onClick={() => {}} />
      </XDSAvatarGroup>,
    );

    const overflow = screen.getByLabelText('3 more');
    expect(overflow.tagName).toBe('BUTTON');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={3} onClick={handleClick} />
      </XDSAvatarGroup>,
    );

    await user.click(screen.getByLabelText('3 more'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders custom children instead of default label', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={5}>
          <span data-testid="custom">more</span>
        </XDSAvatarGroupOverflow>
      </XDSAvatarGroup>,
    );

    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('works with sliced avatar list and server-side count', () => {
    const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const serverTotal = 47;
    const visibleCount = 3;

    render(
      <XDSAvatarGroup size="medium">
        {users.slice(0, visibleCount).map(name => (
          <XDSAvatar key={name} name={name} />
        ))}
        <XDSAvatarGroupOverflow count={serverTotal - visibleCount} />
      </XDSAvatarGroup>,
    );

    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
    expect(screen.getByLabelText('44 more')).toBeInTheDocument();
    expect(screen.getByText('+44')).toBeInTheDocument();
  });
});

describe('XDSAvatarGroupOverflow — hardening', () => {
  it('forwards ref to the span element', () => {
    const ref = {current: null} as React.RefObject<HTMLElement | null>;

    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={3} ref={ref} />
      </XDSAvatarGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards ref to the button element when onClick provided', () => {
    const ref = {current: null} as React.RefObject<HTMLElement | null>;

    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={3} onClick={() => {}} ref={ref} />
      </XDSAvatarGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies className prop', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={3} className="custom-class" />
      </XDSAvatarGroup>,
    );

    const overflow = screen.getByLabelText('3 more');
    expect(overflow.className).toContain('custom-class');
  });

  it('handles count of zero gracefully', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={0} />
      </XDSAvatarGroup>,
    );

    expect(screen.getByText('+0')).toBeInTheDocument();
    expect(screen.getByLabelText('0 more')).toBeInTheDocument();
  });

  it('handles very large count', () => {
    render(
      <XDSAvatarGroup>
        <XDSAvatar name="Alice" />
        <XDSAvatarGroupOverflow count={999} />
      </XDSAvatarGroup>,
    );

    expect(screen.getByText('+999')).toBeInTheDocument();
  });
});
