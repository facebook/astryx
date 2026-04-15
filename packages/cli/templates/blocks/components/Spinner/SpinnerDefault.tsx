'use client';

import {XDSSpinner} from '@xds/core/Spinner';

export default function SpinnerDefault() {
  return (
    <XDSSpinner />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: SpinnerDefault,
};
