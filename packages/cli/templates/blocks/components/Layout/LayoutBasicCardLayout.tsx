'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function LayoutBasicCardLayout() {
  return (
    <XDSCard height={300} width="100%" style={{maxWidth: 400}}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={4}>Card Title</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={3}>
              <XDSText type="body">
                This is a basic card layout with a header, scrollable content
                area, and footer. The layout automatically handles padding and
                spacing between sections.
              </XDSText>
              <XDSText type="body">
                When content exceeds the available height, the content area
                scrolls independently while the header and footer stay fixed in
                place.
              </XDSText>
              <XDSText type="body">
                This pattern works well for modal dialogs, detail panels, and
                any card where the amount of content is unpredictable.
              </XDSText>
              <XDSText type="body">
                The dividers between header, content, and footer provide clear
                visual boundaries between the fixed and scrollable regions.
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
              <XDSButton label="Save" variant="primary">
                Save
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
