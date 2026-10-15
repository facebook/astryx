// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it} from 'vitest';
import {screen} from '@testing-library/react';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';
import {RadioList, type RadioListProps} from './RadioList';
import {RadioListItem} from './RadioListItem';

describe('RadioList props type (family:input-fields FR10)', () => {
  it('accepts container* and control* and no root styling', () => {
    expectFieldInputProps<RadioListProps>();
  });
});

describeFieldInputParts('RadioList', {
  renderMember: props => (
    <RadioList label="Plan" value="a" onChange={() => {}} {...props}>
      <RadioListItem label="A" value="a" />
    </RadioList>
  ),
  getControl: () => screen.getByRole('radiogroup'),
  inGroup: false,
});
