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
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSTextArea} from '@xds/core/TextArea';
import {
  colorVars,
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
  'Influencer Activation',
  'Community Building',
  'Seasonal Campaign',
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
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [isDecider, setIsDecider] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted
    ? {
        fullName: !fullName.trim() ? 'Required' : undefined,
        email: !email.trim() ? 'Required' : undefined,
        company: !company.trim() ? 'Required' : undefined,
        phone: !phone.trim() ? 'Required' : undefined,
        goals: goals.length === 0 ? 'Pick at least one' : undefined,
        timeline: !timeline ? 'Required' : undefined,
        budget: !budget ? 'Required' : undefined,
        hearAboutUs: undefined,
      }
    : {};

  const toggleGoal = (goal: string) =>
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal],
    );

  const handleSubmit = () => {
    setSubmitted(true);
  };

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
            <XDSVStack gap={1}>
              <XDSHeading level={1}>Let's work together</XDSHeading>
              <XDSText type="body" color="secondary">
                Tell us a bit about what you're working on — we'd love to help.
              </XDSText>
            </XDSVStack>
          </div>

          <XDSVStack gap={4}>
            {/* Row 1 */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              <XDSTextInput
                label="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChange={setFullName}
                status={errors.fullName ? {type: 'error', message: errors.fullName} : undefined}
              />
              <XDSTextInput
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChange={setEmail}
                status={errors.email ? {type: 'error', message: errors.email} : undefined}
              />
            </div>

            {/* Row 2 */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              <XDSTextInput
                label="Company"
                placeholder="Company"
                value={company}
                onChange={setCompany}
                status={errors.company ? {type: 'error', message: errors.company} : undefined}
              />
              <XDSTextInput
                label="Phone"
                placeholder="Phone number"
                value={phone}
                onChange={setPhone}
                status={errors.phone ? {type: 'error', message: errors.phone} : undefined}
              />
            </div>

            <div style={{paddingBlock: 16}}>
              <XDSDivider label="About your campaign" />
            </div>

            {/* Goals */}
            <XDSVStack gap={2}>
              <XDSText type="label">What are you going for?</XDSText>
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
              {errors.goals && (
                <span style={{fontSize: 12, color: 'var(--xds-color-error)'}}>
                  {errors.goals}
                </span>
              )}
            </XDSVStack>

            <XDSSelector
              label="When are you thinking?"
              placeholder="When are you thinking of launching?"
              options={LAUNCH_OPTIONS}
              value={timeline}
              onChange={setTimeline}
              status={errors.timeline ? {type: 'error', message: errors.timeline} : undefined}
            />

            <XDSSelector
              label="Ballpark budget?"
              placeholder="What's your rough monthly budget?"
              options={BUDGET_OPTIONS}
              value={budget}
              onChange={setBudget}
              status={errors.budget ? {type: 'error', message: errors.budget} : undefined}
            />

            <XDSRadioList
              label="How did you hear about us?"
              value={hearAboutUs}
              onChange={setHearAboutUs}
              status={errors.hearAboutUs ? {type: 'error', message: errors.hearAboutUs} : undefined}>
              <XDSRadioListItem label="Social media" value="social" />
              <XDSRadioListItem label="Word of mouth" value="word-of-mouth" />
              <XDSRadioListItem label="Search engine" value="search" />
              <XDSRadioListItem label="Event or conference" value="event" />
              <XDSRadioListItem label="Other" value="other" />
            </XDSRadioList>

            <XDSTextArea
              label="Anything else?"
              placeholder="Tell us whatever else is on your mind..."
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
              onClick={handleSubmit}
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
