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

interface SidebarEntry {
  name: string;
  href: string;
}

/**
 * Build sidebar entries from the component registry. Pure data-driven,
 * no hardcoded lists.
 *
 * Classification rules (all from the data):
 * - group === 'Utilities' → Utilities section
 * - Hooks in hooks/ dir with no parentDoc → Utilities section
 * - Hooks with parentDoc → listed after the first component that shares
 *   their parentDoc (e.g. useXDSTableSelection after Table)
 * - Hooks with no parentDoc in a component dir (e.g. useXDSPopover in
 *   Popover/) → listed after the component sharing their directory
 * - Everything else → Components section
 */
function buildSidebar(entries: ComponentEntry[]): {
  components: SidebarEntry[];
  utilities: SidebarEntry[];
} {
  const componentEntries: SidebarEntry[] = [];
  const utilityEntries: SidebarEntry[] = [];
  // component name → hooks to list after it
  const pairedHooks = new Map<string, SidebarEntry[]>();

  // Which parentDoc values have at least one non-hook entry?
  const parentDocsWithComponents = new Set<string>();
  for (const e of entries) {
    if (e.parentDoc && !e.name.startsWith('use') && !e.hidden) {
      parentDocsWithComponents.add(e.parentDoc);
    }
  }

  for (const entry of entries) {
    if (entry.hidden) continue;

    const isHook = entry.name.startsWith('use');

    // Utilities group → Utilities
    if (entry.group === 'Utilities') {
      utilityEntries.push({
        name: entry.name,
        href: `/components/${entry.name}`,
      });
      continue;
    }

    if (isHook) {
      // Standalone hooks in hooks/ → Utilities
      if (!entry.parentDoc && entry.directory === 'hooks') {
        utilityEntries.push({
          name: entry.name,
          href: `/components/${entry.name}`,
        });
        continue;
      }

      // Hook with parentDoc that has real components → pair with parent
      if (entry.parentDoc && parentDocsWithComponents.has(entry.parentDoc)) {
        const parent = entry.parentDoc;
        if (!pairedHooks.has(parent)) pairedHooks.set(parent, []);
        pairedHooks.get(parent)!.push({
          name: entry.name,
          href: `/components/${entry.name}`,
        });
        continue;
      }

      // Hook in a component directory (e.g. useXDSPopover in Popover/)
      if (!entry.parentDoc && entry.directory !== 'hooks') {
        const dir = entry.directory;
        if (!pairedHooks.has(dir)) pairedHooks.set(dir, []);
        pairedHooks.get(dir)!.push({
          name: entry.name,
          href: `/components/${entry.name}`,
        });
        continue;
      }

      // Fallback → Utilities
      utilityEntries.push({
        name: entry.name,
        href: `/components/${entry.name}`,
      });
      continue;
    }

    // Non-hook → Components
    componentEntries.push({
      name: entry.name,
      href: `/components/${entry.name}`,
    });
  }

  // Sort and merge paired hooks after the first component sharing their key
  componentEntries.sort((a, b) => a.name.localeCompare(b.name));
  const merged: SidebarEntry[] = [];
  const usedPairKeys = new Set<string>();

  for (const comp of componentEntries) {
    merged.push(comp);
    // Try pairing by component name first, then by parentDoc match
    for (const [key, hooks] of pairedHooks) {
      if (usedPairKeys.has(key)) continue;
      if (comp.name === key) {
        merged.push(...hooks.sort((a, b) => a.name.localeCompare(b.name)));
        usedPairKeys.add(key);
      }
    }
  }

  // Any unpaired hooks → Utilities
  for (const [key, hooks] of pairedHooks) {
    if (!usedPairKeys.has(key)) {
      utilityEntries.push(...hooks);
    }
  }

  return {
    components: merged,
    utilities: utilityEntries.sort((a, b) => a.name.localeCompare(b.name)),
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
  const {components: sidebarComponents, utilities} =
    buildSidebar(coreComponents);

  const isTheme = (p: PackageMeta) => p.name.includes('theme-');
  const isInComponents = sidebarComponents.some(c => pathname === c.href);
  const isInUtilities = utilities.some(u => pathname === u.href);
  const isInDocs = pathname.startsWith('/docs/') || pathname === '/changelog';
  const isInFoundations =
    pathname.startsWith('/docs/') && pathname !== '/docs/getting-started';
  const isInPackages = packages.some(
    p => !isTheme(p) && pathname === `/packages/${p.name.replace('@xds/', '')}`,
  );
  const isInThemes = packages.some(
    p => isTheme(p) && pathname === `/packages/${p.name.replace('@xds/', '')}`,
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

          {/* Components */}
          <XDSSideNavSection title="Components" isHeaderHidden>
            <XDSSideNavItem
              label="Components"
              collapsible={{defaultIsCollapsed: !isInComponents}}>
              {sidebarComponents.map(comp => (
                <XDSSideNavItem
                  key={comp.name}
                  label={comp.name}
                  href={comp.href}
                  isSelected={pathname === comp.href}
                />
              ))}
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
