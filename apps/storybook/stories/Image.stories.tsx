// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Image} from '@astryxdesign/lab';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const SAMPLE_IMAGE = 'https://picsum.photos/id/10/1200/800';
const SQUARE_IMAGE = 'https://picsum.photos/id/15/800/800';
const BROKEN_SRC = 'https://example.invalid/missing.jpg';

const meta: Meta<typeof Image> = {
  title: 'Lab/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 640, maxWidth: '100%'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Image>;

export const Showcase: Story = {
  render: () => (
    <Image
      src={SAMPLE_IMAGE}
      alt="Forest valley under fog"
      ratio={16 / 9}
      radius="container"
    />
  ),
};

export const RatioAndFit: Story = {
  render: () => (
    <Grid columns={{minWidth: 180, repeat: 'fit'}} gap={6}>
      <VStack gap={2}>
        <Image src={SAMPLE_IMAGE} alt="Cover crop" ratio={1} radius="element" />
        <Text size="sm">ratio 1, cover</Text>
      </VStack>
      <VStack gap={2}>
        <Image
          src={SAMPLE_IMAGE}
          alt="Letterboxed"
          ratio={1}
          fit="contain"
          radius="element"
        />
        <Text size="sm">ratio 1, contain</Text>
      </VStack>
      <VStack gap={2}>
        <Image src={SQUARE_IMAGE} alt="Round avatar" ratio={1} radius="full" />
        <Text size="sm">ratio 1, full radius</Text>
      </VStack>
    </Grid>
  ),
};

export const ErrorFallback: Story = {
  render: () => (
    <Grid columns={{minWidth: 180, repeat: 'fit'}} gap={6}>
      <VStack gap={2}>
        <Image
          src={BROKEN_SRC}
          alt="Broken image"
          ratio={4 / 3}
          radius="element"
        />
        <Text size="sm">default placeholder</Text>
      </VStack>
      <VStack gap={2}>
        <Image
          src={BROKEN_SRC}
          alt="Broken with fallbackSrc"
          ratio={4 / 3}
          radius="element"
          fallbackSrc={SQUARE_IMAGE}
        />
        <Text size="sm">fallbackSrc rescue</Text>
      </VStack>
    </Grid>
  ),
};

export const WithPreview: Story = {
  render: () => (
    <Image
      src={SAMPLE_IMAGE}
      alt="Forest valley under fog"
      ratio={16 / 9}
      radius="container"
      hasPreview
      previewCaption="Forest valley under fog — click-to-zoom preview"
    />
  ),
};

export const IntrinsicMaxWidth: Story = {
  render: () => (
    <Card>
      <Image
        src={SQUARE_IMAGE}
        alt="Capped and centered"
        maxWidth={240}
        radius="element"
      />
    </Card>
  ),
};
