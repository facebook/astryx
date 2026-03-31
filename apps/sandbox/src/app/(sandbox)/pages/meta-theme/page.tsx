'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
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
import {XDSSegmentedControl, XDSSegmentedControlItem} from '@xds/core/SegmentedControl';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSSection} from '@xds/core/Section';
import {XDSSlider} from '@xds/core/Slider';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {useThemeControls} from '../../../providers';

const styles = stylex.create({
  page: {maxWidth: 1080, width: '100%'},
  grid2: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16},
  grid3: {display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16},
  grid4: {display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16},
  statValue: {fontSize: '2rem', fontWeight: 700, lineHeight: 1.1},
  statChange: {fontSize: '0.75rem', fontWeight: 500},
  positive: {color: 'var(--color-text-success)'},
  negative: {color: 'var(--color-text-error)'},
  miniChart: {display: 'flex', alignItems: 'flex-end', gap: 2, height: 32},
  chartBar: {width: 4, borderRadius: 2, backgroundColor: 'var(--color-accent)', opacity: 0.6},
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 10,
    paddingInline: 12,
  },
  tableHeader: {borderBottom: '1px solid var(--color-divider)'},
  tableRowHover: {':hover': {backgroundColor: 'var(--color-surface-secondary)'}},
  activityDot: {
    width: 8, height: 8, borderRadius: '50%',
    backgroundColor: 'var(--color-accent)', flexShrink: 0,
  },
  activityLine: {
    width: 1, height: 20,
    backgroundColor: 'var(--color-divider)', marginInlineStart: 3,
  },
  sidePanel: {minWidth: 280, maxWidth: 320},
  flex1: {flex: 1, minWidth: 0},
});

function MiniChart({data}: {data: number[]}) {
  const max = Math.max(...data);
  return (
    <div {...stylex.props(styles.miniChart)}>
      {data.map((v, i) => (
        <div key={i} {...stylex.props(styles.chartBar)} style={{height: `${(v / max) * 100}%`}} />
      ))}
    </div>
  );
}

function StatCard({label, value, change, trend, chart}: {
  label: string; value: string; change: string; trend: 'up' | 'down'; chart: number[];
}) {
  return (
    <XDSCard>
      <XDSVStack gap={2}>
        <XDSHStack gap={2} hAlign="spaceBetween" vAlign="center">
          <XDSText type="label" color="secondary">{label}</XDSText>
          <MiniChart data={chart} />
        </XDSHStack>
        <XDSHStack gap={2} vAlign="baseline">
          <div {...stylex.props(styles.statValue)}>{value}</div>
          <div {...stylex.props(styles.statChange, trend === 'up' ? styles.positive : styles.negative)}>
            {trend === 'up' ? '\u2191' : '\u2193'} {change}
          </div>
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}

function ActivityItem({name, action, time, isLast}: {
  name: string; action: string; time: string; isLast?: boolean;
}) {
  return (
    <XDSHStack gap={3}>
      <XDSVStack hAlign="center">
        <div {...stylex.props(styles.activityDot)} />
        {!isLast && <div {...stylex.props(styles.activityLine)} />}
      </XDSVStack>
      <XDSVStack gap={0}>
        <XDSText type="body">
          <XDSText type="body" weight="bold">{name}</XDSText>{' '}{action}
        </XDSText>
        <XDSText type="supporting" color="secondary">{time}</XDSText>
      </XDSVStack>
    </XDSHStack>
  );
}

function ProjectRow({name, status, members, progress}: {
  name: string; status: 'active' | 'review' | 'completed' | 'paused'; members: string[]; progress: number;
}) {
  const badgeVariant = status === 'active' ? 'info'
    : status === 'completed' ? 'success'
    : status === 'paused' ? undefined
    : 'warning';
  return (
    <div {...stylex.props(styles.tableRow, styles.tableRowHover)}>
      <XDSText type="body" weight="semibold">{name}</XDSText>
      <XDSBadge variant={badgeVariant} label={status.charAt(0).toUpperCase() + status.slice(1)} />
      <XDSHStack gap={-1}>
        {members.map(m => <XDSAvatar key={m} name={m} size="tiny" />)}
      </XDSHStack>
      <XDSProgressBar label="Progress" value={progress} />
      <XDSMoreMenu items={[
        {label: 'View details', onClick: () => {}},
        {label: 'Edit', onClick: () => {}},
        {type: 'divider'},
        {label: 'Archive', onClick: () => {}},
      ]} />
    </div>
  );
}

export default function MetaThemePage() {
  const {setThemeName} = useThemeControls();
  useState(() => { setThemeName('meta'); });

  const [tab, setTab] = useState('overview');
  const [period, setPeriod] = useState('week');
  const [searchVal, setSearchVal] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifSlack, setNotifSlack] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  const [volume, setVolume] = useState(70);
  const [feedback, setFeedback] = useState('');
  const [tokens, setTokens] = useState(['Design Systems', 'React', 'TypeScript', 'Meta']);
  const [checked, setChecked] = useState(false);

  return (
    <XDSTheme theme={metaTheme}>
      <div {...stylex.props(styles.page)}>
        <XDSVStack gap={6}>
          {/* Page Header */}
          <XDSHStack hAlign="spaceBetween" vAlign="center">
            <XDSVStack gap={1}>
              <XDSHeading level={2}>Dashboard</XDSHeading>
              <XDSText type="body" color="secondary">
                Welcome back. Here&apos;s what&apos;s happening with your projects.
              </XDSText>
            </XDSVStack>
            <XDSHStack gap={2}>
              <XDSSegmentedControl value={period} onChange={setPeriod} size="sm">
                <XDSSegmentedControlItem value="day" label="Day" />
                <XDSSegmentedControlItem value="week" label="Week" />
                <XDSSegmentedControlItem value="month" label="Month" />
              </XDSSegmentedControl>
              <XDSButton label="Export" variant="secondary" size="sm" />
              <XDSButton label="New project" variant="primary" size="sm" />
            </XDSHStack>
          </XDSHStack>

          {/* Stats Row */}
          <div {...stylex.props(styles.grid4)}>
            <StatCard label="Total Users" value="12,486" change="12.5%" trend="up" chart={[4,6,5,8,7,9,11,10,13,12]} />
            <StatCard label="Active Projects" value="34" change="3 new" trend="up" chart={[3,4,3,5,4,6,5,7,6,8]} />
            <StatCard label="Completion Rate" value="87.3%" change="2.1%" trend="up" chart={[70,72,75,74,78,80,82,84,85,87]} />
            <StatCard label="Open Issues" value="23" change="5 closed" trend="down" chart={[35,32,30,28,27,26,25,24,24,23]} />
          </div>

          {/* Banner */}
          <XDSBanner
            status="info"
            title="System maintenance scheduled"
            description="Planned downtime on Saturday, April 5 from 2:00 AM &ndash; 4:00 AM UTC. Save your work beforehand."
          />

          {/* Tabs */}
          <XDSVStack gap={4}>
            <XDSTabList value={tab} onChange={setTab} hasDivider>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="projects" label="Projects" />
              <XDSTab value="team" label="Team" />
              <XDSTab value="settings" label="Settings" />
            </XDSTabList>

            {tab === 'overview' && (
              <XDSHStack gap={4}>
                <div {...stylex.props(styles.flex1)}>
                  <XDSVStack gap={4}>
                    <XDSSection title="Recent Projects">
                      <XDSVStack gap={0}>
                        <div {...stylex.props(styles.tableRow, styles.tableHeader)}>
                          <XDSText type="label" color="secondary">Project</XDSText>
                          <XDSText type="label" color="secondary">Status</XDSText>
                          <XDSText type="label" color="secondary">Team</XDSText>
                          <XDSText type="label" color="secondary">Progress</XDSText>
                          <span />
                        </div>
                        <ProjectRow name="Design System v2" status="active" members={['Alice','Bob','Carol']} progress={72} />
                        <ProjectRow name="Mobile App Redesign" status="review" members={['Dave','Eve']} progress={91} />
                        <ProjectRow name="API Gateway" status="completed" members={['Frank','Grace','Heidi','Ivan']} progress={100} />
                        <ProjectRow name="Analytics Dashboard" status="active" members={['Judy','Karl']} progress={45} />
                        <ProjectRow name="Auth Service" status="paused" members={['Liam']} progress={30} />
                      </XDSVStack>
                    </XDSSection>

                    <XDSSection title="Quick Feedback">
                      <XDSVStack gap={3}>
                        <div {...stylex.props(styles.grid2)}>
                          <XDSTextInput label="Subject" placeholder="What&apos;s this about?" value={searchVal} onChange={setSearchVal} />
                          <XDSDropdownMenu
                            button={{label: 'Category', variant: 'secondary', size: 'md'}}
                            menuWidth={200}
                            items={[
                              {label: 'Bug Report', onClick: () => {}},
                              {label: 'Feature Request', onClick: () => {}},
                              {label: 'General Feedback', onClick: () => {}},
                            ]}
                          />
                        </div>
                        <XDSTextArea label="Message" placeholder="Share your thoughts..." value={feedback} onChange={setFeedback} rows={3} />
                        <XDSHStack gap={2} vAlign="center">
                          <XDSHStack gap={2} style={{flex: 1}}>
                            {tokens.map(t => (
                              <XDSToken key={t} label={t} onRemove={() => setTokens(prev => prev.filter(x => x !== t))} />
                            ))}
                          </XDSHStack>
                          <XDSButton label="Send feedback" variant="primary" size="sm" />
                        </XDSHStack>
                      </XDSVStack>
                    </XDSSection>

                    <XDSSection title="Loading States">
                      <XDSHStack gap={6} vAlign="start">
                        <XDSVStack gap={3} style={{flex: 1}}>
                          <XDSProgressBar label="Uploading assets…" value={65} hasValueLabel />
                          <XDSProgressBar label="Processing data…" isIndeterminate />
                        </XDSVStack>
                        <XDSHStack gap={4} vAlign="center">
                          <XDSSpinner size="sm" />
                          <XDSSpinner size="md" />
                          <XDSSpinner size="lg" />
                        </XDSHStack>
                        <XDSVStack gap={2}>
                          <XDSSkeleton width={200} height={16} />
                          <XDSSkeleton width={140} height={16} />
                          <XDSSkeleton width={40} height={40} radius="rounded" />
                        </XDSVStack>
                      </XDSHStack>
                    </XDSSection>
                  </XDSVStack>
                </div>

                {/* Side Panel */}
                <div {...stylex.props(styles.sidePanel)}>
                  <XDSVStack gap={4}>
                    <XDSCard>
                      <XDSVStack gap={3} hAlign="center">
                        <XDSAvatar name="Ruby Cheung" size="large" />
                        <XDSVStack gap={0} hAlign="center">
                          <XDSText type="body" weight="bold">Ruby Cheung</XDSText>
                          <XDSText type="supporting" color="secondary">Design Systems Lead</XDSText>
                        </XDSVStack>
                        <XDSStatusDot variant="positive" label="Online" />
                        <XDSDivider />
                        <XDSMetadataList>
                          <XDSMetadataListItem label="Team" value="XDS Core" />
                          <XDSMetadataListItem label="Location" value="Menlo Park" />
                          <XDSMetadataListItem label="Joined" value="Jan 2024" />
                        </XDSMetadataList>
                      </XDSVStack>
                    </XDSCard>
                    <XDSCard>
                      <XDSVStack gap={3}>
                        <XDSHStack hAlign="spaceBetween" vAlign="center">
                          <XDSText type="body" weight="bold">Recent Activity</XDSText>
                          <XDSBadge label="5 new" variant="info" />
                        </XDSHStack>
                        <XDSDivider />
                        <ActivityItem name="Alice" action="merged PR #482" time="5 min ago" />
                        <ActivityItem name="Bob" action="opened issue #91" time="22 min ago" />
                        <ActivityItem name="Carol" action="deployed v2.4.0" time="1 hour ago" />
                        <ActivityItem name="Dave" action="commented on PR #479" time="3 hours ago" isLast />
                      </XDSVStack>
                    </XDSCard>
                    <XDSCard>
                      <XDSVStack gap={2}>
                        <XDSText type="body" weight="bold">Shortcuts</XDSText>
                        <XDSDivider />
                        <XDSHStack hAlign="spaceBetween" vAlign="center">
                          <XDSText type="body">Search</XDSText><XDSKbd keys="mod+k" />
                        </XDSHStack>
                        <XDSHStack hAlign="spaceBetween" vAlign="center">
                          <XDSText type="body">Save</XDSText><XDSKbd keys="mod+s" />
                        </XDSHStack>
                        <XDSHStack hAlign="spaceBetween" vAlign="center">
                          <XDSText type="body">New project</XDSText><XDSKbd keys="mod+n" />
                        </XDSHStack>
                      </XDSVStack>
                    </XDSCard>
                  </XDSVStack>
                </div>
              </XDSHStack>
            )}

            {tab === 'settings' && (
              <div {...stylex.props(styles.grid2)}>
                <XDSCard>
                  <XDSVStack gap={4}>
                    <XDSVStack gap={1}>
                      <XDSHeading level={4}>Notifications</XDSHeading>
                      <XDSText type="body" color="secondary">Choose how you want to be notified.</XDSText>
                    </XDSVStack>
                    <XDSDivider />
                    <XDSSwitch label="Email notifications" value={notifEmail} onChange={setNotifEmail} />
                    <XDSSwitch label="Push notifications" value={notifPush} onChange={setNotifPush} />
                    <XDSSwitch label="Slack integration" value={notifSlack} onChange={setNotifSlack} />
                    <XDSDivider />
                    <XDSRadioList label="Digest frequency" value={frequency} onChange={setFrequency}>
                      <XDSRadioListItem value="realtime" label="Real-time" />
                      <XDSRadioListItem value="daily" label="Daily digest" />
                      <XDSRadioListItem value="weekly" label="Weekly summary" />
                    </XDSRadioList>
                  </XDSVStack>
                </XDSCard>
                <XDSCard>
                  <XDSVStack gap={4}>
                    <XDSVStack gap={1}>
                      <XDSHeading level={4}>Preferences</XDSHeading>
                      <XDSText type="body" color="secondary">Customize your experience.</XDSText>
                    </XDSVStack>
                    <XDSDivider />
                    <XDSTextInput label="Display name" placeholder="Your name" value="Ruby Cheung" onChange={() => {}} />
                    <XDSTextInput label="Email" placeholder="you@example.com" value="ruby@meta.com" onChange={() => {}} status={{type: 'success', message: 'Email verified'}} />
                    <XDSSlider label="Font size" value={volume} onChange={setVolume} min={50} max={150} />
                    <XDSCheckboxInput label="Enable beta features" value={checked} onChange={setChecked} />
                    <XDSDivider />
                    <XDSHStack gap={2} hAlign="end">
                      <XDSButton label="Cancel" variant="ghost" size="sm" />
                      <XDSButton label="Save changes" variant="primary" size="sm" />
                    </XDSHStack>
                  </XDSVStack>
                </XDSCard>
              </div>
            )}

            {tab === 'team' && (
              <XDSVStack gap={4}>
                <XDSHStack gap={2} hAlign="spaceBetween" vAlign="center">
                  <XDSTextInput label="" placeholder="Search team members…" value="" onChange={() => {}} />
                  <XDSButton label="Invite member" variant="primary" size="sm" />
                </XDSHStack>
                <div {...stylex.props(styles.grid3)}>
                  {[
                    {name: 'Alice Zhang', role: 'Engineer', status: 'positive' as const},
                    {name: 'Bob Kim', role: 'Designer', status: 'positive' as const},
                    {name: 'Carol Lee', role: 'PM', status: 'warning' as const},
                    {name: 'Dave Patel', role: 'Engineer', status: 'neutral' as const},
                    {name: 'Eve Chen', role: 'Engineer', status: 'positive' as const},
                    {name: 'Frank Wu', role: 'QA Lead', status: 'negative' as const},
                  ].map(member => (
                    <XDSCard key={member.name}>
                      <XDSHStack gap={3} vAlign="center">
                        <XDSAvatar name={member.name} size="medium" />
                        <XDSVStack gap={0} style={{flex: 1}}>
                          <XDSText type="body" weight="semibold">{member.name}</XDSText>
                          <XDSText type="supporting" color="secondary">{member.role}</XDSText>
                        </XDSVStack>
                        <XDSStatusDot variant={member.status} />
                      </XDSHStack>
                    </XDSCard>
                  ))}
                </div>
              </XDSVStack>
            )}

            {tab === 'projects' && (
              <XDSEmptyState
                title="Coming soon"
                description="The full project view is being built. Switch to Overview to see projects in table form."
                actions={<XDSButton label="Go to Overview" variant="primary" size="sm" onPress={() => setTab('overview')} />}
              />
            )}
          </XDSVStack>

          {/* Footer */}
          <XDSDivider />
          <XDSHStack hAlign="spaceBetween" vAlign="center">
            <XDSText type="supporting" color="secondary">Built with XDS · Meta Theme</XDSText>
            <XDSHStack gap={4}>
              <XDSLink href="https://github.com/facebookexperimental/xds" label="GitHub">GitHub</XDSLink>
              <XDSLink href="/pages/theme-editor/" label="Theme Editor">Theme Editor</XDSLink>
            </XDSHStack>
          </XDSHStack>
        </XDSVStack>
      </div>
    </XDSTheme>
  );
}
