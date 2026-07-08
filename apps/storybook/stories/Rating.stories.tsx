// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Rating} from '@astryxdesign/core/Rating';
import type {RatingIcons} from '@astryxdesign/core/Rating';
import {
  StarIcon as StarSolid,
  HeartIcon as HeartSolid,
  HandThumbUpIcon as ThumbSolid,
  BookmarkIcon as BookmarkSolid,
  FlagIcon as FlagSolid,
  ShieldCheckIcon as ShieldSolid,
  TrophyIcon as TrophySolid,
  CheckCircleIcon as CheckSolid,
} from '@heroicons/react/24/solid';
import {
  StarIcon as StarOutline,
  HeartIcon as HeartOutline,
  HandThumbUpIcon as ThumbOutline,
  BookmarkIcon as BookmarkOutline,
  FlagIcon as FlagOutline,
  ShieldCheckIcon as ShieldOutline,
  TrophyIcon as TrophyOutline,
  CheckCircleIcon as CheckOutline,
} from '@heroicons/react/24/outline';

// Realistic icon options from the official icon system (Heroicons: matched
// solid + outline pairs → consistent stroke weight, optical size, and detail).
const ICON_OPTIONS: {name: string; icons: RatingIcons}[] = [
  {name: 'Star (default)', icons: {filled: StarSolid, empty: StarOutline}},
  {name: 'Heart', icons: {filled: HeartSolid, empty: HeartOutline}},
  {name: 'Thumb Up', icons: {filled: ThumbSolid, empty: ThumbOutline}},
  {name: 'Bookmark', icons: {filled: BookmarkSolid, empty: BookmarkOutline}},
  {name: 'Flag', icons: {filled: FlagSolid, empty: FlagOutline}},
  {name: 'Shield', icons: {filled: ShieldSolid, empty: ShieldOutline}},
  {name: 'Medal', icons: {filled: TrophySolid, empty: TrophyOutline}},
  {name: 'Check Circle', icons: {filled: CheckSolid, empty: CheckOutline}},
];

const meta: Meta<typeof Rating> = {
  title: 'Core/Rating',
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    mode: {control: 'inline-radio', options: ['interactive', 'display']},
    value: {control: 'number'},
    max: {control: 'number'},
    precision: {control: 'select', options: [1, 0.5, 0.25, 0.1]},
    size: {control: 'inline-radio', options: ['sm', 'md', 'lg']},
    density: {
      control: 'inline-radio',
      options: ['compact', 'comfortable', 'spacious'],
    },
    color: {control: 'text'},
    animation: {
      control: 'inline-radio',
      options: ['none', 'fill', 'scale', 'bounce'],
    },
    labelPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right', 'hidden'],
    },
    hasValueText: {control: 'boolean'},
    reviewCount: {control: 'number'},
    tooltip: {control: 'inline-radio', options: ['none', 'value', 'label']},
    isDisabled: {control: 'boolean'},
    isLoading: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

const Row = ({children}: {children: React.ReactNode}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    {children}
  </div>
);

// --- Playground ------------------------------------------------------------

export const Playground: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 3);
    const {value: _v, onChange: _o, ...rest} = args;
    return <Rating {...rest} value={value} onChange={setValue} />;
  },
  args: {label: 'Rate this article'},
};

// --- Modes -----------------------------------------------------------------

export const Modes: Story = {
  render: () => (
    <Row>
      <Rating label="Interactive" defaultValue={3} mode="interactive" />
      <Rating label="Display (read-only)" value={4} mode="display" />
    </Row>
  ),
};

// --- Max values ------------------------------------------------------------

export const MaxValues: Story = {
  render: () => (
    <Row>
      <Rating label="Out of 3" defaultValue={2} max={3} />
      <Rating label="Out of 5" defaultValue={3} max={5} />
      <Rating label="Out of 10" defaultValue={7} max={10} />
    </Row>
  ),
};

// --- Precision -------------------------------------------------------------

export const Precision: Story = {
  render: () => (
    <Row>
      <Rating
        label="Whole (1)"
        value={3}
        mode="display"
        precision={1}
        hasValueText
      />
      <Rating
        label="Half (0.5)"
        value={3.5}
        mode="display"
        precision={0.5}
        hasValueText
      />
      <Rating
        label="Quarter (0.25)"
        value={4.25}
        mode="display"
        precision={0.25}
        hasValueText
      />
      <Rating
        label="Tenth (0.1)"
        value={4.6}
        mode="display"
        precision={0.1}
        hasValueText
      />
    </Row>
  ),
};

// --- Icon options (from the official icon system) --------------------------

export const Icons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 20,
      }}>
      {ICON_OPTIONS.map(opt => (
        <Rating
          key={opt.name}
          label={opt.name}
          defaultValue={4}
          size="lg"
          icons={opt.icons}
          color={opt.name.startsWith('Star') ? 'gold' : 'brand'}
        />
      ))}
    </div>
  ),
};

// --- Colors ----------------------------------------------------------------

export const Colors: Story = {
  render: () => (
    <Row>
      <Rating label="Gold (default)" defaultValue={4} color="gold" />
      <Rating label="Brand" defaultValue={4} color="brand" />
      <Rating label="Warning" defaultValue={4} color="warning" />
      <Rating label="Positive" defaultValue={4} color="positive" />
      <Rating label="Neutral" defaultValue={4} color="neutral" />
      <Rating label="Custom crimson" defaultValue={4} color="#E11D48" />
    </Row>
  ),
};

// --- Label placement -------------------------------------------------------

export const LabelPlacement: Story = {
  render: () => (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 32}}>
      <Rating label="Top" defaultValue={3} labelPlacement="top" />
      <Rating label="Bottom" defaultValue={3} labelPlacement="bottom" />
      <Rating label="Left" defaultValue={3} labelPlacement="left" />
      <Rating label="Right" defaultValue={3} labelPlacement="right" />
      <Rating label="Hidden" defaultValue={3} labelPlacement="hidden" />
    </div>
  ),
};

// --- Descriptive labels ----------------------------------------------------

export const DescriptiveLabels: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <Rating
        label="How was it?"
        value={value}
        onChange={setValue}
        descriptiveLabels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
      />
    );
  },
};

// --- States ----------------------------------------------------------------

export const States: Story = {
  render: () => (
    <Row>
      <Rating label="Default" defaultValue={3} />
      <Rating label="Read-only" value={4} mode="display" />
      <Rating label="Disabled" value={3} isDisabled />
      <Rating label="Loading" isLoading />
    </Row>
  ),
};

// --- RTL -------------------------------------------------------------------

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <Rating
        label="تقييم"
        defaultValue={3.5}
        precision={0.5}
        hasValueText
        mode="display"
      />
    </div>
  ),
};

// --- Density ---------------------------------------------------------------

export const Density: Story = {
  render: () => (
    <Row>
      <Rating label="Compact" defaultValue={4} density="compact" size="lg" />
      <Rating
        label="Comfortable"
        defaultValue={4}
        density="comfortable"
        size="lg"
      />
      <Rating label="Spacious" defaultValue={4} density="spacious" size="lg" />
    </Row>
  ),
};

// --- Animation -------------------------------------------------------------

export const Animation: Story = {
  render: () => (
    <Row>
      <Rating label="None" defaultValue={3} animation="none" size="lg" />
      <Rating label="Fill" defaultValue={3} animation="fill" size="lg" />
      <Rating
        label="Scale (hover)"
        defaultValue={3}
        animation="scale"
        size="lg"
      />
      <Rating
        label="Bounce (hover)"
        defaultValue={3}
        animation="bounce"
        size="lg"
      />
    </Row>
  ),
};

// --- Sizes -----------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <Row>
      <Rating label="Small" defaultValue={3} size="sm" />
      <Rating label="Medium" defaultValue={3} size="md" />
      <Rating label="Large" defaultValue={3} size="lg" />
    </Row>
  ),
};

// --- Review summary + tooltip ----------------------------------------------

export const ReviewSummary: Story = {
  render: () => (
    <Rating
      label="Average rating"
      value={4.6}
      mode="display"
      precision={0.1}
      hasValueText
      reviewCount={2341}
      tooltip="value"
    />
  ),
};

// --- Accessibility ---------------------------------------------------------

export const Accessibility: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <Rating
          label="Rate your experience (use arrow keys)"
          value={value}
          onChange={setValue}
          descriptiveLabels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
          tooltip="label"
        />
        <p style={{fontSize: 13, opacity: 0.7, maxWidth: 360}}>
          Tab to focus, then use ←/→ or ↑/↓ to change, Home/End for min/max. The
          value is announced to screen readers via a live region.
        </p>
      </div>
    );
  },
};
