// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Thumbnail} from './Thumbnail';

describe('Thumbnail', () => {
  it('renders an image when src is provided', () => {
    render(<Thumbnail src="/photo.jpg" alt="Test photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Test photo');
  });

  it('renders placeholder when no src is provided', () => {
    render(<Thumbnail data-testid="thumb" />);
    const root = screen.getByTestId('thumb');
    expect(root.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows skeleton when isLoading with no src', () => {
    const {container} = render(<Thumbnail isLoading data-testid="thumb" />);
    expect(container.querySelector('.astryx-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows image with upload overlay when isLoading with src', () => {
    render(
      <Thumbnail
        src="/local.jpg"
        alt="Uploading"
        isLoading
        data-testid="thumb"
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/local.jpg');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('exposes the label as an accessible name via a valid group role', () => {
    render(<Thumbnail label="photo.png" data-testid="thumb" />);
    // The accessible name must be carried by a valid named role (group),
    // not by a bare aria-label on a generic div (aria-prohibited-attr).
    const group = screen.getByRole('group', {name: 'photo.png'});
    expect(group).toBe(screen.getByTestId('thumb'));
  });

  it('does not put aria-label on a generic (roleless) element', () => {
    render(<Thumbnail label="photo.png" data-testid="thumb" />);
    const thumb = screen.getByTestId('thumb');
    // The labeled element must declare a role so the name is legitimate.
    expect(thumb).toHaveAttribute('role', 'group');
  });

  it('keeps interactive children accessible while exposing the group name', () => {
    const onRemove = vi.fn();
    render(
      <Thumbnail
        src="/img.jpg"
        alt="Clickable"
        label="file.png"
        onClick={vi.fn()}
        onRemove={onRemove}
      />,
    );
    // A group role (unlike img) must not hide descendant controls.
    expect(
      screen.getByRole('group', {name: 'file.png — Clickable'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Open file.png — Clickable'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Remove file.png — Clickable'}),
    ).toBeInTheDocument();
  });

  it('label is shown via tooltip, not as inline text', () => {
    render(<Thumbnail label="photo.png" data-testid="thumb" />);
    // Label should exist in DOM (tooltip) but not as a direct child text node
    const thumb = screen.getByTestId('thumb');
    expect(thumb.textContent).not.toContain('photo.png');
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Thumbnail label="file.png" onRemove={onRemove} />);
    const removeBtn = screen.getByRole('button', {name: 'Remove file.png'});
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('calls onClick when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Thumbnail src="/img.jpg" alt="Clickable" onClick={onClick} />);
    const btn = screen.getByRole('button', {name: 'Open Clickable'});
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render remove button when disabled', () => {
    const onRemove = vi.fn();
    render(<Thumbnail label="file.png" onRemove={onRemove} isDisabled />);
    expect(screen.queryByRole('button', {name: /Remove/})).toBeNull();
  });

  it('does not render onClick button when disabled', () => {
    const onClick = vi.fn();
    render(
      <Thumbnail src="/img.jpg" alt="Test" onClick={onClick} isDisabled />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is not interactive when isLoading', () => {
    const onClick = vi.fn();
    render(<Thumbnail src="/img.jpg" alt="Test" onClick={onClick} isLoading />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(<Thumbnail ref={ref} data-testid="thumb" />);
    expect(ref).toHaveBeenCalled();
  });

  describe('showRemoveOn', () => {
    // The reveal style lives on the slot <div> that wraps the remove button
    // (ancestor-marker styles can't ride on a child component's xstyle prop),
    // so assert on the button's parent element.
    const removeSlotClass = (
      showRemoveOn?: 'always' | 'hover',
    ): {className: string; unmount: () => void} => {
      const view = render(
        <Thumbnail
          label="file.png"
          onRemove={vi.fn()}
          showRemoveOn={showRemoveOn}
        />,
      );
      const slot = screen.getByRole('button', {
        name: 'Remove file.png',
      }).parentElement!;
      return {className: slot.className, unmount: view.unmount};
    };

    it('renders the remove button in the DOM even when showRemoveOn="hover"', () => {
      // Hover reveal is CSS-only (opacity) — the button must stay mounted so
      // it remains reachable by keyboard and assistive tech.
      render(
        <Thumbnail label="file.png" onRemove={vi.fn()} showRemoveOn="hover" />,
      );
      expect(
        screen.getByRole('button', {name: 'Remove file.png'}),
      ).toBeInTheDocument();
    });

    it('applies a distinct slot class when showRemoveOn="hover" vs "always"', () => {
      const always = removeSlotClass('always');
      always.unmount();
      const hover = removeSlotClass('hover');
      expect(hover.className).not.toBe(always.className);
    });

    it('defaults to "always" (same slot class as an explicit always)', () => {
      const def = removeSlotClass(undefined);
      def.unmount();
      const always = removeSlotClass('always');
      expect(def.className).toBe(always.className);
    });

    it('still fires onRemove when revealed on hover', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Thumbnail label="file.png" onRemove={onRemove} showRemoveOn="hover" />,
      );
      await user.click(screen.getByRole('button', {name: 'Remove file.png'}));
      expect(onRemove).toHaveBeenCalledOnce();
    });
  });
});
