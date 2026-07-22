// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hook doc formatting — render HookDoc objects to text
 *
 * Mirrors component-format.mjs conventions:
 * - Full: markdown with ## sections, tables, best practices
 * - Compact: markdown with import block, params table, abbreviated practices
 * - Brief: signature line with import hint, description, key params
 */

import {discoverHooks, findHookDoc} from './hook-discovery.mjs';
import {loadDocs} from './component-loader.mjs';
import {mdCell} from './component-format.mjs';

/**
 * Build a signature string from hook docs.
 * e.g. 'useFocusTrap(options: UseFocusTrapOptions): { containerRef, focusFirst }'
 */
function buildSignature(docs) {
  const name = docs.name;

  // Build params string — only top-level params (skip options.foo nested params)
  const topParams = (docs.params || []).filter(p => !p.name.includes('.'));
  const paramStr = topParams
    .map(p => {
      const opt = p.required ? '' : '?';
      return `${p.name}${opt}: ${p.type}`;
    })
    .join(', ');

  // Build return type
  const returns = docs.returns || [];
  let returnStr;
  if (returns.length === 0) {
    returnStr = 'void';
  } else if (returns.length === 1 && returns[0].name === 'value') {
    returnStr = returns[0].type;
  } else {
    returnStr = `{ ${returns.map(r => r.name).join(', ')} }`;
  }

  return `${name}(${paramStr}): ${returnStr}`;
}

/**
 * Format a parameters table (matches component props table style).
 */
function formatParamsTable(params) {
  if (!params || params.length === 0) return '';
  const lines = [];
  lines.push('| Param | Type | Default | Description |');
  lines.push('|-------|------|---------|-------------|');
  for (const p of params) {
    const def = p.default ? `\`${mdCell(p.default)}\`` : '\u2014';
    const req = p.required ? ' **(required)**' : '';
    lines.push(
      `| \`${mdCell(p.name)}\` | \`${mdCell(p.type)}\` | ${def} | ${mdCell(p.description)}${req} |`,
    );
  }
  return lines.join('\n');
}

/**
 * Format a returns table.
 */
function formatReturnsTable(returns) {
  if (!returns || returns.length === 0) return '';
  const lines = [];
  lines.push('| Field | Type | Description |');
  lines.push('|-------|------|-------------|');
  for (const r of returns) {
    lines.push(
      `| \`${mdCell(r.name)}\` | \`${mdCell(r.type)}\` | ${mdCell(r.description)} |`,
    );
  }
  return lines.join('\n');
}

/**
 * Format full hook docs (default mode).
 * Matches component formatFull structure:
 *   # Name, description, anatomy→params, best practices, props→params+returns, theming→related
 */
export function formatHookFull(docs) {
  const sections = [];

  sections.push(`# ${docs.name}\n`);

  const desc = docs.usage?.description || '';
  if (desc) sections.push(desc + '\n');

  // Best Practices (same position as component format)
  if (docs.usage?.bestPractices?.length) {
    sections.push('## Best Practices\n');
    for (const bp of docs.usage.bestPractices) {
      const badge = bp.guidance ? '**Do:**' : "**Don't:**";
      sections.push(`- ${badge} ${bp.description}`);
    }
    sections.push('');
  }

  // Parameters (analogous to ## Props)
  if (docs.params?.length) {
    sections.push('## Parameters\n');
    sections.push(formatParamsTable(docs.params) + '\n');
  }

  // Returns (hook-specific, no component equivalent)
  if (docs.returns?.length) {
    sections.push('## Returns\n');
    sections.push(formatReturnsTable(docs.returns) + '\n');
  }

  return sections.join('\n');
}

/**
 * Format compact hook docs for LLM consumption.
 * Matches component formatCompact structure:
 *   # Name, description, ## Import, ## Best Practices, ## Parameters, ## Returns
 */
export function formatHookCompact(docs, importPath) {
  const sections = [];

  sections.push(`# ${docs.name}\n`);

  // Description
  const desc = docs.usage?.description || '';
  if (desc) sections.push(desc + '\n');

  // Import block (matches component compact)
  const imp = importPath || docs.importPath;
  if (imp) {
    sections.push('## Import\n');
    sections.push(`\`\`\`tsx\nimport { ${docs.name} } from '${imp}';\n\`\`\`\n`);
  }

  // Best Practices (matches component compact)
  if (docs.usage?.bestPractices?.length) {
    sections.push('## Best Practices\n');
    for (const bp of docs.usage.bestPractices) {
      const badge = bp.guidance ? '**Do:**' : "**Don't:**";
      sections.push(`- ${badge} ${bp.description}`);
    }
    sections.push('');
  }

  // Parameters (matches ## Props in component compact)
  if (docs.params?.length) {
    sections.push('## Parameters\n');
    sections.push(formatParamsTable(docs.params) + '\n');
  }

  // Returns
  if (docs.returns?.length) {
    sections.push('## Returns\n');
    sections.push(formatReturnsTable(docs.returns) + '\n');
  }

  // Related components (compact footer)
  const relatedParts = [];
  if (docs.relatedComponents?.length) {
    relatedParts.push(`Components: ${docs.relatedComponents.join(', ')}`);
  }
  if (docs.relatedHooks?.length) {
    relatedParts.push(`Hooks: ${docs.relatedHooks.join(', ')}`);
  }
  if (relatedParts.length) {
    sections.push('## Related\n');
    for (const part of relatedParts) sections.push(part);
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Format a brief, LLM-optimized hook summary.
 * Matches component formatBrief conventions:
 *   signature  ← from 'import/path'
 *   description
 *   key params
 */
export function formatHookBrief(docs) {
  const output = [];

  // Signature line with import hint (matches component brief)
  const sig = buildSignature(docs);
  const imp = docs.importPath;
  output.push(imp ? `${sig}  \u2190 from '${imp}'` : sig);

  // Description (shortened, matches component brief)
  const desc = docs.usage?.description || '';
  if (desc) {
    const shortDesc = desc.length > 80 ? desc.slice(0, 77) + '...' : desc;
    output.push(`  ${shortDesc}`);
  }

  // Related components (compact)
  if (docs.relatedComponents?.length) {
    output.push(`  Related: ${docs.relatedComponents.join(', ')}`);
  }

  // Key params (matches component brief 'prop · prop' line)
  const paramNames = (docs.params || [])
    .filter(p => !p.name.includes('.'))
    .map(p => p.required ? `${p.name}: ${p.type.split('|')[0].trim()}` : p.name);
  if (paramNames.length > 0) {
    output.push(`  ${paramNames.join(' \u00b7 ')}`);
  }

  return output.join('\n') + '\n';
}

/**
 * Format brief summaries for ALL hooks in one output.
 * Matches component formatBriefAll: group headers with ##.
 */
export async function formatHookBriefAll(coreDir) {
  const hooks = discoverHooks(coreDir);
  const output = [];

  for (const [category, hookNames] of Object.entries(hooks)) {
    output.push(`## ${category}\n`);
    for (const hookName of hookNames) {
      const docPath = findHookDoc(coreDir, hookName);
      if (docPath) {
        try {
          const docs = await loadDocs(docPath);
          output.push(formatHookBrief(docs));
        } catch {
          output.push(`${hookName}\n  (no docs)\n`);
        }
      } else {
        output.push(`${hookName}\n  (no docs)\n`);
      }
    }
  }

  return output.join('\n');
}

/**
 * Format only the parameters table (matches component formatProps).
 */
export function formatHookParams(docs) {
  if (docs.params?.length) {
    return `## Parameters\n\n${formatParamsTable(docs.params)}\n`;
  }
  return `No parameters documentation found for ${docs.name}.\n`;
}
