// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';

export default function ThemedPage() {
  return (
    <Layout height="fill">
      <LayoutContent padding={5}>
        <div className="flex flex-col gap-4">
          <Heading level={1}>Themed Page</Heading>
          <Text>
            This page uses the Layout component which applies the theme wash color as the background. Tailwind utility classes handle spacing within the content area.
          </Text>
        </div>
      </LayoutContent>
    </Layout>
  );
}
