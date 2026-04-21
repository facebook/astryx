'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerVariants() {
  return (
    <XDSVStack gap={6}>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          Subtle (default)
        </XDSText>
        <XDSDivider />
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          Strong
        </XDSText>
        <XDSDivider variant="strong" />
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          With label
        </XDSText>
        <XDSDivider label="or" />
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          Strong with label
        </XDSText>
        <XDSDivider variant="strong" label="Section 2" />
      </XDSVStack>
    </XDSVStack>
  );
}
