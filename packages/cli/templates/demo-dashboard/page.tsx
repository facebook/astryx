'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core/Divider';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

const kpis = [
  {label: 'Total Users', value: '12,847', change: '+14%', trend: 'up' as const},
  {label: 'Active Now', value: '1,024', change: '+3%', trend: 'up' as const},
  {label: 'Revenue', value: '$48.2k', change: '-2%', trend: 'down' as const},
  {label: 'Conversion', value: '3.2%', change: '+0.4%', trend: 'up' as const},
];

const recentItems = [
  {id: 1, name: 'Acme Corp', status: 'Active', amount: '$12,400'},
  {id: 2, name: 'Globex Inc', status: 'Pending', amount: '$8,200'},
  {id: 3, name: 'Initech', status: 'Active', amount: '$6,800'},
  {id: 4, name: 'Umbrella Ltd', status: 'Churned', amount: '$3,100'},
  {id: 5, name: 'Stark Industries', status: 'Active', amount: '$22,900'},
];

const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
    maxWidth: 1200,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacingVars['--spacing-4'],
  },
  kpiCard: {
    padding: spacingVars['--spacing-5'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    color: colorVars['--color-text-primary'],
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'start' as const,
    padding: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    borderBottom: `1px solid ${colorVars['--color-border']}`,
    color: colorVars['--color-text-secondary'],
    fontSize: 13,
    fontWeight: 500,
  },
  td: {
    padding: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    borderBottom: `1px solid ${colorVars['--color-border']}`,
  },
});

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={20}
    height={20}
    {...props}>
    <path d="M3 12l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={20}
    height={20}
    {...props}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={20}
    height={20}
    {...props}>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    <circle cx="17" cy="9" r="3" />
    <path d="M21 21v-2a3 3 0 00-2-2.83" />
  </svg>
);

function statusVariant(status: string) {
  if (status === 'Active') return 'success' as const;
  if (status === 'Pending') return 'warning' as const;
  return 'error' as const;
}

export default function DemoDashboard() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <XDSAppShell
      sideNav={
        <XDSSideNav>
          <XDSSideNavSection title="Main" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              icon={HomeIcon}
              isSelected={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <XDSSideNavItem
              label="Dashboard"
              icon={ChartIcon}
              isSelected={activePage === 'dashboard'}
              onClick={() => setActivePage('dashboard')}
            />
            <XDSSideNavItem
              label="Customers"
              icon={UsersIcon}
              isSelected={activePage === 'customers'}
              onClick={() => setActivePage('customers')}
            />
          </XDSSideNavSection>
        </XDSSideNav>
      }
      contentPadding={6}>
      <div {...stylex.props(styles.content)}>
        <XDSHeading level={1}>Dashboard</XDSHeading>

        <div {...stylex.props(styles.kpiGrid)}>
          {kpis.map(kpi => (
            <XDSCard key={kpi.label}>
              <div {...stylex.props(styles.kpiCard)}>
                <XDSText type="body" color="secondary" size="sm">
                  {kpi.label}
                </XDSText>
                <div {...stylex.props(styles.kpiValue)}>{kpi.value}</div>
                <XDSBadge
                  variant={kpi.trend === 'up' ? 'success' : 'error'}
                  label={kpi.change}
                />
              </div>
            </XDSCard>
          ))}
        </div>

        <XDSDivider />

        <div>
          <XDSHeading level={2}>Recent Customers</XDSHeading>
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Name</th>
                <th {...stylex.props(styles.th)}>Status</th>
                <th {...stylex.props(styles.th)}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map(item => (
                <tr key={item.id}>
                  <td {...stylex.props(styles.td)}>
                    <XDSText type="body">{item.name}</XDSText>
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <XDSBadge
                      variant={statusVariant(item.status)}
                      label={item.status}
                    />
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <XDSText type="body">{item.amount}</XDSText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </XDSAppShell>
  );
}
