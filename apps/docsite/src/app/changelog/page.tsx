/**
 * Page type: changelog
 * Version history from CHANGELOG.md files across packages.
 * TODO: port generate-changelog.js into the data pipeline.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

export default function ChangelogPage() {
  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>Changelog</XDSHeading>
        <XDSText type="body" color="secondary">
          Version history coming soon.
        </XDSText>
        {/* TODO: render from changelogRegistry once ported to pipeline */}
      </XDSVStack>
    </XDSSection>
  );
}
