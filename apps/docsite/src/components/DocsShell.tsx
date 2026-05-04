'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSCenter} from '@xds/core/Center';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {SharedTopNav} from './SharedTopNav';
import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';
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
  if (a.topic === 'tokens') return -1;
  if (b.topic === 'tokens') return 1;
  return a.title.localeCompare(b.title);
};

// ── Component sidebar builder ──────────────────────────────────────────

type SidebarItem = ComponentItem;

function buildComponentSidebar(): {
  componentItems: SidebarItem[];
  utilities: Array<{name: string; href: string}>;
} {
  const grouped = groupedComponents['@xds/core'];
  if (!grouped) return {componentItems: [], utilities: []};
  return {componentItems: grouped.items, utilities: grouped.utilities};
}

// ── Wordmark ───────────────────────────────────────────────────────────

const GitHubIcon = ({
  width = 20,
  height = 20,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
);

// ── Shell ──────────────────────────────────────────────────────────────

export function DocsShell({
  children,
  components,
  packages,
  docTopics,
  templates,
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
  const isInGuide =
    guideTopics.some(d => pathname === `/docs/${d.topic}`) ||
    foundationTopics.some(d => pathname === `/docs/${d.topic}`);
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
        <XDSSideNav
          footer={
            <XDSCenter>
              <XDSLink
                color="secondary"
                label="GitHub Pages"
                href="https://studious-broccoli-o7e61n3.pages.github.io/"
                isExternalLink>
                GitHub Pages
              </XDSLink>
            </XDSCenter>
          }>
          {/* Home */}
          <XDSSideNavSection title="Home" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              href="/"
              isSelected={pathname === '/'}
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
        </XDSSideNav>
      }>
      {children}
    </XDSAppShell>
  );
}
