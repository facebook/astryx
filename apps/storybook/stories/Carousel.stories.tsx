// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Card} from '@astryxdesign/core/Card';
import {
  colorVars,
  spacingVars,
  typographyVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
    fontFamily: typographyVars['--font-family-body'],
  },
  constrainedWidth: {
    maxWidth: 400,
  },
  card: {
    width: 160,
    flexShrink: 0,
  },
  cardInner: {
    padding: spacingVars['--spacing-3'],
  },
  cardTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
  },
  cardDesc: {
    margin: 0,
    fontSize: 12,
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: radiusVars['--radius-element'],
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    color: colorVars['--color-text-secondary'],
    marginBottom: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-family-body'],
  },
});

const IMAGES = [
  {id: 1, src: 'https://picsum.photos/id/1042/200/200', label: 'dark.jpg'},
  {id: 2, src: 'https://picsum.photos/id/1043/200/200', label: 'light.jpg'},
  {id: 3, src: 'https://picsum.photos/id/1044/200/200', label: 'warm.jpg'},
  {id: 4, src: 'https://picsum.photos/id/1047/200/200', label: 'mixed.jpg'},
  {id: 5, src: 'https://picsum.photos/id/1050/200/200', label: 'nature.jpg'},
  {id: 6, src: 'https://picsum.photos/id/1055/200/200', label: 'city.jpg'},
  {id: 7, src: 'https://picsum.photos/id/1060/200/200', label: 'ocean.jpg'},
  {id: 8, src: 'https://picsum.photos/id/1069/200/200', label: 'forest.jpg'},
];

const meta: Meta<typeof Carousel> = {
  title: 'Core/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: {type: 'select'},
      options: [0, 0.5, 1, 1.5, 2, 3, 4],
      description: 'Gap between items',
    },
    hasButtons: {
      control: 'boolean',
      description: 'Show navigation buttons on hover',
    },
    hasSnap: {
      control: 'boolean',
      description: 'Enable scroll-snap',
    },
  },
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: () => (
    <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll or hover for arrows →</p>
      <Carousel gap={1} aria-label="Photo thumbnails">
        {IMAGES.map(img => (
          <Thumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </Carousel>
    </div>
  ),
};

export const WithRemove: Story = {
  name: 'Thumbnails with Remove',
  render: function WithRemoveStory() {
    const [items, setItems] = useState(IMAGES);
    return (
      <div {...stylex.props(styles.constrainedWidth)}>
        <p {...stylex.props(styles.label)}>{items.length} attachments</p>
        <Carousel gap={1} aria-label="Attached files">
          {items.map(img => (
            <Thumbnail
              key={img.id}
              src={img.src}
              alt={img.label}
              label={img.label}
              onRemove={() =>
                setItems(prev => prev.filter(i => i.id !== img.id))
              }
            />
          ))}
        </Carousel>
        {items.length === 0 && (
          <p {...stylex.props(styles.label)}>
            All removed. <button onClick={() => setItems(IMAGES)}>Reset</button>
          </p>
        )}
      </div>
    );
  },
};

export const FewItems: Story = {
  name: 'Few Items (No Overflow)',
  render: () => (
    <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>No overflow — no fade, no buttons</p>
      <Carousel gap={1} aria-label="Small gallery">
        {IMAGES.slice(0, 3).map(img => (
          <Thumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </Carousel>
    </div>
  ),
};

export const Cards: Story = {
  name: 'Card Content',
  render: () => {
    const cards = [
      {id: 1, title: 'Design System', desc: 'Component library'},
      {id: 2, title: 'Documentation', desc: 'API reference'},
      {id: 3, title: 'Storybook', desc: 'Visual testing'},
      {id: 4, title: 'Theme Config', desc: 'Token overrides'},
      {id: 5, title: 'CLI Tools', desc: 'Code generation'},
      {id: 6, title: 'Accessibility', desc: 'ARIA patterns'},
    ];
    return (
      <div style={{maxWidth: 500}}>
        <p {...stylex.props(styles.label)}>Cards in a carousel</p>
        <Carousel gap={2} hasSnap aria-label="Feature cards">
          {cards.map(card => (
            <Card key={card.id} xstyle={styles.card}>
              <div {...stylex.props(styles.cardInner)}>
                <p {...stylex.props(styles.cardTitle)}>{card.title}</p>
                <p {...stylex.props(styles.cardDesc)}>{card.desc}</p>
              </div>
            </Card>
          ))}
        </Carousel>
      </div>
    );
  },
};

export const NoButtons: Story = {
  name: 'Without Buttons',
  render: () => (
    <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll only — no arrow buttons</p>
      <Carousel gap={1} hasButtons={false} aria-label="Scroll-only gallery">
        {IMAGES.map(img => (
          <Thumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </Carousel>
    </div>
  ),
};

export const WithSnap: Story = {
  name: 'Scroll Snap',
  render: () => (
    <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Snaps to items on scroll</p>
      <Carousel gap={2} hasSnap aria-label="Snapping gallery">
        {IMAGES.map(img => (
          <Thumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </Carousel>
    </div>
  ),
};

export const LargeGap: Story = {
  name: 'Large Gap',
  render: () => (
    <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>gap=4 (16px)</p>
      <Carousel gap={4} aria-label="Spaced gallery">
        {IMAGES.map(img => (
          <Thumbnail
            key={img.id}
            src={img.src}
            alt={img.label}
            label={img.label}
          />
        ))}
      </Carousel>
    </div>
  ),
};

export const ColorSwatches: Story = {
  name: 'Custom Content (Swatches)',
  render: () => {
    const colors = [
      '#e74c3c',
      '#e67e22',
      '#f1c40f',
      '#2ecc71',
      '#1abc9c',
      '#3498db',
      '#9b59b6',
      '#34495e',
      '#e84393',
      '#00cec9',
      '#6c5ce7',
      '#fdcb6e',
    ];
    return (
      <div style={{maxWidth: 360}}>
        <p {...stylex.props(styles.label)}>Any content works as children</p>
        <Carousel gap={1.5} aria-label="Color swatches">
          {colors.map(color => (
            <div
              key={color}
              {...stylex.props(styles.colorSwatch)}
              style={{backgroundColor: color}}
              title={color}
            />
          ))}
        </Carousel>
      </div>
    );
  },
};
