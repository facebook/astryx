// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerDismissalFamilies.test.tsx
 * @input Uses vitest, @testing-library/react, Dialog, Lightbox, MobileNav
 * @output Tests that every overlay family shares the one dismissal stack
 * @position Colocated with layerStack; the families' own behavior is tested in
 *   their own files, this one only asks who takes the press
 *
 * The stack routes an Escape press to the top-most REGISTERED layer and
 * preventDefault()s it, so a family that is not on the stack cannot be reached
 * once anything else is. Lightbox and MobileNav were that gap: both closed via
 * the native `cancel` event alone, and a `required` Dialog underneath swallowed
 * every press before it got there.
 *
 * SYNC: When a new overlay family joins the stack, add it here.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';

import {Dialog} from '../Dialog/Dialog';
import {Lightbox} from '../Lightbox/Lightbox';
import {MobileNav} from '../MobileNav/MobileNav';
import {resetLayerStackForTests} from './layerStack';

// jsdom does not implement showModal/close.
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

afterEach(() => {
  resetLayerStackForTests();
});

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
}

function fireCancel(dialog: Element): Event {
  const event = new Event('cancel', {bubbles: false, cancelable: true});
  dialog.dispatchEvent(event);
  return event;
}

const getDialog = (label: string) =>
  screen
    .getAllByRole('dialog', {hidden: true})
    .find(d => d.getAttribute('aria-label') === label)!;

const MEDIA = {src: '/photo.jpg', alt: 'A photo'};

describe('overlay families on the shared dismissal stack', () => {
  describe('Lightbox', () => {
    it('takes the Escape when it is open over a required Dialog', () => {
      const onLightboxChange = vi.fn();
      const onDialogChange = vi.fn();

      render(
        <Dialog
          isOpen={true}
          onOpenChange={onDialogChange}
          purpose="required"
          aria-label="Required">
          Choose one
          <Lightbox
            isOpen={true}
            onOpenChange={onLightboxChange}
            media={MEDIA}
          />
        </Dialog>,
      );

      const event = pressEscape();

      expect(onLightboxChange).toHaveBeenCalledWith(false);
      expect(onDialogChange).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('closes on a browser-initiated cancel when it is top-most', () => {
      const onOpenChange = vi.fn();
      render(
        <Lightbox isOpen={true} onOpenChange={onOpenChange} media={MEDIA} />,
      );

      const event = fireCancel(screen.getByRole('dialog', {hidden: true}));

      expect(event.defaultPrevented).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('stays open on a browser-initiated cancel when it is not top-most', () => {
      const onLightboxChange = vi.fn();

      render(
        <>
          <Lightbox
            isOpen={true}
            onOpenChange={onLightboxChange}
            media={MEDIA}
          />
          <Dialog isOpen={true} onOpenChange={() => {}} aria-label="Above">
            Above
          </Dialog>
        </>,
      );

      const event = fireCancel(getDialog('A photo'));

      expect(event.defaultPrevented).toBe(true);
      expect(onLightboxChange).not.toHaveBeenCalled();
    });
  });

  describe('MobileNav', () => {
    it('takes the Escape when it opens over a required Dialog', () => {
      const onNavChange = vi.fn();
      const onDialogChange = vi.fn();

      render(
        <>
          <Dialog
            isOpen={true}
            onOpenChange={onDialogChange}
            purpose="required"
            aria-label="Required">
            Choose one
          </Dialog>
          <MobileNav isOpen={true} onOpenChange={onNavChange} label="Drawer">
            <span>Nav content</span>
          </MobileNav>
        </>,
      );

      const event = pressEscape();

      expect(onNavChange).toHaveBeenCalledWith(false);
      expect(onDialogChange).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('closes on a browser-initiated cancel when it is top-most', () => {
      const onOpenChange = vi.fn();
      render(
        <MobileNav isOpen={true} onOpenChange={onOpenChange} label="Drawer">
          <span>Nav content</span>
        </MobileNav>,
      );

      const event = fireCancel(getDialog('Drawer'));

      expect(event.defaultPrevented).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('stays open on a browser-initiated cancel when it is not top-most', () => {
      const onNavChange = vi.fn();

      render(
        <MobileNav isOpen={true} onOpenChange={onNavChange} label="Drawer">
          <span>Nav content</span>
          <Dialog isOpen={true} onOpenChange={() => {}} aria-label="Above">
            Above
          </Dialog>
        </MobileNav>,
      );

      const event = fireCancel(getDialog('Drawer'));

      expect(event.defaultPrevented).toBe(true);
      expect(onNavChange).not.toHaveBeenCalled();
    });
  });

  describe('required Dialog', () => {
    it('still swallows an Escape when it is alone', () => {
      const onDialogChange = vi.fn();

      render(
        <Dialog
          isOpen={true}
          onOpenChange={onDialogChange}
          purpose="required"
          aria-label="Required">
          Choose one
        </Dialog>,
      );

      const event = pressEscape();

      expect(onDialogChange).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('still swallows an Escape with a Lightbox open UNDER it', () => {
      const onLightboxChange = vi.fn();
      const onDialogChange = vi.fn();

      render(
        <>
          <Lightbox
            isOpen={true}
            onOpenChange={onLightboxChange}
            media={MEDIA}
          />
          <Dialog
            isOpen={true}
            onOpenChange={onDialogChange}
            purpose="required"
            aria-label="Required">
            Choose one
          </Dialog>
        </>,
      );

      pressEscape();

      expect(onDialogChange).not.toHaveBeenCalled();
      expect(onLightboxChange).not.toHaveBeenCalled();
    });
  });
});
