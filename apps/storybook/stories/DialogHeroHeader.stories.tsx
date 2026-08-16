// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {DialogHeroHeader} from '@astryxdesign/lab';
import {Dialog} from '@astryxdesign/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  heroSvg: {
    display: 'block',
  },
});

// Self-contained stand-in for a hero image / illustration. A real app would
// pass an <img>, <video>, or illustration component sized to fill the slot.
function HeroMedia({mode = 'dark'}: {mode?: 'dark' | 'light'}) {
  const [from, to, accent] =
    mode === 'dark'
      ? ['#1c2340', '#3b2d5e', '#8ba7ff']
      : ['#e8ecfb', '#f6e9f2', '#5b74d6'];
  return (
    <svg
      viewBox="0 0 400 160"
      width="100%"
      height="160"
      aria-hidden="true"
      {...stylex.props(styles.heroSvg)}>
      <defs>
        <linearGradient id={`hero-${mode}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill={`url(#hero-${mode})`} />
      <circle cx="330" cy="40" r="52" fill={accent} opacity="0.35" />
      <circle cx="70" cy="140" r="70" fill={accent} opacity="0.25" />
      <circle cx="200" cy="80" r="34" fill={accent} opacity="0.55" />
    </svg>
  );
}

const meta: Meta<typeof DialogHeroHeader> = {
  title: 'Lab/DialogHeroHeader',
  component: DialogHeroHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DialogHeroHeader>;

/**
 * The hero header drops into Layout's header slot exactly like DialogHeader.
 * The media bleeds to the dialog's edges; the close button overlays its
 * top-trailing corner. `mediaMode="dark"` composes MediaTheme so the close
 * button stays legible over the dark artwork.
 */
export const Basic: Story = {
  render: () => (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            title="Welcome aboard"
            media={<HeroMedia mode="dark" />}
            mediaMode="dark"
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Text type="body">
              Set up your workspace in three quick steps. You can change any of
              this later in Settings.
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label="Skip" variant="secondary" />
              <Button label="Get started" variant="primary" />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  ),
};

/**
 * Light media inverts the overlay treatment: `mediaMode="light"` gives the
 * close button dark, contrast-safe tokens.
 */
export const LightMedia: Story = {
  render: () => (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            title="New in this release"
            media={<HeroMedia mode="light" />}
            mediaMode="light"
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Text type="body">
              Charts now support streaming data, and the command palette learned
              fuzzy matching.
            </Text>
          </LayoutContent>
        }
      />
    </Dialog>
  ),
};

/**
 * `startContent` renders inline before the title; `maxLines` truncates long
 * auto-wrapped titles with an ellipsis.
 */
export const StartContentAndTruncation: Story = {
  render: () => (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            title="A launch announcement with a title long enough to need truncation in a narrow dialog"
            media={<HeroMedia mode="dark" />}
            mediaMode="dark"
            startContent={<Icon icon="info" size="sm" />}
            maxLines={1}
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Text type="body">
              The full title stays available to screen readers and in the
              truncation tooltip.
            </Text>
          </LayoutContent>
        }
      />
    </Dialog>
  ),
};

/**
 * When the artwork carries the message, hide the title row visually with
 * `isTitleHidden`. The title still names the dialog for screen readers.
 * Passing a Heading element instead of a string customizes the treatment.
 */
export const HiddenTitleAndCustomHeading: Story = {
  render: () => (
    <HStack gap={4}>
      <Dialog isOpen isInline onOpenChange={() => {}} width={320}>
        <Layout
          header={
            <DialogHeroHeader
              title="Spring theme refresh"
              media={<HeroMedia mode="light" />}
              mediaMode="light"
              isTitleHidden
              onOpenChange={() => {}}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                The media speaks for itself; the hidden title still names the
                dialog.
              </Text>
            </LayoutContent>
          }
        />
      </Dialog>
      <Dialog isOpen isInline onOpenChange={() => {}} width={320}>
        <Layout
          header={
            <DialogHeroHeader
              title={
                <Heading level={2} type="display-3">
                  Big moment
                </Heading>
              }
              media={<HeroMedia mode="dark" />}
              mediaMode="dark"
              onOpenChange={() => {}}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                A caller-provided Heading element renders as-is for custom
                treatments.
              </Text>
            </LayoutContent>
          }
        />
      </Dialog>
    </HStack>
  ),
};

/**
 * Full modal behavior: the title receives focus on open and names the dialog
 * via aria-labelledby; Escape and the overlaid close button both close.
 */
export const Modal: Story = {
  render: function ModalExample() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button
          label="Open hero dialog"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
        <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            header={
              <DialogHeroHeader
                title="Welcome aboard"
                media={<HeroMedia mode="dark" />}
                mediaMode="dark"
                onOpenChange={setIsOpen}
              />
            }
            content={
              <LayoutContent>
                <Text type="body">
                  Set up your workspace in three quick steps.
                </Text>
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Get started"
                    variant="primary"
                    onClick={() => setIsOpen(false)}
                  />
                </HStack>
              </LayoutFooter>
            }
          />
        </Dialog>
      </>
    );
  },
};
