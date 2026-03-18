'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const pages = [
  {name: 'Home', href: '/'},
  {name: '🔬 Shell Lab', href: '/pages/shell-lab/'},
  {name: 'Example', href: '/pages/example/'},
  {name: 'Navigation', href: '/pages/navigation/'},
  {name: 'TopNav Menu', href: '/pages/topnav-menu/'},
  {name: 'Mega Menu', href: '/pages/mega-menu/'},
  {name: 'Polymorphic Link', href: '/pages/polymorphic-link/'},
  {name: 'Table Overview', href: '/pages/table-overview/'},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 220,
        borderRight: '1px solid var(--color-border, #e0e0e0)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}>
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary, #666)',
          marginBottom: '0.75rem',
          padding: '0 0.5rem',
        }}>
        Sandbox
      </div>
      {pages.map(page => {
        const isActive =
          pathname === page.href ||
          (page.href !== '/' && pathname.startsWith(page.href));
        return (
          <Link
            key={page.href}
            href={page.href}
            style={{
              display: 'block',
              padding: '0.5rem 0.75rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: 'var(--color-text-primary, #333)',
              backgroundColor: isActive
                ? 'var(--color-overlay-hover, #f0f0f0)'
                : 'transparent',
              fontWeight: isActive ? 600 : 400,
            }}>
            {page.name}
          </Link>
        );
      })}
    </nav>
  );
}
