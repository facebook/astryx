// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Lightbox} from './Lightbox';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

// Mock showModal/close for jsdom
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

// useAnnounce mounts singleton live regions on <body>; reset between tests so
// stale announcements from one test don't leak into the next.
afterEach(() => {
  __resetLiveRegionsForTest();
});

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

describe('Lightbox', () => {
  it('renders as a dialog element', () => {
    render(
      <Lightbox
        isOpen={false}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('calls showModal when isOpen becomes true', () => {
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('renders the image with correct src and alt', () => {
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'A beautiful photo'}}
      />,
    );
    const img = screen.getByAltText('A beautiful photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('renders caption when provided', () => {
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={() => {}}
        media={{
          src: '/photo.jpg',
          alt: 'Photo',
          caption: 'Sunset over the ocean',
        }}
      />,
    );
    expect(screen.getByText('Sunset over the ocean')).toBeInTheDocument();
  });

  it('does not render caption when not provided', () => {
    const {container} = render(
      <Lightbox
        isOpen={true}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    expect(container.querySelectorAll('[class*="caption"]').length).toBe(0);
  });

  it('calls onOpenChange(false) when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={onOpenChange}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on Escape via cancel event', () => {
    const onOpenChange = vi.fn();
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={onOpenChange}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    const dialog = document.querySelector('dialog')!;
    const cancelEvent = new Event('cancel', {cancelable: true});
    dialog.dispatchEvent(cancelEvent);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sets aria-label on the dialog', () => {
    render(
      <Lightbox
        isOpen={true}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'Beach sunset'}}
      />,
    );
    const dialog = document.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Beach sunset');
  });

  it('forwards ref to dialog element', () => {
    const ref = {current: null as HTMLDialogElement | null};
    render(
      <Lightbox
        ref={ref}
        isOpen={false}
        onOpenChange={() => {}}
        media={{src: '/photo.jpg', alt: 'Photo'}}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });

  describe('gallery mode', () => {
    const media = [
      {src: '/a.jpg', alt: 'Image A', caption: 'First'},
      {src: '/b.jpg', alt: 'Image B', caption: 'Second'},
      {src: '/c.jpg', alt: 'Image C'},
    ];

    it('renders the image at the given index', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={1}
        />,
      );
      expect(screen.getByAltText('Image B')).toBeInTheDocument();
    });

    it('shows gallery counter', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={0}
        />,
      );
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('shows prev/next buttons for middle item', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={1}
        />,
      );
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
    });

    it('keeps prev mounted and disabled on first item', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={0}
        />,
      );
      // The Prev button stays mounted at the range boundary (disabled) rather
      // than unmounting, so navigating to the first item never removes the
      // focused control and drops focus to <body>.
      const prev = screen.getByLabelText('Previous');
      expect(prev).toBeInTheDocument();
      expect(prev).toBeDisabled();
      expect(screen.getByLabelText('Next')).not.toBeDisabled();
    });

    it('keeps next mounted and disabled on last item', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={2}
        />,
      );
      const next = screen.getByLabelText('Next');
      expect(next).toBeInTheDocument();
      expect(next).toBeDisabled();
      expect(screen.getByLabelText('Previous')).not.toBeDisabled();
    });

    it('does not drop focus to <body> when navigating to the last item', () => {
      const {rerender} = render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={1}
        />,
      );
      // Simulate arriving at the final item (Next becomes disabled).
      rerender(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={2}
        />,
      );
      // Both nav buttons remain in the DOM; the dialog stays available so
      // keyboard gallery navigation isn't dead-ended.
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
      const dialog = document.querySelector('dialog');
      expect(dialog).toBeInTheDocument();
      // Arrow handling is on the dialog, so navigation still works at the edge.
      const onIndexChange = vi.fn();
      rerender(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={2}
          onIndexChange={onIndexChange}
        />,
      );
      if (dialog instanceof HTMLElement) {
        fireEvent.keyDown(dialog, {key: 'ArrowLeft'});
      }
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it('calls onIndexChange when next is clicked', () => {
      const onIndexChange = vi.fn();
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={0}
          onIndexChange={onIndexChange}
        />,
      );
      fireEvent.click(screen.getByLabelText('Next'));
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it('calls onIndexChange when prev is clicked', () => {
      const onIndexChange = vi.fn();
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={2}
          onIndexChange={onIndexChange}
        />,
      );
      fireEvent.click(screen.getByLabelText('Previous'));
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it('navigates via arrow keys', () => {
      const onIndexChange = vi.fn();
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={1}
          onIndexChange={onIndexChange}
        />,
      );
      const dialog = document.querySelector('dialog')!;
      fireEvent.keyDown(dialog, {key: 'ArrowRight'});
      expect(onIndexChange).toHaveBeenCalledWith(2);
      fireEvent.keyDown(dialog, {key: 'ArrowLeft'});
      expect(onIndexChange).toHaveBeenCalledWith(0);
    });
  });

  describe('screen-reader announcements', () => {
    const media = [
      {src: '/a.jpg', alt: 'Image A', caption: 'First'},
      {src: '/b.jpg', alt: 'Image B', caption: 'Second'},
      {src: '/c.jpg', alt: 'Image C'},
    ];

    it('announces the new image and position when navigating next via button', async () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          defaultIndex={0}
        />,
      );
      fireEvent.click(screen.getByLabelText('Next'));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Image B, 2 of 3');
      });
    });

    it('announces the new image and position when navigating via arrow keys', async () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          defaultIndex={1}
        />,
      );
      const dialog = document.querySelector('dialog')!;
      fireEvent.keyDown(dialog, {key: 'ArrowRight'});
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Image C, 3 of 3');
      });
    });

    it('announces the new image and position when navigating prev', async () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          defaultIndex={2}
        />,
      );
      fireEvent.click(screen.getByLabelText('Previous'));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Image B, 2 of 3');
      });
    });

    it('falls back to a positional label when the image has no alt', async () => {
      const unlabeled = [
        {src: '/a.jpg', alt: 'Image A'},
        {src: '/b.jpg', alt: ''},
      ];
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={unlabeled}
          defaultIndex={0}
        />,
      );
      fireEvent.click(screen.getByLabelText('Next'));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Image 2 of 2');
      });
    });

    it('does not announce on initial open', async () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          defaultIndex={1}
        />,
      );
      // Allow any scheduled rAF to flush; nothing should have been announced.
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
      // The dialog's aria-label already names the current image on open, so no
      // live region is created (announce is never called).
      expect(politeRegion()).toBeNull();
    });

    it('does not announce when the lightbox opens at a new index', async () => {
      const {rerender} = render(
        <Lightbox
          isOpen={false}
          onOpenChange={() => {}}
          media={media}
          index={0}
        />,
      );
      rerender(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={media}
          index={2}
        />,
      );
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
      expect(politeRegion()).toBeNull();
    });
  });

  describe('video support', () => {
    it('renders a video element when type is video', () => {
      const {container} = render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{src: '/clip.mp4', alt: 'A clip', type: 'video'}}
        />,
      );
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', '/clip.mp4');
      expect(video).toHaveAttribute('controls');
    });
  });

  describe('custom content', () => {
    it('renders arbitrary React content when type is custom', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{
            type: 'custom',
            label: 'Live preview',
            content: <div data-testid="custom-body">Hello preview</div>,
          }}
        />,
      );
      expect(screen.getByTestId('custom-body')).toBeInTheDocument();
      expect(screen.getByText('Hello preview')).toBeInTheDocument();
    });

    it('does not render an img or video for a custom item', () => {
      const {container} = render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{
            type: 'custom',
            label: 'Live preview',
            content: <div>Body</div>,
          }}
        />,
      );
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('video')).toBeNull();
    });

    it('uses the custom item label as the dialog aria-label', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{
            type: 'custom',
            label: 'Dashboard template preview',
            content: <div>Body</div>,
          }}
        />,
      );
      expect(document.querySelector('dialog')).toHaveAttribute(
        'aria-label',
        'Dashboard template preview',
      );
    });

    it('renders a ReactNode caption/footer for a custom item', () => {
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{
            type: 'custom',
            label: 'Preview',
            content: <div>Body</div>,
            caption: (
              <button type="button" data-testid="footer-action">
                Copy command
              </button>
            ),
          }}
        />,
      );
      expect(screen.getByTestId('footer-action')).toBeInTheDocument();
    });

    it('keeps interactive controls inside custom content interactive', () => {
      const onClick = vi.fn();
      render(
        <Lightbox
          isOpen={true}
          onOpenChange={() => {}}
          media={{
            type: 'custom',
            label: 'Preview',
            content: (
              <button type="button" data-testid="inner" onClick={onClick}>
                Action
              </button>
            ),
          }}
        />,
      );
      fireEvent.click(screen.getByTestId('inner'));
      expect(onClick).toHaveBeenCalled();
    });

    describe('zoom-pan gating', () => {
      it('does not activate zoom for a custom item even when hasZoom is set', () => {
        const {container} = render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            hasZoom
            media={{
              type: 'custom',
              label: 'Preview',
              content: <div data-testid="custom-body">Body</div>,
            }}
          />,
        );
        // A custom item has no image surface, so there is nothing to zoom/pan
        // and no zoomable affordance is rendered.
        expect(container.querySelector('img')).toBeNull();
        expect(
          container.querySelectorAll('[class*="imageWrapperZoomable"]').length,
        ).toBe(0);
        expect(screen.getByTestId('custom-body')).toBeInTheDocument();
      });

      it('still activates the zoom affordance for an image when hasZoom is set', () => {
        const {container} = render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            hasZoom
            media={{src: '/photo.jpg', alt: 'Photo'}}
          />,
        );
        expect(
          container.querySelectorAll('[class*="imageWrapperZoomable"]').length,
        ).toBeGreaterThan(0);
      });
    });

    describe('mixed media + custom galleries', () => {
      const mixed = [
        {src: '/a.jpg', alt: 'Image A'},
        {
          type: 'custom' as const,
          label: 'Live preview',
          content: <div data-testid="preview">Preview body</div>,
        },
        {src: '/c.mp4', alt: 'Clip C', type: 'video' as const},
      ];

      it('renders the media item at a media index', () => {
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={0}
          />,
        );
        expect(screen.getByAltText('Image A')).toBeInTheDocument();
        expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
      });

      it('renders the custom item at a custom index', () => {
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={1}
          />,
        );
        expect(screen.getByTestId('preview')).toBeInTheDocument();
        expect(screen.queryByAltText('Image A')).not.toBeInTheDocument();
      });

      it('renders the video item at a video index', () => {
        const {container} = render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={2}
          />,
        );
        expect(container.querySelector('video')).toHaveAttribute(
          'src',
          '/c.mp4',
        );
      });

      it('shows the gallery counter and nav across mixed kinds', () => {
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={1}
          />,
        );
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
        expect(screen.getByLabelText('Previous')).not.toBeDisabled();
        expect(screen.getByLabelText('Next')).not.toBeDisabled();
      });

      it('navigates across kinds via arrow keys (controlled index)', () => {
        const onIndexChange = vi.fn();
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={0}
            onIndexChange={onIndexChange}
          />,
        );
        const dialog = document.querySelector('dialog')!;
        fireEvent.keyDown(dialog, {key: 'ArrowRight'});
        expect(onIndexChange).toHaveBeenCalledWith(1);
      });

      it('navigates across kinds via the next button', () => {
        const onIndexChange = vi.fn();
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            index={1}
            onIndexChange={onIndexChange}
          />,
        );
        fireEvent.click(screen.getByLabelText('Next'));
        expect(onIndexChange).toHaveBeenCalledWith(2);
      });
    });

    describe('announcements', () => {
      const mixed = [
        {src: '/a.jpg', alt: 'Image A'},
        {
          type: 'custom' as const,
          label: 'Live preview',
          content: <div>Body</div>,
        },
      ];

      it('announces a custom item by its label on navigation', async () => {
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            defaultIndex={0}
          />,
        );
        fireEvent.click(screen.getByLabelText('Next'));
        await waitFor(() => {
          expect(politeRegion()).toHaveTextContent('Live preview, 2 of 2');
        });
      });

      it('announces a media item by its alt when navigating back from a custom item', async () => {
        render(
          <Lightbox
            isOpen={true}
            onOpenChange={() => {}}
            media={mixed}
            defaultIndex={1}
          />,
        );
        fireEvent.click(screen.getByLabelText('Previous'));
        await waitFor(() => {
          expect(politeRegion()).toHaveTextContent('Image A, 1 of 2');
        });
      });
    });
  });

  it('does not crash with an empty media array', () => {
    const {container} = render(
      <Lightbox isOpen={true} onOpenChange={() => {}} media={[]} />,
    );
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
  });
});
