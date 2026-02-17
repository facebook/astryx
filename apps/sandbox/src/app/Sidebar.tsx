'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core';
import {XDSVStack} from '@xds/core';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

/**
 * Sidebar page entries.
 *
 * To add a new page to the sidebar, create a page at
 * `src/app/pages/<name>/page.tsx` and add an entry here.
 */
const pages = [
  {name: 'Buttons', href: '/pages/buttons'},
  {name: 'Form', href: '/pages/form'},
];

const styles = stylex.create({
  sidebar: {
    width: 240,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    padding: 16,
    flexShrink: 0,
  },
  title: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  link: {
    display: 'block',
    padding: 8,
    paddingLeft: 12,
    borderRadius: 6,
    textDecoration: 'none',
    color: '#333',
    fontSize: 14,
    transition: 'background-color 0.15s',
  },
  linkActive: {
    backgroundColor: '#e8e8e8',
    fontWeight: 600,
  },
  linkHover: {
    backgroundColor: {
      ':hover': '#f0f0f0',
    },
  },
  homeLink: {
    display: 'block',
    padding: 8,
    paddingLeft: 12,
    borderRadius: 6,
    textDecoration: 'none',
    color: '#666',
    fontSize: 13,
    transition: 'background-color 0.15s',
  },
});

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav {...stylex.props(styles.sidebar)}>
      <XDSVStack gap="space1">
        <div {...stylex.props(styles.title)}>
          <XDSText type="large" weight="bold">
            XDS Sandbox
          </XDSText>
        </div>

        <Link href="/" {...stylex.props(styles.homeLink)}>
          ← Home
        </Link>

        <XDSText type="supporting" weight="bold">
          Pages
        </XDSText>

        {pages.map(page => (
          <Link
            key={page.href}
            href={page.href}
            {...stylex.props(
              styles.link,
              styles.linkHover,
              pathname === page.href && styles.linkActive,
            )}>
            {page.name}
          </Link>
        ))}
      </XDSVStack>
    </nav>
  );
}
