// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MCP Server route handler — hybrid variant (2 tools).
 *
 * Combines the best of both approaches:
 *   - search(): curated, brief-by-default results with context safety guardrails
 *   - get(): direct component/topic lookup when the agent knows what it wants
 *
 * This avoids the search-only pitfall (keyword matching can't bridge semantic
 * gaps like "success message" → Toast) while keeping the context safety of
 * server-curated responses (no accidental 4K token dumps).
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

// ── Context Budget ─────────────────────────────────────────────────────
// Max chars for a single "brief" doc topic response before requiring section drill-down
const MAX_TOPIC_BRIEF_CHARS = 4000;

// ── Scoring ────────────────────────────────────────────────────────────

function score(text: string, query: string): number {
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  if (lower === queryLower) return 100;
  if (lower.includes(queryLower)) return 85;

  const words = queryLower.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0;

  let matched = 0;
  for (const word of words) {
    if (lower.includes(word)) matched++;
  }

  const ratio = matched / words.length;
  if (ratio === 1) return 75;
  if (ratio >= 0.5) return 50;
  if (ratio > 0) return 30;
  return 0;
}

const handler = createMcpHandler(
  server => {
    // ══════════════════════════════════════════════════════════════════
    // Tool 1: search
    // Curated, brief-by-default. Finds components, docs, templates.
    // ══════════════════════════════════════════════════════════════════
    server.tool(
      'search',
      `Search XDS design system — finds components, documentation topics, and page templates.\n\n` +
        `Returns brief results (name, description, key info). Use the "get" tool with a ` +
        `specific name for full details.\n\n` +
        `Examples: "dropdown menu", "form inputs", "theming", "dashboard template", ` +
        `"sidebar navigation", "toast notification", "table with sorting"`,
      {
        query: z.string().describe('Natural language search query.'),
        limit: z
          .number()
          .optional()
          .describe('Max results (default 8).'),
      },
      async ({query, limit = 8}) => {
        const scored: Array<{
          item: unknown;
          score: number;
          type: 'component' | 'doc' | 'template';
        }> = [];

        // Score components
        for (const comp of visibleComponents) {
          const nameScore = score(comp.name, query);
          const descScore = score(comp.description, query);
          const kwScore = Math.max(
            ...comp.keywords.map(k => score(k, query)),
            0,
          );
          const best = Math.max(nameScore, descScore, kwScore);
          if (best > 0) {
            scored.push({item: comp, score: best, type: 'component'});
          }
        }

        // Score docs
        for (const doc of docTopics) {
          const topicScore = score(doc.topic, query);
          const titleScore = score(doc.title, query);
          const descScore = score(doc.description, query);
          const sectionScore = Math.max(
            ...doc.sections.map(s => score(s.title, query) * 0.8),
            0,
          );
          const best = Math.max(topicScore, titleScore, descScore, sectionScore);
          if (best > 0) {
            scored.push({item: doc, score: best, type: 'doc'});
          }
        }

        // Score templates
        for (const t of templates) {
          const nameScore = score(t.name, query);
          const descScore = score(t.description, query);
          const best = Math.max(nameScore, descScore);
          if (best > 0) {
            scored.push({item: t, score: best, type: 'template'});
          }
        }

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, limit);

        if (top.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  results: [],
                  hint: 'No results. Try: a component name (Button, Table, Dialog), a topic (theming, spacing, color), or a template (dashboard, settings).',
                }),
              },
            ],
          };
        }

        const results = top.map(entry => {
          if (entry.type === 'component') {
            const comp = entry.item as typeof visibleComponents[0];
            return {
              type: 'component',
              name: comp.name,
              moduleName: comp.moduleName,
              group: comp.group,
              description: comp.description,
              import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
              propsCount: comp.props.length,
              // Include key props inline for quick reference
              keyProps: comp.props
                .filter(p => p.required || p.name === 'variant' || p.name === 'size' || p.name === 'label')
                .slice(0, 5)
                .map(p => `${p.name}${p.required ? '*' : ''}: ${p.type}`),
              relatedComponents: (comp.relatedComponents ?? []).slice(0, 4),
              hint: `Use get("${comp.name}") for full props, usage, and examples.`,
            };
          } else if (entry.type === 'doc') {
            const doc = entry.item as typeof docTopics[0];
            return {
              type: 'doc',
              topic: doc.topic,
              title: doc.title,
              description: doc.description,
              sections: doc.sections.map(s => s.title),
              hint: `Use get("${doc.topic}") for full content, or get("${doc.topic}", { section: "..." }) for a specific section.`,
            };
          } else {
            const t = entry.item as typeof templates[0];
            return {
              type: 'template',
              slug: (t as {slug: string}).slug,
              name: t.name,
              description: t.description,
              hint: `Use get("${(t as {slug: string}).slug}") for template details and source.`,
            };
          }
        });

        return {
          content: [{type: 'text' as const, text: JSON.stringify(results, null, 2)}],
        };
      },
    );

    // ══════════════════════════════════════════════════════════════════
    // Tool 2: get
    // Direct lookup by name. Returns full details for a specific resource.
    // Agent uses this when it knows what it wants (from search or training data).
    // ══════════════════════════════════════════════════════════════════
    server.tool(
      'get',
      `Get full documentation for a specific XDS component, doc topic, or template by name.\n\n` +
        `Returns complete props, usage guidelines, code examples, and theming info.\n\n` +
        `For doc topics, optionally pass a section name to get just that section ` +
        `(recommended for large topics like "theme" to avoid context overload).\n\n` +
        `Examples:\n` +
        `- get("Button") → full Button docs with all props and examples\n` +
        `- get("useXDSToast") → hook docs with usage pattern\n` +
        `- get("theme", { section: "defineTheme" }) → just the defineTheme API\n` +
        `- get("settings") → template source code`,
      {
        name: z
          .string()
          .describe(
            'Component name (e.g. "Button", "useXDSToast"), doc topic (e.g. "theme", "spacing"), or template slug (e.g. "settings").',
          ),
        section: z
          .string()
          .optional()
          .describe(
            'For doc topics: return only this section (case-insensitive substring match). Recommended for large topics.',
          ),
      },
      async ({name, section}) => {
        const normalized = name.replace(/^XDS/i, '');
        const lower = normalized.toLowerCase();

        // ── Try component match ──────────────────────────────────────
        const comp = visibleComponents.find(
          c =>
            c.name.toLowerCase() === lower ||
            c.moduleName.toLowerCase() === `xds${lower}`,
        );

        if (comp) {
          // Find showcase example
          const showcase = blocks.find(
            b =>
              b.exampleFor.toLowerCase() === comp.name.toLowerCase() &&
              b.isShowcase,
          );

          // Find related blocks (non-showcase, limit 3)
          const relatedBlocks = blocks
            .filter(
              b =>
                b.exampleFor.toLowerCase() === comp.name.toLowerCase() &&
                !b.isShowcase,
            )
            .slice(0, 3);

          const result = {
            name: comp.name,
            moduleName: comp.moduleName,
            import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
            group: comp.group,
            description: comp.description,
            props: comp.props,
            usage: comp.usage,
            theming: comp.theming,
            relatedComponents: comp.relatedComponents,
            relatedHooks: comp.relatedHooks,
            ...(comp.params
              ? {params: comp.params, returns: comp.returns}
              : {}),
            ...(showcase
              ? {
                  example: {
                    name: showcase.name,
                    description: showcase.description,
                    source: showcase.source,
                  },
                }
              : {}),
            ...(relatedBlocks.length > 0
              ? {
                  moreExamples: relatedBlocks.map(b => ({
                    name: b.name,
                    description: b.description,
                    source: b.source,
                  })),
                }
              : {}),
          };

          return {
            content: [
              {type: 'text' as const, text: JSON.stringify(result, null, 2)},
            ],
          };
        }

        // ── Try doc topic match ──────────────────────────────────────
        const doc = docTopics.find(d => d.topic.toLowerCase() === lower);

        if (doc) {
          // If section requested, return just that section
          if (section) {
            const match = doc.sections.find(s =>
              s.title.toLowerCase().includes(section.toLowerCase()),
            );
            if (!match) {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify({
                      error: `Section "${section}" not found in "${doc.topic}".`,
                      available: doc.sections.map(s => s.title),
                    }),
                  },
                ],
                isError: true,
              };
            }
            return {
              content: [
                {type: 'text' as const, text: JSON.stringify(match, null, 2)},
              ],
            };
          }

          // Full topic — but guard against context bombs
          const fullJson = JSON.stringify(doc);
          if (fullJson.length > MAX_TOPIC_BRIEF_CHARS) {
            // Return overview + section list with hint to drill down
            const overview = doc.sections[0]; // Usually "Quick Start" or "Overview"
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify(
                    {
                      topic: doc.topic,
                      title: doc.title,
                      description: doc.description,
                      overview: overview,
                      sections: doc.sections.map(s => s.title),
                      hint: `This topic is large (${doc.sections.length} sections). Use get("${doc.topic}", { section: "..." }) for specific sections to avoid context overload.`,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {type: 'text' as const, text: JSON.stringify(doc, null, 2)},
            ],
          };
        }

        // ── Try template match ───────────────────────────────────────
        const template = templates.find(
          t => (t as {slug: string}).slug?.toLowerCase() === lower || t.name.toLowerCase() === lower,
        );

        if (template) {
          const templateBlocks = blocks
            .filter(b => b.exampleFor === (template as {slug: string}).slug)
            .slice(0, 3);

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    slug: (template as {slug: string}).slug,
                    name: template.name,
                    description: template.description,
                    ...(templateBlocks.length > 0
                      ? {
                          examples: templateBlocks.map(b => ({
                            name: b.name,
                            source: b.source,
                          })),
                        }
                      : {}),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // ── Fuzzy fallback ───────────────────────────────────────────
        const suggestions = visibleComponents
          .filter(
            c =>
              c.name.toLowerCase().includes(lower) ||
              lower.includes(c.name.toLowerCase()),
          )
          .slice(0, 5)
          .map(c => c.name);

        const docSuggestions = docTopics
          .filter(d => d.topic.toLowerCase().includes(lower))
          .map(d => d.topic);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: `"${name}" not found.`,
                ...(suggestions.length > 0
                  ? {similarComponents: suggestions}
                  : {}),
                ...(docSuggestions.length > 0
                  ? {similarTopics: docSuggestions}
                  : {}),
                hint: 'Use search() to discover available components, topics, and templates.',
              }),
            },
          ],
          isError: true,
        };
      },
    );
  },
  {
    capabilities: {tools: {}},
    serverInfo: {
      name: 'xds',
      version: '1.1.0',
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
