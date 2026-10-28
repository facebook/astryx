// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioList.focusableDisabled.test.tsx
 * @input Uses RadioList, RadioListItem, Testing Library
 * @output Tests that disabled radios stay focusable (spec:AST-085 FR1–FR4)
 *   and that arrow keys skip individually disabled options (RadioList FR4)
 * @position Colocated behavior test for RadioList and RadioListItem
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {RadioList} from './RadioList';
import {RadioListItem} from './RadioListItem';

const radio = (name: string) =>
  screen.getByRole<HTMLInputElement>('radio', {name, hidden: true});

describe('RadioList: disabled radios stay focusable (spec:AST-085)', () => {
  it('renders an individually disabled option with aria-disabled and no native disabled', () => {
    render(
      <RadioList label="Delivery" value="standard" onChange={() => {}}>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem label="Express" value="express" isDisabled />
      </RadioList>,
    );
    expect(radio('Express')).not.toHaveAttribute('disabled');
    expect(radio('Express')).toHaveAttribute('aria-disabled', 'true');
    expect(radio('Standard')).not.toHaveAttribute('aria-disabled');
  });

  it('renders every radio of a group disabled without a reason with aria-disabled and no native disabled', () => {
    render(
      <RadioList
        label="Delivery"
        value="standard"
        onChange={() => {}}
        isDisabled>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem label="Express" value="express" />
      </RadioList>,
    );
    for (const name of ['Standard', 'Express']) {
      expect(radio(name)).not.toHaveAttribute('disabled');
      expect(radio(name)).toHaveAttribute('aria-disabled', 'true');
    }
  });

  it('neither selects nor runs a caller onClick when a disabled option is clicked', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <RadioList label="Delivery" value="standard" onChange={onChange}>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem
          label="Express"
          value="express"
          isDisabled
          onClick={onClick}
        />
      </RadioList>,
    );
    fireEvent.click(radio('Express'));
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(radio('Standard')).toBeChecked();
  });

  it('keeps focus on a radio when its group becomes disabled', () => {
    const {rerender} = render(
      <RadioList label="Delivery" value="standard" onChange={() => {}}>
        <RadioListItem label="Standard" value="standard" />
      </RadioList>,
    );
    radio('Standard').focus();
    rerender(
      <RadioList
        label="Delivery"
        value="standard"
        onChange={() => {}}
        isDisabled>
        <RadioListItem label="Standard" value="standard" />
      </RadioList>,
    );
    expect(radio('Standard')).toHaveFocus();
    expect(radio('Standard')).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('RadioList: arrow keys skip individually disabled options', () => {
  function renderDelivery(
    onChange: (value: string) => void,
    props: {value?: string; dir?: 'rtl'} = {},
  ) {
    return render(
      <RadioList
        label="Delivery"
        value={props.value ?? 'standard'}
        onChange={onChange}
        controlStyle={props.dir === 'rtl' ? {direction: 'rtl'} : undefined}>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem label="Express" value="express" isDisabled />
        <RadioListItem label="Pickup" value="pickup" />
      </RadioList>,
    );
  }

  it('moves past a disabled option to the next enabled one and selects it', () => {
    const onChange = vi.fn();
    renderDelivery(onChange);
    radio('Standard').focus();
    const handled = !fireEvent.keyDown(radio('Standard'), {key: 'ArrowDown'});
    expect(handled).toBe(true);
    expect(radio('Pickup')).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('pickup');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('moves past a disabled option backward, with ArrowUp', () => {
    const onChange = vi.fn();
    renderDelivery(onChange, {value: 'pickup'});
    radio('Pickup').focus();
    fireEvent.keyDown(radio('Pickup'), {key: 'ArrowUp'});
    expect(radio('Standard')).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('standard');
  });

  it('follows the inline direction: in RTL, ArrowLeft moves forward', () => {
    const onChange = vi.fn();
    renderDelivery(onChange, {dir: 'rtl'});
    radio('Standard').focus();
    fireEvent.keyDown(radio('Standard'), {key: 'ArrowLeft'});
    expect(radio('Pickup')).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('pickup');
  });

  it('leaves a move onto an enabled option to the browser', () => {
    const onChange = vi.fn();
    renderDelivery(onChange, {value: 'pickup'});
    radio('Pickup').focus();
    // Pickup → (wrap) Standard is enabled: the native radio group handles it.
    const handled = !fireEvent.keyDown(radio('Pickup'), {key: 'ArrowDown'});
    expect(handled).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps focus where it is when every other option is disabled', () => {
    const onChange = vi.fn();
    render(
      <RadioList
        label="Delivery"
        value="standard"
        onChange={onChange}
        isDisabled>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem label="Express" value="express" />
      </RadioList>,
    );
    radio('Standard').focus();
    const handled = !fireEvent.keyDown(radio('Standard'), {key: 'ArrowDown'});
    expect(handled).toBe(true);
    expect(radio('Standard')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores arrow keys held with a modifier', () => {
    const onChange = vi.fn();
    renderDelivery(onChange);
    radio('Standard').focus();
    const handled = !fireEvent.keyDown(radio('Standard'), {
      key: 'ArrowDown',
      ctrlKey: true,
    });
    expect(handled).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('runs a caller onKeyDown as well', () => {
    const onKeyDown = vi.fn();
    render(
      <RadioList
        label="Delivery"
        value="standard"
        onChange={() => {}}
        onKeyDown={onKeyDown}>
        <RadioListItem label="Standard" value="standard" />
        <RadioListItem label="Express" value="express" isDisabled />
      </RadioList>,
    );
    fireEvent.keyDown(radio('Standard'), {key: 'ArrowDown'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe('RadioList: entry Tab stop with disabled options', () => {
  function renderEmpty() {
    return render(
      <>
        <button type="button">before</button>
        <RadioList label="Delivery" value="" onChange={() => {}}>
          <RadioListItem label="Standard" value="standard" isDisabled />
          <RadioListItem label="Express" value="express" />
          <RadioListItem label="Pickup" value="pickup" />
          <RadioListItem label="Locker" value="locker" isDisabled />
        </RadioList>
        <button type="button">after</button>
      </>,
    );
  }

  it('lands forward entry on the first enabled option, past a disabled first one', () => {
    renderEmpty();
    screen.getByText('before').focus();
    radio('Standard').focus();
    expect(radio('Express')).toHaveFocus();
  });

  it('lands backward entry on the last enabled option, past a disabled last one', () => {
    renderEmpty();
    screen.getByText('after').focus();
    radio('Locker').focus();
    expect(radio('Pickup')).toHaveFocus();
  });

  it('enters a wholly disabled group on its first radio', () => {
    render(
      <>
        <button type="button">before</button>
        <RadioList label="Delivery" value="" onChange={() => {}} isDisabled>
          <RadioListItem label="Standard" value="standard" />
          <RadioListItem label="Express" value="express" />
          <RadioListItem label="Pickup" value="pickup" />
        </RadioList>
      </>,
    );
    screen.getByText('before').focus();
    radio('Express').focus();
    expect(radio('Standard')).toHaveFocus();
  });
});

describe('RadioList: disabled values are not submitted (spec:AST-085 FR3)', () => {
  function formOf(container: HTMLElement) {
    return container.querySelector('form')!;
  }

  it('submits nothing from a group disabled without a reason', () => {
    const {container} = render(
      <form>
        <RadioList
          label="Delivery"
          htmlName="delivery"
          value="standard"
          onChange={() => {}}
          isDisabled>
          <RadioListItem label="Standard" value="standard" />
        </RadioList>
      </form>,
    );
    expect([...new FormData(formOf(container)).keys()]).toEqual([]);
  });

  it('keeps an unselected disabled option in the same form group as the others', () => {
    const {container} = render(
      <form>
        <RadioList
          label="Delivery"
          htmlName="delivery"
          value="standard"
          onChange={() => {}}>
          <RadioListItem label="Standard" value="standard" />
          <RadioListItem label="Express" value="express" isDisabled />
        </RadioList>
      </form>,
    );
    const form = formOf(container);
    expect(radio('Standard').form).toBe(form);
    expect(radio('Express').form).toBe(form);
    expect(new FormData(form).get('delivery')).toBe('standard');
  });

  it('submits nothing, and does not block a required submit, when the selected option is disabled', () => {
    const {container} = render(
      <form>
        <RadioList
          label="Delivery"
          htmlName="delivery"
          value="express"
          onChange={() => {}}
          isRequired>
          <RadioListItem label="Standard" value="standard" />
          <RadioListItem label="Express" value="express" isDisabled />
        </RadioList>
      </form>,
    );
    const form = formOf(container);
    expect([...new FormData(form).keys()]).toEqual([]);
    expect(form.checkValidity()).toBe(true);
    // The radios stay one group: every radio shares the same form owner, so
    // the selected radio remains the group's only Tab stop.
    expect(radio('Standard').form).toBe(radio('Express').form);
    expect(radio('Express')).toBeChecked();
  });
});
