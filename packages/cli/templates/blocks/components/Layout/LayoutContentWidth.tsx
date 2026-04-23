'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function LayoutContentWidth() {
  return (
    <XDSLayout
      height="fill"
      contentWidth={360}
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHeading level={4}>Centered Form</XDSHeading>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent>
          <XDSVStack gap={3}>
            <XDSText type="body">
              The contentWidth prop constrains content to a maximum width and
              centers it within the layout. Dividers remain full-bleed while
              content stays narrow and readable.
            </XDSText>
            <XDSText type="body" color="secondary">
              Common widths: 640 for forms, 960 for content pages.
            </XDSText>
          </XDSVStack>
        </XDSLayoutContent>
      }
      footer={
        <XDSLayoutFooter hasDivider>
          <XDSHStack gap={2} hAlign="end">
            <XDSButton label="Cancel" variant="secondary">
              Cancel
            </XDSButton>
            <XDSButton label="Submit" variant="primary">
              Submit
            </XDSButton>
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );
}
