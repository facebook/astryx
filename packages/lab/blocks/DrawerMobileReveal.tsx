// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input A 360px width budget and the default mobile sizing
 * @output A Drawer preserving the page reveal on narrow viewports
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerMobileReveal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open mobile drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Mobile reveal"
        width={360}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Mobile reveal</Heading>
            <Text type="body">
              The page remains visible beside the drawer on mobile.
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
