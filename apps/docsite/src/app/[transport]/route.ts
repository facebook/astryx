// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MCP Server route handler for the XDS docsite.
 *
 * Exposes XDS component documentation, reference docs, templates, and blocks
 * via the Model Context Protocol. This allows AI agents (Cursor, Claude Desktop,
 * Windsurf, etc.) to query XDS knowledge without needing the CLI installed locally.
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

const handler = createMcpHandler(
  server => {
    // ── Tool: list_components ──────────────────────────────────────────
    server.tool(
      'list_components',
      'List all XDS components, optionally filtered by group or search query. ' +
        'Returns component names, descriptions, and groups.',
      {
        group: z
          .string()
          .optional()
          .describe(
            'Filter by component group (e.g. "Dialog", "Navigation", "Form"). ' +
              'Omit to list all components.',
          ),
        query: z
          .string()
          .optional()
          .describe(
            'Search query to filter components by name, description, or keywords.',
          ),
      },
      async ({group, query}) => {
        let filtered = visibleComponents;

        if (group) {
          const lowerGroup = group.toLowerCase();
          filtered = filtered.filter(
            c => c.group?.toLowerCase() === lowerGroup,
          );
        }

        if (query) {
          const lower = query.toLowerCase();
          filtered = filtered.filter(
            c =>
              c.name.toLowerCase().includes(lower) ||
              c.description.toLowerCase().includes(lower) ||
              c.keywords.some(k => k.toLowerCase().includes(lower)),
          );
        }

        const result = filtered.map(c => ({
          name: c.name,
          moduleName: c.moduleName,
          group: c.group,
          description: c.description,
          hasProps: c.props.length > 0,
          isHook: c.params !== null,
        }));

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      },
    );

    // ── Tool: get_component ────────────────────────────────────────────
    server.tool(
      'get_component',
      'Get full documentation for an XDS component including props, usage ' +
        'guidelines, best practices, theming, and accessibility info.',
      {
        name: z
          .string()
          .describe(
            'Component name (e.g. "Button", "Dialog", "Table"). ' +
              'Case-insensitive, with or without "XDS" prefix.',
          ),
        section: z
          .enum(['all', 'props', 'usage', 'theming'])
          .optional()
          .describe(
            'Which section to return. Defaults to "all" for full docs.',
          ),
      },
      async ({name, section = 'all'}) => {
        const normalized = name.replace(/^XDS/i, '');
        const comp = visibleComponents.find(
          c => c.name.toLowerCase() === normalized.toLowerCase(),
        );

        if (!comp) {
          // Fuzzy match
          const lower = normalized.toLowerCase();
          const candidates = visibleComponents
            .filter(
              c =>
                c.name.toLowerCase().includes(lower) ||
                lower.includes(c.name.toLowerCase()),
            )
            .slice(0, 5);

          const suggestions =
            candidates.length > 0
              ? `\nDid you mean: ${candidates.map(c => c.name).join(', ')}?`
              : '';
          return {
            content: [
              {
                type: 'text' as const,
                text: `Component "${name}" not found.${suggestions}`,
              },
            ],
            isError: true,
          };
        }

        let result: Record<string, unknown>;

        switch (section) {
          case 'props':
            result = {
              name: comp.name,
              moduleName: comp.moduleName,
              props: comp.props,
              ...(comp.params ? {params: comp.params, returns: comp.returns} : {}),
            };
            break;
          case 'usage':
            result = {
              name: comp.name,
              usage: comp.usage,
            };
            break;
          case 'theming':
            result = {
              name: comp.name,
              theming: comp.theming,
            };
            break;
          default:
            result = {
              name: comp.name,
              moduleName: comp.moduleName,
              group: comp.group,
              description: comp.description,
              props: comp.props,
              usage: comp.usage,
              theming: comp.theming,
              relatedComponents: comp.relatedComponents,
              relatedHooks: comp.relatedHooks,
              ...(comp.params ? {params: comp.params, returns: comp.returns} : {}),
            };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      },
    );

    // ── Tool: get_docs ─────────────────────────────────────────────────
    server.tool(
      'get_docs',
      'Get XDS reference documentation on topics like spacing, color, ' +
        'typography, theming, getting started, etc.',
      {
        topic: z
          .string()
          .optional()
          .describe(
            'Topic slug (e.g. "spacing", "color", "getting-started"). ' +
              'Omit to list all available topics.',
          ),
        section: z
          .string()
          .optional()
          .describe(
            'Return only a specific section by title (case-insensitive substring match).',
          ),
      },
      async ({topic, section}) => {
        if (!topic) {
          const list = docTopics.map(d => ({
            topic: d.topic,
            title: d.title,
            description: d.description,
            category: d.category,
          }));
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(list, null, 2),
              },
            ],
          };
        }

        const doc = docTopics.find(
          d => d.topic.toLowerCase() === topic.toLowerCase(),
        );
        if (!doc) {
          const available = docTopics.map(d => d.topic).join(', ');
          return {
            content: [
              {
                type: 'text' as const,
                text: `Topic "${topic}" not found. Available: ${available}`,
              },
            ],
            isError: true,
          };
        }

        if (section) {
          const match = doc.sections.find(s =>
            s.title.toLowerCase().includes(section.toLowerCase()),
          );
          if (!match) {
            const available = doc.sections.map(s => s.title).join(', ');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Section "${section}" not found in "${topic}". Available: ${available}`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(match, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(doc, null, 2),
            },
          ],
        };
      },
    );

    // ── Tool: list_templates ───────────────────────────────────────────
    server.tool(
      'list_templates',
      'List available XDS page templates. Templates are full-page layouts ' +
        'like dashboards, AI chat, settings, etc.',
      {
        query: z
          .string()
          .optional()
          .describe('Search by name or description.'),
      },
      async ({query}) => {
        let filtered = templates;

        if (query) {
          const lower = query.toLowerCase();
          filtered = filtered.filter(
            t =>
              t.name.toLowerCase().includes(lower) ||
              t.description.toLowerCase().includes(lower),
          );
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };
      },
    );

    // ── Tool: get_block_source ─────────────────────────────────────────
    server.tool(
      'get_block_source',
      'Get the TSX source code for a specific XDS block/example. ' +
        'Useful for seeing how components are composed together in practice.',
      {
        name: z
          .string()
          .optional()
          .describe(
            'Block directory name (e.g. "AlertDialogDeleteConfirmation"). ' +
              'Omit to search by component.',
          ),
        component: z
          .string()
          .optional()
          .describe(
            'Find blocks that demonstrate this component (e.g. "Button", "Dialog").',
          ),
        showcaseOnly: z
          .boolean()
          .optional()
          .describe('If true, only return the primary showcase example.'),
      },
      async ({name, component, showcaseOnly}) => {
        if (name) {
          const block = blocks.find(
            b => b.dirName.toLowerCase() === name.toLowerCase(),
          );
          if (!block) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Block "${name}" not found.`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `// ${block.name}\n// ${block.description}\n\n${block.source}`,
              },
            ],
          };
        }

        if (component) {
          let matching = blocks.filter(
            b => b.exampleFor.toLowerCase() === component.toLowerCase(),
          );
          if (showcaseOnly) {
            matching = matching.filter(b => b.isShowcase);
          }

          if (matching.length === 0) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `No blocks found for component "${component}".`,
                },
              ],
              isError: true,
            };
          }

          // Return list with sources (limit to 5 to avoid huge responses)
          const results = matching.slice(0, 5).map(b => ({
            name: b.name,
            dirName: b.dirName,
            description: b.description,
            isShowcase: b.isShowcase,
            source: b.source,
          }));

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: 'Provide either "name" or "component" parameter.',
            },
          ],
          isError: true,
        };
      },
    );

    // ── Tool: search ───────────────────────────────────────────────────
    server.tool(
      'search',
      'Search across all XDS resources — components, docs, templates, ' +
        'and blocks. Returns the most relevant matches.',
      {
        query: z.string().describe('Search query.'),
        limit: z
          .number()
          .optional()
          .describe('Max results to return (default 10).'),
      },
      async ({query, limit = 10}) => {
        const lower = query.toLowerCase();
        const results: Array<{
          type: string;
          name: string;
          description: string;
          score: number;
        }> = [];

        // Search components
        for (const c of visibleComponents) {
          let score = 0;
          if (c.name.toLowerCase() === lower) score = 100;
          else if (c.name.toLowerCase().includes(lower)) score = 80;
          else if (c.description.toLowerCase().includes(lower)) score = 60;
          else if (c.keywords.some(k => k.toLowerCase().includes(lower)))
            score = 50;
          if (score > 0) {
            results.push({
              type: 'component',
              name: c.name,
              description: c.description,
              score,
            });
          }
        }

        // Search docs
        for (const d of docTopics) {
          let score = 0;
          if (d.topic.toLowerCase() === lower) score = 100;
          else if (d.title.toLowerCase().includes(lower)) score = 80;
          else if (d.description.toLowerCase().includes(lower)) score = 60;
          if (score > 0) {
            results.push({
              type: 'doc',
              name: d.topic,
              description: d.description,
              score,
            });
          }
        }

        // Search templates
        for (const t of templates) {
          let score = 0;
          if (t.name.toLowerCase().includes(lower)) score = 70;
          else if (t.description.toLowerCase().includes(lower)) score = 50;
          if (score > 0) {
            results.push({
              type: 'template',
              name: t.slug,
              description: t.description,
              score,
            });
          }
        }

        results.sort((a, b) => b.score - a.score);
        const top = results.slice(0, limit);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(top, null, 2),
            },
          ],
        };
      },
    );
  },
  {
    capabilities: {tools: {}},
    serverInfo: {
      name: 'xds',
      version: '1.0.0',
    },
  },
  {
    basePath: '',
    maxDuration: 60,
    disableSse: true,
    verboseLogs: process.env.NODE_ENV === 'development',
  },
);

export {handler as GET, handler as POST, handler as DELETE};
