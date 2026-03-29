'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSLink} from '@xds/core/Link';
import {XDSKbd} from '@xds/core/Kbd';
import {XDSToken} from '@xds/core/Token';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSEmptyState} from '@xds/core/EmptyState';

const styles = stylex.create({
  container: {maxWidth: 860},
  sectionLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--color-divider)',
    marginBottom: '4px',
  },
});

function SectionTitle({children}: {children: string}) {
  return <div {...stylex.props(styles.sectionLabel)}>{children}</div>;
}

const BADGE_VARIANTS = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
] as const;
const AVATAR_SIZES = ['tiny', 'xsmall', 'small', 'medium', 'large'] as const;
const BANNER_STATUSES = ['info', 'success', 'warning', 'error'] as const;
const STATUS_DOT_VARIANTS = [
  'positive',
  'negative',
  'warning',
  'neutral',
] as const;

export default function Components() {
  const [inputVal, setInputVal] = useState('');
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState('a');
  const [tab, setTab] = useState('overview');
  const [tokens, setTokens] = useState(['Design', 'System', 'XDS']);

  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap={8}>
        {/* Typography */}
        <XDSVStack gap={3}>
          <SectionTitle>Typography</SectionTitle>
          {([1, 2, 3, 4, 5, 6] as const).map(level => (
            <XDSHeading key={level} level={level}>
              Heading {level}
            </XDSHeading>
          ))}
          <XDSText type="large" weight="bold">
            Large bold text
          </XDSText>
          <XDSText type="body">Body text — the default reading size.</XDSText>
          <XDSText type="label">Label text</XDSText>
          <XDSText type="supporting" color="secondary">
            Supporting / secondary text
          </XDSText>
        </XDSVStack>

        {/* Buttons */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSButton</SectionTitle>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Primary" variant="primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
            <XDSButton label="Destructive" variant="destructive" />
            <XDSButton label="Disabled" variant="primary" isDisabled />
          </XDSHStack>
          <XDSHStack gap={3} vAlign="center">
            <XDSButton label="Small" size="sm" />
            <XDSButton label="Medium" size="md" />
            <XDSButton label="Large" size="lg" />
          </XDSHStack>
        </XDSVStack>

        {/* Badges */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSBadge</SectionTitle>
          <XDSHStack gap={3} vAlign="center">
            {BADGE_VARIANTS.map(v => (
              <XDSBadge
                key={v}
                variant={v === 'neutral' ? undefined : v}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
              />
            ))}
          </XDSHStack>
          <XDSHStack gap={3} vAlign="center">
            {['1', '12', '99+'].map(n => (
              <XDSBadge key={n} variant="error" label={n} />
            ))}
          </XDSHStack>
        </XDSVStack>

        {/* Banners */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSBanner</SectionTitle>
          {BANNER_STATUSES.map(s => (
            <XDSBanner
              key={s}
              status={s}
              title={`${s.charAt(0).toUpperCase() + s.slice(1)} banner`}
              description={`This is an example ${s} message providing contextual feedback.`}
            />
          ))}
        </XDSVStack>

        {/* Cards */}
        <XDSVStack gap={3}>
          <SectionTitle>Layout / XDSCard</SectionTitle>
          <XDSHStack gap={4}>
            <XDSCard>
              <XDSVStack gap={2}>
                <XDSHeading level={4}>Card Title</XDSHeading>
                <XDSText type="body" color="secondary">
                  Some card body content goes here.
                </XDSText>
                <XDSButton label="Action" variant="primary" size="sm" />
              </XDSVStack>
            </XDSCard>
            <XDSCard>
              <XDSVStack gap={2}>
                <XDSHeading level={4}>Another Card</XDSHeading>
                <XDSText type="body" color="secondary">
                  Cards can hold any content layout.
                </XDSText>
                <XDSButton label="Learn more" variant="ghost" size="sm" />
              </XDSVStack>
            </XDSCard>
          </XDSHStack>
        </XDSVStack>

        {/* Avatars */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSAvatar</SectionTitle>
          <XDSHStack gap={4} vAlign="center">
            {AVATAR_SIZES.map(size => (
              <XDSVStack key={size} gap={1} hAlign="center">
                <XDSAvatar name="Ruby Cheung" size={size} />
                <XDSText type="supporting">{size}</XDSText>
              </XDSVStack>
            ))}
          </XDSHStack>
        </XDSVStack>

        {/* Forms */}
        <XDSVStack gap={4}>
          <SectionTitle>Form</SectionTitle>
          <XDSHStack gap={6}>
            <XDSVStack gap={3} style={{flex: 1}}>
              <XDSTextInput
                label="Name"
                placeholder="Enter your name"
                value={inputVal}
                onChange={setInputVal}
                description="This is a helper description."
              />
              <XDSTextInput
                label="Email (error state)"
                placeholder="you@example.com"
                value=""
                onChange={() => {}}
                status={{type: 'error', message: 'Invalid email address'}}
              />
            </XDSVStack>
            <XDSVStack gap={3}>
              <XDSSwitch
                label="Notifications on"
                value={switchOn}
                onChange={setSwitchOn}
              />
              <XDSSwitch
                label="Auto-update off"
                value={false}
                onChange={() => {}}
              />
              <XDSCheckboxInput
                label="Accept terms"
                value={checked}
                onChange={setChecked}
              />
              <XDSRadioList label="Options" value={radio} onChange={setRadio}>
                <XDSRadioListItem value="a" label="Option A" />
                <XDSRadioListItem value="b" label="Option B" />
                <XDSRadioListItem value="c" label="Option C" />
              </XDSRadioList>
            </XDSVStack>
          </XDSHStack>
        </XDSVStack>

        {/* Dividers */}
        <XDSVStack gap={3}>
          <SectionTitle>Layout / XDSDivider</SectionTitle>
          <XDSDivider />
          <XDSDivider label="Section label" />
        </XDSVStack>

        {/* Progress / Spinner / Skeleton */}
        <XDSVStack gap={3}>
          <SectionTitle>
            Core / XDSProgressBar · XDSSpinner · XDSSkeleton
          </SectionTitle>
          <XDSHStack gap={6} vAlign="start">
            <XDSVStack gap={3} style={{flex: 1}}>
              <XDSProgressBar
                label="Upload progress"
                value={65}
                showValueLabel
              />
              <XDSProgressBar label="Processing…" isIndeterminate />
            </XDSVStack>
            <XDSHStack gap={4} vAlign="center">
              <XDSSpinner size="sm" label="Small" />
              <XDSSpinner size="md" label="Medium" />
              <XDSSpinner size="lg" label="Large" />
            </XDSHStack>
            <XDSVStack gap={2}>
              <XDSSkeleton width={180} height={16} />
              <XDSSkeleton width={120} height={16} />
              <XDSSkeleton width={40} height={40} shape="circle" />
            </XDSVStack>
          </XDSHStack>
        </XDSVStack>

        {/* Tabs */}
        <XDSVStack gap={3}>
          <SectionTitle>Navigation / XDSTabList</SectionTitle>
          <XDSTabList value={tab} onChange={setTab} hasDivider>
            <XDSTab value="overview" label="Overview" />
            <XDSTab value="components" label="Components" />
            <XDSTab value="tokens" label="Tokens" />
            <XDSTab value="changelog" label="Changelog" />
          </XDSTabList>
          <XDSText type="supporting" color="secondary">
            Active tab: {tab}
          </XDSText>
        </XDSVStack>

        {/* Kbd / Token / Link */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSKbd · XDSToken · XDSLink</SectionTitle>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="body">Save with</XDSText>
            <XDSKbd>⌘</XDSKbd>
            <XDSKbd>S</XDSKbd>
          </XDSHStack>
          <XDSHStack gap={2} vAlign="center">
            {tokens.map(t => (
              <XDSToken
                key={t}
                label={t}
                onRemove={() => setTokens(prev => prev.filter(x => x !== t))}
              />
            ))}
          </XDSHStack>
          <XDSHStack gap={4}>
            <XDSLink href="https://github.com/facebookexperimental/xds">
              XDS on GitHub
            </XDSLink>
            <XDSLink href="/pages/example/">Example page</XDSLink>
          </XDSHStack>
        </XDSVStack>

        {/* StatusDot */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSStatusDot</SectionTitle>
          <XDSHStack gap={6} vAlign="center">
            {STATUS_DOT_VARIANTS.map(v => (
              <XDSStatusDot
                key={v}
                variant={v}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
              />
            ))}
          </XDSHStack>
        </XDSVStack>

        {/* EmptyState */}
        <XDSVStack gap={3}>
          <SectionTitle>Core / XDSEmptyState</SectionTitle>
          <XDSHStack gap={6}>
            <XDSEmptyState
              title="No results found"
              description="Try adjusting your search filters to find what you're looking for."
              action={
                <XDSButton
                  label="Clear filters"
                  variant="secondary"
                  size="sm"
                />
              }
            />
            <XDSEmptyState
              title="Nothing here yet"
              description="Get started by creating your first item."
              action={
                <XDSButton label="Create item" variant="primary" size="sm" />
              }
            />
          </XDSHStack>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
