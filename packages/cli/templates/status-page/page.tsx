'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

// ─── Types ────────────────────────────────────────────────────────────────────

type ComponentStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface SystemComponent {
  name: string;
  status: ComponentStatus;
  uptime: number;
}

interface IncidentUpdate {
  status: string;
  timestamp: string;
  message: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
  updates: IncidentUpdate[];
  affectedComponents: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COMPONENTS: SystemComponent[] = [
  {name: 'API', status: 'operational', uptime: 99.98},
  {name: 'Dashboard', status: 'operational', uptime: 99.95},
  {name: 'Authentication', status: 'degraded', uptime: 99.72},
  {name: 'CDN', status: 'operational', uptime: 99.99},
  {name: 'Database', status: 'operational', uptime: 99.97},
  {name: 'Webhooks', status: 'maintenance', uptime: 98.5},
];

const ACTIVE_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Elevated authentication latency',
    severity: 'major',
    status: 'monitoring',
    createdAt: 'Apr 2, 2026 \u2014 2:15 PM UTC',
    affectedComponents: ['Authentication'],
    updates: [
      {
        status: 'Monitoring',
        timestamp: '3:45 PM UTC',
        message:
          'A fix has been deployed. We are monitoring to confirm the issue is fully resolved.',
      },
      {
        status: 'Identified',
        timestamp: '2:50 PM UTC',
        message:
          'The root cause has been identified as a misconfigured cache layer. A fix is being rolled out.',
      },
      {
        status: 'Investigating',
        timestamp: '2:15 PM UTC',
        message:
          'We are investigating reports of slow login times and intermittent auth failures.',
      },
    ],
  },
];

const PAST_INCIDENTS: Incident[] = [
  {
    id: 'inc-002',
    title: 'Webhook delivery delays',
    severity: 'minor',
    status: 'resolved',
    createdAt: 'Mar 31, 2026 \u2014 9:00 AM UTC',
    affectedComponents: ['Webhooks'],
    updates: [
      {
        status: 'Resolved',
        timestamp: '10:30 AM UTC',
        message:
          'Webhook delivery is back to normal. All queued events have been delivered.',
      },
      {
        status: 'Investigating',
        timestamp: '9:00 AM UTC',
        message: 'We are investigating delayed webhook deliveries.',
      },
    ],
  },
  {
    id: 'inc-003',
    title: 'Scheduled database maintenance',
    severity: 'minor',
    status: 'resolved',
    createdAt: 'Mar 29, 2026 \u2014 4:00 AM UTC',
    affectedComponents: ['Database'],
    updates: [
      {
        status: 'Resolved',
        timestamp: '5:15 AM UTC',
        message: 'Maintenance complete. All systems operating normally.',
      },
      {
        status: 'Monitoring',
        timestamp: '4:45 AM UTC',
        message: 'Migration complete. Monitoring for any issues.',
      },
      {
        status: 'Investigating',
        timestamp: '4:00 AM UTC',
        message:
          'Beginning scheduled maintenance window for database migration.',
      },
    ],
  },
  {
    id: 'inc-004',
    title: 'CDN cache invalidation failure',
    severity: 'major',
    status: 'resolved',
    createdAt: 'Mar 27, 2026 \u2014 1:20 PM UTC',
    affectedComponents: ['CDN'],
    updates: [
      {
        status: 'Resolved',
        timestamp: '3:00 PM UTC',
        message:
          'CDN cache has been fully purged and invalidation is working correctly.',
      },
      {
        status: 'Identified',
        timestamp: '1:55 PM UTC',
        message:
          'A bug in the cache invalidation pipeline has been identified. Deploying fix.',
      },
      {
        status: 'Investigating',
        timestamp: '1:20 PM UTC',
        message:
          'We are investigating stale content being served from CDN edge nodes.',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ComponentStatus,
  {label: string; variant: 'success' | 'warning' | 'error' | 'info'}
> = {
  operational: {label: 'Operational', variant: 'success'},
  degraded: {label: 'Degraded', variant: 'warning'},
  outage: {label: 'Major Outage', variant: 'error'},
  maintenance: {label: 'Maintenance', variant: 'info'},
};

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'neutral'> = {
  critical: 'error',
  major: 'warning',
  minor: 'neutral',
};

function getOverallStatus(components: SystemComponent[]): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info';
} {
  if (components.some(c => c.status === 'outage')) {
    return {label: 'Major System Outage', variant: 'error'};
  }
  if (components.some(c => c.status === 'degraded')) {
    return {label: 'Partial System Degradation', variant: 'warning'};
  }
  if (components.some(c => c.status === 'maintenance')) {
    return {label: 'Scheduled Maintenance', variant: 'info'};
  }
  return {label: 'All Systems Operational', variant: 'success'};
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-background-body'],
    minHeight: '100svh',
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-6'],
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-3'],
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  componentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacingVars['--spacing-3'],
  },
  uptimeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  uptimeBarContainer: {
    flex: 1,
    maxWidth: 400,
  },
  timelineItem: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-icon-secondary'],
    marginTop: 6,
    flexShrink: 0,
  },
  subscribeRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    alignItems: 'flex-end',
  },
  subscribeInput: {
    flex: 1,
    maxWidth: 360,
  },
  dateLabel: {
    minWidth: 72,
    flexShrink: 0,
  },
  affectedList: {
    display: 'flex',
    gap: spacingVars['--spacing-1'],
    flexWrap: 'wrap',
  },
});

// ─── Icons ────────────────────────────────────────────────────────────────────

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={28}
    height={28}
    {...props}>
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path
      d="M7 12h10M7 8h6M7 16h8"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Sub-Components ───────────────────────────────────────────────────────────

function OverallStatusBanner() {
  const overall = getOverallStatus(COMPONENTS);
  return (
    <XDSCard>
      <div {...stylex.props(styles.headerRow)}>
        <XDSVStack gap={1}>
          <div {...stylex.props(styles.logoRow)}>
            <LogoIcon style={{color: 'var(--color-icon-primary)'}} />
            <XDSHeading level={2}>System Status</XDSHeading>
          </div>
          <XDSText type="supporting" color="secondary">
            Current status of all services and infrastructure
          </XDSText>
        </XDSVStack>
        <XDSBadge label={overall.label} variant={overall.variant} />
      </div>
    </XDSCard>
  );
}

function ComponentStatusList() {
  return (
    <XDSCard>
      <XDSVStack gap={2}>
        <XDSHeading level={3}>Components</XDSHeading>
        {COMPONENTS.map((component, i) => {
          const config = STATUS_CONFIG[component.status];
          return (
            <div key={component.name}>
              <div {...stylex.props(styles.componentRow)}>
                <XDSText type="body" weight="semibold">
                  {component.name}
                </XDSText>
                <XDSBadge label={config.label} variant={config.variant} />
              </div>
              {i < COMPONENTS.length - 1 && <XDSDivider />}
            </div>
          );
        })}
      </XDSVStack>
    </XDSCard>
  );
}

function IncidentTimeline({updates}: {updates: IncidentUpdate[]}) {
  return (
    <XDSVStack gap={0}>
      {updates.map((update, i) => (
        <div key={i} {...stylex.props(styles.timelineItem)}>
          <div {...stylex.props(styles.timelineDot)} />
          <XDSVStack gap={0}>
            <XDSHStack gap={2} hAlign="center">
              <XDSText type="body" weight="semibold">
                {update.status}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {update.timestamp}
              </XDSText>
            </XDSHStack>
            <XDSText type="body" color="secondary">
              {update.message}
            </XDSText>
          </XDSVStack>
        </div>
      ))}
    </XDSVStack>
  );
}

function IncidentCard({incident}: {incident: Incident}) {
  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <div {...stylex.props(styles.headerRow)}>
          <XDSVStack gap={1}>
            <XDSHStack gap={2} hAlign="center">
              <XDSText type="body" weight="bold">
                {incident.title}
              </XDSText>
              <XDSBadge
                label={incident.severity}
                variant={SEVERITY_VARIANT[incident.severity] ?? 'neutral'}
              />
            </XDSHStack>
            <XDSText type="supporting" color="secondary">
              {incident.createdAt}
            </XDSText>
          </XDSVStack>
        </div>
        {incident.affectedComponents.length > 0 && (
          <div {...stylex.props(styles.affectedList)}>
            {incident.affectedComponents.map(name => (
              <XDSBadge key={name} label={name} variant="neutral" />
            ))}
          </div>
        )}
        <IncidentTimeline updates={incident.updates} />
      </XDSVStack>
    </XDSCard>
  );
}

function ActiveIncidents() {
  if (ACTIVE_INCIDENTS.length === 0) {
    return (
      <XDSCard>
        <XDSVStack gap={1}>
          <XDSHeading level={3}>Active Incidents</XDSHeading>
          <XDSText type="body" color="secondary">
            No active incidents. All systems are operating normally.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    );
  }

  return (
    <XDSVStack gap={3}>
      <XDSHeading level={3}>Active Incidents</XDSHeading>
      {ACTIVE_INCIDENTS.map(incident => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </XDSVStack>
  );
}

function PastIncidents() {
  return (
    <XDSVStack gap={3}>
      <XDSHeading level={3}>Past Incidents</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Last 7 days
      </XDSText>
      {PAST_INCIDENTS.map(incident => (
        <XDSCollapsible
          key={incident.id}
          label={
            <XDSHStack gap={2} hAlign="center">
              <XDSText type="body" weight="semibold">
                {incident.title}
              </XDSText>
              <XDSBadge
                label={incident.severity}
                variant={SEVERITY_VARIANT[incident.severity] ?? 'neutral'}
              />
            </XDSHStack>
          }>
          <XDSVStack gap={2}>
            <XDSText type="supporting" color="secondary">
              {incident.createdAt}
            </XDSText>
            {incident.affectedComponents.length > 0 && (
              <div {...stylex.props(styles.affectedList)}>
                {incident.affectedComponents.map(name => (
                  <XDSBadge key={name} label={name} variant="neutral" />
                ))}
              </div>
            )}
            <IncidentTimeline updates={incident.updates} />
          </XDSVStack>
        </XDSCollapsible>
      ))}
    </XDSVStack>
  );
}

function UptimeMetrics() {
  const [range, setRange] = useState<'30' | '90'>('90');

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <div {...stylex.props(styles.headerRow)}>
          <XDSHeading level={3}>Uptime \u2014 Last {range} Days</XDSHeading>
          <XDSHStack gap={1}>
            <XDSButton
              label="30d"
              variant={range === '30' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setRange('30')}
            />
            <XDSButton
              label="90d"
              variant={range === '90' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setRange('90')}
            />
          </XDSHStack>
        </div>
        {COMPONENTS.map(component => (
          <div key={component.name} {...stylex.props(styles.uptimeRow)}>
            <div {...stylex.props(styles.dateLabel)}>
              <XDSText type="body" weight="semibold">
                {component.name}
              </XDSText>
            </div>
            <div {...stylex.props(styles.uptimeBarContainer)}>
              <XDSProgressBar
                value={component.uptime}
                label={`${component.name} uptime`}
                isLabelHidden
              />
            </div>
            <XDSText type="supporting" color="secondary">
              {component.uptime.toFixed(2)}%
            </XDSText>
          </div>
        ))}
      </XDSVStack>
    </XDSCard>
  );
}

function SubscribeSection() {
  const [email, setEmail] = useState('');

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSHeading level={3}>Stay Updated</XDSHeading>
          <XDSText type="body" color="secondary">
            Subscribe to receive email notifications when incidents are created,
            updated, or resolved.
          </XDSText>
        </XDSVStack>
        <div {...stylex.props(styles.subscribeRow)}>
          <div {...stylex.props(styles.subscribeInput)}>
            <XDSTextInput
              label="Email"
              isLabelHidden
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              type="email"
            />
          </div>
          <XDSButton label="Subscribe" variant="primary" />
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatusPage() {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.container)}>
        <XDSVStack gap={5}>
          <OverallStatusBanner />
          <ComponentStatusList />
          <ActiveIncidents />
          <UptimeMetrics />
          <XDSDivider />
          <PastIncidents />
          <XDSDivider />
          <SubscribeSection />
          <XDSText type="supporting" color="secondary" align="center">
            \u00A9 2026 Acme Inc. \u00B7 Updated every 60 seconds
          </XDSText>
        </XDSVStack>
      </div>
    </div>
  );
}
