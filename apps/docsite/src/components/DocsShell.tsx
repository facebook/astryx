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
  utilities: Array<{name: string; href: string}>;
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

  // Active state detection
  const allComponentHrefs = componentItems.flatMap(item =>
    item.type === 'entry' ? [item.href] : item.entries.map(e => e.href),
  );
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
  const isInComponents = allComponentHrefs.includes(pathname);
  const isInUtilities = utilities.some(u => pathname === u.href);

  return (
    <XDSAppShell
      variant="surface"
      height="auto"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}
      sideNav={
        <XDSSideNav>
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

          {/* Components */}
          <XDSSideNavSection title="Components" isHeaderHidden>
            <XDSSideNavItem
              label="Components"
              collapsible={{defaultIsCollapsed: !isInComponents}}>
              {componentItems.map(item =>
                item.type === 'entry' ? (
                  <XDSSideNavItem
                    key={item.name}
                    label={item.name}
                    href={item.href}
                    isSelected={pathname === item.href}
                  />
                ) : (
                  <XDSSideNavItem
                    key={item.label}
                    label={item.label}
                    collapsible={{
                      defaultIsCollapsed: !item.entries.some(
                        e => pathname === e.href,
                      ),
                    }}>
                    {item.entries.map(entry => (
                      <XDSSideNavItem
                        key={entry.name}
                        label={entry.name}
                        href={entry.href}
                        isSelected={pathname === entry.href}
                      />
                    ))}
                  </XDSSideNavItem>
                ),
              )}
            </XDSSideNavItem>
          </XDSSideNavSection>

          {/* Utilities */}
          {utilities.length > 0 && (
            <XDSSideNavSection title="Utilities" isHeaderHidden>
              <XDSSideNavItem
                label="Utilities"
                collapsible={{defaultIsCollapsed: !isInUtilities}}>
                {utilities.map(comp => (
                  <XDSSideNavItem
                    key={comp.name}
                    label={comp.name}
                    href={comp.href}
                    isSelected={pathname === comp.href}
                  />
                ))}
              </XDSSideNavItem>
            </XDSSideNavSection>
          )}

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
        </XDSSideNav>
      }>
      {children}
    </XDSAppShell>
  );
}
