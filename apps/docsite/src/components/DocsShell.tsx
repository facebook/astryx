'use client';

import {usePathname} from 'next/navigation';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {GITHUB_REPO} from '../constants';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';

interface DocsShellProps {
  children: React.ReactNode;
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
}

/** Foundations: tokens first, then alphabetical */
const foundationsSort = (a: DocTopic, b: DocTopic) => {
  if (a.topic === 'tokens') return -1;
  if (b.topic === 'tokens') return 1;
  return a.title.localeCompare(b.title);
};

// ── Component sidebar builder ──────────────────────────────────────────

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

// ── Wordmark ───────────────────────────────────────────────────────────

const XDS_WORDMARK = (
  <svg
    width="46"
    height="24"
    viewBox="0 0 46 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37617 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
      fill="currentColor"
    />
    <path
      d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3857 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23204C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z"
      fill="currentColor"
    />
  </svg>
);

// ── Shell ──────────────────────────────────────────────────────────────

export function DocsShell({
  children,
  components,
  packages,
  docTopics,
}: DocsShellProps) {
  const pathname = usePathname();

  const coreComponents = components['@xds/core'] || [];
  const {componentItems, utilities} = buildComponentSidebar(coreComponents);

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
      height="fill"
      topNav={
        <XDSTopNav
          label="XDS navigation"
          heading={<XDSTopNavHeading logo={XDS_WORDMARK} headingHref="/" />}
          endContent={
            <XDSButton label="GitHub" variant="ghost" href={GITHUB_REPO} />
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
