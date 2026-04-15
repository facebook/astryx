'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSText} from '@xds/core/Text';

export default function SpinnerRichLabelWithComposition() {
  return (
    <XDSSpinner
      size="lg"
      label={
        <XDSVStack gap={0} hAlign="center">
          <XDSText type="body" weight="bold">Fetching data</XDSText>
          <XDSText type="supporting" color="secondary">This may take a moment</XDSText>
        </XDSVStack>
      }
      aria-label="Fetching data"
    />
  );
}
