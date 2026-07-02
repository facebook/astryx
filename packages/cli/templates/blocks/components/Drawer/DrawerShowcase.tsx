// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Drawer} from '@astryxdesign/core/Drawer';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function DrawerShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button label="Open inspector" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label="Deployment details"
        size={400}>
        <Section padding={4}>
          <VStack gap={4}>
            <VStack gap={1}>
              {/* Modal drawers render a built-in close button */}
              <Heading level={3}>web-prod-04</Heading>
              <Text type="supporting" color="secondary">
                us-east-1 · deployed 12 minutes ago
              </Text>
            </VStack>
            <Divider />
            <VStack gap={2}>
              <Text type="label">Status</Text>
              <Text type="body">
                Healthy — all 6 instances passing readiness checks.
              </Text>
            </VStack>
            <VStack gap={2}>
              <Text type="label">Build</Text>
              <Text type="body">#4821 · main @ 03536f1</Text>
            </VStack>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
