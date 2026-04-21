'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
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
import {
  colorVars,
  typeScaleVars,
  fontWeightVars,
} from '@xds/core/theme/tokens.stylex';

// light-scene-vertical-2 from xds_oss asset set
const BANNER_URL =
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671579969_940118178649402_4522511104889080862_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=RCyQPbhkcRgQ7kNvwF-OGEo&_nc_oc=AdpVzfEVYzLa3On55PG39wuc6G12OiJgEk4bEcgUU2Snr8k3Rrnv3QXE5zZWik7GRURHeIXzRStoqpcF-KZ0FQNu&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=j_DOcV4CdxvzKQgE-8uISA&_nc_ss=7a30f&oh=00_Af3UJlrvjAxkM-Bh2PYYScECcPLx4rY3_6IqN_DodbQ2TQ&oe=69EDD2E8';
const WHY_US_IMAGES = [
  // light-working-horizontal-3 from xds_oss asset set
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673941911_26516873217954372_8426801068656596725_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=kYrBxMsu-XIQ7kNvwG0ALRc&_nc_oc=AdpsvOk_GSeqDZMYyu9XgEXC6sRbDYgskKJ1JIE9ApV4mBEUNtq3UCNLxTd0ziNf8f3rgqqorSiHzRJ3F7Xgwg7U&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=SbFeOZvlQWiw07UnEj8Zwg&_nc_ss=7a30f&oh=00_Af086zBs2S-XGPwqm5wll6ZtPx2l6kbWPvXNCWpFeM4Dzg&oe=69EDBB11',
  // light-working-horizontal-2 from xds_oss asset set
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671588323_987740997112258_5691335682748609046_n.png?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=70KiHu940UwQ7kNvwENkvYe&_nc_oc=Adq-J4tZtztsbv8L7ox4LlF6y1zqwbYmj04smI8hLr6IK5yUCXx0rA8XmCE8G8PUX_ohTPGJrYRdv-_ICWaiFN25&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=-trYwHT8jeTOMvEVq5OLaQ&_nc_ss=7a30f&oh=00_Af3iOmD3mzznUjBacG_SWE8xS6nKOK94TM6KXjNoQZvWjg&oe=69EDE288',
  // light-working-vertical-1 from xds_oss asset set
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671925666_4495480327349179_31826850576590602_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=X4C5kh2r28cQ7kNvwGHycKu&_nc_oc=Adpv6qCiJDDR4DiXZs3DxC9Vns7qO5aV7ToJRiBNE4xzoxd1qwsVePyQ5JO4-bLKKVFpbodppT49JO_-17Z4pSWO&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=yG3_e3LinVYmZOdiA1SQ4w&_nc_ss=7a30f&oh=00_Af1l2Wt6krp_KY7fcPU9hhvzl48uJ0TnKpUKDjwOVk2iOw&oe=69EDB7EB',
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
  pageBg: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  fullWidth: {
    width: '100%',
  },
  errorText: {
    color: colorVars['--color-error'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  displayHeading: {
    fontSize: '56px',
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: '1.05',
    letterSpacing: '-0.03em',
    margin: 0,
    textAlign: 'center',
  },

  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  sectionLabel: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colorVars['--color-text-secondary'],
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
    <div
      {...stylex.props(styles.pageBg)}
      style={{minHeight: '100svh', display: 'flex', flexDirection: 'column'}}>
      {/* Full-bleed banner */}
      <div style={{width: '100%', maxHeight: '15vh', overflow: 'hidden'}}>
        <img
          src={BANNER_URL}
          alt="Decorative banner"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          width: '100%',
          paddingTop: 48,
          paddingBottom: 48,
          paddingLeft: 24,
          paddingRight: 24,
        }}>
        <XDSVStack gap={6}>
          {/* Header */}
          <XDSVStack gap={2} hAlign="center">
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                margin: 0,
                textAlign: 'center',
              }}>
              Let's work together
            </div>
            <XDSText type="body" color="secondary">
              Tell us a bit about what you're working on — we'd love to help.
            </XDSText>
          </XDSVStack>

          {/* Why work with us */}
          <div style={{paddingTop: '5%', paddingBottom: '5%'}}>
            <XDSVStack gap={5}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                {WHY_US.map(item => (
                  <XDSVStack key={item.title} gap={3}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
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
                ))}
              </div>
            </XDSVStack>
          </div>

          {/* Your details */}
          <XDSVStack gap={5}>
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
            </div>
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
            </div>
          </XDSVStack>

          <div style={{paddingTop: 10, paddingBottom: 10}}>
            <XDSDivider />
          </div>

          {/* Your project */}
          <XDSVStack gap={5}>
            <XDSVStack gap={2}>
              <XDSText type="label">What are you going for?</XDSText>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                {CAMPAIGN_GOALS.map(goal => (
                  <XDSToken
                    key={goal}
                    label={goal}
                    color={goals.includes(goal) ? 'blue' : 'default'}
                    onClick={() => toggleGoal(goal)}
                  />
                ))}
              </div>
              {errors.goals && (
                <span {...stylex.props(styles.errorText)}>{errors.goals}</span>
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
              xstyle={styles.fullWidth}
              onClick={() => setSubmitted(true)}
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
