// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Item} from '@astryxdesign/core/Item';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {useSheetOpenGesture} from '@astryxdesign/lab';

const meta: Meta = {
  title: 'Lab/SheetOpenGesture',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'EXPLORATION. Opening a BottomSheet by dragging up from the page, ' +
          'rather than from the sheet (which is not on screen yet) or a button ' +
          '(which is a tap, not a drag).\n\n' +
          '**Touch only** — try it in a device viewport, or with touch ' +
          'emulation on. There is nothing to see with a mouse, by design: a ' +
          'sheet reachable only by dragging is unreachable by keyboard, by ' +
          'screen reader, and under WCAG 2.5.7. The button in each story is ' +
          'not a fallback, it is the primary way in; the gesture is the ' +
          'accelerator.',
      },
      story: {inline: false, height: '620px'},
    },
  },
};

export default meta;
type Story = StoryObj;

const PLACES = [
  'Blue Bottle Coffee',
  'Dolores Park',
  'Tartine Bakery',
  'Bi-Rite Market',
  'Zuni Café',
  'The Castro Theatre',
  'Alamo Square',
  'Ferry Building',
];

function PlaceList() {
  return (
    <VStack padding={4} gap={2}>
      <Heading level={2}>Nearby places</Heading>
      {PLACES.map(place => (
        <Item key={place} label={place} description="Open until 8pm" />
      ))}
    </VStack>
  );
}

/**
 * Scroll to the bottom of the page, then keep pulling up: the sheet comes with
 * the finger. Release near the top and it opens; let go early and it falls
 * back where it came from.
 *
 * The end of the page is the one place an upward pull cannot be mistaken for
 * scrolling — there is no scroll left in that direction — so the gesture needs
 * no threshold beyond a few pixels of intent.
 */
export const PullUpFromPageEnd: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    // Disabled while the sheet is up: from then on, a drag belongs to the
    // sheet's own gestures.
    const {source} = useSheetOpenGesture({enabled: !isOpen});

    return (
      <Section padding={4}>
        <VStack gap={3}>
          <Heading level={1}>Mission District</Heading>
          <Button label="Nearby places" onClick={() => setIsOpen(true)} />
          <Text type="supporting">
            Scroll to the bottom, then keep pulling up.
          </Text>
          {Array.from({length: 24}, (_, index) => (
            <Text key={index}>
              Paragraph {index + 1} — filler so the page has an end to pull
              past.
            </Text>
          ))}
        </VStack>
        <BottomSheet
          label="Nearby places"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          dragSource={source}>
          <PlaceList />
        </BottomSheet>
      </Section>
    );
  },
};

/**
 * The same gesture, armed only inside a region the app marks — here a dock
 * pinned to the bottom of the screen. Use this shape when the page has no
 * natural end to pull past: a long feed, an infinite scroller, a map.
 *
 * The dock is a button as well as a drag target, which is what keeps the
 * pattern reachable without the gesture.
 */
export const PullUpFromADock: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const {source, regionProps} = useSheetOpenGesture({
      from: 'element',
      enabled: !isOpen,
    });

    return (
      <Section padding={4}>
        <VStack gap={3}>
          <Heading level={1}>Mission District</Heading>
          <Text type="supporting">
            Pull up from the bar at the bottom — anywhere else scrolls.
          </Text>
          {Array.from({length: 24}, (_, index) => (
            <Text key={index}>Paragraph {index + 1} — an endless feed.</Text>
          ))}
        </VStack>

        <div
          {...regionProps}
          style={{
            position: 'fixed',
            insetInline: 0,
            insetBlockEnd: 0,
            padding: 12,
            background: 'var(--color-background-surface)',
            borderBlockStart: '1px solid var(--color-border-subtle)',
          }}>
          <Button
            label="Nearby places"
            width="100%"
            onClick={() => setIsOpen(true)}
          />
        </div>

        <BottomSheet
          label="Nearby places"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          dragSource={source}>
          <PlaceList />
        </BottomSheet>
      </Section>
    );
  },
};
