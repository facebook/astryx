// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Drawer} from '@astryxdesign/core/Drawer';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const REGIONS = ['us-east-1', 'eu-west-1', 'ap-south-1'];

// Bottom sheet: side="bottom" renders a full-width sheet sliding from the
// bottom edge; size caps its height (any CSS length works, e.g. '40dvh').
export default function DrawerBottomSheetDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(REGIONS.slice(0, 1));
  return (
    <>
      <Button label="Filter regions" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label="Region filters"
        side="bottom"
        size="40dvh">
        <Section padding={4}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={3}>Filter by region</Heading>
              <Text type="supporting" color="secondary">
                Showing hosts in {selected.length} of {REGIONS.length} regions
              </Text>
            </VStack>
            <VStack gap={2}>
              {REGIONS.map(region => (
                <CheckboxInput
                  key={region}
                  label={region}
                  value={selected.includes(region)}
                  onChange={checked =>
                    setSelected(current =>
                      checked
                        ? [...current, region]
                        : current.filter(r => r !== region),
                    )
                  }
                />
              ))}
            </VStack>
            <Button
              label="Apply filters"
              onClick={() => setIsOpen(false)}
              data-autofocus
            />
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
