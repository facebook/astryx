'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

export default function TypographyPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap="space6">
        <XDSHeading level={1}>Typography</XDSHeading>

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Headings</XDSHeading>
          <XDSHeading level={1}>Heading 1</XDSHeading>
          <XDSHeading level={2}>Heading 2</XDSHeading>
          <XDSHeading level={3}>Heading 3</XDSHeading>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Text Variants</XDSHeading>
          <XDSText type="large" weight="bold">
            Large bold text
          </XDSText>
          <XDSText>Default body text</XDSText>
          <XDSText type="detail" color="secondary">
            Detail text in secondary color
          </XDSText>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
