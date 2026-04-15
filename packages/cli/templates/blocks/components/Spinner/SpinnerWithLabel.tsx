'use client';

import {XDSSpinner} from '@xds/core/Spinner';

export default function SpinnerWithLabel() {
  return (
    <XDSSpinner label="Loading..." />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: SpinnerWithLabel,
};
