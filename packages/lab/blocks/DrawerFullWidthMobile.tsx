// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input A wide desktop budget and isFullWidthOnMobile
 * @output A Drawer that fills the viewport on mobile
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerFullWidthMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open wide drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Wide panel"
        width={560}
        isFullWidthOnMobile>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Wide panel</Heading>
            <Text type="body">
              A wide panel on desktop, the full viewport width on mobile.
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
