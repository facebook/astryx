'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSText} from '@xds/core/Text';

export default function ProgressBarComposedWithExternalDescription() {
  return (
    <div>
      <XDSProgressBar
        value={40}
        max={100}
        label="Download progress"
        hasValueLabel
      />
      <XDSText type="body" color="secondary" size="sm">
        40 MB / 100 MB downloaded
      </XDSText>
    </div>
  );
}
