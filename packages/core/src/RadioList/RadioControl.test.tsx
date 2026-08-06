// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioControl.test.tsx
 * @input Uses vitest, @testing-library/react, RadioControl
 * @output Unit tests for the standalone RadioControl behavior
 * @position Testing; validates RadioControl.tsx implementation
 *
 * SYNC: When RadioControl.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';

import {RadioControl} from './RadioControl';

describe('RadioControl', () => {
  it('renders a standalone radio with an accessible name and does not throw', () => {
    render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={() => {}}
      />,
    );
    const radio = screen.getByRole('radio', {name: 'Email'});
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute('aria-label', 'Email');
  });

  it('reflects the isChecked prop', () => {
    const {rerender} = render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('radio', {name: 'Email'})).not.toBeChecked();

    rerender(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={true}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('radio', {name: 'Email'})).toBeChecked();
  });

  it('fires onChange with the value and the change event when clicked', () => {
    const onChange = vi.fn();
    render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('radio', {name: 'Email'}));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe('email');
    // Hands back the DOM event (matches CheckboxInput's onChange signature).
    expect(onChange.mock.calls[0][1]).toBeDefined();
    expect(onChange.mock.calls[0][1].target).toBeInstanceOf(HTMLInputElement);
  });

  it('generates a group name when htmlName is omitted', () => {
    render(
      <RadioControl
        label="Email"
        value="email"
        isChecked={false}
        onChange={() => {}}
      />,
    );
    // A lone control still behaves as its own group: the input carries a name.
    const radio = screen.getByRole('radio', {name: 'Email'});
    expect(radio).toHaveAttribute('name');
    expect(radio.getAttribute('name')).not.toBe('');
  });

  it('does not fire onChange when disabled', () => {
    const onChange = vi.fn();
    render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        isDisabled
        onChange={onChange}
      />,
    );
    const radio = screen.getByRole('radio', {name: 'Email', hidden: true});
    expect(radio).toBeDisabled();
    // A native disabled input drops the event; fire on the DOM node directly to
    // prove the onChange guard also blocks selection.
    fireEvent.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the astryx-radio and astryx-radio-dot theme targets', () => {
    const {container} = render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={true}
        onChange={() => {}}
      />,
    );
    expect(container.querySelector('.astryx-radio')).toBeInTheDocument();
    expect(container.querySelector('.astryx-radio-dot')).toBeInTheDocument();
  });

  it('does not render the inner dot when unchecked', () => {
    const {container} = render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={() => {}}
      />,
    );
    expect(container.querySelector('.astryx-radio')).toBeInTheDocument();
    expect(
      container.querySelector('.astryx-radio-dot'),
    ).not.toBeInTheDocument();
  });

  it('uses the provided id so an external label can also target it', () => {
    render(
      <>
        <label htmlFor="my-radio">Email</label>
        <RadioControl
          id="my-radio"
          label="Email"
          htmlName="notify"
          value="email"
          isChecked={false}
          onChange={() => {}}
        />
      </>,
    );
    const radio = screen.getByRole('radio', {name: 'Email'});
    expect(radio).toHaveAttribute('id', 'my-radio');
  });

  it('applies xstyle/className/style to the root wrapper, not the hidden input', () => {
    const {container} = render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={() => {}}
        className="probe-root"
        data-testid="radio-input"
      />,
    );
    // className lands on the wrapper (the styleable root), while data-* passes
    // through to the input via {...rest}.
    const root = container.querySelector('.probe-root');
    expect(root).toBeInTheDocument();
    expect(root?.tagName).toBe('DIV');
    expect(screen.getByTestId('radio-input').tagName).toBe('INPUT');
  });

  it('forwards ...rest to the input but cannot clobber the radio type', () => {
    render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        onChange={() => {}}
        // Contract props are set after {...rest}: a stray type can't win.
        {...({type: 'checkbox'} as object)}
      />,
    );
    expect(screen.getByRole('radio', {name: 'Email'})).toHaveAttribute(
      'type',
      'radio',
    );
  });

  it('keeps a disabled control focusable and shows a reason via disabledMessage', () => {
    const onChange = vi.fn();
    render(
      <RadioControl
        label="Email"
        htmlName="notify"
        value="email"
        isChecked={false}
        isDisabled
        disabledMessage="Locked by your administrator"
        onChange={onChange}
      />,
    );
    const radio = screen.getByRole('radio', {name: 'Email'});
    // Focusable-disabled: aria-disabled instead of the native disabled attr,
    // detached from form submission via a dropped name.
    expect(radio).not.toBeDisabled();
    expect(radio).toHaveAttribute('aria-disabled', 'true');
    expect(radio).not.toHaveAttribute('name');
    // aria-describedby wires the reason for AT discovery.
    expect(radio).toHaveAttribute('aria-describedby');
    fireEvent.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
