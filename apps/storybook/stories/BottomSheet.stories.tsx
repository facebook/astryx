// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
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
  title: 'Core/BottomSheet',
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

interface CommentFormValues {
  title: string;
  author: string;
  email: string;
  team: string;
  project: string;
  relatedTask: string;
  summary: string;
  context: string;
  changes: string;
  followUp: string;
  comment: string;
}

function MobileKeyboardCommentForm({onPost}: {onPost: () => void}) {
  const [values, setValues] = useState<CommentFormValues>({
    title: '',
    author: '',
    email: '',
    team: '',
    project: '',
    relatedTask: '',
    summary: '',
    context: '',
    changes: '',
    followUp: '',
    comment: '',
  });
  const update =
    (field: keyof CommentFormValues) =>
    (value: string): void =>
      setValues(current => ({...current, [field]: value}));

  return (
    <VStack gap={4}>
      <Heading level={3}>Add a comment</Heading>
      <Text type="supporting" color="secondary">
        Keep the Tall sheet fully expanded, then focus fields near the
        beginning, middle, and end. The outer sheet remains stationary while its
        body scrolls each control above the mobile keyboard. Drag it down to the
        half-height stop and the accommodation stops — only a fully expanded
        Tall sheet provides it — then drag back up and it resumes.
      </Text>
      <Text type="supporting" color="secondary">
        Move the sheet with its handle or close it with Post comment to verify
        that sheet travel and closing dismiss the keyboard.
      </Text>
      <Divider />
      <TextInput
        label="Title"
        value={values.title}
        onChange={update('title')}
      />
      <TextInput
        label="Author"
        value={values.author}
        onChange={update('author')}
      />
      <TextInput
        label="Email"
        type="email"
        value={values.email}
        onChange={update('email')}
      />
      <TextInput label="Team" value={values.team} onChange={update('team')} />
      <TextInput
        label="Project"
        value={values.project}
        onChange={update('project')}
      />
      <TextInput
        label="Related task"
        value={values.relatedTask}
        onChange={update('relatedTask')}
      />
      <TextArea
        label="Summary"
        rows={4}
        value={values.summary}
        onChange={update('summary')}
      />
      <TextArea
        label="Context"
        rows={6}
        value={values.context}
        onChange={update('context')}
      />
      <TextArea
        label="What changed?"
        rows={4}
        value={values.changes}
        onChange={update('changes')}
      />
      <TextArea
        label="Suggested follow-up"
        rows={4}
        value={values.followUp}
        onChange={update('followUp')}
      />
      <TextArea
        label="Comment"
        rows={8}
        value={values.comment}
        onChange={update('comment')}
      />
      <Button label="Post comment" onClick={onPost} />
    </VStack>
  );
}

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

export const FormPurpose: Story = {
  name: 'Form purpose',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Edit profile" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          purpose="form"
          label="Edit profile"
          height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Edit profile</Heading>
              <Text type="supporting" color="secondary">
                Swiping down or clicking the scrim keeps this form open. Escape
                and the explicit actions can still close it.
              </Text>
              <Button label="Save changes" onClick={() => setIsOpen(false)} />
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
                A Tall sheet fills most of the viewport and scrolls its content.
                It has no snap points, so a drag springs back; flick down to
                dismiss. Escape also dismisses.
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

export const SnapPoints: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Nearby places"
          height="tall"
          snapPoints={[0.5]}>
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                One extra stop, at half the viewport. Drag the handle down to
                collapse the sheet, then back up — the list keeps its scroll
                position. Flick down to dismiss.
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

export const SnapPointsWithPeek: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open route" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Route"
          height="tall"
          snapPoints={['96px', '50%']}>
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>To Ferry Building</Heading>
              <Text type="supporting" color="secondary">
                Three stops: full, half the viewport, and a 96px peek. The half
                stop is a working surface — content laid out, scrim full. The
                peek is a glance: the sheet slides away rather than reflowing
                into a sliver, and the scrim thins.
              </Text>
              <Divider />
              {Array.from({length: 10}, (_, i) => (
                <VStack key={i} gap={1}>
                  <Text type="label">Step {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    Continue for {(0.1 + i * 0.4).toFixed(1)} mi
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
        <Button label="Share page" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Share page"
          height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Share page</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content, up to 92% of the viewport.
              </Text>
              <Divider />
              <Button label="Copy link" />
              <Button label="Send in Messenger" />
              <Button label="Save for later" />
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const HugHeightWithLongContent: Story = {
  name: 'Hug height — Long content',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="View release notes" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Release notes"
          height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Release notes</Heading>
              <Text type="supporting" color="secondary">
                The sheet hugs its content until it reaches 92% of the viewport,
                then the content scrolls within the sheet. Drag it to a snap
                point and the scrolling area resizes to the height you can
                actually see — except at the shortest peek, which slides below
                the viewport at full height rather than reflowing to a sliver.
              </Text>
              <Divider />
              {Array.from({length: 12}, (_, i) => (
                <VStack key={i} gap={1}>
                  <Text type="label">Update {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    A summary of the improvements, fixes, and other changes in
                    this update.
                  </Text>
                </VStack>
              ))}
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const CappedHeightWithLongContent: Story = {
  name: 'Capped height — Long content',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="View saved places" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Saved places"
          height="capped">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Saved places</Heading>
              <Text type="supporting" color="secondary">
                The sheet opens at a capped height while the long list scrolls
                within it.
              </Text>
              <Divider />
              {Array.from({length: 12}, (_, i) => (
                <VStack key={i} gap={1}>
                  <Text type="label">Saved place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    Notes and details about this saved place.
                  </Text>
                </VStack>
              ))}
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>
    );
  },
};

export const MobileKeyboard: Story = {
  name: 'Mobile keyboard',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Add a comment"
          height="tall"
          snapPoints={[0.5]}>
          <Section padding={4}>
            <MobileKeyboardCommentForm onPost={() => setIsOpen(false)} />
          </Section>
        </BottomSheet>
      </>
    );
  },
};
