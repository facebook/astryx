// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Selector.fr10.test.tsx
 * @input Uses vitest, Testing Library, the shared FR10 suites, and Selector
 * @output Tests that Selector's base props, container*, and control* reach
 *   their family:input-fields FR10 targets
 * @position Tests; Selector's FR10 conformance alongside Selector.test.tsx
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';
import {Selector, type SelectorProps} from './Selector';

const OPTIONS = ['Apple', 'Banana'];

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

describe('Selector props type (family:input-fields FR10)', () => {
  it('accepts container* and control* and no root styling', () => {
    expectFieldInputProps<SelectorProps>();
  });
});

describeFieldInputParts('Selector', {
  renderMember: props => (
    <Selector label="Fruit" options={OPTIONS} onChange={() => {}} {...props} />
  ),
  getControl: () => screen.getByRole('combobox'),
  inGroup: true,
});

describe('Selector FR10 targets', () => {
  it('puts control* on the bordered control box around the trigger, not on the trigger or the popup', () => {
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={() => {}}
        controlClassName="fr10-control"
        containerClassName="fr10-container"
      />,
    );
    const trigger = screen.getByRole('combobox');
    const controlBox = document.querySelector('.fr10-control') as HTMLElement;
    expect(controlBox).toHaveClass('astryx-selector');
    expect(controlBox).toContainElement(trigger);
    expect(trigger).not.toHaveClass('fr10-control');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelectorAll('.fr10-control')).toHaveLength(1);
    expect(document.querySelectorAll('.fr10-container')).toHaveLength(1);
    expect(screen.getByRole('listbox', {hidden: true})).not.toHaveClass(
      'fr10-control',
    );
  });

  it('runs the built-in toggle before a consumer onClick, once per press', () => {
    const states: (string | null)[] = [];
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={() => {}}
        onClick={event => {
          states.push(event.currentTarget.getAttribute('role') ?? 'button');
          // Neither cancelling nor stopping the press undoes the built-in
          // toggle, which already ran on the trigger button.
          event.preventDefault();
          event.stopPropagation();
        }}
      />,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(states).toHaveLength(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens from a press on the control box outside the trigger button', () => {
    const {container} = render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={() => {}}
        controlClassName="fr10-control"
      />,
    );
    const controlBox = container.querySelector('.fr10-control') as HTMLElement;
    fireEvent.click(controlBox);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('keeps the built-in keyboard model and composes a consumer onKeyDown after it', () => {
    const keyTargets: EventTarget[] = [];
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={() => {}}
        onKeyDown={event => keyTargets.push(event.currentTarget)}
      />,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, {key: 'Tab'});
    // The consumer handler lands on the trigger itself.
    expect(keyTargets).toEqual([trigger]);
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
