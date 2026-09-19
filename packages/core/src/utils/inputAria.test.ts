// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {getInputARIA} from './inputAria';

describe('getInputARIA', () => {
  it('keeps standalone input labeling native while composing descriptions', () => {
    expect(
      getInputARIA('input-label', ['input-help', undefined, 'input-error']),
    ).toEqual({
      ariaLabelledBy: undefined,
      ariaDescribedBy: 'input-help input-error',
    });
  });

  it('composes InputGroup context before input labels and descriptions', () => {
    expect(
      getInputARIA('input-label', ['input-help'], {
        labelID: 'group-label',
        describedByIDs: 'group-help group-error',
      }),
    ).toEqual({
      ariaLabelledBy: 'group-label input-label',
      ariaDescribedBy: 'group-help group-error input-help',
    });
  });

  it('deduplicates repeated IDs', () => {
    expect(
      getInputARIA('group-label', ['shared', 'input-help'], {
        labelID: 'group-label',
        describedByIDs: 'shared group-error',
      }),
    ).toEqual({
      ariaLabelledBy: 'group-label',
      ariaDescribedBy: 'shared group-error input-help',
    });
  });
});
