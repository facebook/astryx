'use client';

import {XDSText} from '@xds/core/Text';

export default function TextBodyText() {
  return (
    <XDSText type="body">Body text content.</XDSText>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TextBodyText,
};
