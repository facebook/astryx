// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet, BottomSheetOrchestrator} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';

const meta: Meta<typeof BottomSheet> = {
  title: 'Lab/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Render each story in its own iframe in the Docs page. BottomSheet is a
    // viewport-anchored overlay (position:fixed, dvh heights, detents from
    // visualViewport); an iframe gives it a real mini-viewport, so both the
    // modal (top-layer) and non-modal sheets render contained and with correct
    // physics — instead of a modal escaping to cover the whole Docs page while
    // a non-modal gets trapped/janky in the preview card.
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
type Story = StoryObj<typeof BottomSheet>;

export const Showcase: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open sheet" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Filters">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Filters</Heading>
              <Divider />
              <VStack gap={2}>
                <CheckboxInput label="In stock" value={false} />
                <CheckboxInput label="On sale" value={false} />
                <CheckboxInput label="Free shipping" value={false} />
              </VStack>
              <Button label="Apply" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const TallSheet: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Nearby places"
          height="tall">
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Drag the handle to resize between snap points; flick down to
                dismiss or up to expand. Escape also dismisses.
              </Text>
              <Divider />
              {Array.from({length: 12}, (_, i) => (
                <VStack key={i} gap={1}>
                  <Text type="label">Place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    {(0.2 + i * 0.3).toFixed(1)} mi away
                  </Text>
                </VStack>
              ))}
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const NoScrim: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);
    return (
      <>
        {/* A scrim is the semi-transparent layer that covers and blocks the
            background. With hasScrim={false}, this page stays interactive. */}
        <VStack gap={3}>
          <Heading level={3}>Live page behind the overlay</Heading>
          <Text type="supporting" color="secondary">
            A scrim is the semi-transparent overlay that covers and blocks the
            background. This example has no scrim, so the page stays visible and
            interactive. Open the sheet, then tap the counter below.
          </Text>
          <Button label="Open sheet" onClick={() => setIsOpen(true)} />
          <Button
            label={`Background clicks: ${count}`}
            onClick={() => setCount(c => c + 1)}
          />
        </VStack>
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Nearby places"
          hasScrim={false}
          height="capped">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>No scrim</Heading>
              <Text type="supporting" color="secondary">
                This is still an overlay, not inline content. The page behind
                stays live. Drag the handle to resize, flick down to dismiss, or
                press Escape while focus is here.
              </Text>
              <Divider />
              {Array.from({length: 8}, (_, i) => (
                <VStack key={i} gap={1}>
                  <Text type="label">Place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    {(0.2 + i * 0.3).toFixed(1)} mi away
                  </Text>
                </VStack>
              ))}
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const HugHeight: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Add a comment"
          height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Add a comment</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content, up to 92% of the viewport.
              </Text>
              <Divider />
              <TextInput label="Title" value="" />
              <TextArea label="Comment" rows={4} value="" />
              <Button label="Post" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const MultiStepOrchestrator: Story = {
  name: 'Multi-step orchestrator',
  render: () => {
    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
      <>
        <Button
          label="Start profile setup"
          onClick={() => setActiveSheet('profile')}
        />
        <BottomSheetOrchestrator
          activeSheet={activeSheet}
          onActiveSheetChange={setActiveSheet}>
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
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => setActiveSheet(null)}
                  />
                  <Button
                    label="Continue"
                    onClick={() => setActiveSheet('confirm')}
                  />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
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
                  <Text type="label">{name || 'No name provided'}</Text>
                  <Text type="supporting" color="secondary">
                    {email || 'No email provided'}
                  </Text>
                </VStack>
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveSheet('profile')}
                  />
                  <Button
                    label="Continue"
                    onClick={() => setActiveSheet('preferences')}
                  />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
          <BottomSheet
            sheetId="preferences"
            label="Profile preferences"
            height="hug">
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
                  Choose what you would like to receive after completing your
                  profile. This step is intentionally taller than Step 2.
                </Text>
                <VStack gap={2}>
                  <CheckboxInput label="Product updates" value={false} />
                  <CheckboxInput label="Tips and tutorials" value={false} />
                  <CheckboxInput label="Research invitations" value={false} />
                </VStack>
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveSheet('confirm')}
                  />
                  <Button label="Finish" onClick={() => setActiveSheet(null)} />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
        </BottomSheetOrchestrator>
      </>
    );
  },
};
