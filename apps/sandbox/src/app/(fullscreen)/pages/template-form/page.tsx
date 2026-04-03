'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {XDSTextArea} from '@xds/core/TextArea';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {
  radiusVars,
  borderVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
  fontWeightVars,
  spacingVars,
} from '@xds/core/theme/tokens.stylex';

const CAMPAIGN_GOALS = [
  'Brand Awareness',
  'Product Sampling',
  'Product Launch',
  'Event Promotion',
  'Retail / In-Store',
  'Trade Show',
  'Other',
];

const LAUNCH_OPTIONS = [
  'Within 30 days',
  '1\u20133 months',
  '3\u20136 months',
  '6\u201312 months',
  '12+ months',
];

const BUDGET_OPTIONS = [
  'Under $5K/mo',
  '$5K\u2013$15K/mo',
  '$15K\u2013$50K/mo',
  '$50K\u2013$100K/mo',
  '$100K+/mo',
];

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  pill: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-full'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: colorVars['--color-background-surface'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pillSelected: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  fullWidth: {
    width: '100%',
  },
});

/**
 * Form (Simple) — lead capture form template
 */
export default function FormSimplePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isDecider, setIsDecider] = useState(false);

  const toggleGoal = (goal: string) =>
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal],
    );

  return (
    <div
      {...stylex.props(styles.pageBg)}
      style={{minHeight: '100svh', display: 'flex', flexDirection: 'column'}}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
          paddingTop: 48,
          paddingBottom: 48,
          paddingLeft: 24,
          paddingRight: 24,
        }}>
        <XDSVStack gap={8}>
          {/* Header */}
          <div style={{textAlign: 'center'}}>
            <XDSVStack gap={2}>
              <XDSHeading level={1}>Get in touch</XDSHeading>
              <XDSText type="body" color="secondary">
                Tell us about your campaign and we'll be in touch shortly.
              </XDSText>
            </XDSVStack>
          </div>

          <XDSVStack gap={4}>
            {/* Row 1 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
              <XDSTextInput
                label="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChange={setFullName}
              />
              <XDSTextInput
                label="Business Email"
                placeholder="you@company.com"
                value={email}
                onChange={setEmail}
              />
            </div>

            {/* Row 2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
              <XDSTextInput
                label="Company"
                placeholder="Company"
                value={company}
                onChange={setCompany}
              />
              <XDSTextInput
                label="Phone"
                placeholder="Phone number"
                value={phone}
                onChange={setPhone}
              />
            </div>

            <XDSDivider label="Campaign Details" />

            {/* Goals */}
            <XDSVStack gap={2}>
              <XDSText type="label">Campaign goals</XDSText>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                {CAMPAIGN_GOALS.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    aria-pressed={goals.includes(goal)}
                    onClick={() => toggleGoal(goal)}
                    {...stylex.props(
                      styles.pill,
                      goals.includes(goal) && styles.pillSelected,
                    )}>
                    {goal}
                  </button>
                ))}
              </div>
            </XDSVStack>

            <XDSSelector
              label="Launch timeline"
              placeholder="When are you looking to launch?"
              options={LAUNCH_OPTIONS}
              value={timeline}
              onChange={setTimeline}
            />

            <XDSSelector
              label="Monthly budget"
              placeholder="What's your estimated monthly budget?"
              options={BUDGET_OPTIONS}
              value={budget}
              onChange={setBudget}
            />

            <XDSTextArea
              label="Leave us a message"
              placeholder="Tell us anything else you'd like us to know..."
              value={message}
              onChange={setMessage}
            />

            <XDSCheckboxInput
              label="I'm a budget decision-maker"
              value={isDecider}
              onChange={setIsDecider}
            />

            <XDSButton
              label="Submit"
              variant="primary"
              size="lg"
              xstyle={styles.fullWidth}
            />

            <XDSHStack gap={1} hAlign="center">
              <XDSText type="supporting" color="secondary">
                By submitting you agree to our{' '}
                <XDSLink label="Privacy Policy" href="#" type="supporting">
                  Privacy Policy
                </XDSLink>
                .
              </XDSText>
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>
      </div>
    </div>
  );
}
