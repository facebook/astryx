// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

/**
 * The BottomSheetSwitcher stories rebuilt with standalone sheets only: one
 * `isOpen` per step, no `BottomSheetSwitcher` and no `sheetId`. Each story
 * mirrors the switcher story of the same name (content, labels, heights,
 * steps) so the two can be compared one to one. Moving from one step to the
 * next closes one sheet and opens the next in the same update, which the
 * sheets run as a replace handoff.
 */
const meta: Meta<typeof BottomSheet> = {
  title: 'Core/BottomSheetReplace',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {inline: false, height: '560px'},
    },
  },
  argTypes: {
    ref: {control: false},
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
type Story = StoryObj<typeof BottomSheet>;
type NotificationSheetHeight = 'hug' | 'capped';
type NotificationStep = 'overview' | 'frequency' | 'channels';

interface NotificationStepSheetProps {
  isOpen: boolean;
  /** Called with false when the step requests dismissal (Escape, scrim, swipe). */
  onOpenChange: (isOpen: boolean) => void;
  hasScrim: boolean;
}

interface NotificationOverviewSheetProps extends NotificationStepSheetProps {
  height: NotificationSheetHeight;
  onCancel: () => void;
  onContinue: () => void;
}

function NotificationOverviewSheet({
  isOpen,
  onOpenChange,
  hasScrim,
  height,
  onCancel,
  onContinue,
}: NotificationOverviewSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hasScrim={hasScrim}
      label="Set up notifications"
      height={height}>
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

interface NotificationFrequencySheetProps extends NotificationStepSheetProps {
  height: NotificationSheetHeight;
  onBack: () => void;
  onContinue: () => void;
}

function NotificationFrequencySheet({
  isOpen,
  onOpenChange,
  hasScrim,
  height,
  onBack,
  onContinue,
}: NotificationFrequencySheetProps) {
  const [frequency, setFrequency] = useState('daily');

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hasScrim={hasScrim}
      label="Notification frequency"
      height={height}>
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

interface NotificationChannelsSheetProps extends NotificationStepSheetProps {
  height: NotificationSheetHeight;
  onBack: () => void;
  onFinish: () => void;
}

function NotificationChannelsSheet({
  isOpen,
  onOpenChange,
  hasScrim,
  height,
  onBack,
  onFinish,
}: NotificationChannelsSheetProps) {
  const [email, setEmail] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textMessages, setTextMessages] = useState(false);

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hasScrim={hasScrim}
      label="Notification channels"
      height={height}>
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

interface MultiStepReplaceExampleProps {
  height: NotificationSheetHeight;
  hasScrim?: boolean;
}

function MultiStepReplaceExample({
  height,
  hasScrim = true,
}: MultiStepReplaceExampleProps) {
  // One value names the open step, so moving on closes one sheet and opens
  // the next in the same update. A step that is dismissed closes the flow.
  const [step, setStep] = useState<NotificationStep | null>(null);
  const stepProps = (own: NotificationStep): NotificationStepSheetProps => ({
    isOpen: step === own,
    onOpenChange: isOpen => {
      if (!isOpen) {
        setStep(current => (current === own ? null : current));
      }
    },
    hasScrim,
  });

  return (
    <>
      <Button
        label="Set up notifications"
        onClick={() => setStep('overview')}
      />
      <NotificationOverviewSheet
        {...stepProps('overview')}
        height={height}
        onCancel={() => setStep(null)}
        onContinue={() => setStep('frequency')}
      />
      <NotificationFrequencySheet
        {...stepProps('frequency')}
        height={height}
        onBack={() => setStep('overview')}
        onContinue={() => setStep('channels')}
      />
      <NotificationChannelsSheet
        {...stepProps('channels')}
        height={height}
        onBack={() => setStep('frequency')}
        onFinish={() => setStep(null)}
      />
    </>
  );
}

const openFlow: NonNullable<Story['play']> = async ({canvasElement}) => {
  const trigger = canvasElement.querySelector('button');
  if (trigger instanceof HTMLElement) {
    trigger.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

export const HugContent: Story = {
  name: 'Hug content',
  render: () => <MultiStepReplaceExample height="hug" />,
  play: openFlow,
};

export const Capped: Story = {
  render: () => <MultiStepReplaceExample height="capped" />,
  play: openFlow,
};

export const NoScrim: Story = {
  name: 'No scrim',
  render: () => <MultiStepReplaceExample height="hug" hasScrim={false} />,
  play: openFlow,
};

export const NarrowViewport: Story = {
  name: 'Narrow viewport',
  parameters: {viewport: {defaultViewport: 'mobile1'}},
  render: () => <MultiStepReplaceExample height="hug" />,
  play: openFlow,
};
