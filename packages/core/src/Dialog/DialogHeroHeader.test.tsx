// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogHeroHeader.test.tsx
 * @input Uses vitest, @testing-library/react, DialogHeroHeader component
 * @output Unit tests for DialogHeroHeader component behavior
 * @position Testing; validates DialogHeroHeader.tsx implementation
 *
 * SYNC: When DialogHeroHeader.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DialogHeroHeader} from './DialogHeroHeader';
import {LayoutDividerContext} from '../Layout/LayoutDividerContext';

describe('DialogHeroHeader', () => {
  it('renders the title', () => {
    render(<DialogHeroHeader title="Welcome aboard" />);
    expect(
      screen.getByRole('heading', {level: 2, name: 'Welcome aboard'}),
    ).toBeInTheDocument();
  });

  it('renders the title as an h2 element (display sizing preserves the element)', () => {
    render(<DialogHeroHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading.tagName).toBe('H2');
  });

  it('title has tabIndex=-1 for programmatic focus', () => {
    render(<DialogHeroHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('auto-focuses the title when mounted', () => {
    render(<DialogHeroHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(document.activeElement).toBe(heading);
  });

  it('renders subtitle when provided', () => {
    render(
      <DialogHeroHeader title="Title" subtitle="Supporting hero copy here" />,
    );
    expect(screen.getByText('Supporting hero copy here')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<DialogHeroHeader title="Title" />);
    expect(
      screen.queryByText('Supporting hero copy here'),
    ).not.toBeInTheDocument();
  });

  it('renders eyebrow when provided', () => {
    render(<DialogHeroHeader title="Title" eyebrow="Welcome" />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('does not render eyebrow when not provided', () => {
    render(<DialogHeroHeader title="Title" />);
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });

  it('renders the media slot when provided', () => {
    render(
      <DialogHeroHeader
        title="Title"
        media={<img alt="Celebration illustration" src="/hero.png" />}
      />,
    );
    expect(
      screen.getByRole('img', {name: 'Celebration illustration'}),
    ).toBeInTheDocument();
  });

  it('does not render a media slot when not provided', () => {
    render(<DialogHeroHeader title="Title" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders close button when onOpenChange is provided', () => {
    render(<DialogHeroHeader title="Title" onOpenChange={() => {}} />);
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('does not render close button when onOpenChange is not provided', () => {
    render(<DialogHeroHeader title="Title" />);
    expect(
      screen.queryByRole('button', {name: /close/i}),
    ).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleHide = vi.fn();
    render(<DialogHeroHeader title="Title" onOpenChange={handleHide} />);

    await user.click(screen.getByRole('button', {name: /close/i}));
    expect(handleHide).toHaveBeenCalledTimes(1);
    expect(handleHide).toHaveBeenCalledWith(false);
  });

  it('renders without divider by default (no context)', () => {
    // Without context, hasDivider defaults to false — same classes as explicit hasDivider={false}
    const {container: noCtx} = render(<DialogHeroHeader title="No ctx" />);
    const {container: explicitFalse} = render(
      <DialogHeroHeader title="Explicit false" hasDivider={false} />,
    );
    const noCtxHeader = noCtx.firstChild as HTMLElement;
    const explicitFalseHeader = explicitFalse.firstChild as HTMLElement;
    expect(noCtxHeader.className).toBe(explicitFalseHeader.className);
  });

  it('renders with divider when context defaultHasDividers is true', () => {
    const {container: ctxTrue} = render(
      <LayoutDividerContext value={{defaultHasDividers: true}}>
        <DialogHeroHeader title="Ctx true" />
      </LayoutDividerContext>,
    );
    const {container: explicitTrue} = render(
      <DialogHeroHeader title="Explicit true" hasDivider={true} />,
    );
    const ctxHeader = ctxTrue.firstChild as HTMLElement;
    const explicitHeader = explicitTrue.firstChild as HTMLElement;
    expect(ctxHeader.className).toBe(explicitHeader.className);
  });

  it('explicit hasDivider={false} overrides context defaultHasDividers=true', () => {
    const {container: overridden} = render(
      <LayoutDividerContext value={{defaultHasDividers: true}}>
        <DialogHeroHeader title="Overridden" hasDivider={false} />
      </LayoutDividerContext>,
    );
    const {container: noDivider} = render(
      <DialogHeroHeader title="No divider" hasDivider={false} />,
    );
    const overriddenHeader = overridden.firstChild as HTMLElement;
    const noDividerHeader = noDivider.firstChild as HTMLElement;
    expect(overriddenHeader.className).toBe(noDividerHeader.className);
  });

  it('renders media, eyebrow, title, subtitle, and close together', () => {
    render(
      <DialogHeroHeader
        media={<img alt="Hero" src="/hero.png" />}
        eyebrow="Welcome"
        title="You're all set up"
        subtitle="Invite your team to get started."
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByRole('img', {name: 'Hero'})).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: "You're all set up"}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Invite your team to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('start alignment produces different container classes than center', () => {
    const {container: centered} = render(
      <DialogHeroHeader title="Centered" align="center" />,
    );
    const {container: started} = render(
      <DialogHeroHeader title="Started" align="start" />,
    );
    // The inner content container is the first child of LayoutHeader's inner.
    const centeredInner = centered.querySelector('h2')?.parentElement;
    const startedInner = started.querySelector('h2')?.parentElement;
    expect(centeredInner?.className).not.toBe(startedInner?.className);
  });
});
