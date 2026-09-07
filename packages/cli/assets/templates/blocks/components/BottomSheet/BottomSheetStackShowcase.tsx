// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function BottomSheetStackShowcase() {
  const [openSheetIds, setOpenSheetIds] = useState<ReadonlyArray<string>>([]);
  const push = (sheetId: string) =>
    setOpenSheetIds(current => [...current, sheetId]);
  const pop = () =>
    setOpenSheetIds(current => current.slice(0, current.length - 1));

  return (
    <>
      <Button label="Open inbox" onClick={() => setOpenSheetIds(['inbox'])} />
      <BottomSheetStack
        openSheetIds={openSheetIds}
        onOpenSheetIdsChange={setOpenSheetIds}>
        <BottomSheet sheetId="inbox" label="Inbox" height="capped">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Inbox</Heading>
                <Text type="supporting" color="secondary">
                  Select a message to preserve this list beneath its details.
                </Text>
              </VStack>
              <Divider />
              <Button
                label="Review release request"
                variant="secondary"
                onClick={() => push('message')}
              />
              <Button
                label="Close"
                variant="ghost"
                onClick={() => setOpenSheetIds([])}
              />
            </VStack>
          </Section>
        </BottomSheet>

        <BottomSheet sheetId="message" label="Release request" height="capped">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Release request</Heading>
                <Text type="supporting" color="secondary">
                  The Inbox stays mounted, inert, and visible beneath this
                  sheet.
                </Text>
              </VStack>
              <Divider />
              <Text>Version 3.4 is ready for review.</Text>
              <HStack gap={2} hAlign="end">
                <Button label="Back" variant="secondary" onClick={pop} />
                <Button label="Approve" onClick={() => setOpenSheetIds([])} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetStack>
    </>
  );
}
