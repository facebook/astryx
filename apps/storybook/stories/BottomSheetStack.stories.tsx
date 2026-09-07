// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof BottomSheetStack> = {
  title: 'Core/BottomSheetStack',
  component: BottomSheetStack,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {inline: false, height: '560px'},
    },
  },
  decorators: [
    Story => (
      <div style={{minHeight: 480, padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomSheetStack>;

function StackExample() {
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
                  Select a message to inspect it without losing the list.
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
                  The Inbox remains mounted and visible beneath this sheet.
                </Text>
              </VStack>
              <Divider />
              <Text>
                Version 3.4 is ready for review. Inspect the available actions
                before deciding what to do next.
              </Text>
              <HStack gap={2} hAlign="end">
                <Button label="Back" variant="secondary" onClick={pop} />
                <Button label="View actions" onClick={() => push('actions')} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>

        <BottomSheet sheetId="actions" label="Release actions" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Release actions</Heading>
                <Text type="supporting" color="secondary">
                  Three logical levels are open; only this sheet is interactive.
                </Text>
              </VStack>
              <Divider />
              <HStack gap={2} hAlign="end">
                <Button label="Back" variant="secondary" onClick={pop} />
                <Button
                  label="Approve and close"
                  onClick={() => setOpenSheetIds([])}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetStack>
    </>
  );
}

export const Default: Story = {
  render: () => <StackExample />,
};
