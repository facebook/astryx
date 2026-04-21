'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleSingleAccordion() {
  return (
    <XDSCollapsibleGroup type="single" defaultValue="general">
      <XDSVStack gap={2}>
        <XDSCard width="100%">
          <XDSCollapsible trigger="General Settings" value="general">
            <XDSText type="body">
              Configure your general preferences including language, timezone,
              and display options.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard width="100%">
          <XDSCollapsible trigger="Privacy Settings" value="privacy">
            <XDSText type="body">
              Manage who can see your profile, activity, and personal
              information.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard width="100%">
          <XDSCollapsible trigger="Notification Settings" value="notifications">
            <XDSText type="body">
              Choose which notifications you receive and how they are delivered.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
