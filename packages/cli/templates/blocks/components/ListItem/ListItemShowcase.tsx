'use client';

import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBadge} from '@xds/core/Badge';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function ListItemShowcase() {
  return (
    <XDSList header="Settings" hasDividers>
      <XDSListItem
        label="Notifications"
        description="Push, email, and SMS alerts"
        startContent={<BellIcon />}
        endContent={<XDSBadge label="3 new" variant="blue" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Privacy"
        description="Manage data sharing preferences"
        startContent={<LockIcon />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Appearance"
        description="Theme, font size, and display"
        startContent={<PaletteIcon />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Billing"
        description="Plans and payment methods"
        startContent={<CreditCardIcon />}
        endContent={<XDSBadge label="Pro" variant="purple" />}
        onClick={() => {}}
      />
    </XDSList>
  );
}
