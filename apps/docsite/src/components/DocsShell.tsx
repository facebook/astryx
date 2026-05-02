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

/** Group top-level components by their group field */
function groupComponents(
  entries: ComponentEntry[],
): Record<string, ComponentEntry[]> {
  const groups: Record<string, ComponentEntry[]> = {};
  for (const entry of entries) {
    if (entry.hidden) continue;
    if (entry.parentDoc) continue;
    const group = entry.group || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(entry);
  }
  return groups;
}

export function DocsShell({
  children,
  components,
  packages,
  docTopics,
}: DocsShellProps) {
  const pathname = usePathname();

  const coreComponents = components['@xds/core'] || [];
  const grouped = groupComponents(coreComponents);
  const groupNames = Object.keys(grouped).sort();

  const isTheme = (p: PackageMeta) => p.name.includes('theme-');

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
            <XDSSideNavItem label="Guide" collapsible>
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

              {/* Foundations */}
              <XDSSideNavItem label="Foundations" collapsible>
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

              {/* Packages */}
              <XDSSideNavItem label="Packages" collapsible>
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

              {/* Themes */}
              <XDSSideNavItem label="Themes" collapsible>
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

          {/* Components — single section with groups as collapsible children */}
          <XDSSideNavSection title="Components">
            {groupNames.map(group => (
              <XDSSideNavItem key={group} label={group} collapsible>
                {grouped[group].map(comp => (
                  <XDSSideNavItem
                    key={comp.name}
                    label={comp.name}
                    href={`/components/${comp.name}`}
                    isSelected={pathname === `/components/${comp.name}`}
                  />
                ))}
              </XDSSideNavItem>
            ))}
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      {children}
    </XDSAppShell>
  );
}
