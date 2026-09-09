// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterAll, beforeAll, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {BaseTypeahead} from './BaseTypeahead';
import type {SearchableItem, SearchSource} from './types';

const item: SearchableItem = {id: '1', label: 'Apple'};
const source: SearchSource<SearchableItem> = {
  search: () => [item],
  bootstrap: () => [item],
};
const state = new WeakMap<HTMLElement, boolean>();
const matches = HTMLElement.prototype.matches;

beforeAll(() => {
  HTMLElement.prototype.showPopover = function () {
    state.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.hidePopover = function () {
    state.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.matches = function (selector: string): boolean {
    return selector === ':popover-open'
      ? (state.get(this) ?? false)
      : matches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = matches;
});

it('blocks keyboard selection when the open combobox becomes focusable-disabled', async () => {
  const onChange = vi.fn();
  const renderComponent = (isDisabled = false) => (
    <BaseTypeahead
      searchSource={source}
      value={null}
      onChange={onChange}
      debounceMs={0}
      hasEntriesOnFocus
      isDisabled={isDisabled}
      isFocusableDisabled={isDisabled}
    />
  );
  const {rerender} = render(renderComponent());
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

  rerender(renderComponent(true));
  fireEvent.keyDown(input, {key: 'Enter'});
  expect(onChange).not.toHaveBeenCalled();
});
