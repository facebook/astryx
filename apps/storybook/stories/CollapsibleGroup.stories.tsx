import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCollapsibleGroup} from '@xds/core/CollapsibleGroup';
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
  title: 'Components/XDSCollapsibleGroup',
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
      <XDSVStack gap="sm">
        <XDSCard title="General Settings" value="general" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Configure your general preferences including language, timezone, and
            display options.
          </p>
        </XDSCard>
        <XDSCard title="Privacy Settings" value="privacy" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Manage who can see your profile, activity, and personal information.
          </p>
        </XDSCard>
        <XDSCard
          title="Notification Settings"
          value="notifications"
          isCollapsible>
          <p {...stylex.props(styles.text)}>
            Choose which notifications you receive and how they are delivered.
          </p>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  ),
};

export const MultipleMode: Story = {
  name: 'Multiple Mode',
  render: () => (
    <XDSCollapsibleGroup type="multiple" defaultValue={['faq1', 'faq3']}>
      <XDSVStack gap="sm">
        <XDSCard title="What is XDS?" value="faq1" isCollapsible>
          <p {...stylex.props(styles.text)}>
            XDS is a design system for building internal tools and products.
          </p>
        </XDSCard>
        <XDSCard title="How do I install it?" value="faq2" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Run <code>npm install @xds/core</code> to get started.
          </p>
        </XDSCard>
        <XDSCard title="Is it open source?" value="faq3" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Yes! XDS is open source and available on GitHub.
          </p>
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
          <XDSVStack gap="sm">
            <XDSCard title="Section 1" value="section1" isCollapsible>
              <p {...stylex.props(styles.text)}>Content for section 1.</p>
            </XDSCard>
            <XDSCard title="Section 2" value="section2" isCollapsible>
              <p {...stylex.props(styles.text)}>Content for section 2.</p>
            </XDSCard>
            <XDSCard title="Section 3" value="section3" isCollapsible>
              <p {...stylex.props(styles.text)}>Content for section 3.</p>
            </XDSCard>
          </XDSVStack>
        </XDSCollapsibleGroup>
      </div>
    );
  },
};

export const StandaloneCollapsibleCard: Story = {
  name: 'Standalone Collapsible Card',
  render: () => (
    <XDSVStack gap="sm">
      <XDSCard title="Collapsible (starts open)" isCollapsible>
        <p {...stylex.props(styles.text)}>
          This card manages its own state. Click the header to toggle.
        </p>
      </XDSCard>
      <XDSCard title="Starts collapsed" isCollapsible={{initialIsOpen: false}}>
        <p {...stylex.props(styles.text)}>
          This card starts collapsed. Click to reveal.
        </p>
      </XDSCard>
    </XDSVStack>
  ),
};

export const FAQ: Story = {
  name: 'FAQ Page',
  render: () => (
    <XDSCollapsibleGroup type="single">
      <XDSVStack gap="sm">
        <XDSCard title="How do I reset my password?" value="q1" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Go to Settings → Security → Change Password. You'll receive a
            confirmation email.
          </p>
        </XDSCard>
        <XDSCard title="Can I change my username?" value="q2" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Usernames can be changed once every 30 days from your profile
            settings.
          </p>
        </XDSCard>
        <XDSCard title="How do I delete my account?" value="q3" isCollapsible>
          <p {...stylex.props(styles.text)}>
            Account deletion is permanent. Go to Settings → Account → Delete
            Account. Your data will be removed within 30 days.
          </p>
        </XDSCard>
        <XDSCard
          title="What payment methods are accepted?"
          value="q4"
          isCollapsible>
          <p {...stylex.props(styles.text)}>
            We accept Visa, Mastercard, American Express, and PayPal.
          </p>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  ),
};
