// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it} from 'vitest';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';
import {Slider, type SliderProps} from './Slider';

describe('Slider props type (family:input-fields FR10)', () => {
  it('accepts container* and control* and no root styling', () => {
    expectFieldInputProps<SliderProps>();
  });
});

describeFieldInputParts('Slider', {
  renderMember: props => (
    <Slider label="Volume" value={50} onChange={() => {}} {...props} />
  ),
  getControl: () =>
    document.querySelector<HTMLElement>('.astryx-slider-control')!,
  inGroup: false,
});
