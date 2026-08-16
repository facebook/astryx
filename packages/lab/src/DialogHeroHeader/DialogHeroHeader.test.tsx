// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogHeroHeader.test.tsx
 * @input Uses vitest, @testing-library/react, DialogHeroHeader, core Dialog
 * @output Unit tests for DialogHeroHeader component behavior
 * @position Lab testing; validates DialogHeroHeader.tsx implementation
 *
 * SYNC: When DialogHeroHeader.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Heading} from '@astryxdesign/core/Heading';
import {LayoutDividerContext} from '@astryxdesign/core/Layout';
import {DialogHeroHeader} from './DialogHeroHeader';

// Mock dialog methods since they're not fully implemented in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

describe('DialogHeroHeader', () => {
  it('renders a string title as an h2 heading', () => {
    render(
      <DialogHeroHeader title="Welcome aboard" media={<div>media</div>} />,
    );
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Welcome aboard',
    });
    expect(heading.tagName).toBe('H2');
  });

  it('renders a caller-provided Heading element as-is', () => {
    render(
      <DialogHeroHeader
        title={<Heading level={3}>Custom heading</Heading>}
        media={<div>media</div>}
      />,
    );
    expect(
      screen.getByRole('heading', {level: 3, name: 'Custom heading'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument();
  });

  it('renders the media slot', () => {
    render(
      <DialogHeroHeader
        title="Title"
        media={<img alt="Illustration" src="hero.png" />}
      />,
    );
    expect(screen.getByRole('img', {name: 'Illustration'})).toBeInTheDocument();
  });

  it('renders startContent before the title', () => {
    render(
      <DialogHeroHeader
        title="Title"
        media={<div>media</div>}
        startContent={<span>start</span>}
      />,
    );
    expect(screen.getByText('start')).toBeInTheDocument();
  });

  it('auto-focuses the title row when mounted', () => {
    render(<DialogHeroHeader title="Title" media={<div>media</div>} />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(document.activeElement).toBe(heading.parentElement);
    expect(document.activeElement).toHaveAttribute('tabindex', '-1');
  });

  describe('close button', () => {
    it('renders when onOpenChange is provided', () => {
      render(
        <DialogHeroHeader
          title="Title"
          media={<div>media</div>}
          onOpenChange={() => {}}
        />,
      );
      expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
    });

    it('does not render when onOpenChange is not provided', () => {
      render(<DialogHeroHeader title="Title" media={<div>media</div>} />);
      expect(
        screen.queryByRole('button', {name: /close/i}),
      ).not.toBeInTheDocument();
    });

    it('calls onOpenChange(false) when clicked', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <DialogHeroHeader
          title="Title"
          media={<div>media</div>}
          onOpenChange={handleOpenChange}
        />,
      );
      await user.click(screen.getByRole('button', {name: /close/i}));
      expect(handleOpenChange).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('mediaMode', () => {
    it('wraps the close button in a MediaTheme surface', () => {
      const {container} = render(
        <DialogHeroHeader
          title="Title"
          media={<div>media</div>}
          mediaMode="dark"
          onOpenChange={() => {}}
        />,
      );
      const surface = container.querySelector('[data-astryx-media="dark"]');
      expect(surface).not.toBeNull();
      expect(surface).toContainElement(
        screen.getByRole('button', {name: /close/i}),
      );
    });

    it('applies no MediaTheme surface when omitted', () => {
      const {container} = render(
        <DialogHeroHeader
          title="Title"
          media={<div>media</div>}
          onOpenChange={() => {}}
        />,
      );
      expect(container.querySelector('[data-astryx-media]')).toBeNull();
    });
  });

  describe('isTitleHidden', () => {
    it('keeps the title in the accessibility tree', () => {
      render(
        <DialogHeroHeader
          title="Title"
          media={<div>media</div>}
          isTitleHidden
        />,
      );
      expect(
        screen.getByRole('heading', {level: 2, name: 'Title'}),
      ).toBeInTheDocument();
    });

    it('changes the title row presentation', () => {
      const {container: hidden} = render(
        <DialogHeroHeader
          title="Same title"
          media={<div>media</div>}
          isTitleHidden
        />,
      );
      const {container: visible} = render(
        <DialogHeroHeader title="Same title" media={<div>media</div>} />,
      );
      const hiddenRow = hidden.querySelector('h2')?.parentElement;
      const visibleRow = visible.querySelector('h2')?.parentElement;
      // The hidden variant nests the row inside a VisuallyHidden container.
      expect(hiddenRow?.parentElement?.className).not.toBe(
        visibleRow?.parentElement?.className,
      );
    });
  });

  describe('inside Dialog', () => {
    it('names the open dialog via aria-labelledby', () => {
      render(
        <Dialog isOpen onOpenChange={() => {}}>
          <DialogHeroHeader title="Welcome aboard" media={<div>media</div>} />
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent(
        'Welcome aboard',
      );
    });

    it('still names the dialog when the title is hidden', () => {
      render(
        <Dialog isOpen onOpenChange={() => {}}>
          <DialogHeroHeader
            title="Hidden name"
            media={<div>media</div>}
            isTitleHidden
          />
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent(
        'Hidden name',
      );
    });

    it('does not auto-focus the title in inline dialogs', () => {
      render(
        <Dialog isOpen isInline onOpenChange={() => {}}>
          <DialogHeroHeader title="Inline title" media={<div>media</div>} />
        </Dialog>,
      );
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('divider', () => {
    it('renders without divider by default (no context)', () => {
      const {container: noCtx} = render(
        <DialogHeroHeader title="No ctx" media={<div>media</div>} />,
      );
      const {container: explicitFalse} = render(
        <DialogHeroHeader
          title="Explicit false"
          media={<div>media</div>}
          hasDivider={false}
        />,
      );
      expect((noCtx.firstChild as HTMLElement).className).toBe(
        (explicitFalse.firstChild as HTMLElement).className,
      );
    });

    it('inherits divider from Layout context and allows explicit override', () => {
      const {container: ctxTrue} = render(
        <LayoutDividerContext value={{defaultHasDividers: true}}>
          <DialogHeroHeader title="Ctx true" media={<div>media</div>} />
        </LayoutDividerContext>,
      );
      const {container: explicitTrue} = render(
        <DialogHeroHeader
          title="Explicit true"
          media={<div>media</div>}
          hasDivider
        />,
      );
      const {container: overridden} = render(
        <LayoutDividerContext value={{defaultHasDividers: true}}>
          <DialogHeroHeader
            title="Overridden"
            media={<div>media</div>}
            hasDivider={false}
          />
        </LayoutDividerContext>,
      );
      const ctxClass = (ctxTrue.firstChild as HTMLElement).className;
      const explicitClass = (explicitTrue.firstChild as HTMLElement).className;
      const overriddenClass = (overridden.firstChild as HTMLElement).className;
      expect(ctxClass).toBe(explicitClass);
      expect(overriddenClass).not.toBe(ctxClass);
    });
  });

  it('forwards ref, data-testid, and className to the root element', () => {
    const ref = vi.fn();
    render(
      <DialogHeroHeader
        ref={ref}
        title="Title"
        media={<div>media</div>}
        data-testid="hero-header"
        className="custom-class"
      />,
    );
    const root = screen.getByTestId('hero-header');
    expect(root.className).toContain('custom-class');
    expect(ref).toHaveBeenCalledWith(root);
  });
});
