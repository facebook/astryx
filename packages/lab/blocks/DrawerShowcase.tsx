// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Controlled open state for a modal Drawer
 * @output A single-trigger drawer with a scrim and the built-in close button
 * @position Lab Drawer's docsite showcase and copyable CLI block
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Details"
        width={360}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Details</Heading>
            <Text type="body">
              Close with Escape, the scrim, or the close button.
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
