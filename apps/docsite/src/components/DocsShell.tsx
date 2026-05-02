'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';

// Foundation topics to show in sidebar (stable set)
const FOUNDATION_TOPICS = [
  'typography',
  'color',
  'spacing',
  'shape',
  'icons',
  'elevation',
  'motion',
];

interface DocsShellProps {
  children: React.ReactNode;
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
}

/** Group components by their group field for sidebar sections */
function groupComponents(
  entries: ComponentEntry[],
): Record<string, ComponentEntry[]> {
  const groups: Record<string, ComponentEntry[]> = {};
  for (const entry of entries) {
    if (entry.hidden) continue;
    // Skip sub-components in the sidebar — show only top-level entries
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

  const foundations = docTopics.filter(d =>
    FOUNDATION_TOPICS.includes(d.topic),
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
        <XDSSideNav>
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
                href="/getting-started"
                isSelected={pathname === '/getting-started'}
              />
              <XDSSideNavItem
                label="What's New"
                href="/whats-new"
                isSelected={pathname === '/whats-new'}
              />
              <XDSSideNavItem label="Foundations" collapsible>
                {foundations.map(d => (
                  <XDSSideNavItem
                    key={d.topic}
                    label={d.title}
                    href={`/foundations/${d.topic}`}
                    isSelected={pathname === `/foundations/${d.topic}`}
                  />
                ))}
              </XDSSideNavItem>
              <XDSSideNavItem label="Packages" collapsible>
                {packages.map(p => (
                  <XDSSideNavItem
                    key={p.name}
                    label={p.displayName}
                    href={`/packages/${encodeURIComponent(p.name)}`}
                    isSelected={
                      pathname === `/packages/${encodeURIComponent(p.name)}`
                    }
                  />
                ))}
              </XDSSideNavItem>
            </XDSSideNavItem>
          </XDSSideNavSection>

          {/* Component categories */}
          {groupNames.map(group => (
            <XDSSideNavSection key={group} title={group}>
              {grouped[group].map(comp => (
                <XDSSideNavItem
                  key={comp.name}
                  label={comp.name}
                  href={`/components/${comp.name}`}
                  isSelected={pathname === `/components/${comp.name}`}
                />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }>
      {children}
    </XDSAppShell>
  );
}
