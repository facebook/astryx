// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createElement} from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {CommandPalette} from './CommandPalette';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
});

async function delegatedMouseOverScans(count: number) {
  const items = Array.from({length: count}, (_, index) => ({
    id: `item-${index}`,
    label: `Item ${index}`,
  }));
  const view = render(
    createElement(CommandPalette, {
      isOpen: true,
      onOpenChange: () => {},
      searchSource: createStaticSource(items),
    }),
  );
  await waitFor(() => expect(view.getAllByRole('option')).toHaveLength(count));
  const lastOption = view.getAllByRole('option').at(-1);
  if (!lastOption) {
    throw new Error('missing last option');
  }

  let scannedItems = 0;
  const arrayFindIndex = Array.prototype.findIndex;
  function trackedFindIndex(
    this: unknown[],
    predicate: (value: unknown, index: number, array: unknown[]) => unknown,
    thisArg?: unknown,
  ): number {
    if (
      this.length === count &&
      (this[0] as {value?: unknown} | undefined)?.value === 'item-0' &&
      (this.at(-1) as {value?: unknown} | undefined)?.value ===
        `item-${count - 1}`
    ) {
      scannedItems += this.length;
    }
    return arrayFindIndex.call(this, predicate, thisArg);
  }
  const findIndexSpy = vi
    .spyOn(Array.prototype, 'findIndex')
    .mockImplementation(trackedFindIndex);

  try {
    for (let i = 0; i < 10; i++) {
      fireEvent.mouseOver(lastOption);
    }
    expect(view.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      lastOption.id,
    );
  } finally {
    findIndexSpy.mockRestore();
    view.unmount();
  }
  return scannedItems;
}

describe('CommandPalette delegated mouseover performance', () => {
  it.each([50, 500])('does not scan %i items per mouseover', async count => {
    expect(await delegatedMouseOverScans(count)).toBe(0);
  });
});
