'use client';

import {useLocation} from 'react-router';
import {Link} from '../../../../Link';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';

const NAV_ITEMS = [
  {label: 'Home', href: '/pages/doc-home/'},
  {label: 'Documentation', href: '/pages/doc-docs/'},
  {label: 'Discover', href: '/pages/doc-discover/'},
];

export default function DocTopNav() {
  const {pathname} = useLocation();

  return (
    <XDSTopNav
      label="Documentation navigation"
      heading={
        <XDSTopNavHeading heading="XDS" href="/pages/doc-home/" as={Link} />
      }
      centerContent={
        <>
          {NAV_ITEMS.map(item => {
            const isActive = pathname?.startsWith(item.href.replace(/\/$/, ''));
            return (
              <XDSTopNavItem
                key={item.href}
                label={item.label}
                href={item.href}
                isSelected={!!isActive}
                as={Link}
              />
            );
          })}
        </>
      }
    />
  );
}
