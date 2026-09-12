// Copyright (c) Meta Platforms, Inc. and affiliates.

// @vitest-environment jsdom

import type {ReactNode} from 'react';
import {useLayoutEffect, useRef} from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/templates',
  useRouter: () => ({push: vi.fn()}),
}));

vi.mock('@stylexjs/stylex', () => ({
  create: <T,>(styles: T) => styles,
  props: () => ({}),
}));

vi.mock('@astryxdesign/core/AppShell', () => ({
  useAppShellMobile: () => ({
    isMobileNavEnabled: false,
    closeMobileNav: vi.fn(),
  }),
}));

vi.mock('@astryxdesign/core/TopNav', () => ({
  TopNav: ({heading, centerContent, endContent}: Record<string, ReactNode>) => (
    <nav>
      {heading}
      {centerContent}
      {endContent}
    </nav>
  ),
  TopNavHeading: ({logo}: {logo: ReactNode}) => <>{logo}</>,
  TopNavItem: ({label}: {label: string}) => <a href="#">{label}</a>,
  TopNavRenderContext: ({children}: {children: ReactNode}) => <>{children}</>,
  useTopNavRenderMode: () => 'topnav',
}));

vi.mock('@astryxdesign/core/Button', () => ({
  Button: ({
    label,
    onClick,
    href,
  }: {
    label: string;
    onClick?: () => void;
    href?: string;
  }) =>
    href ? (
      <a href={href}>{label}</a>
    ) : (
      <button onClick={onClick}>{label}</button>
    ),
}));

vi.mock('@astryxdesign/core/Layout', () => ({
  HStack: ({children}: {children: ReactNode}) => <>{children}</>,
}));

vi.mock('@astryxdesign/core/MobileNav', () => ({
  MobileNav: ({children}: {children: ReactNode}) => <>{children}</>,
}));

vi.mock('../app/providers', () => ({
  useThemeMode: () => ({
    mode: 'light',
    themeMode: 'light',
    toggleMode: vi.fn(),
  }),
}));

vi.mock('../components/logos', () => ({
  AstryxIcon: () => <svg aria-label="Astryx" />,
}));

vi.mock('../lib/analytics', () => ({
  trackSearch: vi.fn(),
  trackClickCta: vi.fn(),
}));

vi.mock('../components/SearchPalette', () => ({
  SearchPalette: ({
    isOpen,
    onOpenChange,
  }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    const returnFocusRef = useRef<HTMLElement | null>(null);
    useLayoutEffect(() => {
      if (isOpen) {
        returnFocusRef.current = document.activeElement as HTMLElement;
      } else {
        returnFocusRef.current?.focus();
      }
    }, [isOpen]);

    return (
      <div data-testid="search-palette">
        {isOpen ? (
          <button onClick={() => onOpenChange(false)}>Close Search</button>
        ) : (
          <span>Search closed</span>
        )}
      </div>
    );
  },
}));

import {SharedTopNav} from '../components/SharedTopNav';

describe('SharedTopNav search lifecycle', () => {
  it('keeps Search mounted through close so focus returns to its trigger', async () => {
    const user = userEvent.setup();
    render(<SharedTopNav />);
    const trigger = screen.getByRole('button', {name: 'Search'});

    await user.click(trigger);
    await user.click(await screen.findByRole('button', {name: 'Close Search'}));

    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.getByTestId('search-palette').textContent).toContain(
      'Search closed',
    );
  });
});
