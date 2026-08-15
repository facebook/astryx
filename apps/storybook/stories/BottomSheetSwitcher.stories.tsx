// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

const meta: Meta<typeof BottomSheetSwitcher> = {
  title: 'Lab/BottomSheetSwitcher',
  component: BottomSheetSwitcher,
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
type Story = StoryObj<typeof BottomSheetSwitcher>;

interface NotificationOverviewSheetProps {
  onCancel: () => void;
  onContinue: () => void;
}

function NotificationOverviewSheet({
  onCancel,
  onContinue,
}: NotificationOverviewSheetProps) {
  return (
    <BottomSheet sheetId="overview" label="Set up notifications" height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Set up notifications</Heading>
            <Text type="supporting" color="secondary">
              Step 1 of 3
            </Text>
          </VStack>
          <Divider />
          <Text type="supporting" color="secondary">
            Stay informed about activity that matters without checking back
            throughout the day.
          </Text>
          <VStack gap={3}>
            <VStack gap={1}>
              <Text type="label">Important activity</Text>
              <Text type="supporting" color="secondary">
                Know when someone mentions you or needs your attention.
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text type="label">Timely reminders</Text>
              <Text type="supporting" color="secondary">
                Get a reminder before work reaches its due date.
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text type="label">Useful summaries</Text>
              <Text type="supporting" color="secondary">
                Catch up on anything you may have missed.
              </Text>
            </VStack>
          </VStack>
          <HStack gap={2} hAlign="end">
            <Button label="Cancel" variant="secondary" onClick={onCancel} />
            <Button label="Continue" onClick={onContinue} />
          </HStack>
        </VStack>
      </Section>
    </BottomSheet>
  );
}

interface NotificationFrequencySheetProps {
  onBack: () => void;
  onContinue: () => void;
}

function NotificationFrequencySheet({
  onBack,
  onContinue,
}: NotificationFrequencySheetProps) {
  const [frequency, setFrequency] = useState('daily');

  return (
    <BottomSheet
      sheetId="frequency"
      label="Notification frequency"
      height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>How often?</Heading>
            <Text type="supporting" color="secondary">
              Step 2 of 3
            </Text>
          </VStack>
          <Divider />
          <RadioList
            label="Notification frequency"
            isLabelHidden
            value={frequency}
            onChange={setFrequency}>
            <RadioListItem label="Immediately" value="immediately" />
            <RadioListItem label="Daily" value="daily" />
            <RadioListItem label="Weekly" value="weekly" />
          </RadioList>
          <HStack gap={2} hAlign="end">
            <Button label="Back" variant="secondary" onClick={onBack} />
            <Button label="Continue" onClick={onContinue} />
          </HStack>
        </VStack>
      </Section>
    </BottomSheet>
  );
}

interface NotificationChannelsSheetProps {
  onBack: () => void;
  onFinish: () => void;
}

function NotificationChannelsSheet({
  onBack,
  onFinish,
}: NotificationChannelsSheetProps) {
  const [email, setEmail] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textMessages, setTextMessages] = useState(false);

  return (
    <BottomSheet sheetId="channels" label="Notification channels" height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Where should we notify you?</Heading>
            <Text type="supporting" color="secondary">
              Step 3 of 3
            </Text>
          </VStack>
          <Divider />
          <Text type="supporting" color="secondary">
            Choose any combination. You can change these preferences later.
          </Text>
          <VStack gap={2}>
            <CheckboxInput label="Email" value={email} onChange={setEmail} />
            <CheckboxInput
              label="Push notifications"
              value={pushNotifications}
              onChange={setPushNotifications}
            />
            <CheckboxInput
              label="Text messages"
              value={textMessages}
              onChange={setTextMessages}
            />
          </VStack>
          <HStack gap={2} hAlign="end">
            <Button label="Back" variant="secondary" onClick={onBack} />
            <Button label="Finish" onClick={onFinish} />
          </HStack>
        </VStack>
      </Section>
    </BottomSheet>
  );
}

function MultiStepSwitcherExample() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      <Button
        label="Set up notifications"
        onClick={() => setActiveSheet('overview')}
      />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <NotificationOverviewSheet
          onCancel={() => setActiveSheet(null)}
          onContinue={() => setActiveSheet('frequency')}
        />
        <NotificationFrequencySheet
          onBack={() => setActiveSheet('overview')}
          onContinue={() => setActiveSheet('channels')}
        />
        <NotificationChannelsSheet
          onBack={() => setActiveSheet('frequency')}
          onFinish={() => setActiveSheet(null)}
        />
      </BottomSheetSwitcher>
    </>
  );
}

export const MultiStep: Story = {
  name: 'Notification setup',
  render: () => <MultiStepSwitcherExample />,
};
