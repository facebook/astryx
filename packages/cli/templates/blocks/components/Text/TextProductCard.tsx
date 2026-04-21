'use client';

import {XDSText} from '@xds/core/Text';

export default function TextProductCard() {
  return (
    <div
      style={{
        maxWidth: 300,
        padding: 16,
        borderRadius: 8,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
      <XDSText type="label" display="block">
        Product Name
      </XDSText>
      <XDSText type="body" maxLines={2} display="block">
        This is a product description that might be quite long and needs to be
        truncated after two lines to keep the card compact.
      </XDSText>
      <XDSText type="supporting" display="block">
        Updated 5 minutes ago
      </XDSText>
    </div>
  );
}
