'use client';

import {XDSText} from '@xds/core/Text';

export default function TextShowcase() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <XDSText type="body">Body: The bulk of content</XDSText>
      <XDSText type="large">Large: Emphasized content</XDSText>
      <XDSText type="label">Label: Form and chart labels</XDSText>
      <XDSText type="supporting">Supporting: Helper text</XDSText>
      <XDSText type="code">Code: const x = 42;</XDSText>
    </div>
  );
}
