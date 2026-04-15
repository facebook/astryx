'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSLayout} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

export default function ProgressBarComposedWithStatusIcon() {
  return (
    // @ts-expect-error migrated example
    <XDSLayout direction="column" gap="1">
      <XDSProgressBar
        value={100}
        label="Upload complete"
        variant="positive"
        hasValueLabel
      />
      // @ts-expect-error migrated example
      <XDSLayout direction="row" gap="1" align="center">
        <XDSIcon icon={CheckCircleIcon} color="positive" size="sm" />
        <XDSText type="body" color="secondary" size="sm">
          Upload complete
        </XDSText>
      </XDSLayout>
    </XDSLayout>
  );
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarComposedWithStatusIcon,
};
