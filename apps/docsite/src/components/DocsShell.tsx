// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {SharedTopNav} from './SharedTopNav';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';
import type {TemplateEntry} from '../generated/templateRegistry';
import type {ComponentItem} from '../generated/groupedComponentRegistry';
import {groupedComponents} from '../generated/groupedComponentRegistry';

interface DocsShellProps {
  children: React.ReactNode;
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
  templates: TemplateEntry[];
  defaultIsMobile?: boolean;
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

// ── Component sidebar builder ──────────────────────────────────────────

type SidebarItem = ComponentItem;

function buildComponentSidebar(): {
  componentItems: SidebarItem[];
  utilities: Array<{name: string; displayName: string; href: string}>;
} {
  const grouped = groupedComponents['@xds/core'];
  if (!grouped) {
    return {componentItems: [], utilities: []};
  }
  return {componentItems: grouped.items, utilities: grouped.utilities};
}

// ── Shell ──────────────────────────────────────────────────────────────

export function DocsShell({
  children,
  components: _components,
  packages,
  docTopics,
  templates: _templates,
  defaultIsMobile,
}: DocsShellProps) {
  const pathname = usePathname();

  const {componentItems, utilities} = buildComponentSidebar();

  // Classify packages
  const isTheme = (p: PackageMeta) => p.name.includes('theme-');
  const themePackages = packages.filter(isTheme);
  const libraryPackages = packages.filter(p => !isTheme(p));

  // Classify doc topics by category (from data)
  const guideTopics = docTopics
    .filter(d => d.category === 'guide')
    .sort((a, b) => a.title.localeCompare(b.title));
  const foundationTopics = docTopics
    .filter(d => d.category === 'foundations')
    .sort(foundationsSort);

  // Active state detection. Foundations is its own top-level sidebar
  // section (split from Guide on main), so isInGuide no longer counts
  // foundation topics.
  const isInGuide = guideTopics.some(d => pathname === `/docs/${d.topic}`);
  const isInFoundations = foundationTopics.some(
    d => pathname === `/docs/${d.topic}`,
  );
  const isInLibraries = libraryPackages.some(
    p => pathname === `/packages/${p.name.replace('@xds/', '')}`,
  );
  const isInThemes = themePackages.some(
    p => pathname === `/packages/${p.name.replace('@xds/', '')}`,
  );
  // True for the /components index AND every /components/[name] detail page.
  // On these routes we hide every non-Components section so the sidebar is
  // focused on the component library — the top nav handles cross-area
  // navigation.
  const isOnComponentsRoute = pathname.startsWith('/components');

  return (
    <XDSAppShell
      variant="surface"
      height="auto"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}
      sideNav={
        <XDSSideNav>
          {!isOnComponentsRoute && (
            <>
              {/* Documentation */}
              <XDSSideNavSection title="Documentation" isHeaderHidden>
                <XDSSideNavItem
                  label="Documentation"
                  href="/docs"
                  isSelected={pathname === '/docs'}
                />
              </XDSSideNavSection>

              {/* What's New */}
              <XDSSideNavSection title="Changelog" isHeaderHidden>
                <XDSSideNavItem
                  label="What's New"
                  href="/changelog"
                  isSelected={pathname === '/changelog'}
                />
              </XDSSideNavSection>

              {/* Guide */}
              <XDSSideNavSection title="Guide" isHeaderHidden>
                <XDSSideNavItem
                  label="Guide"
                  collapsible={{defaultIsCollapsed: !isInGuide}}>
                  {guideTopics.map(d => (
                    <XDSSideNavItem
                      key={d.topic}
                      label={d.title}
                      href={`/docs/${d.topic}`}
                      isSelected={pathname === `/docs/${d.topic}`}
                    />
                  ))}
                </XDSSideNavItem>
              </XDSSideNavSection>

              {/* Foundations */}
              <XDSSideNavSection title="Foundations" isHeaderHidden>
                <XDSSideNavItem
                  label="Foundations"
                  collapsible={{defaultIsCollapsed: !isInFoundations}}>
                  {foundationTopics.map(d => (
                    <XDSSideNavItem
                      key={d.topic}
                      label={d.title}
                      href={`/docs/${d.topic}`}
                      isSelected={pathname === `/docs/${d.topic}`}
                    />
                  ))}
                </XDSSideNavItem>
              </XDSSideNavSection>

              {/* Libraries */}
              <XDSSideNavSection title="Libraries" isHeaderHidden>
                <XDSSideNavItem
                  label="Libraries"
                  collapsible={{defaultIsCollapsed: !isInLibraries}}>
                  {libraryPackages.map(p => (
                    <XDSSideNavItem
                      key={p.name}
                      label={p.name}
                      href={`/packages/${p.name.replace('@xds/', '')}`}
                      isSelected={
                        pathname === `/packages/${p.name.replace('@xds/', '')}`
                      }
                    />
                  ))}
                </XDSSideNavItem>
              </XDSSideNavSection>

              {/* Themes */}
              <XDSSideNavSection title="Themes" isHeaderHidden>
                <XDSSideNavItem
                  label="Themes"
                  collapsible={{defaultIsCollapsed: !isInThemes}}>
                  {themePackages.map(p => (
                    <XDSSideNavItem
                      key={p.name}
                      label={p.displayName}
                      href={`/packages/${p.name.replace('@xds/', '')}`}
                      isSelected={
                        pathname === `/packages/${p.name.replace('@xds/', '')}`
                      }
                    />
                  ))}
                </XDSSideNavItem>
              </XDSSideNavSection>
            </>
          )}

          {/* Components — rendered as a flat list directly under the section
              (no redundant "Components" parent wrapper). The first item is
              an Overview link back to the /components gallery so users on
              a detail page can return to the index. Sub-grouped items like
              Avatar / Button keep their own collapsible behavior for their
              nested entries. */}
          <XDSSideNavSection title="Components" isHeaderHidden>
            <XDSSideNavItem
              label="Overview"
              href="/components"
              isSelected={pathname === '/components'}
            />
            {componentItems.map(item =>
              item.type === 'entry' ? (
                <XDSSideNavItem
                  key={item.name}
                  label={item.displayName}
                  href={item.href}
                  isSelected={pathname === item.href}
                />
              ) : (
                <XDSSideNavItem
                  key={item.label}
                  label={item.displayName}
                  collapsible={{
                    defaultIsCollapsed: !item.entries.some(
                      e => pathname === e.href,
                    ),
                  }}>
                  {item.entries.map(entry => (
                    <XDSSideNavItem
                      key={entry.name}
                      label={entry.displayName}
                      href={entry.href}
                      isSelected={pathname === entry.href}
                    />
                  ))}
                </XDSSideNavItem>
              ),
            )}
          </XDSSideNavSection>

          {/* Utilities — secondary list rendered below the main Components
              section. Always starts collapsed; users can expand on demand. */}
          {utilities.length > 0 && (
            <XDSSideNavSection title="Utilities" isHeaderHidden>
              <XDSSideNavItem
                label="Utilities"
                collapsible={{defaultIsCollapsed: true}}>
                {utilities.map(comp => (
                  <XDSSideNavItem
                    key={comp.name}
                    label={comp.displayName}
                    href={comp.href}
                    isSelected={pathname === comp.href}
                  />
                ))}
              </XDSSideNavItem>
            </XDSSideNavSection>
          )}
        </XDSSideNav>
      }>
      {children}
    </XDSAppShell>
  );
}
