// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Separate controlled states for modal and non-modal drawers
 * @output A comparison of hasScrim's two presentations
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerScrim() {
  const [openModal, setOpenModal] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);

  return (
    <>
      <HStack gap={2}>
        <Button label="Open modal drawer" onClick={() => setOpenModal(true)} />
        <Button
          label="Open non-modal drawer"
          onClick={() => setOpenPanel(true)}
        />
      </HStack>
      <Drawer
        isOpen={openModal}
        onOpenChange={setOpenModal}
        label="Edit details">
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Edit details</Heading>
            <Text type="body">
              The scrim blocks the page behind this modal drawer.
            </Text>
          </VStack>
        </Section>
      </Drawer>
      <Drawer
        isOpen={openPanel}
        onOpenChange={setOpenPanel}
        label="Inspector"
        hasScrim={false}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Inspector</Heading>
            <Text type="body">
              The page behind this non-modal drawer stays interactive.
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
