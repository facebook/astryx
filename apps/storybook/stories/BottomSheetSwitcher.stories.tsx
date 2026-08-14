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
import {TextInput} from '@astryxdesign/core/TextInput';

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

interface ProfileDetails {
  name: string;
  email: string;
}

interface ProfileDetailsSheetProps {
  onCancel: () => void;
  onContinue: (details: ProfileDetails) => void;
}

function ProfileDetailsSheet({onCancel, onContinue}: ProfileDetailsSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <BottomSheet sheetId="profile" label="Profile details" height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Profile details</Heading>
            <Text type="supporting" color="secondary">
              Step 1 of 3
            </Text>
          </VStack>
          <Divider />
          <TextInput label="Name" value={name} onChange={setName} />
          <TextInput label="Email" value={email} onChange={setEmail} />
          <HStack gap={2} hAlign="end">
            <Button label="Cancel" variant="secondary" onClick={onCancel} />
            <Button
              label="Continue"
              onClick={() => onContinue({name, email})}
            />
          </HStack>
        </VStack>
      </Section>
    </BottomSheet>
  );
}

interface ConfirmProfileSheetProps {
  details: ProfileDetails;
  onBack: () => void;
  onContinue: () => void;
}

function ConfirmProfileSheet({
  details,
  onBack,
  onContinue,
}: ConfirmProfileSheetProps) {
  return (
    <BottomSheet sheetId="confirm" label="Confirm profile" height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Confirm profile</Heading>
            <Text type="supporting" color="secondary">
              Step 2 of 3
            </Text>
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Text type="label">{details.name || 'No name provided'}</Text>
            <Text type="supporting" color="secondary">
              {details.email || 'No email provided'}
            </Text>
          </VStack>
          <HStack gap={2} hAlign="end">
            <Button label="Back" variant="secondary" onClick={onBack} />
            <Button label="Continue" onClick={onContinue} />
          </HStack>
        </VStack>
      </Section>
    </BottomSheet>
  );
}

interface ProfilePreferencesSheetProps {
  onBack: () => void;
  onFinish: () => void;
}

function ProfilePreferencesSheet({
  onBack,
  onFinish,
}: ProfilePreferencesSheetProps) {
  const [productUpdates, setProductUpdates] = useState(false);
  const [tipsAndTutorials, setTipsAndTutorials] = useState(false);
  const [researchInvitations, setResearchInvitations] = useState(false);

  return (
    <BottomSheet sheetId="preferences" label="Profile preferences" height="hug">
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Profile preferences</Heading>
            <Text type="supporting" color="secondary">
              Step 3 of 3
            </Text>
          </VStack>
          <Divider />
          <Text type="supporting" color="secondary">
            Choose what you would like to receive after completing your profile.
            This step is intentionally taller than Step 2.
          </Text>
          <VStack gap={2}>
            <CheckboxInput
              label="Product updates"
              value={productUpdates}
              onChange={setProductUpdates}
            />
            <CheckboxInput
              label="Tips and tutorials"
              value={tipsAndTutorials}
              onChange={setTipsAndTutorials}
            />
            <CheckboxInput
              label="Research invitations"
              value={researchInvitations}
              onChange={setResearchInvitations}
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
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({
    name: '',
    email: '',
  });

  return (
    <>
      <Button
        label="Start profile setup"
        onClick={() => setActiveSheet('profile')}
      />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <ProfileDetailsSheet
          onCancel={() => setActiveSheet(null)}
          onContinue={details => {
            setProfileDetails(details);
            setActiveSheet('confirm');
          }}
        />
        <ConfirmProfileSheet
          details={profileDetails}
          onBack={() => setActiveSheet('profile')}
          onContinue={() => setActiveSheet('preferences')}
        />
        <ProfilePreferencesSheet
          onBack={() => setActiveSheet('confirm')}
          onFinish={() => setActiveSheet(null)}
        />
      </BottomSheetSwitcher>
    </>
  );
}

export const MultiStep: Story = {
  name: 'Multi-step switcher',
  render: () => <MultiStepSwitcherExample />,
};
