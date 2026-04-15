'use client';

import {XDSText} from '@xds/core/Text';

export default function TextTruncatedTextWithTooltip() {
  return (
    <XDSText type="body" maxLines={2}>Very long text that will be clamped after two lines and show a tooltip on hover.</XDSText>
  );
}
