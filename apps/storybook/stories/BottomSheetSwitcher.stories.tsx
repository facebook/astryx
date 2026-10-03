// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

const meta: Meta<typeof BottomSheetSwitcher> = {
  title: 'Core/BottomSheetSwitcher',
  component: BottomSheetSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {inline: false, height: '560px'},
    },
  },
  argTypes: {
    ref: {control: false},
    onCancel: {control: false},
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
type NotificationSheetHeight = 'hug' | 'capped';

interface NotificationOverviewSheetProps {
  height: NotificationSheetHeight;
  onCancel: () => void;
  onContinue: () => void;
  /** Pushes a stacked help sheet above this step (activeSheets flows). */
  onHelp?: () => void;
}

function NotificationOverviewSheet({
  height,
  onCancel,
  onContinue,
  onHelp,
}: NotificationOverviewSheetProps) {
  return (
    <BottomSheet
      sheetId="overview"
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
          {onHelp != null && (
            <Button
              label="How do notifications work?"
              variant="secondary"
              onClick={onHelp}
            />
          )}
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
  height: NotificationSheetHeight;
  onBack: () => void;
  onContinue: () => void;
}

function NotificationFrequencySheet({
  height,
  onBack,
  onContinue,
}: NotificationFrequencySheetProps) {
  const [frequency, setFrequency] = useState('daily');

  return (
    <BottomSheet
      sheetId="frequency"
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

interface NotificationChannelsSheetProps {
  height: NotificationSheetHeight;
  onBack: () => void;
  onFinish: () => void;
}

function NotificationChannelsSheet({
  height,
  onBack,
  onFinish,
}: NotificationChannelsSheetProps) {
  const [email, setEmail] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textMessages, setTextMessages] = useState(false);

  return (
    <BottomSheet
      sheetId="channels"
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

interface MultiStepSwitcherExampleProps {
  height: NotificationSheetHeight;
  hasScrim?: boolean;
}

function MultiStepSwitcherExample({
  height,
  hasScrim = true,
}: MultiStepSwitcherExampleProps) {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      <Button
        label="Set up notifications"
        onClick={() => setActiveSheet('overview')}
      />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}
        hasScrim={hasScrim}>
        <NotificationOverviewSheet
          height={height}
          onCancel={() => setActiveSheet(null)}
          onContinue={() => setActiveSheet('frequency')}
        />
        <NotificationFrequencySheet
          height={height}
          onBack={() => setActiveSheet('overview')}
          onContinue={() => setActiveSheet('channels')}
        />
        <NotificationChannelsSheet
          height={height}
          onBack={() => setActiveSheet('frequency')}
          onFinish={() => setActiveSheet(null)}
        />
      </BottomSheetSwitcher>
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

/**
 * The unified flow on the ordered `activeSheets` path: the same three setup
 * steps as the singular flow (each step replaces the last), plus a stacked
 * help sheet pushed above step 1 — the covered step stays mounted and recedes
 * behind it, and Back pops one level.
 */
function MultiStepPathExample({
  initialSheets,
}: {
  initialSheets: ReadonlyArray<string>;
}) {
  const [activeSheets, setActiveSheets] =
    useState<ReadonlyArray<string>>(initialSheets);

  return (
    <>
      <Button
        label="Set up notifications"
        onClick={() => setActiveSheets(['overview'])}
      />
      <BottomSheetSwitcher
        activeSheets={activeSheets}
        onActiveSheetsChange={setActiveSheets}>
        {/* Hug-height help content sized to closely match the first step's
            natural height, so the covered step's recede reads clearly behind
            it (prototype parity pending spec:AST-044 OQ5). */}
        <NotificationOverviewSheet
          height="hug"
          onCancel={() => setActiveSheets([])}
          onContinue={() => setActiveSheets(['frequency'])}
          onHelp={() => setActiveSheets(['overview', 'help'])}
        />
        <BottomSheet sheetId="help" label="How notifications work" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>How notifications work</Heading>
                <Text type="supporting" color="secondary">
                  Stacked above step 1
                </Text>
              </VStack>
              <Divider />
              <Text type="supporting" color="secondary">
                This sheet is stacked on the ordered path: the first step stays
                mounted and recedes behind it, keeping your place.
              </Text>
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text type="label">Back returns one level</Text>
                  <Text type="supporting" color="secondary">
                    Popping the path reveals the step below with its state and
                    focus intact.
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text type="label">Private by default</Text>
                  <Text type="supporting" color="secondary">
                    Notifications never share your activity with other people.
                  </Text>
                </VStack>
              </VStack>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Back"
                  onClick={() =>
                    setActiveSheets(current => current.slice(0, -1))
                  }
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <NotificationFrequencySheet
          height="hug"
          onBack={() => setActiveSheets(['overview'])}
          onContinue={() => setActiveSheets(['channels'])}
        />
        <NotificationChannelsSheet
          height="hug"
          onBack={() => setActiveSheets(['frequency'])}
          onFinish={() => setActiveSheets([])}
        />
      </BottomSheetSwitcher>
    </>
  );
}

export const MultiStepStackedHelp: Story = {
  name: 'Multi-step + Stacked Help (activeSheets)',
  render: () => <MultiStepPathExample initialSheets={['overview', 'help']} />,
};

export const HugContent: Story = {
  name: 'Legacy Singular (activeSheet) — Hug content',
  render: () => <MultiStepSwitcherExample height="hug" />,
  play: openFlow,
};

export const Capped: Story = {
  name: 'Legacy Singular (activeSheet) — Capped',
  render: () => <MultiStepSwitcherExample height="capped" />,
  play: openFlow,
};

export const NoScrim: Story = {
  name: 'Legacy Singular (activeSheet) — No scrim',
  render: () => <MultiStepSwitcherExample height="hug" hasScrim={false} />,
  play: openFlow,
};

export const NarrowViewport: Story = {
  name: 'Legacy Singular (activeSheet) — Narrow viewport',
  parameters: {viewport: {defaultViewport: 'mobile1'}},
  render: () => <MultiStepSwitcherExample height="hug" />,
  play: openFlow,
};
