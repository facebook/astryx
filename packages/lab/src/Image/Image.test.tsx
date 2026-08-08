// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createRef} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Image} from './Image';

const testStyles = stylex.create({
  probe: {
    marginTop: '7px',
  },
  // Mirror of the repo's ring-on-un-clipped-root pattern (Thumbnail,
  // ClickableCard) — identical declarations compile to identical atomic
  // classes, so the frame can be probed for them.
  focusRing: {
    outline: {
      default: null,
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
});

// Lightbox is built on <dialog>/showModal(), which jsdom doesn't implement.
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

const SRC = 'https://example.com/photo.jpg';
const FALLBACK_SRC = 'https://example.com/placeholder.jpg';

function getImg(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector('img');
  expect(img).not.toBeNull();
  return img as HTMLImageElement;
}

describe('Image', () => {
  describe('rendering', () => {
    it('renders an img with src and alt', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      const img = getImg(container);
      expect(img).toHaveAttribute('src', SRC);
      expect(img).toHaveAttribute('alt', 'A photo');
    });

    it('defaults to lazy loading', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      expect(getImg(container)).toHaveAttribute('loading', 'lazy');
    });

    it('passes loading="eager" through', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" loading="eager" />,
      );
      expect(getImg(container)).toHaveAttribute('loading', 'eager');
    });

    it('exposes the stable theming class on the root', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.classList.contains('astryx-image')).toBe(true);
    });

    it('forwards ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Image src={SRC} alt="A photo" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('astryx-image')).toBe(true);
    });

    it('passes data-testid and className through to the root', () => {
      render(
        <Image src={SRC} alt="A photo" data-testid="hero" className="custom" />,
      );
      const root = screen.getByTestId('hero');
      expect(root.classList.contains('custom')).toBe(true);
    });

    it('caps the frame width via maxWidth', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" maxWidth={240} />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('style')).toContain('240px');
    });

    it('honors maxWidth={0} and passes string values through unconverted', () => {
      const zero = render(<Image src={SRC} alt="A photo" maxWidth={0} />);
      expect(
        (zero.container.firstElementChild as HTMLElement).getAttribute('style'),
      ).toContain('0px');
      zero.unmount();

      const pct = render(<Image src={SRC} alt="A photo" maxWidth="50%" />);
      expect(
        (pct.container.firstElementChild as HTMLElement).getAttribute('style'),
      ).toContain('50%');
    });

    it('merges consumer style and className with the maxWidth inline var', () => {
      const {container} = render(
        <Image
          src={SRC}
          alt="A photo"
          maxWidth={240}
          className="custom"
          style={{outlineColor: 'red'}}
        />,
      );
      const root = container.firstElementChild as HTMLElement;
      const inline = root.getAttribute('style') ?? '';
      expect(inline).toContain('240px');
      expect(inline).toContain('outline-color');
      expect(root.classList.contains('custom')).toBe(true);
      expect(root.classList.contains('astryx-image')).toBe(true);
    });

    it('applies xstyle to the root element', () => {
      const probeRender = render(
        <div data-testid="xstyle-probe" {...stylex.props(testStyles.probe)} />,
      );
      const probeClasses = [
        ...probeRender.getByTestId('xstyle-probe').classList,
      ];
      expect(probeClasses.length).toBeGreaterThan(0);
      probeRender.unmount();

      const {container} = render(
        <Image src={SRC} alt="A photo" xstyle={testStyles.probe} />,
      );
      const root = container.firstElementChild as HTMLElement;
      for (const cls of probeClasses) {
        expect(root.classList.contains(cls)).toBe(true);
      }
    });
  });

  describe('aspect ratio and fit', () => {
    it('renders an AspectRatio box when ratio is set', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      expect(container.querySelector('.astryx-aspect-ratio')).not.toBeNull();
    });

    it('defaults fit to cover when ratio is set', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      expect(getImg(container)).toHaveAttribute('data-fit', 'cover');
    });

    it('applies fit="contain"', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={4 / 3} fit="contain" />,
      );
      expect(getImg(container)).toHaveAttribute('data-fit', 'contain');
    });

    it('renders no AspectRatio box and no fit without ratio', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      expect(container.querySelector('.astryx-aspect-ratio')).toBeNull();
      expect(getImg(container)).not.toHaveAttribute('data-fit');
    });
  });

  describe('radius', () => {
    it('defaults to radius="none"', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('data-radius', 'none');
    });

    it('reflects the radius role as a data attribute', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" radius="container" />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('data-radius', 'container');
    });
  });

  describe('loading state', () => {
    it('shows a skeleton and aria-busy inside a ratio box until the image loads', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.astryx-skeleton')).not.toBeNull();

      fireEvent.load(getImg(container));

      expect(root).not.toHaveAttribute('aria-busy');
      expect(container.querySelector('.astryx-skeleton')).toBeNull();
    });

    it('sets aria-busy without a skeleton when there is no ratio box', () => {
      const {container} = render(<Image src={SRC} alt="A photo" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.astryx-skeleton')).toBeNull();

      fireEvent.load(getImg(container));
      expect(root).not.toHaveAttribute('aria-busy');
    });

    it('settles for an already-cached image without a load event', async () => {
      // A cached image is `complete` before React attaches onLoad, so the
      // event never fires — the ref callback must settle the loading state.
      const completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      const widthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(800);
      try {
        const {container} = render(
          <Image src={SRC} alt="A photo" ratio={16 / 9} />,
        );
        await act(async () => {});
        const root = container.firstElementChild as HTMLElement;
        expect(root).not.toHaveAttribute('aria-busy');
        expect(container.querySelector('.astryx-skeleton')).toBeNull();
      } finally {
        completeSpy.mockRestore();
        widthSpy.mockRestore();
      }
    });

    it('settles a cached image into the error chain when it is broken', async () => {
      // complete=true with naturalWidth=0 is the browser's "completely
      // failed" cached state — onError may never fire (e.g. the failure
      // happened before hydration), so the ref check must route it into
      // the error chain instead of leaving aria-busy forever.
      const completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      const widthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(0);
      try {
        const {container} = render(
          <Image src={SRC} alt="A photo" ratio={16 / 9} />,
        );
        await act(async () => {});
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByRole('img', {name: 'A photo'})).toBeInTheDocument();
        expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
      } finally {
        completeSpy.mockRestore();
        widthSpy.mockRestore();
      }
    });

    it('settles a cached fallback image without a load event', async () => {
      const completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      const widthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(800);
      try {
        const {container} = render(
          <Image
            src={SRC}
            alt="A photo"
            ratio={16 / 9}
            fallbackSrc={FALLBACK_SRC}
          />,
        );
        fireEvent.error(getImg(container));
        await act(async () => {});
        expect(getImg(container)).toHaveAttribute('src', FALLBACK_SRC);
        expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
        expect(container.querySelector('.astryx-skeleton')).toBeNull();
      } finally {
        completeSpy.mockRestore();
        widthSpy.mockRestore();
      }
    });

    it('does not settle a swapped src from the previous image’s complete state', async () => {
      // Setting img.src restarts the request in a microtask; a synchronous
      // `complete` read at ref-attach time can still see the PREVIOUS
      // image's settled state. The check must be deferred past that
      // restart, so the swapped-in source keeps its loading state.
      const completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      const widthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(800);
      try {
        const {container, rerender} = render(
          <Image src={SRC} alt="A photo" ratio={16 / 9} />,
        );
        await act(async () => {});
        expect(container.firstElementChild).not.toHaveAttribute('aria-busy');

        rerender(
          <Image
            src="https://example.com/swapped.jpg"
            alt="A photo"
            ratio={16 / 9}
          />,
        );
        // By the time any deferred check runs, the request has restarted
        // and `complete` reports false for the new source.
        completeSpy.mockReturnValue(false);
        await act(async () => {});
        expect(container.firstElementChild).toHaveAttribute(
          'aria-busy',
          'true',
        );
        expect(container.querySelector('.astryx-skeleton')).not.toBeNull();
      } finally {
        completeSpy.mockRestore();
        widthSpy.mockRestore();
      }
    });

    it('stays in the loading state while fallbackSrc loads, then settles', () => {
      const {container} = render(
        <Image
          src={SRC}
          alt="A photo"
          ratio={16 / 9}
          fallbackSrc={FALLBACK_SRC}
        />,
      );
      const root = container.firstElementChild as HTMLElement;
      fireEvent.error(getImg(container));
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.astryx-skeleton')).not.toBeNull();

      fireEvent.load(getImg(container));
      expect(root).not.toHaveAttribute('aria-busy');
      expect(container.querySelector('.astryx-skeleton')).toBeNull();
    });

    it('re-enters loading when returning to a previously loaded source', () => {
      // An earlier load is no cache guarantee (no-store, eviction) — every
      // source change refetches, and the cached-settle ref check (not stale
      // state) is what ends the loading state instantly for cached images.
      const other = 'https://example.com/other.jpg';
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      fireEvent.load(getImg(container));
      rerender(<Image src={other} alt="A photo" ratio={16 / 9} />);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');

      rerender(<Image src={SRC} alt="A photo" ratio={16 / 9} />);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.astryx-skeleton')).not.toBeNull();

      fireEvent.load(getImg(container));
      expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
    });

    it('re-enters loading when falling back to a previously loaded URL', () => {
      // src A loads; later chain: src B with fallbackSrc=A; B fails → the
      // img refetches A. Stale "A loaded once" state must not suppress the
      // loading UI during that refetch.
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      fireEvent.load(getImg(container));
      rerender(
        <Image
          src="https://example.com/b.jpg"
          alt="A photo"
          ratio={16 / 9}
          fallbackSrc={SRC}
        />,
      );
      fireEvent.error(getImg(container));
      expect(getImg(container)).toHaveAttribute('src', SRC);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');

      fireEvent.load(getImg(container));
      expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
    });

    it('renders the skeleton without its own corner radius', () => {
      // Atomic-class probe: the frame owns the rounding (--_image-radius +
      // overflow clip), so the skeleton must not add its default radius-3
      // corners. Diff a default Skeleton against radius="none" to find the
      // radius-3 classes, then assert the Image skeleton carries none.
      const probe = render(
        <div>
          <Skeleton data-testid="probe-default" />
          <Skeleton data-testid="probe-none" radius="none" />
        </div>,
      );
      const defaultClasses = probe.getByTestId('probe-default').className;
      const noneClasses = new Set(
        probe.getByTestId('probe-none').className.split(' '),
      );
      const radiusClasses = defaultClasses
        .split(' ')
        .filter(cls => !noneClasses.has(cls));
      expect(radiusClasses.length).toBeGreaterThan(0);
      probe.unmount();

      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      const skeleton = container.querySelector('.astryx-skeleton');
      expect(skeleton).not.toBeNull();
      for (const cls of radiusClasses) {
        expect(skeleton?.classList.contains(cls)).toBe(false);
      }
    });

    it('returns to the loading state when src changes after a load', () => {
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      fireEvent.load(getImg(container));
      expect(container.querySelector('.astryx-skeleton')).toBeNull();

      rerender(
        <Image
          src="https://example.com/other.jpg"
          alt="A photo"
          ratio={16 / 9}
        />,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.astryx-skeleton')).not.toBeNull();
    });
  });

  describe('error fallback', () => {
    it('renders the default placeholder with role="img" when src fails', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} />,
      );
      fireEvent.error(getImg(container));

      expect(container.querySelector('img')).toBeNull();
      const placeholder = screen.getByRole('img', {name: 'A photo'});
      expect(placeholder).toBeInTheDocument();
      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toHaveAttribute('aria-busy');
    });

    it('swaps to fallbackSrc when src fails', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />,
      );
      fireEvent.error(getImg(container));
      expect(getImg(container)).toHaveAttribute('src', FALLBACK_SRC);
    });

    it('renders the placeholder when fallbackSrc also fails', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />,
      );
      fireEvent.error(getImg(container));
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByRole('img', {name: 'A photo'})).toBeInTheDocument();
    });

    it('renders a custom fallback node when all sources fail', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" fallback={<span>No image</span>} />,
      );
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('retries a changed src after an error', () => {
      const {container, rerender} = render(<Image src={SRC} alt="A photo" />);
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();

      rerender(<Image src="https://example.com/new.jpg" alt="A photo" />);
      expect(getImg(container)).toHaveAttribute(
        'src',
        'https://example.com/new.jpg',
      );
    });

    it('shows the placeholder, not a stuck skeleton, when fallbackSrc equals src', () => {
      // The same URL can never rescue itself, and re-rendering the <img>
      // with an unchanged src fires no new error event — without special
      // handling the chain wedges in a permanent loading state.
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} fallbackSrc={SRC} />,
      );
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByRole('img', {name: 'A photo'})).toBeInTheDocument();
      expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
    });

    it('ignores an empty-string fallbackSrc', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" fallbackSrc="" />,
      );
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByRole('img', {name: 'A photo'})).toBeInTheDocument();
    });

    it('retries a src that errored before, when the prop cycles back to it', () => {
      const other = 'https://example.com/other.jpg';
      const {container, rerender} = render(<Image src={SRC} alt="A photo" />);
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();

      rerender(<Image src={other} alt="A photo" />);
      // Cycling back to the originally-failed src must get a fresh attempt.
      rerender(<Image src={SRC} alt="A photo" />);
      expect(getImg(container)).toHaveAttribute('src', SRC);
    });

    it('retries fallbackSrc for a new src chain after both previously failed', () => {
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />,
      );
      fireEvent.error(getImg(container));
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();

      // A new src starts a new chain; if it fails, the fallback deserves a
      // fresh attempt too.
      rerender(
        <Image
          src="https://example.com/new.jpg"
          alt="A photo"
          fallbackSrc={FALLBACK_SRC}
        />,
      );
      fireEvent.error(getImg(container));
      expect(getImg(container)).toHaveAttribute('src', FALLBACK_SRC);
    });

    it('retries a changed fallbackSrc after both sources failed', () => {
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />,
      );
      fireEvent.error(getImg(container));
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();

      rerender(
        <Image
          src={SRC}
          alt="A photo"
          fallbackSrc="https://example.com/second.jpg"
        />,
      );
      expect(getImg(container)).toHaveAttribute(
        'src',
        'https://example.com/second.jpg',
      );
    });

    it('revives from the placeholder when fallbackSrc is added after failure', () => {
      const {container, rerender} = render(<Image src={SRC} alt="A photo" />);
      fireEvent.error(getImg(container));
      expect(container.querySelector('img')).toBeNull();

      rerender(<Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />);
      expect(getImg(container)).toHaveAttribute('src', FALLBACK_SRC);
    });

    it('keeps loading, alt, and data-fit on the img across the fallback swap', () => {
      const {container} = render(
        <Image
          src={SRC}
          alt="A photo"
          ratio={16 / 9}
          loading="eager"
          fallbackSrc={FALLBACK_SRC}
        />,
      );
      fireEvent.error(getImg(container));
      const img = getImg(container);
      expect(img).toHaveAttribute('src', FALLBACK_SRC);
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('alt', 'A photo');
      expect(img).toHaveAttribute('data-fit', 'cover');
    });

    it('switches back to a new src while the fallback is showing', () => {
      const {container, rerender} = render(
        <Image src={SRC} alt="A photo" fallbackSrc={FALLBACK_SRC} />,
      );
      fireEvent.error(getImg(container));
      expect(getImg(container)).toHaveAttribute('src', FALLBACK_SRC);

      const next = 'https://example.com/next.jpg';
      rerender(<Image src={next} alt="A photo" fallbackSrc={FALLBACK_SRC} />);
      expect(getImg(container)).toHaveAttribute('src', next);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    });

    it('hides the placeholder from assistive tech for decorative images', () => {
      const {container} = render(<Image src={SRC} alt="" ratio={1} />);
      fireEvent.error(getImg(container));
      expect(screen.queryByRole('img')).toBeNull();
      const placeholder = container.querySelector(
        '[data-astryx-image-placeholder]',
      );
      expect(placeholder).not.toBeNull();
      expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('preview', () => {
    it('renders no trigger without hasPreview', () => {
      render(<Image src={SRC} alt="A photo" ratio={16 / 9} />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders a real button trigger with aria-haspopup="dialog"', () => {
      render(<Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />);
      const trigger = screen.getByRole('button', {name: 'A photo'});
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('opens the Lightbox on click and closes it again', () => {
      const {baseElement} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(dialog).not.toHaveAttribute('open');

      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));
      expect(dialog).toHaveAttribute('open');

      fireEvent.click(screen.getByRole('button', {name: /close/i}));
      expect(dialog).not.toHaveAttribute('open');
    });

    it('passes previewCaption to the Lightbox', () => {
      render(
        <Image
          src={SRC}
          alt="A photo"
          ratio={16 / 9}
          hasPreview
          previewCaption="Shot on film"
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));
      expect(screen.getByText('Shot on film')).toBeInTheDocument();
    });

    it('carries the focus-ring classes on the un-clipped frame', () => {
      // The trigger's own UA outline is fully clipped by the frame's
      // overflow: clip — the ring must live on the frame via
      // :has(:focus-visible), like Thumbnail and ClickableCard.
      const probe = render(
        <div
          data-testid="ring-probe"
          {...stylex.props(testStyles.focusRing)}
        />,
      );
      const ringClasses = [...probe.getByTestId('ring-probe').classList].filter(
        cls => !cls.includes('__'),
      );
      expect(ringClasses.length).toBeGreaterThan(0);
      probe.unmount();

      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      const root = container.firstElementChild as HTMLElement;
      for (const cls of ringClasses) {
        expect(root.classList.contains(cls)).toBe(true);
      }
    });

    it('renders the trigger and opens the preview in intrinsic (ratio-less) layout', () => {
      const {baseElement} = render(
        <Image src={SRC} alt="A photo" hasPreview />,
      );
      const trigger = screen.getByRole('button', {name: 'A photo'});
      expect(trigger.querySelector('img')).not.toBeNull();

      fireEvent.click(trigger);
      expect(baseElement.querySelector('dialog')).toHaveAttribute('open');
    });

    it('follows the fallback chain: trigger persists and the Lightbox shows the fallback', () => {
      const {baseElement, container} = render(
        <Image
          src={SRC}
          alt="A photo"
          ratio={16 / 9}
          hasPreview
          fallbackSrc={FALLBACK_SRC}
        />,
      );
      fireEvent.error(getImg(container));

      const trigger = screen.getByRole('button', {name: 'A photo'});
      fireEvent.click(trigger);
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).toHaveAttribute('open');
      expect(dialog?.querySelector('img')).toHaveAttribute('src', FALLBACK_SRC);
    });

    it('renders no dialog for previewCaption without hasPreview', () => {
      const {baseElement} = render(
        <Image src={SRC} alt="A photo" previewCaption="Ignored" />,
      );
      expect(baseElement.querySelector('dialog')).toBeNull();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('uses an explicit previewLabel for decorative images too', () => {
      render(
        <Image
          src={SRC}
          alt=""
          ratio={1}
          hasPreview
          previewLabel="Zoom logo"
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Zoom logo'}),
      ).toBeInTheDocument();
    });

    it('drops the trigger when every source has failed', () => {
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      fireEvent.error(getImg(container));
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('re-anchors focus on the frame when the open preview is force-closed by failure', () => {
      // The removed dialog would otherwise drop keyboard focus to <body>
      // with no announcement — the frame is the component-owned anchor.
      const {container} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      const trigger = screen.getByRole('button', {name: 'A photo'});
      trigger.focus();
      fireEvent.click(trigger);
      fireEvent.error(getImg(container));
      expect(document.activeElement).toBe(container.firstElementChild);
    });

    it('does not auto-reopen the preview after error recovery via a new src', () => {
      const {container, baseElement, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));
      expect(baseElement.querySelector('dialog')).toHaveAttribute('open');

      // The source fails while the preview is open — the Lightbox unmounts,
      // so its own close path never runs.
      fireEvent.error(getImg(container));
      expect(baseElement.querySelector('dialog')).toBeNull();

      // Documented retry path: a new src gets a fresh attempt. The preview
      // must stay closed — only a user click opens it.
      rerender(
        <Image
          src="https://example.com/new.jpg"
          alt="A photo"
          ratio={16 / 9}
          hasPreview
        />,
      );
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(dialog).not.toHaveAttribute('open');
    });

    it('does not self-open the preview when hasPreview is toggled off and back on', () => {
      const {baseElement, container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      fireEvent.load(getImg(container));
      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));
      expect(baseElement.querySelector('dialog')).toHaveAttribute('open');

      rerender(<Image src={SRC} alt="A photo" ratio={16 / 9} />);
      expect(baseElement.querySelector('dialog')).toBeNull();

      rerender(<Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />);
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(dialog).not.toHaveAttribute('open');
    });

    it('keeps the preview open across a src change and follows the new source', () => {
      const {baseElement, container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      fireEvent.load(getImg(container));
      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).toHaveAttribute('open');

      const next = 'https://example.com/next.jpg';
      rerender(<Image src={next} alt="A photo" ratio={16 / 9} hasPreview />);
      expect(dialog).toHaveAttribute('open');
      expect(dialog?.querySelector('img')).toHaveAttribute('src', next);
    });

    it('keeps the open preview dialog outside the aria-busy subtree', () => {
      // aria-busy marks the loading frame; the dialog's content is not busy
      // and must not sit inside a busy region for assistive tech.
      const {baseElement, container, rerender} = render(
        <Image src={SRC} alt="A photo" ratio={16 / 9} hasPreview />,
      );
      fireEvent.load(getImg(container));
      fireEvent.click(screen.getByRole('button', {name: 'A photo'}));

      rerender(
        <Image
          src="https://example.com/next.jpg"
          alt="A photo"
          ratio={16 / 9}
          hasPreview
        />,
      );
      const dialog = baseElement.querySelector('dialog');
      expect(dialog).toHaveAttribute('open');
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
      expect(dialog?.closest('[aria-busy="true"]')).toBeNull();
    });

    it('never renders a nameless trigger, even for previewLabel=""', () => {
      render(<Image src={SRC} alt="" ratio={1} hasPreview previewLabel="" />);
      expect(
        screen.getByRole('button', {name: 'View larger image'}),
      ).toBeInTheDocument();
    });

    it('falls back to the default previewLabel for decorative images', () => {
      render(<Image src={SRC} alt="" ratio={1} hasPreview />);
      const trigger = screen.getByRole('button', {name: 'View larger image'});
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('uses an explicit previewLabel as the trigger name', () => {
      render(
        <Image
          src={SRC}
          alt="A photo"
          ratio={1}
          hasPreview
          previewLabel="Zoom product photo"
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Zoom product photo'}),
      ).toBeInTheDocument();
    });
  });
});
