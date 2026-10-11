// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.fr10.test.tsx
 * @input Uses vitest, Testing Library, the shared FR10 suites, and ComplexSelector
 * @output Tests that ComplexSelector's base props, container*, and control* reach
 *   their family:input-fields FR10 targets
 * @position Tests; ComplexSelector's FR10 conformance alongside ComplexSelector.test.tsx
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';
import {ComplexSelector, type ComplexSelectorProps} from './ComplexSelector';

const VALUE = 'Apple';
const content = () => <p>Pick a fruit</p>;

// jsdom has no Popover API; reflect open state the way the browser does.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
});

describe('ComplexSelector props type (family:input-fields FR10)', () => {
  it('accepts container* and control* and no root styling', () => {
    expectFieldInputProps<ComplexSelectorProps>();
  });
});

describeFieldInputParts('ComplexSelector', {
  renderMember: props => (
    <ComplexSelector label="Fruit" value={VALUE} onChange={() => {}} {...props}>
      {content}
    </ComplexSelector>
  ),
  getControl: () => screen.getByRole('button', {name: 'Fruit'}),
  // No shipped InputGroup support (family:input-fields adoption table).
  inGroup: false,
});

describe('ComplexSelector FR10 targets', () => {
  it('puts control* on the bordered control box around the trigger, not on the trigger or the popup', () => {
    render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        controlClassName="fr10-control"
        containerClassName="fr10-container">
        {content}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'Fruit'});
    const controlBox = document.querySelector('.fr10-control') as HTMLElement;
    expect(controlBox).toHaveClass('astryx-complex-selector');
    expect(controlBox).toContainElement(trigger);
    expect(trigger).not.toHaveClass('fr10-control');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelectorAll('.fr10-control')).toHaveLength(1);
    expect(document.querySelectorAll('.fr10-container')).toHaveLength(1);
    expect(screen.getByRole('dialog', {hidden: true})).not.toHaveClass(
      'fr10-control',
    );
  });

  it('runs the built-in toggle before a consumer onClick, once per press', () => {
    const states: (string | null)[] = [];
    render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        onClick={event => {
          states.push(event.currentTarget.getAttribute('aria-expanded'));
          event.preventDefault();
        }}>
        {content}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'Fruit'});
    fireEvent.click(trigger);
    // The consumer ran after the toggle, and cancelling did not undo it.
    expect(states).toHaveLength(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens from a press on the control box outside the trigger button', () => {
    const {container} = render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        controlClassName="fr10-control">
        {content}
      </ComplexSelector>,
    );
    const controlBox = container.querySelector('.fr10-control') as HTMLElement;
    fireEvent.click(controlBox);
    expect(screen.getByRole('button', {name: 'Fruit'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('keeps the built-in keyboard model and composes a consumer onKeyDown after it', () => {
    const onKeyDown = vi.fn();
    render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        onKeyDown={onKeyDown}>
        {content}
      </ComplexSelector>,
    );
    const trigger = screen.getByRole('button', {name: 'Fruit'});
    fireEvent.keyDown(trigger, {key: 'Tab'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('ComplexSelector FR10 renderTrigger', () => {
  it('forwards base props and the ref to the caller-rendered control', () => {
    const ref = {current: null as HTMLElement | null};
    const onClick = vi.fn();
    render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        ref={ref}
        data-testid="opener"
        aria-details="details-id"
        onClick={onClick}
        renderTrigger={props => (
          <button type="button" {...props}>
            Open
          </button>
        )}>
        {content}
      </ComplexSelector>,
    );
    const opener = screen.getByRole('button', {name: 'Open'});
    expect(opener).toHaveAttribute('data-testid', 'opener');
    expect(opener).toHaveAttribute('aria-details', 'details-id');
    expect(ref.current).toBe(opener);
    fireEvent.click(opener);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(opener).toHaveAttribute('aria-expanded', 'true');
  });

  it('warns that container* and control* have no effect', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {container} = render(
      <ComplexSelector
        label="Fruit"
        value={VALUE}
        onChange={() => {}}
        controlClassName="fr10-control"
        renderTrigger={props => (
          <button type="button" {...props}>
            Open
          </button>
        )}>
        {content}
      </ComplexSelector>,
    );
    expect(container.querySelector('.fr10-control')).toBeNull();
    expect(
      warn.mock.calls.some(call =>
        String(call[0]).startsWith(
          'ComplexSelector: `container*` and `control*`',
        ),
      ),
    ).toBe(true);
    warn.mockRestore();
  });
});
