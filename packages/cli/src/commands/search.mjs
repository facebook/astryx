// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file search command — Cross-resource search with alias resolution
 *
 * Searches across components, docs, templates, hooks, and plugins.
 * Resolves natural language to component names via synonym/alias map.
 * Returns targeted results with imports, key props, and examples.
 *
 * Usage:
 *   xds search "sidebar"           → finds SideNav, SideNavSection, etc.
 *   xds search "toast"             → finds Toast, useXDSToast
 *   xds search "table sorting"     → finds Table, useXDSTableSortable
 *   xds search "success message"   → finds Toast (via alias)
 *   xds search "form inputs"       → finds FormLayout, TextInput, Selector
 */

import {jsonOut, jsonError} from '../lib/json.mjs';
import {component as componentApi} from '../api/component.mjs';
import {docs as docsApi} from '../api/docs.mjs';
import {template as templateApi} from '../api/template.mjs';

// ── Alias Map ─────────────────────────────────────────────────────────────────
// Maps natural language terms → component names for discovery
const ALIASES = {
  sidebar: ['SideNav', 'SideNavSection', 'SideNavItem', 'AppShell'],
  toast: ['Toast', 'useXDSToast'],
  notification: ['Toast', 'useXDSToast', 'Banner'],
  'success message': ['Toast', 'useXDSToast'],
  'error message': ['Toast', 'Banner'],
  alert: ['AlertDialog', 'useXDSImperativeAlertDialog', 'Banner'],
  confirm: ['AlertDialog', 'useXDSImperativeAlertDialog'],
  confirmation: ['AlertDialog', 'useXDSImperativeAlertDialog'],
  modal: ['Dialog', 'DialogHeader', 'useXDSImperativeDialog'],
  popup: ['Dialog', 'Popover'],
  dropdown: ['DropdownMenu', 'Selector', 'DropdownMenuItem'],
  'select a': ['Selector', 'MultiSelector'],
  'pick a': ['Selector'],
  'choose a': ['Selector'],
  selector: ['Selector', 'MultiSelector'],
  table: ['Table', 'BaseTable', 'useXDSTableSortable', 'useXDSTableSelection', 'useXDSTableColumnSettings'],
  sortable: ['useXDSTableSortable'],
  sort: ['useXDSTableSortable'],
  sorting: ['useXDSTableSortable'],
  selection: ['useXDSTableSelection'],
  'table selection': ['useXDSTableSelection'],
  'row selection': ['useXDSTableSelection'],
  'table sorting': ['useXDSTableSortable'],
  'table sort': ['useXDSTableSortable'],
  tabs: ['TabList', 'Tab', 'TabPanel'],
  form: ['FormLayout', 'TextInput', 'Selector', 'Switch', 'RadioList', 'Field', 'FieldLabel', 'FieldStatus'],
  input: ['TextInput', 'TextArea', 'NumberInput', 'DateInput'],
  autocomplete: ['Typeahead', 'BaseTypeahead'],
  navigation: ['SideNav', 'TopNav', 'TopNavItem', 'MobileNav', 'Breadcrumb'],
  nav: ['SideNav', 'TopNav', 'MobileNav'],
  layout: ['AppShell', 'Layout', 'LayoutPanel', 'LayoutContent'],
  grid: ['Grid', 'GridItem'],
  card: ['Card', 'CardHeader', 'CardContent', 'CardFooter'],
  button: ['Button', 'ButtonGroup'],
  chat: ['ChatLayout', 'ChatMessageList', 'ChatMessage', 'ChatComposer'],
  command: ['CommandPalette', 'CommandPaletteItem'],
  'command palette': ['CommandPalette', 'CommandPaletteItem'],
  tooltip: ['Tooltip'],
  avatar: ['Avatar', 'AvatarStatusDot'],
  badge: ['Badge'],
  switch: ['Switch'],
  toggle: ['Switch'],
  radio: ['RadioList', 'Radio'],
  checkbox: ['Checkbox'],
  loading: ['Spinner', 'Skeleton'],
  spinner: ['Spinner'],
  menu: ['DropdownMenu', 'ContextMenu', 'MoreMenu'],
  'dark mode': ['Theme'],
  theming: ['Theme'],
  theme: ['Theme'],
  icon: ['Icon'],
  search: ['Typeahead', 'BaseTypeahead', 'CommandPalette', 'PowerSearch'],
  popover: ['Popover', 'HoverCard'],
  hover: ['HoverCard'],
  date: ['DateInput', 'DateRangePicker', 'DateTimePicker', 'Calendar'],
  calendar: ['Calendar', 'DateInput'],
  slider: ['Slider'],
  progress: ['ProgressBar', 'Stepper'],
  tree: ['TreeList'],
  list: ['List', 'ListItem', 'MetadataList'],
  divider: ['Divider'],
  heading: ['Heading'],
  text: ['Text', 'Heading'],
  code: ['Code', 'CodeBlock'],
  file: ['FileInput'],
  pagination: ['Pagination'],
  breadcrumb: ['Breadcrumb', 'BreadcrumbItem'],
  skeleton: ['Skeleton'],
  resizable: ['Resizable', 'useXDSResizable'],
  split: ['Resizable', 'LayoutPanel', 'useXDSResizable'],
};

// ── Topic aliases ─────────────────────────────────────────────────────────────
const TOPIC_ALIASES = {
  theming: 'theme',
  'custom theme': 'theme',
  'set up theme': 'theme',
  'dark mode': 'theme',
  'light mode': 'theme',
  colors: 'color',
  colour: 'color',
  spacing: 'spacing',
  typography: 'typography',
  fonts: 'typography',
  motion: 'motion',
  animation: 'motion',
  icons: 'icons',
  tokens: 'tokens',
  'design tokens': 'tokens',
  styling: 'styling',
  css: 'styling',
  xstyle: 'styling',
  'getting started': 'getting-started',
  setup: 'getting-started',
  install: 'getting-started',
};

function resolveComponents(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);
  const found = new Set();
  const matchedSpans = []; // track which parts of query are consumed

  // Multi-word alias matching (check longest phrases first)
  const sortedAliases = Object.keys(ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    // Word-boundary aware: alias must appear as whole word(s) in query
    const aliasWords = alias.split(/\s+/);
    let matches = false;

    if (aliasWords.length > 1) {
      // Multi-word: check if the phrase appears in the query
      matches = lower.includes(alias);
    } else {
      // Single word: must match as a whole word (with common suffixes)
      // "sorting" matches "sort", "selection" matches "selection", etc.
      const stems = [alias, alias + 's', alias + 'ing', alias + 'ed', alias + 'able'];
      matches = words.some(w => stems.includes(w) || w === alias + 'ion');
      // Also check if any query word starts with the alias (sortable → sort)
      if (!matches && alias.length >= 4) {
        matches = words.some(w => w.startsWith(alias) && w.length <= alias.length + 4);
      }
    }

    if (matches) {
      // Skip if a longer alias already covered these components
      const newComponents = ALIASES[alias].filter(n => !found.has(n));
      if (newComponents.length > 0) {
        newComponents.forEach(n => found.add(n));
        matchedSpans.push(alias);
      }
    }
  }

  return [...found];
}

function resolveTopics(query) {
  const lower = query.toLowerCase();
  const topics = [];

  const sortedAliases = Object.keys(TOPIC_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    if (lower.includes(alias)) {
      topics.push(TOPIC_ALIASES[alias]);
    }
  }

  return [...new Set(topics)];
}

export function registerSearch(program) {
  program
    .command('search <query>')
    .description('Search across components, docs, templates, and hooks')
    .option('--budget <tokens>', 'Max approximate tokens in response (default: 1500)', '1500')
    .option('--components-only', 'Only search components')
    .option('--docs-only', 'Only search documentation topics')
    .action(async (query, options) => {
      const json = program.opts().json || false;
      const budget = parseInt(options.budget) || 1500;

      const componentNames = resolveComponents(query);
      const topicSlugs = resolveTopics(query);

      const results = {
        query,
        components: [],
        docs: [],
        templates: [],
      };

      let tokensUsed = 0;
      const tokenBudgetPerComponent = Math.min(400, Math.floor(budget / Math.max(componentNames.length, 1)));

      // Fetch component details (brief)
      if (!options.docsOnly) {
        for (const name of componentNames.slice(0, 8)) {
          if (tokensUsed >= budget) break;
          try {
            const result = await componentApi(name, {
              cwd: process.cwd(),
              detail: 'brief',
              json: true,
            });
            if (result && result.data) {
              // Trim to budget-friendly size
              const entry = {
                name: result.data.name,
                import: result.data.import || `import {XDS${result.data.name}} from '@xds/core/${result.data.name}';`,
                description: result.data.description,
                group: result.data.group,
              };

              // Include key props if budget allows
              if (result.data.props && tokensUsed + 200 < budget) {
                entry.keyProps = result.data.props
                  .filter(p => p.required || ['variant', 'size', 'label', 'value', 'onChange', 'options', 'children', 'items'].includes(p.name))
                  .slice(0, 6)
                  .map(p => ({name: p.name, type: p.type, required: p.required || false}));
              }

              // Include related components
              if (result.data.relatedComponents && result.data.relatedComponents.length > 0) {
                entry.related = result.data.relatedComponents.slice(0, 5);
              }
              if (result.data.relatedHooks && result.data.relatedHooks.length > 0) {
                entry.relatedHooks = result.data.relatedHooks.slice(0, 3);
              }

              // For hooks, include return type
              if (result.data.returns) {
                entry.returns = result.data.returns;
              }

              results.components.push(entry);
              tokensUsed += JSON.stringify(entry).length / 4;
            }
          } catch {
            // Component not found via API — include as stub from alias resolution
            // This handles hooks and plugins that aren't in the component list
            if (name.startsWith('useXDS')) {
              const entry = {
                name,
                import: `import {${name}} from '@xds/core/${name.replace(/^useXDS/, '')}';`,
                type: 'hook',
                description: `Hook resolved via alias. Use \`xds hook ${name}\` or \`xds component ${name.replace(/^useXDS/, '')}\` for full docs.`,
              };
              results.components.push(entry);
              tokensUsed += JSON.stringify(entry).length / 4;
            }
          }
        }
      }

      // Fetch doc topics (section-level only to stay within budget)
      if (!options.componentsOnly && topicSlugs.length > 0) {
        for (const topic of topicSlugs.slice(0, 3)) {
          if (tokensUsed >= budget) break;
          try {
            const result = await docsApi(topic, undefined, {
              cwd: process.cwd(),
              detail: 'brief',
              json: true,
            });
            if (result && result.data) {
              // Only include section titles + first section content
              const entry = {
                topic: result.data.topic || topic,
                title: result.data.title,
                description: result.data.description,
                sections: result.data.sections
                  ? result.data.sections.map(s => s.title || s)
                  : [],
              };

              // Include first section content if within budget
              if (result.data.sections && result.data.sections[0] && tokensUsed + 300 < budget) {
                const firstSection = result.data.sections[0];
                if (typeof firstSection === 'object' && firstSection.content) {
                  entry.quickStart = firstSection.content;
                }
              }

              results.docs.push(entry);
              tokensUsed += JSON.stringify(entry).length / 4;
            }
          } catch {
            // Topic not found, skip
          }
        }
      }

      // Search templates
      if (!options.componentsOnly && !options.docsOnly) {
        try {
          const templateResult = await templateApi(undefined, {
            cwd: process.cwd(),
            list: true,
            json: true,
          });
          if (templateResult && templateResult.data) {
            const lower = query.toLowerCase();
            const matched = templateResult.data.filter(t =>
              t.name.toLowerCase().includes(lower) ||
              t.description?.toLowerCase().includes(lower) ||
              lower.split(/\s+/).some(w => w.length > 3 && t.description?.toLowerCase().includes(w)),
            );
            results.templates = matched.slice(0, 3).map(t => ({
              name: t.name,
              slug: t.slug,
              description: t.description,
            }));
          }
        } catch {
          // Templates not available
        }
      }

      // Output
      if (json) {
        const total = results.components.length + results.docs.length + results.templates.length;
        if (total === 0) {
          return jsonOut('search.empty', {
            query,
            hint: 'Try: component names (Button, Table), UI patterns (sidebar, toast, form), or topics (theming, spacing)',
          });
        }
        return jsonOut('search.results', results);
      }

      // Human-readable output
      if (results.components.length === 0 && results.docs.length === 0 && results.templates.length === 0) {
        console.log(`No results for "${query}".`);
        console.log('Try: component names (Button, Table), UI patterns (sidebar, toast), or topics (theming, spacing)');
        return;
      }

      if (results.components.length > 0) {
        console.log(`\n  Components (${results.components.length}):\n`);
        for (const c of results.components) {
          console.log(`    ${c.name} — ${c.description}`);
          console.log(`      ${c.import}`);
          if (c.keyProps) {
            const props = c.keyProps.map(p => `${p.name}${p.required ? '*' : ''}`).join(', ');
            console.log(`      key props: ${props}`);
          }
          if (c.related) console.log(`      related: ${c.related.join(', ')}`);
          console.log();
        }
      }

      if (results.docs.length > 0) {
        console.log(`  Docs (${results.docs.length}):\n`);
        for (const d of results.docs) {
          console.log(`    ${d.title} (${d.topic})`);
          if (d.sections.length > 0) {
            console.log(`      sections: ${d.sections.join(', ')}`);
          }
          console.log();
        }
      }

      if (results.templates.length > 0) {
        console.log(`  Templates (${results.templates.length}):\n`);
        for (const t of results.templates) {
          console.log(`    ${t.name} — ${t.description}`);
          console.log();
        }
      }
    });
}
