// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {getInputGroupInputAria} from './inputGroupAria';

describe('getInputGroupInputAria', () => {
  it('keeps standalone input labeling Field-driven while composing descriptions', () => {
    expect(
      getInputGroupInputAria({
        inputGroup: null,
        inputLabelID: 'input-label',
        describedByIDs: ['input-help', undefined, 'input-error'],
      }),
    ).toEqual({
      ariaLabelledBy: undefined,
      ariaDescribedBy: 'input-help input-error',
    });
  });

  it('combines group and input labels/descriptions for grouped inputs', () => {
    expect(
      getInputGroupInputAria({
        inputGroup: {
          labelID: 'group-label',
          describedByIDs: 'group-help group-error',
        },
        inputLabelID: 'input-label',
        describedByIDs: ['input-help'],
      }),
    ).toEqual({
      ariaLabelledBy: 'group-label input-label',
      ariaDescribedBy: 'group-help group-error input-help',
    });
  });

  it('deduplicates repeated IDs', () => {
    expect(
      getInputGroupInputAria({
        inputGroup: {
          labelID: 'group-label',
          describedByIDs: 'shared group-error',
        },
        inputLabelID: 'group-label',
        describedByIDs: ['shared', 'input-help'],
      }),
    ).toEqual({
      ariaLabelledBy: 'group-label',
      ariaDescribedBy: 'shared group-error input-help',
    });
  });
});
