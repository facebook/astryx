// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

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

/**
 * One notification-setup flow on the ordered `activeSheets` path. The three
 * steps replace each other (`['overview']` → `['frequency']` → `['channels']`)
 * exactly like the released singular flow, and the first step also pushes a
 * stacked help sheet (`['overview', 'help']`): the covered step stays visible
 * and receded behind it, Back pops one level, and Cancel clears the path.
 */
export default function BottomSheetSwitcherShowcase() {
  const [activeSheets, setActiveSheets] = useState<ReadonlyArray<string>>([]);
  const popSheet = () => setActiveSheets(current => current.slice(0, -1));
  const closeAll = () => setActiveSheets([]);
  const [frequency, setFrequency] = useState('daily');
  const [email, setEmail] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textMessages, setTextMessages] = useState(false);

  return (
    <>
      <Button
        label="Set up notifications"
        onClick={() => setActiveSheets(['overview'])}
      />
      <BottomSheetSwitcher
        activeSheets={activeSheets}
        onActiveSheetsChange={setActiveSheets}>
        <BottomSheet
          sheetId="overview"
          label="Set up notifications"
          height="hug">
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
              </VStack>
              <Button
                label="How do notifications work?"
                variant="secondary"
                onClick={() => setActiveSheets(['overview', 'help'])}
              />
              <HStack gap={2} hAlign="end">
                <Button label="Cancel" variant="secondary" onClick={closeAll} />
                <Button
                  label="Continue"
                  onClick={() => setActiveSheets(['frequency'])}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        {/* Hug-height help content sized to closely match the first step's
            natural height, so the covered step's recede reads clearly behind
            it (prototype parity pending spec:AST-044 OQ5). */}
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
                <Button label="Back" onClick={popSheet} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
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
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActiveSheets(['overview'])}
                />
                <Button
                  label="Continue"
                  onClick={() => setActiveSheets(['channels'])}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          sheetId="channels"
          label="Notification channels"
          height="hug">
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
                <CheckboxInput
                  label="Email"
                  value={email}
                  onChange={setEmail}
                />
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
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActiveSheets(['frequency'])}
                />
                <Button label="Finish" onClick={closeAll} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}
