// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/VStack';

export default function ThemedPage() {
  return (
    <Layout height="fill">
      <LayoutContent padding={5}>
        <VStack gap={4}>
          <Heading level={1}>Themed Page</Heading>
          <Text>
            This page uses the Layout component which automatically applies the theme wash color as the background. The LayoutContent area receives proper padding and scrollable overflow.
          </Text>
        </VStack>
      </LayoutContent>
    </Layout>
  );
}
