// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MCP Server route handler — search-only variant.
 *
 * Exposes XDS documentation via a single "search" tool inspired by Cloudflare's
 * Code Mode pattern. The server acts as context curator: it decides how much
 * detail to return based on the query, preventing context degradation issues
 * (see #2182) by never over-serving documentation.
 *
 * Design:
 *   - 1 tool: search() — handles discovery, component docs, theming, examples
 *   - Server decides depth: brief by default, full only when explicitly expanded
 *   - Guardrails: topics known to cause context degradation (theming internals)
 *     are returned at API-surface level unless the agent requests expansion
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

// ── Context Budget Guardrails ──────────────────────────────────────────
// Topics where full output causes agent context degradation (from #2182).
// For these, we serve brief API surface by default.
const BRIEF_ONLY_SECTIONS = new Set(['defineTheme', 'Scale Configs', 'Token Architecture']);
const MAX_BRIEF_TOKENS = 800; // ~3200 chars — safe budget for any single result

/**
 * Score a string against a query using word-level matching.
 * Returns 0-100. Handles multi-word queries by scoring each word.
 */
function score(text: string, query: string): number {
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (lower === queryLower) return 100;

  // Full query as substring
  if (lower.includes(queryLower)) return 85;

  // Word-level: score each query word independently
  const words = queryLower.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0;

  let matched = 0;
  for (const word of words) {
    if (lower.includes(word)) matched++;
  }

  const ratio = matched / words.length;
  if (ratio === 1) return 75; // all words found
  if (ratio >= 0.5) return 50; // half the words
  if (ratio > 0) return 30; // some words
  return 0;
}

/**
 * Determine what the user is looking for based on query analysis.
 */
type QueryIntent =
  | 'component_lookup' // "Button", "Dialog props"
  | 'composition' // "button with dropdown", "form with validation"
  | 'topic_lookup' // "theming", "spacing", "color"
  | 'template_lookup' // "settings page", "dashboard"
  | 'general'; // anything else

function classifyIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();

  // Check if it's a direct component name
  const directMatch = visibleComponents.find(
    c => c.name.toLowerCase() === lower.replace(/^xds/, ''),
  );
  if (directMatch) return 'component_lookup';

  // Props/API request
  if (/\b(props?|api|interface|types?)\b/.test(lower)) return 'component_lookup';

  // Composition patterns
  if (/\b(with|and|inside|containing|combining|how to)\b/.test(lower))
    return 'composition';

  // Template/page patterns
  if (/\b(page|template|layout|dashboard|settings|chat)\b/.test(lower))
    return 'template_lookup';

  // Topic patterns
  const topicSlugs = docTopics.map(d => d.topic.toLowerCase());
  if (topicSlugs.some(slug => lower.includes(slug))) return 'topic_lookup';
  if (/\b(theme|theming|spacing|color|typography|motion|icon|token)\b/.test(lower))
    return 'topic_lookup';

  return 'general';
}

/**
 * Build a brief component summary (name, description, key props, import).
 */
function briefComponent(comp: typeof visibleComponents[0]) {
  const topProps = comp.props
    .filter(p => p.required || p.name === 'variant' || p.name === 'size')
    .slice(0, 6)
    .map(p => ({
      name: p.name,
      type: p.type,
      required: p.required || false,
      ...(p.default ? {default: p.default} : {}),
    }));

  return {
    type: 'component' as const,
    name: comp.name,
    import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
    description: comp.description,
    props: topProps,
    totalProps: comp.props.length,
    group: comp.group,
    ...(comp.relatedComponents.length > 0
      ? {related: comp.relatedComponents.slice(0, 4)}
      : {}),
  };
}

/**
 * Build a full component doc (all props, usage, theming, examples).
 */
function fullComponent(comp: typeof visibleComponents[0]) {
  const showcase = blocks.find(
    b => b.exampleFor.toLowerCase() === comp.name.toLowerCase() && b.isShowcase,
  );

  return {
    type: 'component' as const,
    name: comp.name,
    import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
    description: comp.description,
    group: comp.group,
    props: comp.props,
    usage: comp.usage,
    theming: comp.theming,
    relatedComponents: comp.relatedComponents,
    relatedHooks: comp.relatedHooks,
    ...(showcase ? {example: {name: showcase.name, source: showcase.source}} : {}),
  };
}

/**
 * Build brief topic summary — API surface only, no internals.
 */
function briefTopic(doc: typeof docTopics[0]) {
  // For topics with many sections, return just titles + first section content
  const briefSections = doc.sections.slice(0, 3).map(s => ({
    title: s.title,
    // Only include content for the first (usually "Quick Start" or "API") section
    ...(doc.sections.indexOf(s) === 0 ? {content: s.content} : {}),
  }));

  return {
    type: 'doc' as const,
    topic: doc.topic,
    title: doc.title,
    description: doc.description,
    sections: briefSections,
    allSections: doc.sections.map(s => s.title),
    hint: 'Search with "expand:<topic>/<section>" for full section content.',
  };
}

/**
 * Build an expanded section of a topic.
 */
function expandedSection(doc: typeof docTopics[0], sectionTitle: string) {
  const section = doc.sections.find(s =>
    s.title.toLowerCase().includes(sectionTitle.toLowerCase()),
  );
  if (!section) {
    return {
      type: 'error' as const,
      message: `Section "${sectionTitle}" not found in "${doc.topic}".`,
      available: doc.sections.map(s => s.title),
    };
  }
  return {
    type: 'doc_section' as const,
    topic: doc.topic,
    section: section,
  };
}

const handler = createMcpHandler(
  server => {
    server.tool(
      'search',
      `Search XDS design system documentation. Returns components, props, usage examples, ` +
        `design tokens, page templates, and reference docs.\n\n` +
        `Query examples:\n` +
        `- Component: "Button", "Dialog props", "Table"\n` +
        `- Composition: "button with dropdown menu", "form with validation"\n` +
        `- Topic: "theming", "spacing tokens", "color system"\n` +
        `- Template: "settings page", "dashboard layout"\n` +
        `- Expand: "expand:theme/defineTheme" for full section detail\n\n` +
        `Results are curated to safe context sizes. Use "expand:" prefix for more detail on any result.`,
      {
        query: z.string().describe('Natural language search query or "expand:<ref>" for detail.'),
      },
      async ({query}) => {
        // ── Handle expand: requests ──────────────────────────────────
        const expandMatch = query.match(/^expand:(\w[\w-]*)(?:\/(.+))?$/i);
        if (expandMatch) {
          const [, ref, section] = expandMatch;

          // Expand a doc topic section
          const doc = docTopics.find(
            d => d.topic.toLowerCase() === ref.toLowerCase(),
          );
          if (doc && section) {
            const result = expandedSection(doc, section);
            return {
              content: [{type: 'text' as const, text: JSON.stringify(result, null, 2)}],
            };
          }
          if (doc && !section) {
            // Full topic (warn if it's a known context bomb)
            const totalChars = JSON.stringify(doc).length;
            if (totalChars > MAX_BRIEF_TOKENS * 4) {
              // Return sections list with size hints
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify(
                      {
                        type: 'doc',
                        topic: doc.topic,
                        title: doc.title,
                        warning:
                          'Full topic is large. Expand individual sections for best results.',
                        sections: doc.sections.map(s => ({
                          title: s.title,
                          expandWith: `expand:${doc.topic}/${s.title}`,
                        })),
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }
            return {
              content: [{type: 'text' as const, text: JSON.stringify(doc, null, 2)}],
            };
          }

          // Expand a component (full docs)
          const comp = visibleComponents.find(
            c => c.name.toLowerCase() === ref.toLowerCase(),
          );
          if (comp) {
            return {
              content: [
                {type: 'text' as const, text: JSON.stringify(fullComponent(comp), null, 2)},
              ],
            };
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: `Nothing found for "${ref}". Try a component name or doc topic.`,
              },
            ],
            isError: true,
          };
        }

        // ── Standard search ──────────────────────────────────────────
        const intent = classifyIntent(query);
        const results: unknown[] = [];

        // Direct component lookup — return full details for exact matches
        if (intent === 'component_lookup') {
          const normalized = query.toLowerCase().replace(/^xds/, '').replace(/\s*(props?|api|types?)\s*/g, '').trim();
          const exact = visibleComponents.find(
            c => c.name.toLowerCase() === normalized,
          );
          if (exact) {
            results.push(fullComponent(exact));
            return {
              content: [{type: 'text' as const, text: JSON.stringify(results, null, 2)}],
            };
          }
        }

        // Score everything
        const scored: Array<{item: unknown; score: number; type: string}> = [];

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

        for (const doc of docTopics) {
          const topicScore = score(doc.topic, query);
          const titleScore = score(doc.title, query);
          const descScore = score(doc.description, query);
          // Also search section titles
          const sectionScore = Math.max(
            ...doc.sections.map(s => score(s.title, query) * 0.8),
            0,
          );
          const best = Math.max(topicScore, titleScore, descScore, sectionScore);
          if (best > 0) {
            scored.push({item: doc, score: best, type: 'doc'});
          }
        }

        for (const t of templates) {
          const nameScore = score(t.name, query);
          const descScore = score(t.description, query);
          const best = Math.max(nameScore, descScore);
          if (best > 0) {
            scored.push({item: t, score: best, type: 'template'});
          }
        }

        // Sort by score, take top results
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 8);

        // Build response based on intent and results
        for (const entry of top) {
          if (entry.type === 'component') {
            const comp = entry.item as typeof visibleComponents[0];
            // For composition queries or when there are many results, use brief
            if (intent === 'composition' || intent === 'general' || top.length > 2) {
              results.push(briefComponent(comp));
            } else {
              results.push(fullComponent(comp));
            }
          } else if (entry.type === 'doc') {
            const doc = entry.item as typeof docTopics[0];
            results.push(briefTopic(doc));
          } else if (entry.type === 'template') {
            const t = entry.item as typeof templates[0];
            // Include showcase source for templates
            const templateBlocks = blocks
              .filter(b => b.exampleFor === t.slug)
              .slice(0, 1);
            results.push({
              type: 'template',
              slug: (t as any).slug,
              name: t.name,
              description: t.description,
              ...(templateBlocks.length > 0
                ? {preview: templateBlocks[0].source}
                : {}),
            });
          }
        }

        // If composition intent and we found components, also include a relevant example
        if (intent === 'composition' && results.length > 0) {
          const firstComp = top.find(e => e.type === 'component');
          if (firstComp) {
            const comp = firstComp.item as typeof visibleComponents[0];
            const example = blocks.find(
              b =>
                b.exampleFor.toLowerCase() === comp.name.toLowerCase() &&
                b.isShowcase,
            );
            if (example) {
              results.push({
                type: 'example',
                component: comp.name,
                name: example.name,
                source: example.source,
              });
            }
          }
        }

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    type: 'no_results',
                    message: `No results for "${query}".`,
                    suggestions: [
                      'Try a component name: Button, Dialog, Table, Sidebar',
                      'Try a topic: theming, spacing, color, typography',
                      'Try a template: settings, dashboard, ai-chat',
                      'List all: "components", "templates", "docs"',
                    ],
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [{type: 'text' as const, text: JSON.stringify(results, null, 2)}],
        };
      },
    );
  },
  {
    capabilities: {tools: {}},
    serverInfo: {
      name: 'xds-search',
      version: '0.1.0',
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
