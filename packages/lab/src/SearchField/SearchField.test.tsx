// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SearchField.test.tsx
 * @input vitest, @testing-library/react, SearchField
 * @output jsdom coverage of SearchField's semantics and state: a search
 *   landmark holding a named searchbox with a touch keyboard's Search key
 *   and no autocorrection; focus activates; the close button cancels
 *   (clears, ends editing, deactivates) and is out of the tab order while
 *   inactive; Escape cancels outside composition; Enter submits and keeps
 *   focus; the clear button appears with text, clears and keeps or restores
 *   focus inside the tap; a host's handle focuses the field right after an
 *   activation it committed (a tab bar's tap); controlled and uncontrolled
 * @position Testing; the motion is proven in real engines by
 *   __tests__/SearchField.interaction.browser.spec.ts
 */

import {describe, expect, it, vi} from 'vitest';
import {createRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  SearchField,
  type SearchFieldHandle,
  type SearchFieldProps,
} from './SearchField';

function Field(props: Partial<SearchFieldProps>) {
  return <SearchField label="Search" {...props} />;
}

const box = () => screen.getByRole('searchbox', {name: 'Search'});
// The close button stays mounted (hidden while inactive), so it is found by
// its data attribute rather than by role.
const close = () => {
  const button = document.querySelector<HTMLButtonElement>(
    '[data-search-field-close]',
  );
  if (button == null) {
    throw new Error('no close button');
  }
  return button;
};

describe('SearchField', () => {
  it('is a search landmark holding a searchbox named by its label', () => {
    render(<Field />);
    expect(screen.getByRole('search')).toContainElement(box());
    expect(box()).toHaveAttribute('placeholder', 'Search');
  });

  it('asks a touch keyboard for its Search key and no autocorrection', () => {
    render(<Field />);
    expect(box()).toHaveAttribute('enterkeyhint', 'search');
    expect(box()).toHaveAttribute('autocorrect', 'off');
  });

  it('activates when the field gains focus, once', () => {
    const onActiveChange = vi.fn();
    render(<Field onActiveChange={onActiveChange} />);
    act(() => box().focus());
    act(() => box().blur());
    act(() => box().focus());
    expect(onActiveChange.mock.calls).toEqual([[true]]);
    expect(screen.getByRole('search')).toHaveAttribute(
      'data-search-field-active',
      'true',
    );
  });

  it('keeps the close button hidden and out of the tab order while inactive', () => {
    render(<Field />);
    expect(close()).toHaveAttribute('aria-hidden', 'true');
    expect(close()).toHaveAttribute('tabindex', '-1');
    act(() => box().focus());
    expect(close()).not.toHaveAttribute('aria-hidden');
    expect(close()).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('button', {name: 'Cancel'})).toBe(close());
  });

  it('cancels from the close button: clears, ends editing and deactivates', () => {
    const onChange = vi.fn();
    const onActiveChange = vi.fn();
    render(
      <Field
        defaultValue="ap"
        onChange={onChange}
        onActiveChange={onActiveChange}
      />,
    );
    act(() => box().focus());
    fireEvent.click(close());
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    expect(box()).toHaveValue('');
    expect(box()).not.toHaveFocus();
  });

  it('cancels on Escape, but not on an Escape that ends a composition', () => {
    const onActiveChange = vi.fn();
    render(<Field onActiveChange={onActiveChange} />);
    act(() => box().focus());
    fireEvent.keyDown(box(), {key: 'Escape', isComposing: true});
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(box(), {key: 'Escape'});
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('submits the query on Enter and keeps editing', () => {
    const onSubmit = vi.fn();
    render(<Field defaultValue="pear" onSubmit={onSubmit} />);
    act(() => box().focus());
    fireEvent.keyDown(box(), {key: 'Enter'});
    expect(onSubmit).toHaveBeenCalledWith('pear');
    expect(box()).toHaveFocus();
  });

  it('shows the clear button only with text; it clears without taking focus', () => {
    render(<Field />);
    expect(
      screen.queryByRole('button', {name: 'Clear text'}),
    ).not.toBeInTheDocument();
    act(() => box().focus());
    fireEvent.change(box(), {target: {value: 'ch'}});
    const clear = screen.getByRole('button', {name: 'Clear text'});
    // Its press never takes the input's focus.
    expect(fireEvent.mouseDown(clear)).toBe(false);
    fireEvent.click(clear);
    expect(box()).toHaveValue('');
    expect(box()).toHaveFocus();
    expect(
      screen.queryByRole('button', {name: 'Clear text'}),
    ).not.toBeInTheDocument();
  });

  // iOS raises the keyboard only for a focus made during the tap; UIKit's
  // clear button makes a field that is not editing first responder.
  it('focuses the input inside the tap when clear is tapped while not editing', () => {
    render(<Field defaultValue="kiwi" defaultIsActive />);
    const clear = screen.getByRole('button', {name: 'Clear text'});
    const focusedDuring: (string | undefined)[] = [];
    const input = box();
    const focus = HTMLElement.prototype.focus;
    Object.defineProperty(input, 'focus', {
      configurable: true,
      value(options?: FocusOptions) {
        focusedDuring.push(window.event?.type);
        focus.call(input, options);
      },
    });
    fireEvent.click(clear);
    expect(input).toHaveFocus();
    expect(focusedDuring).toEqual(['click']);
  });

  it('lets a host focus the field right after committing its activation', () => {
    const handle = createRef<SearchFieldHandle>();
    function Host() {
      const [active, setActive] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              // A tab bar's tap: commit the activation, then focus inside the
              // same tap so the touch keyboard rises.
              flushSync(() => setActive(true));
              handle.current?.focus();
            }}>
            Search tab
          </button>
          <SearchField
            label="Search"
            handleRef={handle}
            isActive={active}
            onActiveChange={setActive}
          />
        </>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByRole('button', {name: 'Search tab'}));
    expect(box()).toHaveFocus();
    expect(screen.getByRole('search')).toHaveAttribute(
      'data-search-field-active',
      'true',
    );
    act(() => handle.current?.blur());
    expect(box()).not.toHaveFocus();
  });

  it('follows controlled value and active state', () => {
    const {rerender} = render(<Field value="fig" isActive={false} />);
    expect(box()).toHaveValue('fig');
    expect(close()).toHaveAttribute('aria-hidden', 'true');
    rerender(<Field value="figs" isActive />);
    expect(box()).toHaveValue('figs');
    expect(close()).not.toHaveAttribute('aria-hidden');
  });
});
