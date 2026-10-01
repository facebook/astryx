// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Theme',
  displayName: 'Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'theme',
    'theming',
    'provider',
    'color-scheme',
    'density',
    'compact',
    'dense',
  ],
  playground: {
    defaults: {
      theme: '@astryxdesign/theme-matcha',
      mode: 'light',
      children: {
        __element: 'Card',
        props: {padding: 4, style: {maxWidth: 360}},
        children: {
          __element: 'VStack',
          props: {gap: 3},
          children: [
            {
              __element: 'Heading',
              props: {level: 4},
              children: 'Theme preview',
            },
            {
              __element: 'Text',
              props: {type: 'body', color: 'secondary'},
              children:
                'Cards, text, and buttons inherit tokens from the selected theme.',
            },
            {__element: 'Button', props: {label: 'Primary action'}},
          ],
        },
      },
    },
  },
  usage: {
    description:
      'Wraps a subtree with a specific Astryx theme. For static production themes, use `astryx theme build` and import the generated CSS plus built theme object for first-paint and SSR performance. Use runtime `defineTheme()` when themes are dynamic or for prototyping.\n\n`defineTheme` accepts a `tokens` object whose keys are CSS custom property names (always prefixed with `--`). Common token names include `--color-accent`, `--color-background-surface`, `--color-background-body`, `--color-text-primary`, `--color-text-secondary`, `--radius-container`, `--spacing-1` through `--spacing-6`. Values can be a string (same for light/dark) or a `[light, dark]` tuple.\n\nExample:\n```ts\nimport {defineTheme} from \'@astryxdesign/core/theme\';\nconst myTheme = defineTheme({\n  name: \'ocean\',\n  tokens: {\n    \'--color-accent\': [\'#0077B6\', \'#48CAE4\'],\n    \'--color-background-surface\': [\'#F0F8FF\', \'#0A1628\'],\n    \'--color-text-primary\': [\'#0A1317\', \'#FFFFFF\'],\n    \'--radius-container\': \'16px\',\n  },\n});\n```',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build app themes that are known ahead of time with `astryx theme build`, then import the generated CSS and built theme object.',
      },
      {
        guidance: true,
        description:
          'Use runtime themes when the theme is created or edited in the browser, such as theme editors, user branding, or prototypes.',
      },
      {
        guidance: true,
        description:
          'Token names always start with `--` (e.g. `--color-accent`, `--color-background-surface`). Do not omit the prefix.',
      },
      {
        guidance: true,
        description:
          'Set `density="compact"` on the Theme that wraps a dense tool (issue tracker, ops console, inbox, dashboard) instead of shrinking text, padding, and control sizes element by element.',
      },
      {
        guidance: false,
        description:
          'Use compact density for marketing, landing, or long-form reading pages. Nest `<Theme theme={…} density="default">` to give a reading region inside a compact app its standard scale back.',
      },
      {
        guidance: false,
        description:
          'Default to runtime themes in SSR production apps. Component overrides inject after hydration instead of shipping as static CSS.',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'DefinedTheme',
      required: true,
      description:
        'Theme object to apply. Prefer built theme objects for static production themes; use runtime `defineTheme()` for dynamic themes.',
    },
    {
      name: 'mode',
      type: "'light' | 'dark' | 'system'",
      default: "'system'",
      description: 'Color mode. System follows OS preference.',
    },
    {
      name: 'density',
      type: "'default' | 'compact'",
      description:
        "Region density. `compact` is for dense tools (issue trackers, ops consoles, inboxes, dashboards): spacing steps 3–12 shrink to about 0.75×, the type ramp steps down about one step (body 14→13px, supporting 12→11px), and controls, table rows, and nav items default to their small size. Values derive from the theme's own tokens and work in light and dark. Unset, a Theme inherits the enclosing Theme's density (`default` at the root); pass `default` to restore the standard scale inside a compact region.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content to render with the theme.',
    },
  ],
  examples: [
    {
      label: 'Dense issue tracker',
      code: `
import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Table, proportional, pixel, type TableColumn} from '@astryxdesign/core/Table';
import {CircleDot, Inbox, LayoutDashboard, Plus} from 'lucide-react';

type Issue = {
  id: string;
  title: string;
  status: 'Open' | 'In progress' | 'Blocked';
  priority: string;
  assignee: string;
  label: string;
  updated: string;
};

const issues: Issue[] = [
  {id: 'ENG-1402', title: 'Login redirect loops when the session cookie expires', status: 'Blocked', priority: 'P0', assignee: 'Ada Park', label: 'auth', updated: '12m ago'},
  {id: 'ENG-1398', title: 'CSV export drops unicode column headers', status: 'In progress', priority: 'P1', assignee: 'Ben Ortiz', label: 'export', updated: '1h ago'},
  {id: 'ENG-1391', title: 'Webhook retries ignore the backoff header', status: 'Open', priority: 'P2', assignee: 'Chen Wu', label: 'api', updated: '3h ago'},
];

const statusVariant = {Open: 'accent', 'In progress': 'warning', Blocked: 'error'} as const;

const columns: TableColumn<Issue>[] = [
  {key: 'id', header: 'ID', width: pixel(96)},
  {key: 'title', header: 'Title', width: proportional(3)},
  {
    key: 'status',
    header: 'Status',
    width: pixel(128),
    renderCell: row => <StatusDot variant={statusVariant[row.status]} label={row.status} />,
  },
  {key: 'priority', header: 'Pri', width: pixel(56)},
  {key: 'assignee', header: 'Assignee', width: pixel(128)},
  {key: 'label', header: 'Label', width: pixel(96), renderCell: row => <Token label={row.label} />},
  {key: 'updated', header: 'Updated', width: pixel(88)},
];

export function IssueTracker() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  // One prop makes the whole tool dense: 13px body text, tighter spacing,
  // 28px controls, compact table rows, small nav rows.
  return (
    <Theme theme={neutralTheme} density="compact">
      <AppShell
        contentPadding={6}
        sideNav={
          <SideNav>
            <SideNavSection title="Work" isHeaderHidden>
              <SideNavItem label="Inbox" icon={Inbox} href="#" />
              <SideNavItem label="Issues" icon={CircleDot} isSelected href="#" />
              <SideNavItem label="Dashboards" icon={LayoutDashboard} href="#" />
            </SideNavSection>
          </SideNav>
        }>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={2}>Issues</Heading>
            <Text type="supporting" color="secondary">
              {issues.length} open across 5 projects
            </Text>
          </VStack>
          <HStack gap={2} wrap="wrap">
            <TextInput label="Search issues" isLabelHidden placeholder="Search issues" value={query} onChange={setQuery} width={240} />
            <Selector
              label="Status"
              isLabelHidden
              value={status}
              onChange={value => setStatus(value ?? 'all')}
              options={[
                {value: 'all', label: 'All statuses'},
                {value: 'open', label: 'Open'},
                {value: 'blocked', label: 'Blocked'},
              ]}
            />
            <Button label="New issue" icon={<Plus size={16} />} />
          </HStack>
          <Table data={issues} columns={columns} idKey="id" hasHover />
        </VStack>
      </AppShell>
    </Theme>
  );
}
`,
    },
    {
      label: 'Dashboard: default vs compact',
      code: `
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';

const stats = [
  {label: 'Requests / min', value: '48.2k', note: '+3.1% vs last hour'},
  {label: 'Healthy hosts', value: '312 / 318', note: '6 draining'},
  {label: 'Open incidents', value: '4', note: '1 sev-2'},
  {label: 'p95 latency', value: '182 ms', note: '-12 ms'},
];

const services = [
  {id: 'api-gateway', status: 'success', label: 'Healthy', p95: '41 ms', errors: '0.02%'},
  {id: 'search', status: 'warning', label: 'Degraded', p95: '310 ms', errors: '0.8%'},
  {id: 'notifications', status: 'error', label: 'Down', p95: '1.2 s', errors: '2.6%'},
] as const;

const columns = [
  {key: 'id' as const, header: 'Service', width: proportional(2)},
  {
    key: 'status' as const,
    header: 'Status',
    width: pixel(128),
    renderCell: (row: (typeof services)[number]) => <StatusDot variant={row.status} label={row.label} />,
  },
  {key: 'p95' as const, header: 'p95', width: pixel(88)},
  {key: 'errors' as const, header: 'Errors', width: pixel(88)},
];

function Dashboard() {
  return (
    <VStack gap={6}>
      <HStack gap={3} wrap="wrap" justify="between">
        <VStack gap={1}>
          <Heading level={2}>Operations</Heading>
          <Text type="supporting" color="secondary">Updated 2 minutes ago</Text>
        </VStack>
        <Button label="Refresh" variant="secondary" />
      </HStack>
      <Grid columns={{minWidth: 160, max: 4}} gap={4}>
        {stats.map(stat => (
          <Card key={stat.label} padding={4}>
            <VStack gap={2}>
              <Text type="supporting" color="secondary">{stat.label}</Text>
              <Heading level={3}>{stat.value}</Heading>
              <Text type="supporting" color="secondary">{stat.note}</Text>
            </VStack>
          </Card>
        ))}
      </Grid>
      <Card padding={0}>
        <Table data={[...services]} columns={columns} idKey="id" />
      </Card>
    </VStack>
  );
}

// The same component under both densities. Compact: 13px body, 12px card
// padding instead of 16px, 28px buttons, compact table rows.
export function DensityComparison() {
  return (
    <Grid columns={{minWidth: 360, max: 2}} gap={6}>
      <Theme theme={neutralTheme}>
        <Dashboard />
      </Theme>
      <Theme theme={neutralTheme} density="compact">
        <Dashboard />
      </Theme>
    </Grid>
  );
}
`,
    },
    {
      label: 'Restore the default scale inside a compact app',
      code: `
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export function SupportConsole() {
  return (
    <Theme theme={neutralTheme} density="compact">
      <Layout
        start={
          <LayoutPanel width={280} label="Ticket queue">
            {/* The ticket queue stays dense. */}
            <List>
              <ListItem label="Refund not received" description="#4821 · 5m ago" />
              <ListItem label="Cannot reset password" description="#4819 · 12m ago" />
              <ListItem label="Invoice shows the wrong address" description="#4814 · 1h ago" />
            </List>
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            {/* The help article is for reading: a nested Theme restores the default scale. */}
            <Theme theme={neutralTheme} density="default">
              <VStack gap={3}>
                <Heading level={2}>Refund timelines</Heading>
                <Text type="body">
                  Card refunds post within 5–10 business days after approval. Bank transfers can
                  take up to 14 days, depending on the receiving bank.
                </Text>
              </VStack>
            </Theme>
          </LayoutContent>
        }
      />
    </Theme>
  );
}
`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'Wraps subtree w/ specific Astryx theme. For static production themes, use `astryx theme build` + generated CSS + built theme object for first-paint/SSR performance. Use runtime `defineTheme()` for dynamic themes or prototyping. Token names always start with `--` (e.g. `--color-accent`, `--color-background-surface`).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build app themes known ahead of time w/ `astryx theme build`; import generated CSS + built theme object.',
      },
      {
        guidance: true,
        description:
          'Use runtime themes when theme is created/edited in browser, e.g. theme editor, user branding, prototype.',
      },
      {
        guidance: true,
        description:
          'Token names always start with `--` (e.g. `--color-accent`, `--color-background-surface`). Do not omit the prefix.',
      },
      {
        guidance: true,
        description:
          'Dense tool (tracker, console, inbox, dashboard) → `density="compact"` on its Theme, not per-element shrinking.',
      },
      {
        guidance: false,
        description:
          'Compact density on marketing/reading pages. Nested `density="default"` restores the standard scale.',
      },
      {
        guidance: false,
        description:
          'Default to runtime themes in SSR production apps. Component overrides inject after hydration instead of static CSS.',
      },
    ],
  },
  propDescriptions: {
    theme:
      'theme object to apply. Prefer built theme objects for static production themes; use runtime `defineTheme()` for dynamic themes.',
    mode: 'color mode. System follows OS preference. defaults to "system"',
    density:
      '"compact" for dense tools (trackers, consoles, inboxes, dashboards): spacing 3–12 ×0.75, type ~1 step down (body 13px), controls/table rows/nav items small. Unset = inherit enclosing Theme ("default" at root).',
  },
};
