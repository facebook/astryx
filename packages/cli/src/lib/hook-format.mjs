/**
 * @file Hook doc formatting — render HookDoc objects to text
 */

import {discoverHooks, findHookDoc} from './hook-discovery.mjs';
import {loadDocs} from './component-loader.mjs';

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
 * Format a parameters table.
 */
function formatParamsTable(params) {
  if (!params || params.length === 0) return '';
  const lines = [];
  lines.push('| Param | Type | Default | Description |');
  lines.push('|-------|------|---------|-------------|');
  for (const p of params) {
    const def = p.default ? `\`${p.default}\`` : '—';
    const req = p.required ? ' **(required)**' : '';
    lines.push(`| \`${p.name}\` | \`${p.type}\` | ${def} | ${p.description}${req} |`);
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
    lines.push(`| \`${r.name}\` | \`${r.type}\` | ${r.description} |`);
  }
  return lines.join('\n');
}

/**
 * Format full hook docs (default mode).
 *
 * @param {object} docs - HookDoc object
 * @returns {string}
 */
export function formatHookFull(docs) {
  const sections = [];

  sections.push(`# ${docs.name}\n`);

  const desc = docs.usage?.description || '';
  if (desc) sections.push(desc + '\n');

  // Signature
  sections.push(`\`\`\`ts\n${buildSignature(docs)}\n\`\`\`\n`);

  // Parameters
  if (docs.params?.length) {
    sections.push('## Parameters\n');
    sections.push(formatParamsTable(docs.params) + '\n');
  }

  // Returns
  if (docs.returns?.length) {
    sections.push('## Returns\n');
    sections.push(formatReturnsTable(docs.returns) + '\n');
  }

  // Best Practices
  if (docs.usage?.bestPractices?.length) {
    sections.push('## Best Practices\n');
    for (const bp of docs.usage.bestPractices) {
      const badge = bp.guidance ? '**Do:**' : "**Don't:**";
      sections.push(`- ${badge} ${bp.description}`);
    }
    sections.push('');
  }

  // Related
  const relatedParts = [];
  if (docs.relatedComponents?.length) {
    relatedParts.push(`Components: ${docs.relatedComponents.join(', ')}`);
  }
  if (docs.relatedHooks?.length) {
    relatedParts.push(`Hooks: ${docs.relatedHooks.join(', ')}`);
  }
  if (docs.importPath) {
    relatedParts.push(`Import: ${docs.importPath}`);
  }
  if (relatedParts.length) {
    sections.push('## Related\n');
    for (const part of relatedParts) {
      sections.push(part);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Format compact hook docs for LLM consumption.
 * One-liner per param/return with import info.
 *
 * @param {object} docs - HookDoc object
 * @param {string} [importPath] - Import path hint
 * @returns {string}
 */
export function formatHookCompact(docs, importPath) {
  const sections = [];

  // Signature line
  sections.push(buildSignature(docs));

  // Description (shortened)
  const desc = docs.usage?.description || '';
  if (desc) {
    const shortDesc = desc.length > 120 ? desc.slice(0, 117) + '...' : desc;
    sections.push(`  ${shortDesc}`);
  }

  // Params (compact)
  if (docs.params?.length) {
    for (const p of docs.params) {
      const req = p.required ? ' (required)' : '';
      const def = p.default ? ` [=${p.default}]` : '';
      sections.push(`  ${p.name}: ${p.type}${def}${req} — ${p.description}`);
    }
  }

  // Returns (compact)
  if (docs.returns?.length) {
    sections.push('  Returns:');
    for (const r of docs.returns) {
      sections.push(`    ${r.name}: ${r.type} — ${r.description}`);
    }
  }

  // Best practices (compact — first 2 only)
  const practices = docs.usage?.bestPractices?.slice(0, 2) || [];
  if (practices.length) {
    for (const bp of practices) {
      const badge = bp.guidance ? 'Do:' : "Don't:";
      sections.push(`  ${badge} ${bp.description}`);
    }
  }

  // Import
  const imp = importPath || docs.importPath;
  if (imp) {
    sections.push(`  Import: ${imp}`);
  }

  return sections.join('\n') + '\n';
}

/**
 * Format a brief, single-line hook summary.
 *
 * Format: signature  description
 *
 * @param {object} docs - HookDoc object
 * @returns {string}
 */
export function formatHookBrief(docs) {
  const sig = buildSignature(docs);
  const desc = docs.usage?.description || '';
  const shortDesc = desc.length > 60 ? desc.slice(0, 57) + '...' : desc;
  return `${sig}  ${shortDesc}\n`;
}

/**
 * Format brief summaries for ALL hooks in one output.
 *
 * @param {string} coreDir
 * @returns {Promise<string>}
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
 * Format only the parameters table.
 *
 * @param {object} docs - HookDoc object
 * @returns {string}
 */
export function formatHookParams(docs) {
  if (docs.params?.length) {
    return `## Parameters\n\n${formatParamsTable(docs.params)}\n`;
  }
  return `No parameters documentation found for ${docs.name}.\n`;
}
