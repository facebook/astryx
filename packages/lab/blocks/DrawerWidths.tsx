// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input A pixel, rem, or percentage width and controlled open state
 * @output A Drawer demonstrating the selected width budget
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerWidths() {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState<number | string>(320);

  function openAtWidth(value: number | string) {
    setWidth(value);
    setIsOpen(true);
  }

  return (
    <>
      <HStack gap={2}>
        <Button label="320px" onClick={() => openAtWidth(320)} />
        <Button label="32rem" onClick={() => openAtWidth('32rem')} />
        <Button label="50%" onClick={() => openAtWidth('50%')} />
      </HStack>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Width budget"
        width={width}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Width budget</Heading>
            <Text type="body">
              Width: {typeof width === 'number' ? `${width}px` : width}
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
