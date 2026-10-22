// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {observeContent} from './sharedMutationObserver';

const flush = async () => new Promise(resolve => setTimeout(resolve, 0));

describe('observeContent', () => {
  it('calls a registration once per batch for changes anywhere inside its element', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<span>first</span>';
    const callback = vi.fn();
    const unsubscribe = observeContent(element, callback);

    element.querySelector('span')!.firstChild!.nodeValue = 'second';
    element.append('third');
    await flush();

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('removes only its own registration', async () => {
    const element = document.createElement('div');
    const kept = vi.fn();
    const removed = vi.fn();
    const unsubscribeKept = observeContent(element, kept);
    const unsubscribeRemoved = observeContent(element, removed);

    unsubscribeRemoved();
    element.textContent = 'changed';
    await flush();

    expect(kept).toHaveBeenCalledTimes(1);
    expect(removed).not.toHaveBeenCalled();
    unsubscribeKept();
  });

  it('ignores a released element', async () => {
    const released = document.createElement('div');
    const live = document.createElement('div');
    const releasedCallback = vi.fn();
    const unsubscribeReleased = observeContent(released, releasedCallback);
    const unsubscribeLive = observeContent(live, vi.fn());

    unsubscribeReleased();
    released.textContent = 'changed';
    await flush();

    expect(releasedCallback).not.toHaveBeenCalled();
    unsubscribeLive();
  });
});
