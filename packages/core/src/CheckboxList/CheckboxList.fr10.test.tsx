// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it} from 'vitest';
import {screen} from '@testing-library/react';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';
import {CheckboxList, type CheckboxListProps} from './CheckboxList';
import {CheckboxListItem} from './CheckboxListItem';

describe('CheckboxList props type (family:input-fields FR10)', () => {
  it('accepts container* and control* and no root styling', () => {
    expectFieldInputProps<CheckboxListProps>();
  });
});

describeFieldInputParts('CheckboxList', {
  renderMember: props => (
    <CheckboxList label="Preferences" value={[]} onChange={() => {}} {...props}>
      <CheckboxListItem label="A" value="a" />
    </CheckboxList>
  ),
  getControl: () => screen.getByRole('group'),
  inGroup: false,
});
