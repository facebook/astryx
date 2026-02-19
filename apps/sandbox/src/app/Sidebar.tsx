'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const pages = [
  {name: 'Home', href: '/'},
  {name: 'Buttons', href: '/pages/buttons'},
  {name: 'Form', href: '/pages/form'},
  {name: 'Typography', href: '/pages/typography'},
];

const styles = stylex.create({
  sidebar: {
    width: 220,
    borderRight: '1px solid #e0e0e0',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#666',
    marginBottom: '0.75rem',
    padding: '0 0.5rem',
  },
  link: {
    display: 'block',
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: '0.875rem',
    color: '#333',
    transition: 'background 0.15s',
  },
  linkActive: {
    backgroundColor: '#f0f0f0',
    fontWeight: 600,
  },
});

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav {...stylex.props(styles.sidebar)}>
      <div {...stylex.props(styles.title)}>Sandbox</div>
      {pages.map(page => {
        const isActive =
          pathname === page.href ||
          (page.href !== '/' && pathname.startsWith(page.href));
        return (
          <Link
            key={page.href}
            href={page.href}
            {...stylex.props(styles.link, isActive && styles.linkActive)}>
            {page.name}
          </Link>
        );
      })}
    </nav>
  );
}
