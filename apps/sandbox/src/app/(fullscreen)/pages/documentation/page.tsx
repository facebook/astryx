'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavHeading,
} from '@xds/core/SideNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDivider} from '@xds/core/Divider';
import {
  XDSBreadcrumbs,
  XDSBreadcrumbItem,
} from '@xds/core/Breadcrumbs';
import {
  XDSTable,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

// Icons
const BookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const RocketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ThumbUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const ThumbDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

// Config table types
interface ConfigOption extends Record<string, unknown> {
  id: string;
  option: string;
  type: string;
  defaultVal: string;
  description: string;
  badge?: 'required' | 'new' | 'deprecated';
}

const configOptions: ConfigOption[] = [
  {id: '1', option: 'apiKey', type: 'string', defaultVal: '\u2014', description: 'Your API authentication key', badge: 'required'},
  {id: '2', option: 'baseUrl', type: 'string', defaultVal: '"https://api.yp.com"', description: 'Base URL for all API requests'},
  {id: '3', option: 'typeSafe', type: 'boolean', defaultVal: 'false', description: 'Enable compile-time route type checking'},
  {id: '4', option: 'timeout', type: 'number', defaultVal: '5000', description: 'Request timeout in milliseconds'},
  {id: '5', option: 'retries', type: 'number', defaultVal: '3', description: 'Number of automatic retry attempts on failure', badge: 'new'},
  {id: '6', option: 'debug', type: 'boolean', defaultVal: 'false', description: 'Enable verbose request/response logging'},
  {id: '7', option: 'legacyMode', type: 'boolean', defaultVal: 'false', description: 'Use v1 API format. Removed in v4.', badge: 'deprecated'},
];

const BADGE_MAP: Record<string, 'error' | 'success' | 'warning'> = {
  required: 'error',
  new: 'success',
  deprecated: 'warning',
};

const configColumns: XDSTableColumn<ConfigOption>[] = [
  {
    key: 'option',
    header: 'Option',
    width: proportional(2),
    renderCell: (item: ConfigOption) => (
      <XDSHStack gap={2} vAlign="center">
        <code {...stylex.props(styles.inlineCode)}>{item.option}</code>
        {item.badge && (
          <XDSBadge
            variant={BADGE_MAP[item.badge]}
            label={item.badge.charAt(0).toUpperCase() + item.badge.slice(1)}
          />
        )}
      </XDSHStack>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    width: pixel(120),
    renderCell: (item: ConfigOption) => (
      <code {...stylex.props(styles.typeCode)}>{item.type}</code>
    ),
  },
  {
    key: 'defaultVal',
    header: 'Default',
    width: pixel(180),
    renderCell: (item: ConfigOption) => (
      <XDSText type="supporting" color="secondary">
        {item.defaultVal === '\u2014' ? '\u2014' : <code {...stylex.props(styles.inlineCode)}>{item.defaultVal}</code>}
      </XDSText>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    width: proportional(3),
    renderCell: (item: ConfigOption) => (
      <XDSText type="body">{item.description}</XDSText>
    ),
  },
];

function DocsSideNav() {
  const [active, setActive] = useState('introduction');
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={<XDSNavIcon icon={<BookIcon style={{width: 16, height: 16}} />} />}
          heading="YourProject"
          headingHref="#"
        />
      }>
      <XDSSideNavSection title="Getting Started">
        <XDSSideNavItem
          label="Introduction"
          icon={BookIcon}
          isSelected={active === 'introduction'}
          onClick={() => setActive('introduction')}
        />
        <XDSSideNavItem
          label="Installation"
          icon={RocketIcon}
          isSelected={active === 'installation'}
          onClick={() => setActive('installation')}
        />
        <XDSSideNavItem
          label="Quick Start"
          icon={RocketIcon}
          isSelected={active === 'quickstart'}
          onClick={() => setActive('quickstart')}
        />
        <XDSSideNavItem
          label="Project Structure"
          icon={FileIcon}
          isSelected={active === 'structure'}
          onClick={() => setActive('structure')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Core Concepts">
        <XDSSideNavItem
          label="Configuration"
          icon={SettingsIcon}
          isSelected={active === 'config'}
          onClick={() => setActive('config')}
        />
        <XDSSideNavItem
          label="Authentication"
          icon={ShieldIcon}
          isSelected={active === 'auth'}
          onClick={() => setActive('auth')}
        />
        <XDSSideNavItem
          label="Data Fetching"
          icon={DatabaseIcon}
          isSelected={active === 'data'}
          onClick={() => setActive('data')}
        />
        <XDSSideNavItem
          label="Error Handling"
          icon={AlertIcon}
          isSelected={active === 'errors'}
          onClick={() => setActive('errors')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="API Reference">
        <XDSSideNavItem
          label="Client"
          icon={CodeIcon}
          isSelected={active === 'client'}
          onClick={() => setActive('client')}
        />
        <XDSSideNavItem
          label="Endpoints"
          icon={LayersIcon}
          isSelected={active === 'endpoints'}
          onClick={() => setActive('endpoints')}
        />
        <XDSSideNavItem
          label="Types"
          icon={CodeIcon}
          isSelected={active === 'types'}
          onClick={() => setActive('types')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Resources">
        <XDSSideNavItem
          label="Examples"
          icon={FileIcon}
          isSelected={active === 'examples'}
          onClick={() => setActive('examples')}
        />
        <XDSSideNavItem
          label="FAQ"
          icon={HelpIcon}
          isSelected={active === 'faq'}
          onClick={() => setActive('faq')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

export default function DocumentationTemplate() {
  const [installTab, setInstallTab] = useState('npm');
  const [searchFilters, setSearchFilters] = useState<PowerSearchFilter[]>([]);

  return (
    <XDSAppShell
      sideNav={<DocsSideNav />}
      variant="elevated"
      contentPadding={6}>
        <div style={{paddingBottom: 36}}>
        <XDSPowerSearch
          config={{name: 'Docs', fields: []}}
          filters={searchFilters}
          onChange={newFilters => setSearchFilters([...newFilters])}
          placeholder="Search documentation..."
        />
        </div>
        <main style={{maxWidth: 820, width: '100%', marginInline: 'auto', display: 'flex', flexDirection: 'column' as const}}>
          {/* Page header */}
          <XDSVStack gap={1}>
            <XDSBreadcrumbs>
              <XDSBreadcrumbItem href="#">Docs</XDSBreadcrumbItem>
              <XDSBreadcrumbItem href="#">Getting Started</XDSBreadcrumbItem>
              <XDSBreadcrumbItem isCurrent>Introduction</XDSBreadcrumbItem>
            </XDSBreadcrumbs>
            <div style={{marginTop: 8}}>
              <XDSHeading level={1}>Introduction</XDSHeading>
            </div>
            <XDSText type="body" color="secondary">
              YourProject is a modern toolkit for building fast, reliable APIs.
              This guide covers everything you need to get started.
            </XDSText>
          </XDSVStack>

          {/* Quick links */}
          <div style={{marginTop: 32}}>
          <XDSGrid columns={3} gap={4}>
            <XDSCard>
              <div {...stylex.props(styles.cardInner)}>
                <XDSVStack gap={2}>
                  <XDSText type="body" weight="bold">Quick Start</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Get up and running in under 5 minutes with our starter template.
                  </XDSText>
                </XDSVStack>
              </div>
            </XDSCard>
            <XDSCard>
              <div {...stylex.props(styles.cardInner)}>
                <XDSVStack gap={2}>
                  <XDSText type="body" weight="bold">API Reference</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Complete reference for all endpoints, types, and utilities.
                  </XDSText>
                </XDSVStack>
              </div>
            </XDSCard>
            <XDSCard>
              <div {...stylex.props(styles.cardInner)}>
                <XDSVStack gap={2}>
                  <XDSText type="body" weight="bold">Examples</XDSText>
                  <XDSText type="supporting" color="secondary">
                    Real-world examples and patterns to learn from.
                  </XDSText>
                </XDSVStack>
              </div>
            </XDSCard>
          </XDSGrid>
          </div>

          {/* Overview */}
          <div style={{marginTop: 36}}>
          <XDSVStack gap={3}>
            <XDSHeading level={2} id="overview">Overview</XDSHeading>
            <XDSText type="body">
              YourProject provides a type-safe, batteries-included framework for building
              production-ready APIs. It handles authentication, validation, rate limiting,
              and more &mdash; so you can focus on your business logic.
            </XDSText>
            <div style={{marginTop: 8}}>
            <XDSBanner
              status="info"
              title="Prerequisites"
              description="You'll need Node.js 18+ and npm 9+ installed on your machine."
            />
            </div>
          </XDSVStack>
          </div>

          {/* Installation */}
          <div style={{marginTop: 36}}>
          <XDSVStack gap={3}>
            <XDSHeading level={2} id="installation">Installation</XDSHeading>
            <XDSVStack gap={6}>
              <XDSVStack gap={3}>
                <XDSHeading level={3}>1. Install the package</XDSHeading>
                <XDSText type="body" color="secondary">
                  Add YourProject to your project using your preferred package manager.
                </XDSText>
                <XDSTabList
                  value={installTab}
                  onChange={setInstallTab}>
                  <XDSTab value="npm" label="npm" />
                  <XDSTab value="yarn" label="yarn" />
                  <XDSTab value="pnpm" label="pnpm" />
                </XDSTabList>
                {installTab === 'npm' && (
                  <XDSCodeBlock title="Terminal" code="npm install yourproject" language="bash" hasLineNumbers />
                )}
                {installTab === 'yarn' && (
                  <XDSCodeBlock title="Terminal" code="yarn add yourproject" language="bash" hasLineNumbers />
                )}
                {installTab === 'pnpm' && (
                  <XDSCodeBlock title="Terminal" code="pnpm add yourproject" language="bash" hasLineNumbers />
                )}
              </XDSVStack>

              <XDSVStack gap={3}>
                <XDSHeading level={3}>2. Create a config file</XDSHeading>
                <XDSText type="body" color="secondary">
                  Add a configuration file to your project root.
                </XDSText>
                <XDSCodeBlock title="yourproject.config.ts" language="typescript" hasLineNumbers code={`import { defineConfig } from "yourproject";

export default defineConfig({
  // Your API key from the dashboard
  apiKey: process.env.API_KEY,

  // Enable type-safe routes
  typeSafe: true,

  // Request timeout (ms)
  timeout: 5000,
});`} />
              </XDSVStack>

              <XDSVStack gap={3}>
                <XDSHeading level={3}>3. Start building</XDSHeading>
                <XDSText type="body" color="secondary">
                  You&apos;re ready to go! Create your first endpoint.
                </XDSText>
                <XDSCodeBlock title="src/index.ts" language="typescript" hasLineNumbers code={`import { createApp, router } from "yourproject";

const app = createApp();

app.get("/hello", (req, res) => {
  res.json({ message: "Hello, world!" });
});

app.listen(3000);`} />
              </XDSVStack>
            </XDSVStack>
            <div style={{marginTop: 8}}>
            <XDSBanner
              status="success"
              title="You're all set!"
              description="Run npx yourproject dev and visit http://localhost:3000/hello."
            />
            </div>
          </XDSVStack>
          </div>

          {/* Configuration */}
          <div style={{marginTop: 36}}>
          <XDSVStack gap={3}>
            <XDSHeading level={2} id="configuration">Configuration</XDSHeading>
            <XDSText type="body">
              The config file supports the following options. All options are optional
              unless marked as required.
            </XDSText>
            <XDSTable<ConfigOption>
              data={configOptions}
              columns={configColumns}
              idKey="id"
              density="balanced"
              dividers="rows"
            />
            <div style={{marginTop: 8}}>
            <XDSBanner
              status="warning"
              title="Security"
              description="Never commit your apiKey to version control. Use environment variables or a .env file."
            />
            </div>
          </XDSVStack>
          </div>

          {/* Feedback */}
          <div style={{marginTop: 36}}>
          <XDSDivider />
          </div>
          <div style={{marginTop: 36, marginBottom: 36}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSHeading level={3}>Was this page helpful?</XDSHeading>
            <XDSButton label="Yes" icon={<ThumbUpIcon style={{width: 16, height: 16}} />} />
            <XDSButton label="No" icon={<ThumbDownIcon style={{width: 16, height: 16}} />} />
          </XDSHStack>
          </div>
        </main>
    </XDSAppShell>
  );
}

const styles = stylex.create({
  cardInner: {
    padding: 4,
  },
  inlineCode: {
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: '0.85em',
    backgroundColor: colorVars['--color-background-muted'],
    padding: '2px 6px',
    borderRadius: radiusVars['--radius-inner'],
  },
  typeCode: {
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 12,
    color: colorVars['--color-accent'],
  },
});
