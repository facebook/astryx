// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogHeader.test.tsx
 * @input Uses vitest, @testing-library/react, DialogHeader component
 * @output Unit tests for DialogHeader component behavior
 * @position Testing; validates DialogHeader.tsx implementation
 *
 * SYNC: When DialogHeader.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DialogHeader} from './DialogHeader';
import {LayoutDividerContext} from '../Layout/LayoutDividerContext';

describe('DialogHeader', () => {
  it('renders the title', () => {
    render(<DialogHeader title="My Dialog Title" />);
    expect(
      screen.getByRole('heading', {level: 2, name: 'My Dialog Title'}),
    ).toBeInTheDocument();
  });

  it('renders the title as an h2 element', () => {
    render(<DialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading.tagName).toBe('H2');
  });

  it('title has tabIndex=-1 for programmatic focus', () => {
    render(<DialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('auto-focuses the title when mounted', () => {
    render(<DialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(document.activeElement).toBe(heading);
  });

  it('renders subtitle when provided', () => {
    render(<DialogHeader title="Title" subtitle="This is a subtitle" />);
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<DialogHeader title="Title" />);
    expect(screen.queryByText('This is a subtitle')).not.toBeInTheDocument();
  });

  it('renders close button when onOpenChange is provided', () => {
    render(<DialogHeader title="Title" onOpenChange={() => {}} />);
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('does not render close button when onOpenChange is not provided', () => {
    render(<DialogHeader title="Title" />);
    expect(
      screen.queryByRole('button', {name: /close/i}),
    ).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleHide = vi.fn();
    render(<DialogHeader title="Title" onOpenChange={handleHide} />);

    await user.click(screen.getByRole('button', {name: /close/i}));
    expect(handleHide).toHaveBeenCalledTimes(1);
  });

  it('renders without divider by default (no context)', () => {
    // Without context, hasDivider defaults to false — same classes as explicit hasDivider={false}
    const {container: noCtx} = render(<DialogHeader title="No ctx" />);
    const {container: explicitFalse} = render(
      <DialogHeader title="Explicit false" hasDivider={false} />,
    );
    const noCtxHeader = noCtx.firstChild as HTMLElement;
    const explicitFalseHeader = explicitFalse.firstChild as HTMLElement;
    expect(noCtxHeader.className).toBe(explicitFalseHeader.className);
  });

  it('renders with divider when context defaultHasDividers is true', () => {
    // With context true and no explicit prop, should match explicit hasDivider={true}
    const {container: ctxTrue} = render(
      <LayoutDividerContext value={{defaultHasDividers: true}}>
        <DialogHeader title="Ctx true" />
      </LayoutDividerContext>,
    );
    const {container: explicitTrue} = render(
      <DialogHeader title="Explicit true" hasDivider={true} />,
    );
    const ctxHeader = ctxTrue.firstChild as HTMLElement;
    const explicitHeader = explicitTrue.firstChild as HTMLElement;
    expect(ctxHeader.className).toBe(explicitHeader.className);
  });

  it('explicit hasDivider={false} overrides context defaultHasDividers=true', () => {
    const {container: overridden} = render(
      <LayoutDividerContext value={{defaultHasDividers: true}}>
        <DialogHeader title="Overridden" hasDivider={false} />
      </LayoutDividerContext>,
    );
    const {container: noDivider} = render(
      <DialogHeader title="No divider" hasDivider={false} />,
    );
    const overriddenHeader = overridden.firstChild as HTMLElement;
    const noDividerHeader = noDivider.firstChild as HTMLElement;
    expect(overriddenHeader.className).toBe(noDividerHeader.className);
  });

  it('explicit hasDivider={true} shows divider without context', () => {
    // Explicit true should differ from default (no context = false)
    const {container: withDiv} = render(
      <DialogHeader title="With div" hasDivider={true} />,
    );
    const {container: withoutDiv} = render(
      <DialogHeader title="Without div" hasDivider={false} />,
    );
    const withDivHeader = withDiv.firstChild as HTMLElement;
    const withoutDivHeader = withoutDiv.firstChild as HTMLElement;
    expect(withDivHeader.className).not.toBe(withoutDivHeader.className);
  });

  it('renders additional endContent', () => {
    render(
      <DialogHeader
        title="Title"
        endContent={<button type="button">Custom Action</button>}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Custom Action'}),
    ).toBeInTheDocument();
  });

  it('renders endContent alongside close button', () => {
    render(
      <DialogHeader
        title="Title"
        onOpenChange={() => {}}
        endContent={<button type="button">Custom Action</button>}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Custom Action'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('renders startContent before the title', () => {
    render(
      <DialogHeader
        title="Title"
        startContent={<button type="button">Back</button>}
      />,
    );
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();
  });

  it('renders startContent and endContent together', () => {
    render(
      <DialogHeader
        title="Title"
        startContent={<button type="button">Back</button>}
        endContent={<button type="button">Save</button>}
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });
});
