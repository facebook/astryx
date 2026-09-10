// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';

export default function BottomSheetShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  return (
    <>
      <Button label="Open sheet" onClick={() => setIsOpen(true)} />
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Filters">
        <Section padding={4}>
          <VStack gap={4}>
            <Heading level={3}>Filters</Heading>
            <Divider />
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
              <CheckboxInput
                label="Free shipping"
                value={freeShipping}
                onChange={setFreeShipping}
              />
            </VStack>
            <Button label="Apply" onClick={() => setIsOpen(false)} />
          </VStack>
        </Section>
      </BottomSheet>
    </>
  );
}
