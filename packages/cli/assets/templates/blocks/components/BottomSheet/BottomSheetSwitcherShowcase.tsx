// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function BottomSheetSwitcherShowcase() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      <Button label="Start setup" onClick={() => setActiveSheet('details')} />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <BottomSheet sheetId="details" label="Setup details" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Setup details</Heading>
              <Text type="body">
                Add the essential information for this setup.
              </Text>
              <Text type="supporting" color="secondary">
                You can review these details before saving.
              </Text>
              <Button
                label="Continue"
                onClick={() => setActiveSheet('preferences')}
              />
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          sheetId="preferences"
          label="Choose preferences"
          height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Choose preferences</Heading>
              <Text type="body">Select how this setup should behave.</Text>
              <Text type="supporting" color="secondary">
                Notifications can be sent immediately, daily, or weekly.
              </Text>
              <Text type="supporting" color="secondary">
                You can update these preferences later.
              </Text>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActiveSheet('details')}
                />
                <Button
                  label="Continue"
                  onClick={() => setActiveSheet('confirm')}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm setup" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Confirm setup</Heading>
              <Text type="body">Everything is ready to save.</Text>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActiveSheet('preferences')}
                />
                <Button label="Finish" onClick={() => setActiveSheet(null)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}
