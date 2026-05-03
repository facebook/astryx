'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSLink} from '@xds/core/Link';
import {XDSToken} from '@xds/core/Token';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBanner} from '@xds/core/Banner';

const WHY_US_IMAGES = [
  // illustration-horizontal-3 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-3.png',
  // illustration-horizontal-4 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-4.png',
  // illustration-horizontal-5 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-5.png',
];

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

const WHY_US = [
  {
    image: WHY_US_IMAGES[0],
    title: 'We move fast for you',
    description: 'We cut through the noise and get straight to the work.',
  },
  {
    image: WHY_US_IMAGES[1],
    title: 'We build around you',
    description: "We tailor everything to what you're trying to achieve.",
  },
  {
    image: WHY_US_IMAGES[2],
    title: 'We show up for you',
    description: 'A dedicated team that knows your brand and wants to win.',
  },
];

const styles = stylex.create({
  imgFull: {
    width: '100%',
  },
  bannerImage: {
    height: '15vh',
    objectFit: 'cover',
  },
});

/**
 * Contact Form — lead capture form template
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
      }
    : {};

  const toggleGoal = (goal: string) =>
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal],
    );

  return (
    <XDSCenter axis="horizontal">
      <XDSVStack hAlign="center" width="100%">
        {/* Full-bleed banner */}
        <img
          // illustration-horizontal-2 from xds_oss asset set
          src="https://lookaside.facebook.com/assets/xds_oss/illustration-horizontal-2.png"
          alt="Decorative banner"
          {...stylex.props(styles.imgFull, styles.bannerImage)}
        />

        <XDSSection maxWidth={800} padding={6} paddingBlock={10} variant="section">
          <XDSVStack gap={6}>
          {/* Header */}
          <XDSVStack gap={2} hAlign="center">
            <XDSText type="display-1" weight="bold">
              Let's work together
            </XDSText>
            <XDSText type="body" color="secondary">
              Tell us a bit about what you're working on — we'd love to help.
            </XDSText>
          </XDSVStack>

          {/* Why work with us */}
          <XDSVStack gap={5}>
            <XDSGrid minChildWidth={200} gap={4}>
              {WHY_US.map(item => (
                <XDSCard key={item.title}>
                  <XDSVStack gap={3}>
                    <img
                      src={item.image}
                      alt={item.title}
                      {...stylex.props(styles.imgFull)}
                    />
                    <XDSVStack gap={1}>
                      <XDSText type="body" weight="bold">
                        {item.title}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {item.description}
                      </XDSText>
                    </XDSVStack>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          </XDSVStack>

          {/* Your details */}
          <XDSVStack gap={5}>
            <XDSGrid minChildWidth={260} gap={4}>
              <XDSTextInput
                label="Full Name"
                placeholder="Full Name"
                value={fullName}
                onChange={setFullName}
                status={
                  errors.fullName
                    ? {type: 'error', message: errors.fullName}
                    : undefined
                }
              />
              <XDSTextInput
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChange={setEmail}
                status={
                  errors.email
                    ? {type: 'error', message: errors.email}
                    : undefined
                }
              />
            </XDSGrid>
            <XDSGrid minChildWidth={260} gap={4}>
              <XDSTextInput
                label="Company"
                placeholder="Company"
                value={company}
                onChange={setCompany}
                status={
                  errors.company
                    ? {type: 'error', message: errors.company}
                    : undefined
                }
              />
              <XDSTextInput
                label="Phone"
                placeholder="Phone number"
                value={phone}
                onChange={setPhone}
                status={
                  errors.phone
                    ? {type: 'error', message: errors.phone}
                    : undefined
                }
              />
            </XDSGrid>
          </XDSVStack>

          <XDSDivider />

          {/* Your project */}
          <XDSVStack gap={5}>
            <XDSVStack gap={2}>
              <XDSText type="label">What are you going for?</XDSText>
              <XDSHStack gap={2} wrap="wrap">
                {CAMPAIGN_GOALS.map(goal => (
                  <XDSToken
                    key={goal}
                    label={goal}
                    color={goals.includes(goal) ? 'blue' : 'default'}
                    onClick={() => toggleGoal(goal)}
                  />
                ))}
              </XDSHStack>
              {errors.goals && (
                <XDSBanner status="error" title={errors.goals} />
              )}
            </XDSVStack>

            <XDSSelector
              label="When are you thinking?"
              placeholder="When are you thinking of launching?"
              options={LAUNCH_OPTIONS}
              value={timeline}
              onChange={setTimeline}
              status={
                errors.timeline
                  ? {type: 'error', message: errors.timeline}
                  : undefined
              }
            />

            <XDSSelector
              label="Ballpark budget?"
              placeholder="What's your rough monthly budget?"
              options={BUDGET_OPTIONS}
              value={budget}
              onChange={setBudget}
              status={
                errors.budget
                  ? {type: 'error', message: errors.budget}
                  : undefined
              }
            />

            <XDSRadioList
              label="How did you hear about us?"
              value={hearAboutUs}
              onChange={setHearAboutUs}>
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
          </XDSVStack>

          {/* Submit */}
          <XDSVStack gap={3}>
            <XDSButton
              label="Submit"
              variant="primary"
              size="lg"
              onClick={() => setSubmitted(true)}
            />
            <XDSHStack gap={1} hAlign="center">
              <XDSText type="supporting" color="secondary">
                By submitting you agree to our{' '}
                <XDSLink href="#" type="supporting">
                  Privacy Policy
                </XDSLink>
                .
              </XDSText>
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>
      </XDSSection>
      </XDSVStack>
    </XDSCenter>
  );
}
