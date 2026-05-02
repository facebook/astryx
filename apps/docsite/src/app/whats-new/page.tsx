import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

export default function WhatsNew() {
  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>What's New</XDSHeading>
        <XDSText type="body" color="secondary">
          Changelog coming soon.
        </XDSText>
      </XDSVStack>
    </XDSSection>
  );
}
