'use client';

import {XDSText} from '@xds/core/Text';

export default function TextSupportingText() {
  return (
    <XDSText type="supporting">Helper text beneath a field.</XDSText>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TextSupportingText,
};
