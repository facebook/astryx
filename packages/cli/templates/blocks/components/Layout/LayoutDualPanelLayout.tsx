'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function LayoutDualPanelLayout() {
  return (
    <XDSCard>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={4}>File Browser</XDSHeading>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider>
            <XDSVStack gap={1}>
              <XDSText type="label" color="secondary">
                Folders
              </XDSText>
              <XDSList>
                <XDSListItem label="Documents" />
                <XDSListItem label="Projects" isSelected />
                <XDSListItem label="Downloads" />
              </XDSList>
            </XDSVStack>
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <XDSText type="label" color="secondary">
                Files
              </XDSText>
              <XDSCard variant="muted">
                <XDSText type="body">
                  Select a folder to view its contents
                </XDSText>
              </XDSCard>
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={
          <XDSLayoutPanel hasDivider>
            <XDSVStack gap={2}>
              <XDSText type="label" color="secondary">
                Details
              </XDSText>
              <XDSText type="body">Select a file to view details</XDSText>
            </XDSVStack>
          </XDSLayoutPanel>
        }
      />
    </XDSCard>
  );
}
