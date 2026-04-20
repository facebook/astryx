'use client';

import {XDSSpinner} from '@xds/core/Spinner';
import {XDSText} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

export default function SpinnerWithLabel() {
  return (
    <XDSHStack gap={8} vAlign="start">
      <XDSSpinner size="lg" label="Loading..." />
      <XDSSpinner
        size="lg"
        label={
          <XDSVStack gap={0} hAlign="center">
            <XDSText type="body" weight="bold">
              Fetching data
            </XDSText>
            <XDSText type="supporting" color="secondary">
              This may take a moment
            </XDSText>
          </XDSVStack>
        }
        aria-label="Fetching data"
      />
    </XDSHStack>
  );
}
