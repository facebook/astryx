// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {CommentComposer} from '@astryxdesign/lab';
import CommentComposerShowcase from '../../../packages/lab/blocks/CommentComposerShowcase';

const meta: Meta = {
  title: 'Lab/Comments',
  component: CommentComposer,
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj;

/** A controlled standalone composer that posts into a short list. */
export const Composer: Story = {
  render: () => <CommentComposerShowcase />,
};
