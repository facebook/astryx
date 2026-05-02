import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

export default function GettingStarted() {
  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>Getting Started</XDSHeading>
        <XDSText type="body" color="secondary">
          Getting started guide coming soon.
        </XDSText>
      </XDSVStack>
    </XDSSection>
  );
}
