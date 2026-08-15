// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';

export default function BottomSheetShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [onSale, setOnSale] = useState(false);

  return (
    <>
      <Button label="Open filters" onClick={() => setIsOpen(true)} />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Filters"
        height="hug">
        <Section padding={4}>
          <VStack gap={4}>
            <Heading level={3}>Filters</Heading>
            <VStack gap={2}>
              <CheckboxInput
                label="In stock"
                value={inStock}
                onChange={setInStock}
              />
              <CheckboxInput
                label="On sale"
                value={onSale}
                onChange={setOnSale}
              />
            </VStack>
            <Button label="Apply filters" onClick={() => setIsOpen(false)} />
          </VStack>
        </Section>
      </BottomSheet>
    </>
  );
}
