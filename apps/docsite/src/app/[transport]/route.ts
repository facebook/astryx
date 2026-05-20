// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MCP Server route handler — concierge variant.
 *
 * Single tool: ask(query)
 *
 * The server acts as a context-aware concierge that composes targeted responses
 * from multiple data sources (components, docs, blocks, templates). Instead of
 * returning pre-shaped full docs, it assembles only the relevant pieces based
 * on what the agent is trying to accomplish.
 *
 * Key insight: an agent building a sidebar needs ~400 tokens of targeted info
 * (imports, composition pattern, key props, example) — not 4,700 tokens of
 * everything ever documented about SideNav.
 *
 * Transport: Streamable HTTP (via mcp-handler)
 * Endpoint: /mcp (primary), /sse (legacy)
 */

import {createMcpHandler} from 'mcp-handler';
import {z} from 'zod';
import {components} from '../../generated/componentRegistry';
import {docTopics} from '../../generated/docsRegistry';
import {blocks} from '../../generated/blockRegistry';
import {templates} from '../../generated/templateRegistry';

const allComponents = Object.values(components).flat();
const visibleComponents = allComponents.filter(c => !c.hidden);

// ── Aliases / synonym map ──────────────────────────────────────────────
const ALIASES: Record<string, string[]> = {
  sidebar: ['SideNav', 'SideNavSection', 'SideNavItem', 'AppShell'],
  toast: ['Toast', 'useXDSToast'],
  notification: ['Toast', 'useXDSToast', 'Banner'],
  'success message': ['Toast', 'useXDSToast'],
  alert: ['AlertDialog', 'useXDSImperativeAlertDialog', 'Banner'],
  confirmation: ['AlertDialog', 'useXDSImperativeAlertDialog'],
  modal: ['Dialog', 'DialogHeader', 'useXDSImperativeDialog'],
  popup: ['Dialog', 'Popover'],
  dropdown: ['DropdownMenu', 'Selector', 'DropdownMenuItem'],
  select: ['Selector', 'MultiSelector'],
  table: ['Table', 'BaseTable', 'useXDSTableSortable', 'useXDSTableSelection'],
  sortable: ['useXDSTableSortable'],
  selection: ['useXDSTableSelection'],
  tabs: ['TabList', 'Tab', 'TabPanel'],
  form: ['FormLayout', 'TextInput', 'Selector', 'Switch', 'RadioList', 'Field'],
  input: ['TextInput', 'TextArea', 'BaseTypeahead'],
  autocomplete: ['Typeahead', 'BaseTypeahead'],
  navigation: ['SideNav', 'TopNav', 'TopNavItem', 'MobileNav', 'Breadcrumb'],
  nav: ['SideNav', 'TopNav', 'MobileNav'],
  layout: ['AppShell', 'Layout', 'LayoutPanel', 'LayoutContent'],
  grid: ['Grid', 'GridItem'],
  card: ['Card', 'CardHeader', 'CardContent', 'CardFooter'],
  button: ['Button', 'ButtonGroup'],
  chat: ['ChatLayout', 'ChatMessageList', 'ChatMessage', 'ChatComposer'],
  command: ['CommandPalette', 'CommandPaletteItem'],
  tooltip: ['Tooltip'],
  avatar: ['Avatar', 'AvatarStatusDot'],
  badge: ['Badge'],
  switch: ['Switch'],
  toggle: ['Switch'],
  radio: ['RadioList'],
  checkbox: ['Checkbox'],
  loading: ['Spinner', 'Skeleton'],
  menu: ['DropdownMenu', 'ContextMenu', 'MoreMenu'],
  'dark mode': ['Theme'],
  theming: ['Theme'],
  icon: ['Icon'],
  search: ['Typeahead', 'BaseTypeahead', 'CommandPalette'],
};

// ── Query Intent Classification ────────────────────────────────────────

type QueryIntent =
  | 'how_to_build'
  | 'what_props'
  | 'how_to_use'
  | 'find_component'
  | 'theming'
  | 'template_lookup';

function classifyIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();
  if (/\b(theme|theming|brand|color scheme|dark mode|light mode|define\s*theme|visual identity)\b/.test(lower))
    return 'theming';
  if (/\b(template|page layout|dashboard layout|settings page|landing page)\b/.test(lower))
    return 'template_lookup';
  if (/\b(props?|api|interface|types?|params?|arguments?|signature)\b/.test(lower))
    return 'what_props';
  if (/\b(how (do|to|can)|show me how|usage|pattern|example of)\b/.test(lower))
    return 'how_to_use';
  if (/\b(build|create|add|make|implement|set up|need a|want a|give me)\b/.test(lower))
    return 'how_to_build';
  return 'find_component';
}

// ── Component Resolution ───────────────────────────────────────────────

function resolveComponents(query: string): typeof visibleComponents[0][] {
  const lower = query.toLowerCase();
  const found = new Set<string>();

  // Check aliases
  for (const [alias, names] of Object.entries(ALIASES)) {
    if (lower.includes(alias)) {
      names.forEach(n => found.add(n.toLowerCase()));
    }
  }

  // Direct name matches
  for (const comp of visibleComponents) {
    if (lower.includes(comp.name.toLowerCase())) {
      found.add(comp.name.toLowerCase());
    }
    for (const kw of comp.keywords) {
      if (lower.includes(kw.toLowerCase()) && kw.length > 3) {
        found.add(comp.name.toLowerCase());
      }
    }
  }

  return visibleComponents.filter(c => found.has(c.name.toLowerCase()));
}

// ── Response Composers ─────────────────────────────────────────────────

function composeQuickRef(comp: typeof visibleComponents[0]) {
  const keyProps = comp.props
    .filter(p => p.required || ['variant', 'size', 'label', 'options', 'value', 'onChange', 'children', 'items'].includes(p.name))
    .slice(0, 8)
    .map(p => {
      const parts = [`${p.name}${p.required ? '*' : ''}: ${p.type}`];
      if (p.default) parts.push(`(default: ${p.default})`);
      return parts.join(' ');
    });

  return {
    name: comp.name,
    import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
    description: comp.description,
    keyProps,
    ...(comp.relatedComponents && comp.relatedComponents.length > 0
      ? {composedWith: comp.relatedComponents.slice(0, 5)}
      : {}),
    ...(comp.params ? {returns: comp.returns} : {}),
  };
}

function composeImplementation(comps: typeof visibleComponents[0][]) {
  const result: {
    imports: string[];
    components: Array<{name: string; description: string; keyProps: string[]}>;
    example?: {name: string; source: string};
    tips?: string[];
  } = {imports: [], components: []};

  const seenImports = new Set<string>();
  for (const comp of comps.slice(0, 5)) {
    const imp = `import {${comp.moduleName}} from '@xds/core/${comp.name}';`;
    if (!seenImports.has(imp)) {
      seenImports.add(imp);
      result.imports.push(imp);
    }
    const keyProps = comp.props
      .filter(p => p.required || ['variant', 'size', 'label', 'children', 'items', 'options', 'value', 'onChange'].includes(p.name))
      .slice(0, 6)
      .map(p => `${p.name}${p.required ? '*' : ''}: ${p.type}`);
    result.components.push({name: comp.name, description: comp.description, keyProps});
  }

  // Best matching example
  const primaryComp = comps[0];
  if (primaryComp) {
    const showcase = blocks.find(
      b => b.exampleFor.toLowerCase() === primaryComp.name.toLowerCase() && b.isShowcase,
    );
    if (showcase) {
      result.example = {name: showcase.name, source: showcase.source};
    }
  }

  // Tips
  const tips: string[] = [];
  for (const comp of comps.slice(0, 2)) {
    if (comp.usage?.bestPractices) {
      for (const bp of comp.usage.bestPractices.slice(0, 2)) {
        if (bp.guidance) tips.push(`${comp.name}: ${bp.description}`);
      }
    }
  }
  if (tips.length > 0) result.tips = tips;

  return result;
}

function composeThemingResponse(query: string) {
  const lower = query.toLowerCase();
  const themeDocs = docTopics.find(d => d.topic === 'theme');
  if (!themeDocs) return {error: 'Theme documentation not found.'};

  if (/\b(set up|define|create|custom|brand|gold|navy|coral|green)\b/.test(lower)) {
    const defineSection = themeDocs.sections.find(s =>
      s.title.toLowerCase().includes('definetheme'),
    );
    const quickStart = themeDocs.sections.find(s =>
      s.title.toLowerCase().includes('quick start'),
    );
    return {
      topic: 'Setting up a custom theme',
      quickStart: quickStart?.content,
      defineTheme: defineSection?.content,
      hint: 'After defining your theme, wrap your app with <XDSTheme theme={yourTheme}>. Components inherit the theme automatically via tokens.',
    };
  }

  if (/\b(dark|light|mode|switch)\b/.test(lower)) {
    const darkSection = themeDocs.sections.find(s =>
      s.title.toLowerCase().includes('dark') || s.title.toLowerCase().includes('mode'),
    );
    return {
      topic: 'Dark/light mode',
      content: darkSection?.content,
      hint: 'Tokens use [light, dark] tuples. XDSTheme handles switching automatically.',
    };
  }

  return {
    topic: 'Theme System',
    description: themeDocs.description,
    sections: themeDocs.sections.map(s => s.title),
    quickStart: themeDocs.sections[0]?.content,
    hint: 'Ask about: "set up custom theme", "dark mode", "design tokens".',
  };
}

function composeTemplateResponse(query: string) {
  const lower = query.toLowerCase();
  const matched = templates.filter(
    t => lower.includes(t.name.toLowerCase()) ||
         lower.includes(((t as {slug: string}).slug ?? '').toLowerCase()) ||
         t.description.toLowerCase().split(' ').some(w => w.length > 4 && lower.includes(w)),
  );

  if (matched.length === 0) {
    return {
      available: templates.slice(0, 10).map(t => ({
        name: t.name,
        slug: (t as {slug: string}).slug,
        description: t.description,
      })),
      hint: 'Ask about a specific template for source code.',
    };
  }

  return matched.slice(0, 3).map(t => {
    const tBlocks = blocks.filter(b => b.exampleFor === (t as {slug: string}).slug).slice(0, 1);
    return {
      name: t.name,
      slug: (t as {slug: string}).slug,
      description: t.description,
      ...(tBlocks.length > 0 ? {source: tBlocks[0].source} : {}),
    };
  });
}

// ── Main Handler ───────────────────────────────────────────────────────

const handler = createMcpHandler(
  server => {
    server.tool(
      'ask',
      `Ask about XDS design system components, patterns, theming, or templates.\n\n` +
        `Describe what you're trying to build or what you need to know. Returns targeted ` +
        `imports, props, patterns, and examples — composed for your specific need.\n\n` +
        `Examples:\n` +
        `- "build a sidebar with sections for navigation"\n` +
        `- "add a sortable table with row selection"\n` +
        `- "show a success toast after form submit"\n` +
        `- "what props does Button take"\n` +
        `- "set up a custom theme with dark navy and gold"\n` +
        `- "settings page template"\n` +
        `- "how do I use the Selector component"`,
      {
        query: z.string().describe(
          'What you need — describe what you\'re building or what you want to know.',
        ),
      },
      async ({query}) => {
        const intent = classifyIntent(query);
        let response: unknown;

        switch (intent) {
          case 'theming': {
            response = composeThemingResponse(query);
            break;
          }
          case 'template_lookup': {
            response = composeTemplateResponse(query);
            break;
          }
          case 'what_props': {
            const comps = resolveComponents(query);
            if (comps.length === 0) {
              response = {error: 'Component not found.', hint: 'Try: Button, Table, Dialog, SideNav, Selector, Toast'};
            } else {
              const comp = comps[0];
              response = {
                name: comp.name,
                import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
                props: comp.props,
                ...(comp.params ? {hookParams: comp.params, returns: comp.returns} : {}),
              };
            }
            break;
          }
          case 'how_to_use': {
            const comps = resolveComponents(query);
            if (comps.length === 0) {
              response = {error: 'Component not found.', hint: 'Try: Button, Table, Dialog, SideNav, Toast'};
            } else {
              const comp = comps[0];
              const showcase = blocks.find(
                b => b.exampleFor.toLowerCase() === comp.name.toLowerCase() && b.isShowcase,
              );
              response = {
                ...composeQuickRef(comp),
                ...(comp.params ? {hookParams: comp.params, returns: comp.returns} : {}),
                ...(comp.usage?.bestPractices
                  ? {tips: comp.usage.bestPractices.filter(b => b.guidance).slice(0, 3).map(b => b.description)}
                  : {}),
                ...(showcase ? {example: {name: showcase.name, source: showcase.source}} : {}),
              };
            }
            break;
          }
          case 'how_to_build': {
            const comps = resolveComponents(query);
            if (comps.length === 0) {
              const templateResult = composeTemplateResponse(query);
              response = Array.isArray(templateResult) && templateResult.length > 0
                ? templateResult
                : {error: 'Could not identify components.', hint: 'Mention UI elements: sidebar, table, form, dialog, toast'};
            } else {
              response = composeImplementation(comps);
            }
            break;
          }
          default: {
            const comps = resolveComponents(query);
            if (comps.length === 0) {
              const lower = query.toLowerCase();
              const matches = visibleComponents
                .filter(c =>
                  c.name.toLowerCase().includes(lower) ||
                  c.description.toLowerCase().includes(lower) ||
                  c.keywords.some(k => k.toLowerCase().includes(lower)),
                )
                .slice(0, 8);
              response = matches.length > 0
                ? matches.map(composeQuickRef)
                : {error: `No matches for "${query}".`, hint: 'Try: sidebar, table, form, dropdown, toast, dialog, button'};
            } else {
              response = comps.slice(0, 6).map(composeQuickRef);
            }
          }
        }

        return {
          content: [{type: 'text' as const, text: JSON.stringify(response, null, 2)}],
        };
      },
    );
  },
  {
    capabilities: {tools: {}},
    serverInfo: {name: 'xds', version: '2.0.0'},
  },
  {basePath: '', maxDuration: 60, disableSse: true, verboseLogs: process.env.NODE_ENV === 'development'},
);

export {handler as GET, handler as POST, handler as DELETE};
