// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, act, waitFor} from '@testing-library/react';
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

  // ── Refs #3231 ──────────────────────────────────────────────────────────
  // The APCA sample (`fetch(src, {mode: 'cors'})` -> createImageBitmap ->
  // OffscreenCanvas getImageData) exists only to pick the remove button's
  // MediaTheme. When there is no remove button the sampled mode is discarded,
  // so the fetch is pure waste — and on a cross-origin src it is waste that
  // logs a CORS error (see scripts/check-demo-media.mjs).
  describe('image sampling', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    /** jsdom has no fetch/createImageBitmap/OffscreenCanvas — stub the pipeline. */
    function stubSamplingPipeline() {
      const fetchSpy = vi.fn(async () => {
        throw new TypeError(
          'Failed to fetch: No Access-Control-Allow-Origin header',
        );
      });
      vi.stubGlobal('fetch', fetchSpy);
      vi.stubGlobal('createImageBitmap', vi.fn());
      vi.stubGlobal('OffscreenCanvas', class {});
      return fetchSpy;
    }

    /** Let the effect's fetch + state update flush. */
    async function flush() {
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
    }

    it('does not sample the image when there is no remove button', async () => {
      const fetchSpy = stubSamplingPipeline();
      render(<Thumbnail src="https://cdn.example/photo.png" alt="Photo" />);
      await flush();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('does not sample the image when onRemove is suppressed by isDisabled', async () => {
      const fetchSpy = stubSamplingPipeline();
      render(
        <Thumbnail
          src="https://cdn.example/photo.png"
          alt="Photo"
          onRemove={vi.fn()}
          isDisabled
        />,
      );
      await flush();
      expect(screen.queryByRole('button', {name: /Remove/})).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('still samples the image when a remove button is rendered', async () => {
      const fetchSpy = stubSamplingPipeline();
      render(
        <Thumbnail
          src="https://cdn.example/photo.png"
          alt="Photo"
          onRemove={vi.fn()}
        />,
      );
      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/photo.png', {
        mode: 'cors',
      });
    });

    it('does not sample when there is no src to sample', async () => {
      const fetchSpy = stubSamplingPipeline();
      render(<Thumbnail onRemove={vi.fn()} isLoading />);
      await flush();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    // The gate is a render-time condition, not a mount-time latch: a thumbnail
    // that gains its remove button later must still get its contrast sample.
    it('starts sampling when the remove button appears after mount', async () => {
      const fetchSpy = stubSamplingPipeline();
      const {rerender} = render(
        <Thumbnail
          src="https://cdn.example/photo.png"
          alt="Photo"
          onRemove={vi.fn()}
          isDisabled
        />,
      );
      await flush();
      expect(fetchSpy).not.toHaveBeenCalled();

      rerender(
        <Thumbnail
          src="https://cdn.example/photo.png"
          alt="Photo"
          onRemove={vi.fn()}
        />,
      );
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('button', {name: /Remove/})).toBeInTheDocument();
    });

    it('re-samples when src changes while the remove button is rendered', async () => {
      const fetchSpy = stubSamplingPipeline();
      const {rerender} = render(
        <Thumbnail
          src="https://cdn.example/photo.png"
          alt="Photo"
          onRemove={vi.fn()}
        />,
      );
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

      rerender(
        <Thumbnail
          src="https://cdn.example/other.png"
          alt="Photo"
          onRemove={vi.fn()}
        />,
      );
      await waitFor(() =>
        expect(fetchSpy).toHaveBeenLastCalledWith(
          'https://cdn.example/other.png',
          {mode: 'cors'},
        ),
      );
    });
  });
});
