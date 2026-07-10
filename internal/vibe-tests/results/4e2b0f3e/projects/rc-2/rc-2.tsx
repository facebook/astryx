// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Layout, LayoutPanel, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Divider} from '@astryxdesign/core/Divider';

const navItems = ['Dashboard', 'Analytics', 'Settings', 'Help'];

export default function ResponsiveSidebar() {
  return (
    <Layout
      start={
        <LayoutPanel width={260} hasDivider>
          <div className="flex flex-col gap-2 p-4">
            <Heading level={3}>Navigation</Heading>
            <Divider />
            {navItems.map((item) => (
              <Text key={item} className="py-1">{item}</Text>
            ))}
          </div>
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={4}>
          <div className="flex flex-col gap-4">
            <Heading level={2}>Main Content</Heading>
            <Card padding={4}>
              <Text>This layout has a sidebar for navigation. On smaller viewports, consider adapting to a bottom sheet or overlay pattern using responsive Tailwind utilities.</Text>
            </Card>
          </div>
        </LayoutContent>
      }
    />
  );
}
