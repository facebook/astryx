// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Layout, LayoutHeader, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';

const navSections = ['General', 'Notifications', 'Security', 'Billing'];

export default function SettingsDashboard() {
  return (
    <Layout height="fill">
      <LayoutHeader hasDivider>
        <div className="flex items-center px-4 py-2">
          <Heading level={1}>Settings</Heading>
        </div>
      </LayoutHeader>
      <Layout
        start={
          <LayoutPanel width={220} hasDivider>
            <div className="flex flex-col gap-2 p-4">
              {navSections.map((section) => (
                <Text key={section} weight="medium">{section}</Text>
              ))}
            </div>
          </LayoutPanel>
        }
        content={
          <LayoutContent padding={5}>
            <div className="flex flex-col gap-5">
              <Card padding={4}>
                <div className="flex flex-col gap-3">
                  <Heading level={3}>General</Heading>
                  <Divider />
                  <Text>Manage your account settings and preferences.</Text>
                </div>
              </Card>
              <Card padding={4}>
                <div className="flex flex-col gap-3">
                  <Heading level={3}>Notifications</Heading>
                  <Divider />
                  <Text>Configure how and when you receive notifications.</Text>
                </div>
              </Card>
            </div>
          </LayoutContent>
        }
      />
    </Layout>
  );
}
