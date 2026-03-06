import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
  text: {
    fontFamily: typographyVars['--font-body'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  textSecondary: {
    color: colorVars['--color-text-secondary'],
    fontSize: 14,
    fontFamily: typographyVars['--font-body'],
    margin: 0,
  },
});

const meta: Meta<typeof XDSCollapsibleGroup> = {
  title: 'Components/XDSCollapsible',
  component: XDSCollapsibleGroup,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSCollapsibleGroup>;

export const SingleMode: Story = {
  name: 'Single Mode (default)',
  render: () => (
    <XDSCollapsibleGroup type="single" defaultValue="general">
      <XDSVStack gap="space2">
        <XDSCard>
          <XDSCollapsible trigger="General Settings" value="general">
            <p {...stylex.props(styles.text)}>
              Configure your general preferences including language, timezone,
              and display options.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Privacy Settings" value="privacy">
            <p {...stylex.props(styles.text)}>
              Manage who can see your profile, activity, and personal
              information.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Notification Settings" value="notifications">
            <p {...stylex.props(styles.text)}>
              Choose which notifications you receive and how they are delivered.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  ),
};

export const MultipleMode: Story = {
  name: 'Multiple Mode',
  render: () => (
    <XDSCollapsibleGroup type="multiple" defaultValue={['faq1', 'faq3']}>
      <XDSVStack gap="space2">
        <XDSCard>
          <XDSCollapsible trigger="What is XDS?" value="faq1">
            <p {...stylex.props(styles.text)}>
              XDS is a design system for building internal tools and products.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="How do I install it?" value="faq2">
            <p {...stylex.props(styles.text)}>
              Run <code>npm install @xds/core</code> to get started.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Is it open source?" value="faq3">
            <p {...stylex.props(styles.text)}>
              Yes! XDS is open source and available on GitHub.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  ),
};

export const Controlled: Story = {
  name: 'Controlled',
  render: function ControlledStory() {
    const [open, setOpen] = useState<string | string[]>('section1');
    return (
      <div>
        <p {...stylex.props(styles.textSecondary)}>
          Currently open: <strong>{String(open) || '(none)'}</strong>
        </p>
        <XDSCollapsibleGroup type="single" value={open} onValueChange={setOpen}>
          <XDSVStack gap="space2">
            <XDSCard>
              <XDSCollapsible trigger="Section 1" value="section1">
                <p {...stylex.props(styles.text)}>Content for section 1.</p>
              </XDSCollapsible>
            </XDSCard>
            <XDSCard>
              <XDSCollapsible trigger="Section 2" value="section2">
                <p {...stylex.props(styles.text)}>Content for section 2.</p>
              </XDSCollapsible>
            </XDSCard>
            <XDSCard>
              <XDSCollapsible trigger="Section 3" value="section3">
                <p {...stylex.props(styles.text)}>Content for section 3.</p>
              </XDSCollapsible>
            </XDSCard>
          </XDSVStack>
        </XDSCollapsibleGroup>
      </div>
    );
  },
};

export const StandaloneCollapsible: Story = {
  name: 'Standalone Collapsible',
  render: () => (
    <XDSVStack gap="space2">
      <XDSCard>
        <XDSCollapsible trigger="Starts open (default)">
          <p {...stylex.props(styles.text)}>
            This collapsible manages its own state. Click the trigger to toggle.
          </p>
        </XDSCollapsible>
      </XDSCard>
      <XDSCard>
        <XDSCollapsible trigger="Starts collapsed" defaultIsOpen={false}>
          <p {...stylex.props(styles.text)}>
            This collapsible starts collapsed. Click to reveal.
          </p>
        </XDSCollapsible>
      </XDSCard>
    </XDSVStack>
  ),
};

export const WithoutCard: Story = {
  name: 'Without Card (standalone)',
  render: () => (
    <XDSVStack gap="space2">
      <XDSCollapsible trigger="Show more details">
        <p {...stylex.props(styles.text)}>
          XDSCollapsible works anywhere — it doesn't require a card wrapper.
        </p>
      </XDSCollapsible>
      <XDSCollapsible trigger="Another section" defaultIsOpen={false}>
        <p {...stylex.props(styles.text)}>This section starts collapsed.</p>
      </XDSCollapsible>
    </XDSVStack>
  ),
};

export const FAQ: Story = {
  name: 'FAQ Page',
  render: () => (
    <XDSCollapsibleGroup type="single">
      <XDSVStack gap="space2">
        <XDSCard>
          <XDSCollapsible trigger="How do I reset my password?" value="q1">
            <p {...stylex.props(styles.text)}>
              Go to Settings → Security → Change Password. You'll receive a
              confirmation email.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Can I change my username?" value="q2">
            <p {...stylex.props(styles.text)}>
              Usernames can be changed once every 30 days from your profile
              settings.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="How do I delete my account?" value="q3">
            <p {...stylex.props(styles.text)}>
              Account deletion is permanent. Go to Settings → Account → Delete
              Account. Your data will be removed within 30 days.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible
            trigger="What payment methods are accepted?"
            value="q4">
            <p {...stylex.props(styles.text)}>
              We accept Visa, Mastercard, American Express, and PayPal.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  ),
};
