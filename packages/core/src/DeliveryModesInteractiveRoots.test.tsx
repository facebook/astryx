// Copyright (c) Meta Platforms, Inc. and affiliates.

import {cleanup, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'vitest';
import {measureAdoptionInDocument} from '../../../internal/vibe-tests/delivery-modes/evaluator.mjs';
import {
  REACT_INTERACTIVE_ROOT_CLASSES,
  REACT_INTERACTIVE_ROOT_CLASSES_BY_COMPONENT,
} from '../../../internal/vibe-tests/delivery-modes/react-interactive-roots.mjs';
import {CheckboxInput} from './CheckboxInput';
import {DateInput} from './DateInput';
import {NumberInput} from './NumberInput';
import {RadioList, RadioListItem} from './RadioList';
import {Selector} from './Selector';
import {Slider} from './Slider';
import {Switch} from './Switch';
import {TextInput} from './TextInput';

afterEach(cleanup);

const components = [
  {
    name: 'CheckboxInput',
    render: () =>
      render(
        <CheckboxInput label="Accept" value={false} onChange={() => {}} />,
      ),
    target: () => screen.getByRole('checkbox', {name: 'Accept'}),
  },
  {
    name: 'DateInput',
    render: () => render(<DateInput label="Date" onChange={() => {}} />),
    target: () => screen.getByLabelText('Date'),
  },
  {
    name: 'NumberInput',
    render: () =>
      render(<NumberInput label="Quantity" value={1} onChange={() => {}} />),
    target: () => screen.getByRole('spinbutton', {name: 'Quantity'}),
  },
  {
    name: 'RadioList',
    render: () =>
      render(
        <RadioList label="Plan" value="" onChange={() => {}}>
          <RadioListItem label="Basic" value="basic" />
        </RadioList>,
      ),
    target: () => screen.getByRole('radio', {name: 'Basic'}),
  },
  {
    name: 'Selector',
    render: () => render(<Selector label="Fruit" options={[]} />),
    target: () => screen.getByRole('combobox', {name: 'Fruit'}),
  },
  {
    name: 'Slider',
    render: () => render(<Slider label="Volume" value={50} />),
    target: () => screen.getByRole('slider', {name: 'Volume'}),
  },
  {
    name: 'Switch',
    render: () => render(<Switch label="Enabled" value={false} />),
    target: () => screen.getByRole('switch', {name: 'Enabled'}),
  },
  {
    name: 'TextInput',
    render: () =>
      render(<TextInput label="Name" value="" onChange={() => {}} />),
    target: () => screen.getByRole('textbox', {name: 'Name'}),
  },
];

function nearestAstryxRootClasses(element: HTMLElement): string[] {
  let candidate: HTMLElement | null = element;
  while (candidate && candidate !== document.body) {
    const classes = [...candidate.classList].filter(name =>
      name.startsWith('astryx-'),
    );
    if (classes.length > 0) {
      return classes;
    }
    candidate = candidate.parentElement;
  }
  return [];
}

describe('delivery-mode React interactive component roots', () => {
  test.each(components)(
    '$name manifest matches the real packages/core DOM',
    ({name, render: renderComponent, target}) => {
      renderComponent();
      expect(nearestAstryxRootClasses(target())).toEqual(
        REACT_INTERACTIVE_ROOT_CLASSES_BY_COMPONENT[
          name as keyof typeof REACT_INTERACTIVE_ROOT_CLASSES_BY_COMPONENT
        ],
      );
    },
  );

  test.each(
    components.filter(({name}) =>
      ['Selector', 'CheckboxInput', 'Switch', 'RadioList', 'Slider'].includes(
        name,
      ),
    ),
  )('$name receives precise adoption credit', ({render: renderComponent}) => {
    renderComponent();
    const result = measureAdoptionInDocument({
      assumeVisible: true,
      reactInteractiveRootClasses: REACT_INTERACTIVE_ROOT_CLASSES,
    });

    expect(result.interactiveEligibleElementCount).toBe(1);
    expect(result.interactiveAdoptedElementCount).toBe(1);
    expect(result.interactiveAdoptionShare).toBe(1);
  });
});
