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

/** Names to skip — style exports, not real components */
const SKIP_NAMES = new Set(['stack', 'stackItem']);

/**
 * Component-paired hooks — these show alongside their component in the
 * sidebar, not in Utilities. Keyed by hook name → component name they pair with.
 */
const COMPONENT_PAIRED_HOOKS: Record<string, string> = {
  useXDSCollapsible: 'Collapsible',
  useXDSHoverCard: 'HoverCard',
  useXDSPopover: 'Popover',
  useXDSResizable: 'Resizable',
  useXDSToast: 'Toast',
  useXDSTooltip: 'Tooltip',
};

interface SidebarEntry {
  name: string;
  href: string;
}

interface SidebarGroup {
  label: string;
  entries: SidebarEntry[];
}

/**
 * Build the sidebar structure:
 * - Components: flat alphabetical, with paired hooks grouped next to their component
 * - Utilities: standalone hooks (directory=hooks) + Utilities group + useXDSLayer
 */
function buildSidebar(entries: ComponentEntry[]): {
  componentGroups: SidebarGroup[];
  utilities: SidebarEntry[];
} {
  const components: SidebarEntry[] = [];
  const utilities: SidebarEntry[] = [];
  const pairedHooks = new Map<string, SidebarEntry[]>();

  for (const entry of entries) {
    if (entry.hidden || SKIP_NAMES.has(entry.name)) continue;

    const isHook = entry.name.startsWith('use');
    const isUtilityGroup = entry.group === 'Utilities';

    // Component-paired hooks → collect to merge with their component
    if (COMPONENT_PAIRED_HOOKS[entry.name]) {
      const pairWith = COMPONENT_PAIRED_HOOKS[entry.name];
      if (!pairedHooks.has(pairWith)) pairedHooks.set(pairWith, []);
      pairedHooks.get(pairWith)!.push({
        name: entry.name,
        href: `/components/${entry.name}`,
      });
      continue;
    }

    // Utility group items + standalone hooks (directory=hooks) → Utilities
    if (
      isUtilityGroup ||
      (isHook && !entry.parentDoc && entry.directory === 'hooks')
    ) {
      utilities.push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }

    // Component-specific hooks with parentDoc (e.g. useXDSTableSelection) → skip sidebar
    if (isHook && entry.parentDoc) continue;

    // Everything else → Components list
    components.push({name: entry.name, href: `/components/${entry.name}`});
  }

  // Sort and merge paired hooks right after their component
  components.sort((a, b) => a.name.localeCompare(b.name));
  const merged: SidebarEntry[] = [];
  for (const comp of components) {
    merged.push(comp);
    const hooks = pairedHooks.get(comp.name);
    if (hooks) {
      merged.push(...hooks.sort((a, b) => a.name.localeCompare(b.name)));
    }
  }

  return {
    componentGroups: [{label: 'Components', entries: merged}],
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
  const {componentGroups, utilities} = buildSidebar(coreComponents);

  const isTheme = (p: PackageMeta) => p.name.includes('theme-');

  /** Check if current path is within a collapsible section */
  const isInComponents = pathname.startsWith('/components/');
  const isInDocs = pathname.startsWith('/docs/') || pathname === '/changelog';
  const isInFoundations =
    pathname.startsWith('/docs/') && pathname !== '/docs/getting-started';
  const isInPackages =
    pathname.startsWith('/packages/') &&
    !packages.some(
      p =>
        isTheme(p) && pathname === `/packages/${p.name.replace('@xds/', '')}`,
    );
  const isInThemes =
    pathname.startsWith('/packages/') &&
    packages.some(
      p =>
        isTheme(p) && pathname === `/packages/${p.name.replace('@xds/', '')}`,
    );
  const isInUtilities = utilities.some(u => pathname === u.href);

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
              collapsible={{defaultIsCollapsed: !isInDocs}}>
              <XDSSideNavItem
                label="Getting Started"
                href="/docs/getting-started"
                isSelected={pathname === '/docs/getting-started'}
              />
              <XDSSideNavItem
                label="Changelog"
                href="/changelog"
                isSelected={pathname === '/changelog'}
              />

              <XDSSideNavItem
                label="Foundations"
                collapsible={{defaultIsCollapsed: !isInFoundations}}>
                {docTopics
                  .filter(d => d.topic !== 'getting-started')
                  .map(d => (
                    <XDSSideNavItem
                      key={d.topic}
                      label={d.title}
                      href={`/docs/${d.topic}`}
                      isSelected={pathname === `/docs/${d.topic}`}
                    />
                  ))}
              </XDSSideNavItem>

              <XDSSideNavItem
                label="Packages"
                collapsible={{defaultIsCollapsed: !isInPackages}}>
                {packages
                  .filter(p => !isTheme(p))
                  .map(p => (
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

              <XDSSideNavItem
                label="Themes"
                collapsible={{defaultIsCollapsed: !isInThemes}}>
                {packages.filter(isTheme).map(p => (
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
            </XDSSideNavItem>
          </XDSSideNavSection>

          {/* Components — collapsible, flat alphabetical with paired hooks */}
          <XDSSideNavSection title="Components" isHeaderHidden>
            <XDSSideNavItem
              label="Components"
              collapsible={{defaultIsCollapsed: !isInComponents}}>
              {componentGroups[0].entries.map(comp => (
                <XDSSideNavItem
                  key={comp.name}
                  label={comp.name}
                  href={comp.href}
                  isSelected={pathname === comp.href}
                />
              ))}
            </XDSSideNavItem>
          </XDSSideNavSection>

          {/* Utilities — standalone hooks + utility components */}
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
