'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';

export default function CollapsibleShowcase() {
  return (
    <XDSCard width={400}>
      <XDSCollapsibleGroup type="single" defaultValue="general">
        <XDSCollapsible trigger="General settings" value="general">
          <XDSText type="body" color="secondary">
            Configure your display name, language, and time zone preferences.
          </XDSText>
        </XDSCollapsible>
        <XDSCollapsible trigger="Notifications" value="notifications">
          <XDSText type="body" color="secondary">
            Choose which email and push notifications you want to receive.
          </XDSText>
        </XDSCollapsible>
        <XDSCollapsible trigger="Privacy" value="privacy">
          <XDSText type="body" color="secondary">
            Manage your data sharing preferences and account visibility.
          </XDSText>
        </XDSCollapsible>
      </XDSCollapsibleGroup>
    </XDSCard>
  );
}
