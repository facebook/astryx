// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DocsShell.tsx
 * @input Route metadata, component registry, and the rendered AppShell header
 * @output Docs navigation with a stable sidebar offset before hydration
 * @position Docsite-only shell and first-paint header measurement
 */

import {useState, useMemo} from 'react';
import {usePathname} from 'next/navigation';
import {Search, FlaskConical} from 'lucide-react';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Icon} from '@astryxdesign/core/Icon';
import {SharedTopNav} from './SharedTopNav';
import {CanaryBanner} from './CanaryBanner';
import {CURRENT_TARGET} from '../lib/docsVersions';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocGuide, DocLink} from '../generated/docsRegistry';
import {
  getComponentSidebarData,
  type ComponentSidebarEntry,
  type ComponentSidebarItem,
} from './componentSidebarData';

/** What the sidebar reads of a package: its name and whether it is canary. */
type SidebarPackage = Pick<PackageMeta, 'name' | 'displayName' | 'canaryOnly'>;

interface DocsShellProps {
  children: React.ReactNode;
  packages: SidebarPackage[];
  /** The twelve guides and Reference, in reading order. */
  docGuides: DocGuide[];
}

const styles = stylex.create({
  canaryMarker: {
    alignItems: 'center',
    display: 'inline-flex',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
});

function CanaryCategoryMarker() {
  return (
    <span {...stylex.props(styles.canaryMarker)}>
      <Icon icon={FlaskConical} label="Canary" size="sm" />
    </span>
  );
}

// Seed the full header height while parsing, before restored scroll can put
// the sidebar under it, and refresh once its fonts settle. CSSOM leaves React's
// DOM unchanged; the existing observer's inline value takes over after hydration.
const initialHeaderHeightScript = `(() => {
  const script = document.currentScript;
  const header = script?.closest('.astryx-app-shell-header');
  const style = script?.previousElementSibling;
  const sheet = style?.sheet;
  const publish = () => {
    if (!header?.isConnected || !style?.isConnected || !sheet) return;
    if (sheet.cssRules.length === 0) sheet.insertRule(':root {}');
    sheet.cssRules[0].style.setProperty('--appshell-header-height',
      header.getBoundingClientRect().height + 'px');
  };
  publish();
  document.fonts.ready.then(publish);
})();`;

/** Whether a link, or any link below it, is the current page. */
function holdsPath(link: DocLink, pathname: string): boolean {
  return (
    link.href === pathname ||
    (link.children ?? []).some(child => holdsPath(child, pathname))
  );
}

/** A guide's children in the sidebar; a landing below it nests its own. */
function renderDocLinks(links: DocLink[], pathname: string): React.ReactNode {
  return links.map(link =>
    link.children && link.children.length > 0 ? (
      <SideNavItem
        key={link.href}
        label={link.title}
        href={link.href}
        isSelected={pathname === link.href}
        collapsible={{defaultIsCollapsed: !holdsPath(link, pathname)}}>
        {renderDocLinks(link.children, pathname)}
      </SideNavItem>
    ) : (
      <SideNavItem
        key={link.href}
        label={link.title}
        href={link.href}
        isSelected={pathname === link.href}
      />
    ),
  );
}

// ── Shell ──────────────────────────────────────────────────────────────

export function DocsShell({children, packages, docGuides}: DocsShellProps) {
  const pathname = usePathname();
  const [componentQuery, setComponentQuery] = useState('');

  const {componentItems, utilities, canaryCategories} =
    getComponentSidebarData();

  const q = componentQuery.trim().toLowerCase();

  // When searching, flatten every readiness category to individual entries so
  // results are all at the same level with no nesting.
  const flatSearchResults = useMemo<ComponentSidebarEntry[]>(() => {
    if (!q) {
      return [];
    }
    const allItems = [
      ...componentItems,
      ...canaryCategories.flatMap(category => category.componentItems),
    ];
    return allItems.flatMap(item => {
      if (item.type === 'entry') {
        return item.displayName.toLowerCase().includes(q) ? [item] : [];
      }
      return item.entries.filter(e => e.displayName.toLowerCase().includes(q));
    });
  }, [canaryCategories, componentItems, q]);

  const filteredUtilities = useMemo(() => {
    const allUtilities = [
      ...utilities,
      ...canaryCategories.flatMap(category => category.utilities),
    ];
    return q
      ? allUtilities.filter(u => u.displayName.toLowerCase().includes(q))
      : utilities;
  }, [canaryCategories, utilities, q]);

  // Classify packages
  const isTheme = (p: SidebarPackage) => p.name.includes('theme-');
  const libraryPackages = packages.filter(p => !isTheme(p) && !p.canaryOnly);
  const canaryPackages = packages.filter(p => !isTheme(p) && p.canaryOnly);

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

  const renderComponentItems = (items: ComponentSidebarItem[]) =>
    items.map(item =>
      item.type === 'entry' ? (
        <SideNavItem
          key={`${item.packageName}:${item.name}`}
          label={item.displayName}
          href={item.href}
          isSelected={pathname === item.href}
        />
      ) : (
        <SideNavItem
          key={`${item.packageName}:${item.label}`}
          label={item.displayName}
          collapsible={{
            defaultIsCollapsed: !item.entries.some(e => pathname === e.href),
          }}>
          {item.entries.map(entry => (
            <SideNavItem
              key={`${entry.packageName}:${entry.name}`}
              label={entry.displayName}
              href={entry.href}
              isSelected={pathname === entry.href}
            />
          ))}
        </SideNavItem>
      ),
    );

  return (
    <AppShell
      className="astryx-docs-shell"
      variant="surface"
      height="auto"
      banner={CURRENT_TARGET === 'canary' ? <CanaryBanner /> : undefined}
      topNav={
        <>
          <SharedTopNav />
          {/* Parser-blocking measurement precedes all sidebar markup, including
              when the response is streamed. Stylesheets above it are loaded. */}
          <style />
          <script
            dangerouslySetInnerHTML={{__html: initialHeaderHeightScript}}
          />
        </>
      }
      sideNav={
        <SideNav topContent={isOnComponentsRoute ? componentSearch : undefined}>
          {!isOnComponentsRoute && (
            <>
              {/* Home, then the guides in reading order (not A-Z): the
                  order `astryx docs` lists them, Reference last. */}
              <SideNavSection title="Guides" isHeaderHidden>
                <SideNavItem
                  label="Home"
                  href="/docs"
                  isSelected={pathname === '/docs'}
                />
                {/* Each guide nests its children, collapsed unless the page
                    is in it. Foundations has no page of its own and stays
                    open, as it always has. */}
                {docGuides.map(guide => {
                  const isActive =
                    guide.href === pathname ||
                    guide.children.some(child => holdsPath(child, pathname));
                  return guide.children.length > 0 ? (
                    <SideNavItem
                      key={guide.topic}
                      label={guide.title}
                      href={guide.href ?? undefined}
                      isSelected={guide.href === pathname}
                      collapsible={{
                        defaultIsCollapsed: guide.href != null && !isActive,
                      }}>
                      {renderDocLinks(guide.children, pathname)}
                    </SideNavItem>
                  ) : (
                    <SideNavItem
                      key={guide.topic}
                      label={guide.title}
                      href={guide.href ?? undefined}
                      isSelected={guide.href === pathname}
                    />
                  );
                })}
              </SideNavSection>

              {/* The catalog */}
              <SideNavSection title="Catalog" isHeaderHidden>
                <SideNavItem
                  label="Components"
                  href="/components"
                  isSelected={pathname === '/components'}
                />
                <SideNavItem
                  label="Templates"
                  href="/templates"
                  isSelected={pathname === '/templates'}
                />
                <SideNavItem
                  label="Themes"
                  href="/themes"
                  isSelected={pathname === '/themes'}
                />
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

              {canaryPackages.length > 0 && (
                <SideNavSection title="Canary libraries" isHeaderHidden>
                  {canaryPackages.map(p => (
                    <SideNavItem
                      key={p.name}
                      label={p.displayName}
                      endContent={<CanaryCategoryMarker />}
                      href={`/docs/${p.name.replace('@astryxdesign/', '')}`}
                      isSelected={
                        pathname ===
                        `/docs/${p.name.replace('@astryxdesign/', '')}`
                      }
                    />
                  ))}
                </SideNavSection>
              )}

              <SideNavSection title="News" isHeaderHidden>
                <SideNavItem
                  label="What's New"
                  href="/changelog"
                  isSelected={pathname === '/changelog'}
                />
                <SideNavItem
                  label="Blog"
                  href="/blog"
                  isSelected={pathname.startsWith('/blog')}
                />
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
                        key={`${item.packageName}:${item.name}`}
                        label={item.displayName}
                        href={item.href}
                        isSelected={pathname === item.href}
                      />
                    ))
                  : renderComponentItems(componentItems)}
                {/* Utilities — secondary list rendered below the main Components
                    section. Always starts collapsed; users can expand on demand. */}
                {filteredUtilities.length > 0 &&
                  (q ? (
                    filteredUtilities.map(comp => (
                      <SideNavItem
                        key={`${comp.packageName}:${comp.name}`}
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
                          key={`${comp.packageName}:${comp.name}`}
                          label={comp.displayName}
                          href={comp.href}
                          isSelected={pathname === comp.href}
                        />
                      ))}
                    </SideNavItem>
                  ))}
              </SideNavSection>

              {!q && canaryCategories.length > 0 && (
                <SideNavSection title="Canary components" isHeaderHidden>
                  {canaryCategories.map(category => (
                    <SideNavItem
                      key={category.packageName}
                      label={category.displayName}
                      endContent={<CanaryCategoryMarker />}
                      collapsible={{
                        defaultIsCollapsed: ![
                          ...category.componentItems.flatMap(item =>
                            item.type === 'entry' ? [item] : item.entries,
                          ),
                          ...category.utilities,
                        ].some(entry => pathname === entry.href),
                      }}>
                      {renderComponentItems(category.componentItems)}
                      {category.utilities.length > 0 && (
                        <SideNavItem
                          label="Utilities"
                          collapsible={{defaultIsCollapsed: true}}>
                          {category.utilities.map(comp => (
                            <SideNavItem
                              key={`${comp.packageName}:${comp.name}`}
                              label={comp.displayName}
                              href={comp.href}
                              isSelected={pathname === comp.href}
                            />
                          ))}
                        </SideNavItem>
                      )}
                    </SideNavItem>
                  ))}
                </SideNavSection>
              )}
            </>
          )}
        </SideNav>
      }>
      {children}
    </AppShell>
  );
}
