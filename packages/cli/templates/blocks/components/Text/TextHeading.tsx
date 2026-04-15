'use client';

import {XDSHeading} from '@xds/core/Text';

export default function TextHeading() {
  return (
    <XDSHeading level={1}>Page Title</XDSHeading>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TextHeading,
};
