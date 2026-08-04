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

export const NonModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);
    return (
      <>
        {/* With hasScrim={false} the sheet is non-modal: this background stays
            clickable while the sheet is open (no scrim, no scroll lock). Open
            the sheet, then tap the counter — it still responds. The story
            renders in its own iframe in Docs (see meta docs.story), so the
            sheet gets a real mini-viewport and behaves correctly. */}
        <VStack gap={3}>
          <Heading level={3}>Live page (background)</Heading>
          <Text type="supporting" color="secondary">
            A non-modal sheet (hasScrim={'{false}'}) leaves this content
            interactive. Open the sheet, then tap the counter below — it keeps
            working, and there is no dimming behind the sheet.
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
              <Heading level={3}>Non-modal sheet</Heading>
              <Text type="supporting" color="secondary">
                No scrim; the page behind stays live. Drag the handle to resize,
                flick down to dismiss, or press Escape while focus is here.
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
