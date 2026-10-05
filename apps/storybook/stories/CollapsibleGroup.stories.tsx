// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {VStack} from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  canvas: {
    backgroundColor: colorVars['--color-background-body'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    maxWidth: 720,
    padding: spacingVars['--spacing-6'],
  },
  heading: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typographyVars['--text-heading-4-size'],
    fontWeight: typographyVars['--text-heading-4-weight'],
    lineHeight: typographyVars['--text-heading-4-leading'],
    marginBlock: 0,
  },
  body: {
    color: colorVars['--color-text-secondary'],
    marginBlock: 0,
  },
});

const meta: Meta<typeof CollapsibleGroup> = {
  title: 'Core/CollapsibleGroup',
  component: CollapsibleGroup,
  tags: ['autodocs', 'visual-theme-matrix'],
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AuditMatrix: Story = {
  render: () => (
    <VStack gap={6} xstyle={styles.canvas}>
      <section aria-labelledby="collapsible-group-single-heading">
        <VStack gap={2}>
          <h2
            id="collapsible-group-single-heading"
            {...stylex.props(styles.heading)}>
            Single selection with leading chevrons
          </h2>
          <CollapsibleGroup
            type="single"
            hasDividers
            chevronPosition="start"
            defaultValue="profile">
            <Collapsible trigger="Profile settings" value="profile">
              <p {...stylex.props(styles.body)}>
                Update the profile details shown to other people.
              </p>
            </Collapsible>
            <Collapsible trigger="Privacy settings" value="privacy">
              <p {...stylex.props(styles.body)}>
                Choose who can see profile activity.
              </p>
            </Collapsible>
          </CollapsibleGroup>
        </VStack>
      </section>

      <section aria-labelledby="collapsible-group-multiple-heading">
        <VStack gap={2}>
          <h2
            id="collapsible-group-multiple-heading"
            {...stylex.props(styles.heading)}>
            Multiple selection with compact rows
          </h2>
          <CollapsibleGroup
            type="multiple"
            hasDividers
            density="compact"
            defaultValue={['deployment', 'logs']}>
            <Collapsible trigger="Deployment details" value="deployment">
              <p {...stylex.props(styles.body)}>
                The current release is available to everyone.
              </p>
            </Collapsible>
            <Collapsible trigger="Environment variables" value="environment">
              <p {...stylex.props(styles.body)}>
                Twelve variables are configured.
              </p>
            </Collapsible>
            <Collapsible trigger="Build logs" value="logs">
              <p {...stylex.props(styles.body)}>
                The latest build completed successfully.
              </p>
            </Collapsible>
          </CollapsibleGroup>
        </VStack>
      </section>
    </VStack>
  ),
};
