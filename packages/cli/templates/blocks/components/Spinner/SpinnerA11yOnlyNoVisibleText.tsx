'use client';

import {XDSSpinner} from '@xds/core/Spinner';

export default function SpinnerA11yOnlyNoVisibleText() {
  return (
    <XDSSpinner aria-label="Loading data" />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: SpinnerA11yOnlyNoVisibleText,
};
