'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';

interface DocsShellProps {
  children: React.ReactNode;
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
}

// Guide topics (ordered)
const GUIDE_TOPICS = ['getting-started', 'principles', 'styling', 'theme'];
// Foundation topics: everything else. Tokens first, then alphabetical.
const FOUNDATIONS_SORT = (a: DocTopic, b: DocTopic) => {
  if (a.topic === 'tokens') return -1;
  if (b.topic === 'tokens') return 1;
  return a.title.localeCompare(b.title);
};

type SidebarItem =
  | {type: 'entry'; name: string; href: string}
  | {
      type: 'group';
      label: string;
      entries: Array<{name: string; href: string}>;
    };

function buildComponentSidebar(entries: ComponentEntry[]): {
  componentItems: SidebarItem[];
  utilities: Array<{name: string; href: string}>;
} {
  const utilities: Array<{name: string; href: string}> = [];
  const groups = new Map<string, Array<{name: string; href: string}>>();
  const ungrouped: Array<{name: string; href: string}> = [];

  const parentDocsWithComponents = new Set<string>();
  for (const e of entries) {
    if (e.parentDoc && !e.name.startsWith('use') && !e.hidden) {
      parentDocsWithComponents.add(e.parentDoc);
    }
  }

  for (const entry of entries) {
    if (entry.hidden) continue;
    const isHook = entry.name.startsWith('use');

    if (
      entry.group === 'Utilities' ||
      (isHook && !entry.parentDoc && entry.directory === 'hooks')
    ) {
      utilities.push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    if (entry.group) {
      if (!groups.has(entry.group)) groups.set(entry.group, []);
      groups
        .get(entry.group)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    if (isHook && !entry.parentDoc && entry.directory !== 'hooks') {
      const dir = entry.directory;
      if (!groups.has(dir)) groups.set(dir, []);
      groups
        .get(dir)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    if (
      isHook &&
      entry.parentDoc &&
      parentDocsWithComponents.has(entry.parentDoc)
    ) {
      const parent = entry.parentDoc;
      if (!groups.has(parent)) groups.set(parent, []);
      groups
        .get(parent)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    if (isHook) {
      utilities.push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    ungrouped.push({name: entry.name, href: `/components/${entry.name}`});
  }

  const items: Array<{sortKey: string; item: SidebarItem}> = [];
  for (const [label, members] of groups) {
    members.sort((a, b) => a.name.localeCompare(b.name));
    if (members.length === 1) {
      items.push({
        sortKey: members[0].name,
        item: {type: 'entry', ...members[0]},
      });
    } else {
      items.push({
        sortKey: label,
        item: {type: 'group', label, entries: members},
      });
    }
  }
  for (const entry of ungrouped) {
    items.push({sortKey: entry.name, item: {type: 'entry', ...entry}});
  }
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return {
    componentItems: items.map(i => i.item),
    utilities: utilities.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function DocsShell({
  children,
  components,
  packages,
  docTopics,
}: DocsShellProps) {
  const pathname = usePathname();

  const coreComponents = components['@xds/core'] || [];
  const {componentItems, utilities} = buildComponentSidebar(coreComponents);

  const isTheme = (p: PackageMeta) => p.name.includes('theme-');
  const themePackages = packages.filter(isTheme);

  const guideTopics = GUIDE_TOPICS.map(slug =>
    docTopics.find(d => d.topic === slug),
  ).filter((d): d is DocTopic => !!d);

  const foundationTopics = docTopics
    .filter(d => !GUIDE_TOPICS.includes(d.topic))
    .sort(FOUNDATIONS_SORT);

  const allComponentHrefs = componentItems.flatMap(item =>
    item.type === 'entry' ? [item.href] : item.entries.map(e => e.href),
  );
  const isInComponents = allComponentHrefs.includes(pathname);
  const isInUtilities = utilities.some(u => pathname === u.href);
  const isInGuide =
    guideTopics.some(d => pathname === `/docs/${d.topic}`) ||
    pathname === '/changelog' ||
    foundationTopics.some(d => pathname === `/docs/${d.topic}`);
  const isInFoundations = foundationTopics.some(
    d => pathname === `/docs/${d.topic}`,
  );
  const isInThemes = themePackages.some(
    p => pathname === `/packages/${p.name.replace('@xds/', '')}`,
  );

  return (
    <XDSAppShell
      variant="surface"
      height="fill"
      mobileNav={{breakpoint: 'none'}}
      topNav={
        <XDSTopNav
          label="XDS navigation"
          heading={<XDSTopNavHeading logo="XDS" headingHref="/" />}
          endContent={
            <XDSButton
              label="GitHub"
              variant="ghost"
              href="https://github.com/facebookexperimental/xds"
            />
          }
        />
      }
      sideNav={
        <XDSSideNav
          footer={
            <XDSVStack gap={1}>
              <XDSLink
                label="Terms of Use"
                href="https://opensource.fb.com/legal/terms"
                isExternalLink>
                Terms of Use
              </XDSLink>
              <XDSLink
                label="Privacy Policy"
                href="https://opensource.fb.com/legal/privacy"
                isExternalLink>
                Privacy Policy
              </XDSLink>
            </XDSVStack>
          }>
          {/* Home */}
          <XDSSideNavSection title="Home" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              href="/"
              isSelected={pathname === '/'}
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
              <XDSSideNavItem
                label="Changelog"
                href="/changelog"
                isSelected={pathname === '/changelog'}
              />
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

          {/* CLI */}
          <XDSSideNavSection title="CLI" isHeaderHidden>
            <XDSSideNavItem
              label="CLI"
              href="/packages/cli"
              isSelected={pathname === '/packages/cli'}
            />
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
