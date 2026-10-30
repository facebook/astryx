// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {PageControl} from '@astryxdesign/lab';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    padding: spacingVars['--spacing-6'],
    fontFamily: typographyVars['--font-family-body'],
  },
  page: {
    width: 280,
    height: 160,
    display: 'grid',
    placeItems: 'center',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-primary'],
    fontSize: 20,
    fontWeight: 600,
  },
});

const meta: Meta<typeof PageControl> = {
  title: 'Lab/PageControl',
  component: PageControl,
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof PageControl>;

function Paged({count, start = 0}: {count: number; start?: number}) {
  const [page, setPage] = useState(start);
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.page)} data-testid="page">
        Page {page + 1}
      </div>
      <PageControl count={count} value={page} onChange={setPage} />
    </div>
  );
}

export const Default: Story = {
  render: () => <Paged count={5} start={2} />,
};

export const ManyPages: Story = {
  name: 'Many Pages (50)',
  render: () => <Paged count={50} start={25} />,
};

export const SinglePageHidden: Story = {
  name: 'Single Page (hidesForSinglePage)',
  render: () => (
    <PageControl count={1} value={0} onChange={() => {}} hidesForSinglePage />
  ),
};
