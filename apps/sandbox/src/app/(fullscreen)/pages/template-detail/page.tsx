'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSVStack,
  XDSHStack,
  XDSSection,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';

// ─── Icons ──────────────────────────────────────────────────────────────────

const HomeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);
const OrdersIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const ProductsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const CustomersIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const AnalyticsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const DiscountsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path d="M6 6h.008v.008H6V6z" />
  </svg>
);
const SettingsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ArrowLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const ChevronLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
const PencilIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const Squares2x2Icon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
  </svg>
);
const UserIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const MapPinIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const PhoneIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const EnvelopeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const CheckCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldCheckIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const StoreIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...p}>
    <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
  </svg>
);

// ─── Styles ─────────────────────────────────────────────────────────────────

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  maxWidth: {maxWidth: 800},
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-secondary-text)',
    textDecoration: 'none',
    fontSize: 13,
    cursor: 'pointer',
  },
  stepperItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    paddingBottom: 20,
  },
  stepperItemLast: {paddingBottom: 0},
  stepperLine: {
    position: 'absolute',
    left: 9,
    top: 22,
    bottom: 0,
    width: 2,
    backgroundColor: 'var(--color-divider)',
  },
  stepperLineCompleted: {backgroundColor: 'var(--color-positive)'},
  stepperDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepperDotCompleted: {
    backgroundColor: 'var(--color-positive)',
    color: 'white',
  },
  stepperDotActive: {backgroundColor: 'var(--color-accent)', color: 'white'},
  stepperDotPending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'var(--color-divider)',
  },
  stepperCheck: {width: 12, height: 12},
  stepperActiveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'white',
  },
  fraudCard: {
    backgroundColor: 'var(--color-positive-wash)',
    borderRadius: 8,
    padding: 16,
  },
  productIcon: {width: 20, height: 20, color: 'var(--color-secondary-text)'},
  lineItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'var(--color-wash)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSm: {
    width: 16,
    height: 16,
    color: 'var(--color-secondary-text)',
    flexShrink: 0,
  },
});

// ─── Data ───────────────────────────────────────────────────────────────────

const ORDER_ITEMS = [
  {
    name: 'Custom Notebook — Personalized',
    details: 'Color: Navy Blue · Size: A5 · Format: Lined',
    qty: 1,
    price: 20.0,
  },
  {
    name: 'Custom Notebook — Personalized',
    details: 'Color: Forest Green · Size: A4 · Format: Dotted',
    qty: 1,
    price: 20.0,
  },
];

const STEPPER_STEPS: Array<{
  label: string;
  status: 'completed' | 'active' | 'pending';
}> = [
  {label: 'Place your order', status: 'completed'},
  {label: 'Order details', status: 'active'},
  {label: 'Confirm order', status: 'pending'},
  {label: 'Order processing', status: 'pending'},
  {label: 'Order fulfillment', status: 'pending'},
  {label: 'Delivery', status: 'pending'},
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function DetailSideNav() {
  const [active, setActive] = useState('orders');
  return (
    <XDSSideNav
      collapsible
      header={
        <XDSSideNavHeading
          icon={<StoreIcon style={{width: 20, height: 20}} />}
          heading="Acme Store"
          subheading="Online Storefront"
        />
      }
      footer={
        <div style={{padding: '8px 0'}}>
          <XDSSideNavItem
            label="Settings"
            icon={SettingsIcon}
            isSelected={active === 'settings'}
            onClick={() => setActive('settings')}
          />
        </div>
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Home"
          icon={HomeIcon}
          isSelected={active === 'home'}
          onClick={() => setActive('home')}
        />
        <XDSSideNavItem
          label="Orders"
          icon={OrdersIcon}
          isSelected={active === 'orders'}
          onClick={() => setActive('orders')}
        />
        <XDSSideNavItem
          label="Products"
          icon={ProductsIcon}
          isSelected={active === 'products'}
          onClick={() => setActive('products')}
        />
        <XDSSideNavItem
          label="Customers"
          icon={CustomersIcon}
          isSelected={active === 'customers'}
          onClick={() => setActive('customers')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Insights">
        <XDSSideNavItem
          label="Analytics"
          icon={AnalyticsIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
        <XDSSideNavItem
          label="Discounts"
          icon={DiscountsIcon}
          isSelected={active === 'discounts'}
          onClick={() => setActive('discounts')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

function StepperDotIcon({
  status,
}: {
  status: 'completed' | 'active' | 'pending';
}) {
  if (status === 'completed') {
    return (
      <div {...stylex.props(styles.stepperDot, styles.stepperDotCompleted)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          {...stylex.props(styles.stepperCheck)}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div {...stylex.props(styles.stepperDot, styles.stepperDotActive)}>
        <div {...stylex.props(styles.stepperActiveDot)} />
      </div>
    );
  }
  return <div {...stylex.props(styles.stepperDot, styles.stepperDotPending)} />;
}

function OrderStepper() {
  return (
    <XDSList>
      {STEPPER_STEPS.map((step, i) => {
        const isLast = i === STEPPER_STEPS.length - 1;
        return (
          <div
            key={step.label}
            {...stylex.props(
              styles.stepperItem,
              isLast && styles.stepperItemLast,
            )}>
            {!isLast && (
              <div
                {...stylex.props(
                  styles.stepperLine,
                  step.status === 'completed' && styles.stepperLineCompleted,
                )}
              />
            )}
            <StepperDotIcon status={step.status} />
            <XDSText
              type="body"
              weight={step.status === 'active' ? 'bold' : 'normal'}
              color={step.status === 'pending' ? 'secondary' : 'primary'}>
              {step.label}
            </XDSText>
          </div>
        );
      })}
    </XDSList>
  );
}

function ItemsSection() {
  return (
    <XDSSection variant="section">
      <XDSVStack gap={2}>
        <XDSHStack gap={2} vAlign="center">
          <XDSHeading level={3}>Items</XDSHeading>
          <XDSBadge variant="warning" label="Unfulfilled" />
        </XDSHStack>
        <XDSDivider />
        <XDSList>
          {ORDER_ITEMS.map((item, i) => (
            <XDSListItem
              key={i}
              label={item.name}
              description={item.details}
              startContent={
                <div {...stylex.props(styles.lineItemImage)}>
                  <ProductsIcon {...stylex.props(styles.productIcon)} />
                </div>
              }
              endContent={
                <XDSText type="body">${item.price.toFixed(2)}</XDSText>
              }
            />
          ))}
        </XDSList>
        <XDSHStack gap={2}>
          <XDSButton label="Fulfill item" variant="secondary" size="sm" />
          <XDSButton
            label="Create shipping label"
            variant="secondary"
            size="sm"
          />
        </XDSHStack>
      </XDSVStack>
    </XDSSection>
  );
}

function InvoiceSection() {
  return (
    <XDSSection variant="section">
      <XDSVStack gap={2}>
        <XDSHStack gap={2} vAlign="center">
          <XDSHeading level={3}>Invoice</XDSHeading>
          <XDSBadge variant="success" label="Paid" />
        </XDSHStack>
        <XDSDivider />
        <XDSMetadataList label={{position: 'start'}}>
          <XDSMetadataListItem label="Subtotal">
            <XDSHStack gap={2} vAlign="center">
              <XDSText type="supporting" color="secondary">
                2 items
              </XDSText>
              <XDSText type="body">$40.00</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Discount">
            <XDSHStack gap={2} vAlign="center">
              <XDSBadge variant="info" label="NEW15" />
              <XDSText type="body">{'\u2212'}$15.00</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Shipping">
            <XDSHStack gap={2} vAlign="center">
              <XDSText type="supporting" color="secondary">
                Free
              </XDSText>
              <XDSText type="body">$0.00</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Tax">
            <XDSHStack gap={2} vAlign="center">
              <XDSText type="supporting" color="secondary">
                8.25%
              </XDSText>
              <XDSText type="body">$4.20</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Total">
            <XDSText type="body" weight="bold">
              $29.20
            </XDSText>
          </XDSMetadataListItem>
        </XDSMetadataList>
        <XDSDivider />
        <XDSHStack gap={2} hAlign="between" vAlign="center">
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="body" color="secondary">
              Paid by customer
            </XDSText>
            <XDSText type="body">Visa ····7482</XDSText>
          </XDSHStack>
          <XDSText type="body" weight="semibold">
            $29.20
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={2}>
          <XDSButton label="Refund" variant="secondary" size="sm" />
          <XDSButton label="Send Invoice" variant="secondary" size="sm" />
        </XDSHStack>
      </XDSVStack>
    </XDSSection>
  );
}

function NotesSection() {
  const [notes, setNotes] = useState(
    'Customer requested gift wrapping for both notebooks. Please include the handwritten note card from the uploaded file. Priority shipping was discussed but customer opted for standard delivery.',
  );
  return (
    <XDSSection variant="section">
      <XDSVStack gap={2}>
        <XDSHeading level={3}>Notes</XDSHeading>
        <XDSDivider />
        <XDSTextArea
          label="Order notes"
          isLabelHidden
          value={notes}
          onChange={setNotes}
          rows={5}
        />
      </XDSVStack>
    </XDSSection>
  );
}

function RightPanel() {
  return (
    <XDSVStack gap={4}>
      <XDSVStack gap={2}>
        <XDSHeading level={4}>Status</XDSHeading>
        <OrderStepper />
      </XDSVStack>
      <XDSDivider />
      <XDSVStack gap={2}>
        <XDSHeading level={4}>Customer</XDSHeading>
        <XDSMetadataList label={{position: 'start'}}>
          <XDSMetadataListItem
            label="Name"
            icon={<UserIcon {...stylex.props(styles.iconSm)} />}>
            Jane Doe
          </XDSMetadataListItem>
          <XDSMetadataListItem
            label="Address"
            icon={<MapPinIcon {...stylex.props(styles.iconSm)} />}>
            321 Smith Road, CA 38238
          </XDSMetadataListItem>
          <XDSMetadataListItem
            label="Phone"
            icon={<PhoneIcon {...stylex.props(styles.iconSm)} />}>
            234-555-0198
          </XDSMetadataListItem>
          <XDSMetadataListItem
            label="Email"
            icon={<EnvelopeIcon {...stylex.props(styles.iconSm)} />}>
            <XDSLink label="janedoe@email.com" href="mailto:janedoe@email.com">
              janedoe@email.com
            </XDSLink>
          </XDSMetadataListItem>
          <XDSMetadataListItem
            label="Billing"
            icon={<CheckCircleIcon {...stylex.props(styles.iconSm)} />}>
            <XDSText type="supporting" color="secondary">
              Same as shipping address
            </XDSText>
          </XDSMetadataListItem>
        </XDSMetadataList>
      </XDSVStack>
      <XDSDivider />
      <XDSVStack gap={2}>
        <XDSHeading level={4}>Fraud Analysis</XDSHeading>
        <div {...stylex.props(styles.fraudCard)}>
          <XDSVStack gap={2}>
            <XDSHStack gap={2} vAlign="center">
              <ShieldCheckIcon
                style={{width: 16, height: 16, color: 'var(--color-positive)'}}
              />
              <XDSText type="body" weight="bold">
                Recommendation: Fulfill order
              </XDSText>
            </XDSHStack>
            <XDSText type="supporting" color="secondary">
              There is a low chance that you will receive a chargeback on this
              order.
            </XDSText>
            <XDSLink label="Learn more" href="#">
              Learn more
            </XDSLink>
          </XDSVStack>
        </div>
      </XDSVStack>
    </XDSVStack>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function DetailTemplate() {
  return (
    <XDSAppShell
      variant="elevated"
      sideNav={<DetailSideNav />}
      contentPadding={0}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div {...stylex.props(styles.maxWidth)}>
              <XDSVStack gap={2}>
                <XDSHStack gap={2} hAlign="between" vAlign="center">
                  <a {...stylex.props(styles.backLink)} href="#">
                    <ArrowLeftIcon style={{width: 14, height: 14}} />
                    All orders
                  </a>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSButton
                      label="Grid view"
                      variant="ghost"
                      size="sm"
                      icon={<Squares2x2Icon />}
                    />
                    <XDSHStack gap={1} vAlign="center">
                      <XDSButton
                        label="Previous"
                        variant="ghost"
                        size="sm"
                        icon={<ChevronLeftIcon />}
                      />
                      <XDSText type="supporting" color="secondary">
                        2 / 9
                      </XDSText>
                      <XDSButton
                        label="Next"
                        variant="ghost"
                        size="sm"
                        icon={<ChevronRightIcon />}
                      />
                    </XDSHStack>
                    <XDSButton label="Restock" variant="secondary" size="sm" />
                    <XDSButton
                      label="Edit"
                      variant="secondary"
                      size="sm"
                      icon={<PencilIcon />}
                    />
                  </XDSHStack>
                </XDSHStack>
                <XDSHeading level={1}>#1001</XDSHeading>
                <XDSHStack gap={2} vAlign="center">
                  <XDSText type="supporting" color="secondary">
                    5 days since order placed
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {'\u00b7'}
                  </XDSText>
                  <XDSText type="supporting">Sarah Jon</XDSText>
                  <XDSText type="supporting" color="secondary">
                    {'\u00b7'}
                  </XDSText>
                  <XDSBadge variant="warning" label="Payment pending" />
                  <XDSText type="supporting" color="secondary">
                    {'\u00b7'}
                  </XDSText>
                  <XDSLink label="See All" href="#">
                    See All
                  </XDSLink>
                </XDSHStack>
              </XDSVStack>
            </div>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <div {...stylex.props(styles.maxWidth)}>
              <XDSVStack gap={4}>
                <ItemsSection />
                <InvoiceSection />
                <NotesSection />
              </XDSVStack>
            </div>
          </XDSLayoutContent>
        }
        end={
          <XDSLayoutPanel width={280} hasDivider>
            <RightPanel />
          </XDSLayoutPanel>
        }
      />
    </XDSAppShell>
  );
}
