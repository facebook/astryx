import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme/default';
import {
  XDSAppShell,
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSSideNav,
  XDSSideNavSection,
  XDSSideNavItem,
} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';
import {XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';

function SettingsContent() {
  return (
    <XDSVStack gap={6}>
      <XDSHeading level={1}>General Settings</XDSHeading>

      <XDSCard>
        <XDSVStack gap={4}>
          <XDSHeading level={3}>Profile</XDSHeading>
          <XDSTextInput label="Display Name" />
          <XDSTextInput label="Email Address" />
          <XDSDivider />
          <XDSHeading level={3}>Preferences</XDSHeading>
          <XDSSwitch label="Enable email notifications" />
          <XDSSwitch label="Dark mode" />
          <XDSSwitch label="Show online status" />
        </XDSVStack>
      </XDSCard>

      <XDSCard>
        <XDSVStack gap={4}>
          <XDSHeading level={3}>Privacy</XDSHeading>
          <XDSSwitch label="Make profile public" />
          <XDSSwitch label="Allow search engines to index profile" />
          <XDSText type="supporting">
            These settings control how others can find and view your profile.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSVStack>
  );
}

export default function SettingsDashboard() {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSAppShell
        contentPadding={4}
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="Settings Dashboard" />}
            startContent={
              <>
                <XDSTopNavItem label="Home" href="/" />
                <XDSTopNavItem label="Settings" href="/settings" isSelected />
              </>
            }
          />
        }
        sideNav={
          <XDSSideNav>
            <XDSSideNavSection title="Settings" isHeaderHidden>
              <XDSSideNavItem label="General" isSelected href="/settings/general" />
              <XDSSideNavItem label="Account" href="/settings/account" />
              <XDSSideNavItem label="Notifications" href="/settings/notifications" />
              <XDSSideNavItem label="Privacy" href="/settings/privacy" />
              <XDSSideNavItem label="Security" href="/settings/security" />
            </XDSSideNavSection>
            <XDSSideNavSection title="Advanced">
              <XDSSideNavItem label="API Keys" href="/settings/api-keys" />
              <XDSSideNavItem label="Integrations" href="/settings/integrations" />
              <XDSSideNavItem label="Danger Zone" href="/settings/danger" />
            </XDSSideNavSection>
          </XDSSideNav>
        }>
        <SettingsContent />
      </XDSAppShell>
    </XDSTheme>
  );
}
