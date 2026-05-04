'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function HeadingShowcase() {
  return (
    <XDSVStack gap={2} hAlign="start">
      <XDSHeading level={1}>Heading Level 1</XDSHeading>
      <XDSHeading level={2}>Heading Level 2</XDSHeading>
      <XDSHeading level={3}>Heading Level 3</XDSHeading>
      <XDSHeading level={4}>Heading Level 4</XDSHeading>
      <XDSHeading level={5}>Heading Level 5</XDSHeading>
      <XDSHeading level={6}>Heading Level 6</XDSHeading>
    </XDSVStack>
  );
}
