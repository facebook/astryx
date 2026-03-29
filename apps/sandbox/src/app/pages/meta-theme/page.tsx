'use client';

import {XDSTheme} from '@xds/core/theme';
import {metaTheme} from '@xds/theme-meta';
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
import * as stylex from '@stylexjs/stylex';
import {useState} from 'react';

const s = stylex.create({
  page: {
    background: 'var(--color-wash)',
    padding: '32px 24px',
    minHeight: '100vh',
  },
  inner: {maxWidth: 860, margin: '0 auto'},
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--color-secondary)',
    borderBottom: '1px solid var(--color-divider)',
    paddingBottom: 6,
  },
  swatch: {
    width: 52,
    height: 36,
    borderRadius: 6,
    border: '1px solid rgba(0,0,0,0.08)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 3,
  },
  wrap: {flexWrap: 'wrap' as const},
  flex1: {flex: 1},
});

const SWATCHES = [
  {c: '#0064E0', l: 'Accent'},
  {c: '#0A1317', l: 'Gray 1100'},
  {c: '#5D6C7B', l: 'Gray 650'},
  {c: '#DDE2E8', l: 'Gray 150'},
  {c: '#F1F4F7', l: 'Gray 50'},
  {c: '#D31130', l: 'Error'},
  {c: '#147B29', l: 'Success'},
  {c: '#965E03', l: 'Warning'},
];

const SL = ({t}: {t: string}) => <div {...stylex.props(s.label)}>{t}</div>;

export default function Components() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [inp, setInp] = useState('');
  const [sw1, setSw1] = useState(true);
  const [sw2, setSw2] = useState(false);
  const [ck, setCk] = useState(true);
  const [radio, setRadio] = useState('b');
  const [tab, setTab] = useState('overview');
  const [tokens, setTokens] = useState(['Design', 'System', 'XDS']);

  return (
    <XDSTheme theme={metaTheme} mode={mode}>
      <div {...stylex.props(s.page)} style={{colorScheme: mode}}>
        <div {...stylex.props(s.inner)}>
          <XDSVStack gap={8}>
            <XDSHStack
              gap={4}
              alignItems="center"
              justifyContent="space-between">
              <XDSHeading level={2}>Components</XDSHeading>
              <XDSButton
                label={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                variant="secondary"
                size="sm"
                onPress={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
              />
            </XDSHStack>

            <XDSVStack gap={3}>
              <SL t="Color / Palette" />
              <XDSHStack gap={3} {...stylex.props(s.wrap)}>
                {SWATCHES.map(({c, l}) => (
                  <div key={c} {...stylex.props(s.col)}>
                    <div {...stylex.props(s.swatch)} style={{background: c}} />
                    <XDSText type="supporting">{l}</XDSText>
                  </div>
                ))}
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Typography / XDSHeading + XDSText" />
              {([1, 2, 3, 4, 5, 6] as const).map(l => (
                <XDSHeading key={l} level={l}>
                  Heading {l}
                </XDSHeading>
              ))}
              <XDSHStack gap={4} {...stylex.props(s.wrap)}>
                <XDSText type="large">Large</XDSText>
                <XDSText type="body">Body text</XDSText>
                <XDSText type="label" weight="bold">
                  Label bold
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Supporting
                </XDSText>
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSButton" />
              <XDSHStack gap={3} {...stylex.props(s.wrap)}>
                {(
                  ['primary', 'secondary', 'ghost', 'destructive'] as const
                ).map(v => (
                  <XDSButton
                    key={v}
                    label={v[0].toUpperCase() + v.slice(1)}
                    variant={v}
                    onPress={() => {}}
                  />
                ))}
                <XDSButton
                  label="Disabled"
                  variant="primary"
                  isDisabled
                  onPress={() => {}}
                />
              </XDSHStack>
              <XDSHStack gap={3} alignItems="center">
                {(['sm', 'md', 'lg'] as const).map(sz => (
                  <XDSButton
                    key={sz}
                    label={sz.toUpperCase()}
                    variant="secondary"
                    size={sz}
                    onPress={() => {}}
                  />
                ))}
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSBadge" />
              <XDSHStack gap={3} alignItems="center" {...stylex.props(s.wrap)}>
                <XDSBadge variant="info">Info</XDSBadge>
                <XDSBadge variant="success">Success</XDSBadge>
                <XDSBadge variant="warning">Warning</XDSBadge>
                <XDSBadge variant="error">Error</XDSBadge>
                <XDSBadge>42</XDSBadge>
                <XDSBadge>New</XDSBadge>
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSBanner" />
              <XDSVStack gap={2}>
                <XDSBanner
                  status="info"
                  title="Info"
                  description="Something informational to note."
                />
                <XDSBanner
                  status="success"
                  title="Success"
                  description="Operation completed successfully."
                />
                <XDSBanner
                  status="warning"
                  title="Warning"
                  description="Proceed with caution."
                />
                <XDSBanner
                  status="error"
                  title="Error"
                  description="Something went wrong."
                />
              </XDSVStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Layout / XDSCard" />
              <XDSHStack gap={4}>
                {['Card One', 'Card Two'].map(title => (
                  <div key={title} {...stylex.props(s.flex1)}>
                    <XDSCard>
                      <XDSVStack gap={2} style={{padding: 16}}>
                        <XDSHeading level={5}>{title}</XDSHeading>
                        <XDSText type="body">
                          Card content with supporting description text.
                        </XDSText>
                      </XDSVStack>
                    </XDSCard>
                  </div>
                ))}
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSAvatar" />
              <XDSHStack gap={4} alignItems="flex-end">
                {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(
                  size => (
                    <div key={size} {...stylex.props(s.col)}>
                      <XDSAvatar name="Ruby Cheung" size={size} />
                      <XDSText type="supporting">{size}</XDSText>
                    </div>
                  ),
                )}
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Form" />
              <XDSHStack gap={4} {...stylex.props(s.wrap)}>
                <div {...stylex.props(s.flex1)}>
                  <XDSTextInput
                    label="Username"
                    placeholder="Enter username"
                    value={inp}
                    onChange={setInp}
                    description="Your display name"
                  />
                </div>
                <div {...stylex.props(s.flex1)}>
                  <XDSTextInput
                    label="Email"
                    placeholder="Enter email"
                    value=""
                    onChange={() => {}}
                    status={{type: 'error', message: 'Invalid email address'}}
                  />
                </div>
              </XDSHStack>
              <XDSHStack gap={6} {...stylex.props(s.wrap)}>
                <XDSSwitch
                  label="Notifications on"
                  value={sw1}
                  onChange={setSw1}
                />
                <XDSSwitch
                  label="Marketing off"
                  value={sw2}
                  onChange={setSw2}
                />
                <XDSCheckboxInput
                  label="Accept terms"
                  value={ck}
                  onChange={setCk}
                />
              </XDSHStack>
              <XDSRadioList label="Plan" value={radio} onChange={setRadio}>
                <XDSRadioListItem value="a" label="Starter" />
                <XDSRadioListItem value="b" label="Pro" />
                <XDSRadioListItem value="c" label="Enterprise" />
              </XDSRadioList>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Layout / XDSDivider" />
              <XDSDivider />
              <XDSDivider label="Section Break" />
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSProgressBar + XDSSpinner + XDSSkeleton" />
              <XDSHStack
                gap={6}
                alignItems="flex-start"
                {...stylex.props(s.wrap)}>
                <XDSVStack gap={2} style={{flex: 1, minWidth: 200}}>
                  <XDSProgressBar label="Upload" value={65} showValueLabel />
                  <XDSProgressBar label="Processing" isIndeterminate />
                </XDSVStack>
                <XDSHStack gap={3} alignItems="center">
                  {(['sm', 'md', 'lg'] as const).map(sz => (
                    <XDSSpinner key={sz} size={sz} label={sz} />
                  ))}
                </XDSHStack>
                <XDSVStack gap={2}>
                  <XDSSkeleton width={180} height={16} />
                  <XDSSkeleton width={140} height={16} />
                  <XDSSkeleton width={200} height={60} />
                </XDSVStack>
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Navigation / XDSTabList" />
              <XDSTabList value={tab} onChange={setTab} hasDivider>
                <XDSTab value="overview" label="Overview" />
                <XDSTab value="components" label="Components" />
                <XDSTab value="tokens" label="Tokens" />
                <XDSTab value="changelog" label="Changelog" />
              </XDSTabList>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSKbd + XDSToken + XDSLink" />
              <XDSHStack gap={2} alignItems="center">
                <XDSText type="body">Save:</XDSText>
                <XDSKbd>⌘</XDSKbd>
                <XDSKbd>S</XDSKbd>
              </XDSHStack>
              <XDSHStack gap={2} alignItems="center" {...stylex.props(s.wrap)}>
                {tokens.map(t => (
                  <XDSToken
                    key={t}
                    label={t}
                    onRemove={() => setTokens(ts => ts.filter(x => x !== t))}
                  />
                ))}
              </XDSHStack>
              <XDSHStack gap={3}>
                <XDSLink href="#">Documentation</XDSLink>
                <XDSLink href="#">GitHub</XDSLink>
                <XDSLink href="#">Storybook</XDSLink>
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSStatusDot" />
              <XDSHStack gap={6} {...stylex.props(s.wrap)}>
                <XDSStatusDot variant="positive" label="Positive" />
                <XDSStatusDot variant="negative" label="Negative" />
                <XDSStatusDot variant="warning" label="Warning" />
                <XDSStatusDot variant="neutral" label="Neutral" />
              </XDSHStack>
            </XDSVStack>

            <XDSVStack gap={3}>
              <SL t="Core / XDSEmptyState" />
              <XDSHStack
                gap={4}
                alignItems="flex-start"
                {...stylex.props(s.wrap)}>
                <div {...stylex.props(s.flex1)}>
                  <XDSEmptyState
                    title="No results found"
                    description="Try adjusting your search or filters."
                    action={
                      <XDSButton
                        label="Clear filters"
                        variant="secondary"
                        size="sm"
                        onPress={() => {}}
                      />
                    }
                  />
                </div>
                <div {...stylex.props(s.flex1)}>
                  <XDSEmptyState
                    title="Nothing here yet"
                    description="Create your first item to get started."
                    action={
                      <XDSButton
                        label="Create item"
                        variant="primary"
                        size="sm"
                        onPress={() => {}}
                      />
                    }
                  />
                </div>
              </XDSHStack>
            </XDSVStack>
          </XDSVStack>
        </div>
      </div>
    </XDSTheme>
  );
}
