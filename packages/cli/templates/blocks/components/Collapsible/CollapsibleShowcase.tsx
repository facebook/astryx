'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';

export default function CollapsibleShowcase() {
  return (
    <XDSCard width={400}>
      <XDSCollapsibleGroup type="single" defaultValue="notifications">
        <XDSCollapsible trigger="General settings" value="general">
          <XDSStack direction="vertical" gap={3}>
            <XDSText type="body" color="secondary">
              Configure your display name, language, and time zone preferences.
            </XDSText>
          </XDSStack>
        </XDSCollapsible>
        <XDSCollapsible trigger="Notifications" value="notifications">
          <XDSStack direction="vertical" gap={3}>
            <XDSText type="body" color="secondary">
              Choose which email and push notifications you want to receive.
            </XDSText>
          </XDSStack>
        </XDSCollapsible>
        <XDSCollapsible trigger="Privacy" value="privacy">
          <XDSStack direction="vertical" gap={3}>
            <XDSText type="body" color="secondary">
              Manage your data sharing preferences and account visibility.
            </XDSText>
          </XDSStack>
        </XDSCollapsible>
      </XDSCollapsibleGroup>
    </XDSCard>
  );
}
