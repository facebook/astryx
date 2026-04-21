'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleSingleAccordion() {
  return (
    <XDSCollapsibleGroup type="single" defaultValue="general">
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="General Settings" value="general">
            <p style={{margin: 0}}>
              Configure your general preferences including language, timezone,
              and display options.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Privacy Settings" value="privacy">
            <p style={{margin: 0}}>
              Manage who can see your profile, activity, and personal
              information.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Notification Settings" value="notifications">
            <p style={{margin: 0}}>
              Choose which notifications you receive and how they are delivered.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
