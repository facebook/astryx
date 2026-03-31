'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavCollapseButton,
} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

// =============================================================================
// Icons
// =============================================================================

const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const OrdersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);

// =============================================================================
// Mock data
// =============================================================================

const stats = [
  {
    label: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    positive: true,
  },
  {label: 'Subscriptions', value: '2,350', change: '+180.1%', positive: true},
  {label: 'Active Users', value: '12,234', change: '+19%', positive: true},
  {label: 'Bounce Rate', value: '21.3%', change: '-4.5%', positive: true},
];

interface OrderRow extends Record<string, unknown> {
  id: string;
  customer: string;
  avatar: string;
  email: string;
  amount: string;
  status: 'completed' | 'processing' | 'failed';
  date: string;
}

const recentOrders: OrderRow[] = [
  {
    id: '1',
    customer: 'Olivia Martin',
    avatar: 'https://i.pravatar.cc/36?img=1',
    email: 'olivia@example.com',
    amount: '$1,999.00',
    status: 'completed',
    date: 'Mar 28',
  },
  {
    id: '2',
    customer: 'Jackson Lee',
    avatar: 'https://i.pravatar.cc/36?img=2',
    email: 'jackson@example.com',
    amount: '$39.00',
    status: 'processing',
    date: 'Mar 27',
  },
  {
    id: '3',
    customer: 'Isabella Nguyen',
    avatar: 'https://i.pravatar.cc/36?img=3',
    email: 'isabella@example.com',
    amount: '$299.00',
    status: 'completed',
    date: 'Mar 27',
  },
  {
    id: '4',
    customer: 'William Kim',
    avatar: 'https://i.pravatar.cc/36?img=4',
    email: 'will@example.com',
    amount: '$99.00',
    status: 'failed',
    date: 'Mar 26',
  },
  {
    id: '5',
    customer: 'Sofia Davis',
    avatar: 'https://i.pravatar.cc/36?img=5',
    email: 'sofia@example.com',
    amount: '$599.00',
    status: 'completed',
    date: 'Mar 26',
  },
];

const teamMembers = [
  {
    name: 'Sofia Davis',
    role: 'Engineering Lead',
    avatar: 'https://i.pravatar.cc/36?img=5',
  },
  {
    name: 'Jackson Lee',
    role: 'Product Designer',
    avatar: 'https://i.pravatar.cc/36?img=2',
  },
  {
    name: 'Isabella Nguyen',
    role: 'Frontend Engineer',
    avatar: 'https://i.pravatar.cc/36?img=3',
  },
];

// =============================================================================
// Table columns
// =============================================================================

const orderColumns: XDSTableColumn<OrderRow>[] = [
  {
    key: 'customer',
    header: 'Customer',
    width: proportional(4),
    renderCell: (item: OrderRow) => (
      <XDSHStack gap={3} vAlign="center">
        <XDSAvatar src={item.avatar} name={item.customer} size="small" />
        <XDSVStack gap={0}>
          <XDSText type="body" weight="bold">
            {item.customer}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {item.email}
          </XDSText>
        </XDSVStack>
      </XDSHStack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(130),
    renderCell: (item: OrderRow) => (
      <XDSBadge
        variant={
          item.status === 'completed'
            ? 'success'
            : item.status === 'processing'
              ? 'info'
              : 'error'
        }
        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      />
    ),
  },
  {
    key: 'date',
    header: 'Date',
    width: pixel(100),
    renderCell: (item: OrderRow) => (
      <XDSText type="supporting" color="secondary">
        {item.date}
      </XDSText>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    width: pixel(120),
    renderCell: (item: OrderRow) => (
      <XDSText type="body" weight="bold">
        {item.amount}
      </XDSText>
    ),
  },
];

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  statCard: {
    padding: '20px 24px',
  },
  changePositive: {
    color: '#16a34a',
  },
  changeNegative: {
    color: '#dc2626',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 24,
  },
  chartPlaceholder: {
    height: 240,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'var(--color-surface-wash, #f5f5f5)',
  },
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 180,
    padding: '0 24px',
  },
  bar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    backgroundColor: 'var(--color-action-primary, #0066ff)',
    opacity: 0.8,
    minWidth: 20,
  },
  barLabel: {
    textAlign: 'center' as const,
    marginTop: 8,
  },
  teamCard: {
    padding: 16,
  },
  progress: {
    padding: '0 24px 24px',
  },
});

// =============================================================================
// Components
// =============================================================================

function StatCard({label, value, change, positive}: (typeof stats)[0]) {
  return (
    <XDSCard>
      <div {...stylex.props(styles.statCard)}>
        <XDSVStack gap={1}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <XDSText type="large" weight="bold">
            {value}
          </XDSText>
          <XDSText type="supporting" color={positive ? undefined : 'secondary'}>
            <span
              {...stylex.props(
                positive ? styles.changePositive : styles.changeNegative,
              )}>
              {change}
            </span>{' '}
            from last month
          </XDSText>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

const monthlyData = [
  {month: 'Jan', value: 65},
  {month: 'Feb', value: 45},
  {month: 'Mar', value: 80},
  {month: 'Apr', value: 55},
  {month: 'May', value: 70},
  {month: 'Jun', value: 90},
  {month: 'Jul', value: 60},
  {month: 'Aug', value: 85},
  {month: 'Sep', value: 75},
  {month: 'Oct', value: 95},
  {month: 'Nov', value: 88},
  {month: 'Dec', value: 72},
];

function MiniBarChart() {
  const max = Math.max(...monthlyData.map(d => d.value));
  return (
    <XDSVStack gap={2}>
      <div {...stylex.props(styles.barChart)}>
        {monthlyData.map(d => (
          <div
            key={d.month}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <div
              {...stylex.props(styles.bar)}
              style={{height: `${(d.value / max) * 100}%`}}
            />
            <div {...stylex.props(styles.barLabel)}>
              <XDSText type="supporting" color="secondary">
                {d.month}
              </XDSText>
            </div>
          </div>
        ))}
      </div>
    </XDSVStack>
  );
}

// =============================================================================
// Sidebar
// =============================================================================

function DashboardSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
          <XDSNavIcon
            icon={<AnalyticsIcon style={{width: 16, height: 16}} />}
          />
          <XDSText type="body" weight="bold">
            Acme Inc
          </XDSText>
        </div>
      }
      footer={<XDSSideNavCollapseButton />}>
      <XDSSideNavSection title="Overview">
        <XDSSideNavItem
          label="Dashboard"
          icon={DashboardIcon}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={AnalyticsIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Management">
        <XDSSideNavItem
          label="Customers"
          icon={UsersIcon}
          isSelected={active === 'customers'}
          onClick={() => setActive('customers')}
        />
        <XDSSideNavItem
          label="Orders"
          icon={OrdersIcon}
          isSelected={active === 'orders'}
          onClick={() => setActive('orders')}
        />
        <XDSSideNavItem
          label="Settings"
          icon={SettingsIcon}
          isSelected={active === 'settings'}
          onClick={() => setActive('settings')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// =============================================================================
// TopNav
// =============================================================================

function DashboardTopNav() {
  return (
    <XDSTopNav
      startContent={
        <>
          <XDSTopNavItem label="Overview" isSelected />
          <XDSTopNavItem label="Analytics" />
          <XDSTopNavItem label="Reports" />
        </>
      }
      endContent={
        <XDSAvatar
          src="https://i.pravatar.cc/36?img=12"
          name="Admin User"
          size="xsmall"
        />
      }>
      <XDSTopNavHeading>Dashboard</XDSTopNavHeading>
    </XDSTopNav>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function DashboardTemplate() {
  return (
    <XDSAppShell
      sideNav={<DashboardSideNav />}
      topNav={<DashboardTopNav />}
      variant="elevated"
      contentPadding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={1}>
          <XDSHeading level={1}>Dashboard</XDSHeading>
          <XDSText type="body" color="secondary">
            Welcome back! Here&apos;s what&apos;s happening with your business
            today.
          </XDSText>
        </XDSVStack>

        {/* Stats Grid */}
        <div {...stylex.props(styles.statsGrid)}>
          {stats.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div {...stylex.props(styles.contentGrid)}>
          {/* Chart + Table column */}
          <XDSVStack gap={6}>
            <XDSCard>
              <div style={{padding: '24px 24px 0'}}>
                <XDSVStack gap={1}>
                  <XDSText type="body" weight="bold">
                    Revenue Overview
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    Monthly revenue for the current year
                  </XDSText>
                </XDSVStack>
              </div>
              <MiniBarChart />
            </XDSCard>

            <XDSCard>
              <div style={{padding: '20px 24px 8px'}}>
                <XDSHStack gap={3} vAlign="center">
                  <div style={{flex: 1}}>
                    <XDSText type="body" weight="bold">
                      Recent Orders
                    </XDSText>
                  </div>
                  <XDSButton label="View all" variant="ghost" size="sm" />
                </XDSHStack>
              </div>
              <XDSTable<OrderRow>
                data={recentOrders}
                columns={orderColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
              />
            </XDSCard>
          </XDSVStack>

          {/* Sidebar column */}
          <XDSVStack gap={6}>
            <XDSCard>
              <div style={{padding: '20px 24px'}}>
                <XDSVStack gap={4}>
                  <XDSText type="body" weight="bold">
                    Team Members
                  </XDSText>
                  {teamMembers.map(member => (
                    <XDSHStack key={member.name} gap={3} vAlign="center">
                      <XDSAvatar
                        src={member.avatar}
                        name={member.name}
                        size="small"
                      />
                      <XDSVStack gap={0}>
                        <XDSText type="body" weight="bold">
                          {member.name}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {member.role}
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                  ))}
                </XDSVStack>
              </div>
            </XDSCard>

            <XDSCard>
              <div style={{padding: '20px 24px'}}>
                <XDSVStack gap={4}>
                  <XDSText type="body" weight="bold">
                    Goals
                  </XDSText>
                  <XDSVStack gap={3}>
                    <XDSVStack gap={1}>
                      <XDSHStack gap={2} vAlign="center">
                        <div style={{flex: 1}}>
                          <XDSText type="supporting">Revenue target</XDSText>
                        </div>
                        <XDSText type="supporting" weight="bold">
                          72%
                        </XDSText>
                      </XDSHStack>
                      <XDSProgressBar
                        value={72}
                        label="Progress"
                        isLabelHidden
                      />
                    </XDSVStack>
                    <XDSVStack gap={1}>
                      <XDSHStack gap={2} vAlign="center">
                        <div style={{flex: 1}}>
                          <XDSText type="supporting">New users</XDSText>
                        </div>
                        <XDSText type="supporting" weight="bold">
                          48%
                        </XDSText>
                      </XDSHStack>
                      <XDSProgressBar
                        value={48}
                        label="Progress"
                        isLabelHidden
                      />
                    </XDSVStack>
                    <XDSVStack gap={1}>
                      <XDSHStack gap={2} vAlign="center">
                        <div style={{flex: 1}}>
                          <XDSText type="supporting">Retention</XDSText>
                        </div>
                        <XDSText type="supporting" weight="bold">
                          89%
                        </XDSText>
                      </XDSHStack>
                      <XDSProgressBar
                        value={89}
                        label="Progress"
                        isLabelHidden
                      />
                    </XDSVStack>
                  </XDSVStack>
                </XDSVStack>
              </div>
            </XDSCard>
          </XDSVStack>
        </div>
      </XDSVStack>
    </XDSAppShell>
  );
}
