// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import {usePathname} from 'next/navigation';
import {Search} from 'lucide-react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {TextInput} from '@astryxdesign/core/TextInput';
import {SharedTopNav} from './SharedTopNav';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';
import type {GroupedEntry} from '../generated/groupedComponentRegistry';
import {getComponentSidebarData} from './componentSidebarData';

interface DocsShellProps {
  children: React.ReactNode;
  packages: PackageMeta[];
  docTopics: DocTopic[];
}

/** Foundations: tokens first, then alphabetical */
const foundationsSort = (a: DocTopic, b: DocTopic) => {
  if (a.topic === 'tokens') {
    return -1;
  }
  if (b.topic === 'tokens') {
    return 1;
  }
  return a.title.localeCompare(b.title);
};

// ── Shell ──────────────────────────────────────────────────────────────

export function DocsShell({
  children,
  packages,
  docTopics,
}: DocsShellProps) {
  const pathname = usePathname();
  const [componentQuery, setComponentQuery] = useState('');

  const {componentItems, utilities} = getComponentSidebarData();

  const q = componentQuery.trim().toLowerCase();

  // When searching, flatten groups to individual entries so results are
  // all at the same level with no nesting.
  const flatSearchResults = useMemo<GroupedEntry[]>(() => {
    if (!q) {
      return [];
    }
    return componentItems.flatMap(item => {
      if (item.type === 'entry') {
        return item.displayName.toLowerCase().includes(q) ? [item] : [];
      }
      return item.entries
        .filter(e => e.displayName.toLowerCase().includes(q))
        .map(e => ({
          type: 'entry' as const,
          name: e.name,
          displayName: e.displayName,
          href: e.href,
          description: '',
        }));
    });
  }, [componentItems, q]);

  const filteredUtilities = useMemo(
    () =>
      q
        ? utilities.filter(u => u.displayName.toLowerCase().includes(q))
        : utilities,
    [utilities, q],
  );

  // Classify packages
  const isTheme = (p: PackageMeta) => p.name.includes('theme-');
  const libraryPackages = packages.filter(p => !isTheme(p));

  // Classify doc topics by category (from data). Getting Started is promoted
  // to a top-level nav item, so it is excluded from the Guide section.
  const guideTopics = docTopics
    .filter(d => d.category === 'guide' && d.topic !== 'getting-started')
    .sort((a, b) => a.title.localeCompare(b.title));
  const foundationTopics = docTopics
    .filter(d => d.category === 'foundations')
    .sort(foundationsSort);

  // True for the /components index AND every /components/[name] detail page.
  // On these routes we hide every non-Components section so the sidebar is
  // focused on the component library — the top nav handles cross-area
  // navigation.
  const isOnComponentsRoute = pathname.startsWith('/components');

  const componentSearch = (
    <TextInput
      label="Search components"
      isLabelHidden
      value={componentQuery}
      onChange={setComponentQuery}
      placeholder="Search components…"
      startIcon={Search}
      hasClear
    />
  );

  return (
    <AppShell
      variant="surface"
      height="auto"
      topNav={<SharedTopNav />}
      sideNav={
        <SideNav topContent={isOnComponentsRoute ? componentSearch : undefined}>
          {!isOnComponentsRoute && (
            <>
              {/* Getting Started */}
              <SideNavSection title="Documentation" isHeaderHidden>
                <SideNavItem
                  label="Getting Started"
                  href="/docs/getting-started"
                  isSelected={pathname === '/docs/getting-started'}
                />
                <SideNavItem
                  label="What's New"
                  href="/changelog"
                  isSelected={pathname === '/changelog'}
                />
              </SideNavSection>

              {/* Guide */}
              <SideNavSection title="Guide" isHeaderHidden>
                <SideNavItem
                  label="Guide"
                  collapsible={{defaultIsCollapsed: false}}>
                  {guideTopics.map(d => (
                    <SideNavItem
                      key={d.topic}
                      label={d.title}
                      href={`/docs/${d.topic}`}
                      isSelected={pathname === `/docs/${d.topic}`}
                    />
                  ))}
                </SideNavItem>
              </SideNavSection>

              {/* Foundations */}
              <SideNavSection title="Foundations" isHeaderHidden>
                <SideNavItem
                  label="Foundations"
                  collapsible={{defaultIsCollapsed: false}}>
                  {foundationTopics.map(d => (
                    <SideNavItem
                      key={d.topic}
                      label={d.title}
                      href={`/docs/${d.topic}`}
                      isSelected={pathname === `/docs/${d.topic}`}
                    />
                  ))}
                </SideNavItem>
              </SideNavSection>

              {/* Libraries */}
              <SideNavSection title="Libraries" isHeaderHidden>
                <SideNavItem
                  label="Libraries"
                  collapsible={{defaultIsCollapsed: false}}>
                  {libraryPackages.map(p => (
                    <SideNavItem
                      key={p.name}
                      label={p.name}
                      href={`/docs/${p.name.replace('@astryxdesign/', '')}`}
                      isSelected={
                        pathname ===
                        `/docs/${p.name.replace('@astryxdesign/', '')}`
                      }
                    />
                  ))}
                </SideNavItem>
              </SideNavSection>
            </>
          )}

          {/* Components — only shown on /components routes */}
          {isOnComponentsRoute && (
            <>
              <SideNavSection title="Components" isHeaderHidden>
                {!q && (
                  <SideNavItem
                    label="Overview"
                    href="/components"
                    isSelected={pathname === '/components'}
                  />
                )}
                {q
                  ? flatSearchResults.map(item => (
                      <SideNavItem
                        key={item.name}
                        label={item.displayName}
                        href={item.href}
                        isSelected={pathname === item.href}
                      />
                    ))
                  : componentItems.map(item =>
                      item.type === 'entry' ? (
                        <SideNavItem
                          key={item.name}
                          label={item.displayName}
                          href={item.href}
                          isSelected={pathname === item.href}
                        />
                      ) : (
                        <SideNavItem
                          key={item.label}
                          label={item.displayName}
                          collapsible={{
                            defaultIsCollapsed: !item.entries.some(
                              e => pathname === e.href,
                            ),
                          }}>
                          {item.entries.map(entry => (
                            <SideNavItem
                              key={entry.name}
                              label={entry.displayName}
                              href={entry.href}
                              isSelected={pathname === entry.href}
                            />
                          ))}
                        </SideNavItem>
                      ),
                    )}
                {/* Utilities — secondary list rendered below the main Components
                    section. Always starts collapsed; users can expand on demand. */}
                {filteredUtilities.length > 0 &&
                  (q ? (
                    filteredUtilities.map(comp => (
                      <SideNavItem
                        key={comp.name}
                        label={comp.displayName}
                        href={comp.href}
                        isSelected={pathname === comp.href}
                      />
                    ))
                  ) : (
                    <SideNavItem
                      label="Utilities"
                      collapsible={{defaultIsCollapsed: true}}>
                      {utilities.map(comp => (
                        <SideNavItem
                          key={comp.name}
                          label={comp.displayName}
                          href={comp.href}
                          isSelected={pathname === comp.href}
                        />
                      ))}
                    </SideNavItem>
                  ))}
              </SideNavSection>
            </>
          )}
        </SideNav>
      }>
      {children}
    </AppShell>
  );
}
