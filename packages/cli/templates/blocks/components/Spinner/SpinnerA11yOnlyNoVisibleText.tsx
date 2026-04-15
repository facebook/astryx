'use client';

import {XDSSpinner} from '@xds/core/Spinner';

export default function SpinnerA11yOnlyNoVisibleText() {
  return (
    <XDSSpinner aria-label="Loading data" />
  );
}
