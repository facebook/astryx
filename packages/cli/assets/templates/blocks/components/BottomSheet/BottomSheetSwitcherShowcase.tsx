// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function BottomSheetSwitcherShowcase() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      <Button label="Start setup" onClick={() => setActiveSheet('details')} />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <BottomSheet sheetId="details" label="Setup details" height="capped">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Setup details</Heading>
              <Text type="body">
                Review the settings before continuing to confirmation.
              </Text>
              <Button
                label="Continue"
                onClick={() => setActiveSheet('confirm')}
              />
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm setup" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Confirm setup</Heading>
              <Text type="body">Your settings are ready to save.</Text>
              <Button label="Finish" onClick={() => setActiveSheet(null)} />
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}
