// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {resolveSelectionIndicator} from './selectionRegistry';
import {SelectionIndicator} from './SelectionIndicator';
import {RadioIndicator} from './RadioIndicator';

const radioTheme = defineTheme({
  name: 'selection-radio',
  componentIcons: {'selector-selected-option': {indicator: 'radio'}},
});

const hiddenTheme = defineTheme({
  name: 'selection-hidden',
  componentIcons: {'selector-selected-option': null},
});

function renderMark(
  state: 'checked' | 'unchecked',
  theme?: ReturnType<typeof defineTheme>,
) {
  const mark = (
    <SelectionIndicator
      slot="selector-selected-option"
      fallback="check"
      state={state}
      iconSize="sm"
      indicatorSize="sm"
    />
  );
  return render(theme ? <Theme theme={theme}>{mark}</Theme> : mark);
}

describe('resolveSelectionIndicator', () => {
  it('falls back to the component default icon', () => {
    expect(resolveSelectionIndicator('selector-selected-option', 'check')).toEqual({
      type: 'icon',
      name: 'check',
    });
  });

  it('resolves an indicator mapping to the theme indicator component', () => {
    const resolved = resolveSelectionIndicator(
      'selector-selected-option',
      'check',
      radioTheme,
    );

    expect(resolved).toMatchObject({type: 'indicator', name: 'radio'});
    expect(
      resolved.type === 'indicator' ? resolved.Indicator : null,
    ).toBe(RadioIndicator);
  });

  it('resolves a null mapping to nothing', () => {
    expect(
      resolveSelectionIndicator('selector-selected-option', 'check', hiddenTheme),
    ).toEqual({type: 'none'});
  });
});

describe('SelectionIndicator', () => {
  it('renders the default icon only in the selected state', () => {
    const {container, unmount} = renderMark('unchecked');
    expect(container.querySelector('.astryx-icon')).not.toBeInTheDocument();
    unmount();

    const selected = renderMark('checked');
    expect(
      selected.container.querySelector('.astryx-icon'),
    ).toBeInTheDocument();
  });

  it('renders a themed indicator in both states', () => {
    const {container, unmount} = renderMark('unchecked', radioTheme);
    const unselected = container.querySelector('.astryx-radio');
    expect(unselected).toBeInTheDocument();
    expect(unselected).not.toHaveAttribute('data-checked');
    unmount();

    const selected = renderMark('checked', radioTheme);
    expect(selected.container.querySelector('.astryx-radio')).toHaveAttribute(
      'data-checked',
      'checked',
    );
  });

  it('renders nothing when the theme maps the slot to null', () => {
    const {container} = renderMark('checked', hiddenTheme);
    expect(container.querySelector('.astryx-icon')).not.toBeInTheDocument();
    expect(container.querySelector('.astryx-radio')).not.toBeInTheDocument();
  });
});
