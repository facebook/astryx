// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
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
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          label="Filters">
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

export const SnapPoints: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          label="Nearby places"
          snapPoints={[0.3, 0.6, 1]}>
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Drag the handle or press the arrow keys to move between the
                peek, half, and full detents.
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

export const FormSheet: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          label="Add a comment"
          hasSwipeToDismiss={false}>
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Add a comment</Heading>
              <Text type="supporting" color="secondary">
                Swipe-to-dismiss is disabled here so vertical drag does not
                fight the text fields. Use Escape or the close button.
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
