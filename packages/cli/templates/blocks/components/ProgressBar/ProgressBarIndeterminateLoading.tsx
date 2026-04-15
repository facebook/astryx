'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarIndeterminateLoading() {
  return <XDSProgressBar isIndeterminate label="Loading..." />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarIndeterminateLoading,
};
