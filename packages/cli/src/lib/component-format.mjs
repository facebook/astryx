/**
 * @file Component doc formatting — render ComponentDoc objects to text
 */

import {discoverComponents, findComponentReadme, resolveImportPath} from './component-discovery.mjs';
import {loadDocs} from './component-loader.mjs';
import {extractBrief} from './component-legacy.mjs';
import * as fs from 'node:fs';

/** Derive the theme component key from a theming target (strips 'xds-' prefix). */
function targetKey(target) {
  return target.className.replace(/^xds-/, '');
}

function formatPropsTable(props) {
  if (!props || props.length === 0) return '';
  const lines = [];
  lines.push('| Prop | Type | Default | Description |');
  lines.push('|------|------|---------|-------------|');
  for (const p of props) {
    const def = p.default ? `\`${p.default}\`` : '—';
    const req = p.required ? ' **(required)**' : '';
    lines.push(`| \`${p.name}\` | \`${p.type}\` | ${def} | ${p.description}${req} |`);
  }
  return lines.join('\n');
}

/**
 * Get the variant values for a given theming target, extracting them from
 * the visualProps and the variant prop in the component's props list.
 * Returns an array of variant strings from the `variant` prop type,
 * or the variants from target visualProps.
 */
function getTargetVariants(target, docs) {
  if (!target.visualProps?.length) return [];

  // If variant is a visualProp, try to resolve the actual variant values from props
  if (target.visualProps.includes('variant')) {
    const allProps = docs.props || (docs.components?.[0]?.props) || [];
    const variantProp = allProps.find(p => p.name === 'variant');
    if (variantProp && variantProp.type.includes('|')) {
      return variantProp.type
        .replace(/['"]/g, '')
        .split('|')
        .map(v => v.trim())
        .filter(Boolean);
    }
  }

  // Return all visualProps as-is (size, orientation, etc.)
  return target.visualProps;
}

/**
 * Get the state classes for a theming target from the states field.
 */
function getTargetStates(target) {
  return target.states || [];
}

/**
 * Format the theming targets table, merging in theme variants if available.
 *
 * @param {object} docs - Component doc object
 * @param {object|null} themeData - Resolved theme data with variants
 * @returns {string} Markdown table
 */
function formatTargetsTable(docs, themeData) {
  if (!docs.theming?.targets?.length) return '';

  const lines = [];
  lines.push('| Class | Variants | States |');
  lines.push('|-------|----------|--------|');

  for (const target of docs.theming.targets) {
    const coreVariants = getTargetVariants(target, docs);
    const states = getTargetStates(target);

    // Merge theme variants — keyed by component name derived from class
    // e.g. className 'xds-button' → component key 'button'
    const componentKey = targetKey(target);
    const themeVariants = themeData?.variants?.[componentKey] || [];

    // Build variant display: core variants plain, theme variants with * suffix
    const variantParts = [
      ...coreVariants,
      ...themeVariants.map(v => `${v}*`),
    ];

    const variantsStr = variantParts.length > 0 ? variantParts.join(', ') : '—';
    const statesStr = states.length > 0 ? states.join(', ') : '—';

    lines.push(`| \`${target.className}\` | ${variantsStr} | ${statesStr} |`);
  }

  return lines.join('\n');
}

/**
 * Format full component docs (default mode, replaces cleanReadme).
 *
 * @param {object} docs - Component doc object
 * @param {object} [options] - Options
 * @param {object|null} [options.themeData] - Resolved theme data
 */
export function formatFull(docs, options = {}) {
  const sections = [];

  sections.push(`# ${docs.name}\n`);
  sections.push(docs.description + '\n');

  if (docs.features?.length) {
    sections.push('## Features\n');
    sections.push(docs.features.map(f => `- ${f}`).join('\n') + '\n');
  }

  // Single component props
  if ('props' in docs) {
    sections.push('## Props\n');
    sections.push(formatPropsTable(docs.props) + '\n');
  }

  // Multi-component
  if ('components' in docs) {
    sections.push('## Components\n');
    for (const comp of docs.components) {
      sections.push(`### ${comp.name}\n`);
      sections.push(comp.description + '\n');
      sections.push(formatPropsTable(comp.props) + '\n');
      if (comp.examples?.length) {
        for (const ex of comp.examples) {
          if (ex.label) sections.push(`#### ${ex.label}\n`);
          sections.push('```tsx\n' + ex.code + '\n```\n');
        }
      }
    }
  }

  if (docs.examples?.length) {
    sections.push('## Examples\n');
    for (const ex of docs.examples) {
      if (ex.label) sections.push(`### ${ex.label}\n`);
      sections.push('```tsx\n' + ex.code + '\n```\n');
    }
  }

  if (docs.theming) {
    const { themeData = null } = options;
    sections.push('## Theming\n');
// Targets table with theme variant merging
    if (docs.theming.targets?.length) {
      const targetsTable = formatTargetsTable(docs, themeData);
      sections.push(targetsTable + '\n');

      // Note about theme variants if any are present
      if (themeData?.variants) {
        const componentKeys = docs.theming.targets.map(t => targetKey(t));
        const hasThemeVariants = componentKeys.some(k => themeData.variants[k]?.length > 0);
        if (hasThemeVariants) {
          sections.push(`_\\* = custom variant from ${themeData.name || 'active'} theme_\n`);
        }
      }

      // Generate defineTheme example with class targeting
      const exampleLines = ['Override in defineTheme:\n```ts\ncomponents: {'];
      const rootTarget = docs.theming.targets[0];
      const rootKey = targetKey(rootTarget);
      exampleLines.push(`  '${rootKey}': {`);
      exampleLines.push(`    base: { /* CSS properties */ },`);
      if (rootTarget.visualProps?.length) {
        const firstVariant = rootTarget.visualProps[0];
        exampleLines.push(`    '${firstVariant}:value': { /* variant-specific */ },`);
      }
      if (rootTarget.states?.length) {
        const firstState = rootTarget.states[0];
        exampleLines.push(`    '${firstState}': { /* state-specific */ },`);
      }
      exampleLines.push(`  },`);
      // Show sub-element example if there are multiple targets
      if (docs.theming.targets.length > 1) {
        const subTarget = docs.theming.targets[1];
        const subKey = targetKey(subTarget);
        exampleLines.push(`  '${subKey}': {`);
        exampleLines.push(`    base: { /* CSS properties */ },`);
        if (subTarget.states?.length) {
          const firstState = subTarget.states[0];
          exampleLines.push(`    '${firstState}': { /* state-specific */ },`);
        }
        exampleLines.push(`  },`);
      }
      exampleLines.push('}\n```\n');
      sections.push(exampleLines.join('\n'));
    }

    // Legacy componentKey (for backward compatibility)
    if (docs.theming.componentKey) {
      sections.push(`Component key: \`${docs.theming.componentKey}\`\n`);
    }

    // Public CSS custom properties
    if (docs.theming?.cssProperties?.length) {
      const propLines = [];
      propLines.push('| CSS Property | Description | Default |');
      propLines.push('|-------------|-------------|---------|');
      for (const p of docs.theming.cssProperties) {
        propLines.push(`| \`${p.name}\` | ${p.description} | ${p.default || '—'} |`);
      }
      sections.push(propLines.join('\n') + '\n');
    }

    // Component CSS vars
    if (docs.theming?.vars?.length) {
      const varLines = [];
      varLines.push('| CSS Variable | Default | Description |');
      varLines.push('|-------------|---------|-------------|');
      for (const v of docs.theming.vars) {
        if (v.derived) {
          varLines.push(`| \`${v.name}\` | _(derived)_ | ${v.description} |`);
        } else {
          varLines.push(`| \`${v.name}\` | \`${v.default}\` | ${v.description} |`);
        }
      }
      sections.push(varLines.join('\n') + '\n');

      // Show var override example
      const overridableVars = docs.theming.vars.filter(v => !v.derived);
      if (overridableVars.length > 0) {
        const exampleVar = overridableVars[0];
        const varsKey = docs.theming.targets?.length ? targetKey(docs.theming.targets[0]) : docs.theming.componentKey || '';
        sections.push('Override CSS vars in defineTheme:\n```ts\ncomponents: {\n  ' + varsKey + ': {\n    base: { \'' + exampleVar.name + '\': \'...\' },\n  },\n}\n```\n');
      }
    }
  }

  if (docs.accessibility?.length) {
    sections.push('## Accessibility\n');
    sections.push(docs.accessibility.map(a => `- ${a}`).join('\n') + '\n');
  }

  if (docs.keyboard) {
    sections.push('## Keyboard\n');
    sections.push(docs.keyboard + '\n');
  }

  if (docs.notes?.length) {
    sections.push('## Notes\n');
    sections.push(docs.notes.map(n => `- ${n}`).join('\n') + '\n');
  }

  return sections.join('\n');
}

/**
 * Format compact docs for LLM consumption (replaces extractCompact + ensureImportStatement).
 * Includes: import, features, props, limited examples, keyboard, notes.
 */
export function formatCompact(docs, componentName, importHint) {
  const displayName = componentName.startsWith('XDS')
    ? componentName
    : `XDS${componentName}`;

  const sections = [];

  sections.push(`# ${docs.name}\n`);
  sections.push(docs.description + '\n');

  // Import statement
  if (importHint) {
    sections.push('## Import\n');
    sections.push(`\`\`\`tsx\nimport { ${displayName} } from '${importHint}';\n\`\`\`\n`);
  }

  if (docs.features?.length) {
    sections.push('## Features\n');
    sections.push(docs.features.map(f => `- ${f}`).join('\n') + '\n');
  }

  // Props
  if ('props' in docs) {
    sections.push('## Props\n');
    sections.push(formatPropsTable(docs.props) + '\n');
  }

  if ('components' in docs) {
    for (const comp of docs.components) {
      sections.push(`### ${comp.name}\n`);
      sections.push(comp.description + '\n');
      sections.push(formatPropsTable(comp.props) + '\n');
    }
  }

  // Limited examples (max 3)
  const examples = docs.examples?.slice(0, 3) || [];
  if (examples.length) {
    sections.push('## Usage\n');
    for (const ex of examples) {
      if (ex.label) sections.push(`### ${ex.label}\n`);
      sections.push('```tsx\n' + ex.code + '\n```\n');
    }
  }

  if (docs.keyboard) {
    sections.push('## Keyboard\n');
    sections.push(docs.keyboard + '\n');
  }

  if (docs.notes?.length) {
    sections.push('## Notes\n');
    sections.push(docs.notes.map(n => `- ${n}`).join('\n') + '\n');
  }

  // CSS custom properties (compact includes these for theme consumers)
  if (docs.theming?.cssProperties?.length) {
    sections.push('## CSS Properties\n');
    const propLines = [];
    propLines.push('| CSS Property | Description | Default |');
    propLines.push('|-------------|-------------|---------|');
    for (const p of docs.theming.cssProperties) {
      propLines.push(`| \`${p.name}\` | ${p.description} | ${p.default || '—'} |`);
    }
    sections.push(propLines.join('\n') + '\n');
  }

  return sections.join('\n');
}

/**
 * Format a brief, LLM-optimized summary (replaces extractBrief).
 *
 * Format: component signature + key props + one usage example.
 * Targets ~200-400 chars per component (vs ~2-3KB for --detail compact).
 *
 * For multi-component docs, extracts the entry matching componentName.
 */
export function formatBrief(docs, componentName, importHint, options = {}) {
  const displayName = componentName.startsWith('XDS')
    ? componentName
    : `XDS${componentName}`;

  // Find the right props and examples for this component
  let props = [];
  let description = docs.description;
  let examples = docs.examples || [];

  if ('props' in docs) {
    props = docs.props;
  } else if ('components' in docs) {
    const entry = docs.components.find(c => c.name === displayName);
    if (entry) {
      props = entry.props;
      description = entry.description;
      examples = entry.examples || docs.examples || [];
    }
  }

  // Build signature from union-type props
  const signatureProps = [];
  const otherProps = [];

  for (const prop of props) {
    if (prop.type.includes('|') && !prop.type.includes('ReactNode')) {
      const values = prop.type
        .replace(/['"]/g, '')
        .split('|')
        .map(v => v.trim())
        .join('|');
      signatureProps.push(`${prop.name}: ${values}`);
    } else if (prop.required) {
      otherProps.unshift(`${prop.name}: ${prop.type.split('|')[0].trim()}`);
    } else {
      otherProps.push(prop.name);
    }
  }

  // Build output
  const output = [];

  // Signature line
  const sigStr =
    signatureProps.length > 0
      ? `${displayName}(${signatureProps.join(', ')})`
      : displayName;
  output.push(importHint ? `${sigStr}  ← from '${importHint}'` : sigStr);

  // Description (shortened)
  if (description) {
    const shortDesc =
      description.length > 80
        ? description.slice(0, 77) + '...'
        : description;
    output.push(`  ${shortDesc}`);
  }

  // Component vars (if any)
  if (docs.theming?.vars?.length) {
    const varNames = docs.theming.vars
      .filter(v => !v.derived)
      .map(v => `${v.name} (${v.default})`)
      .join(', ');
    if (varNames) {
      output.push(`  Vars: ${varNames}`);
    }
  }

  // CSS custom properties (if any)
  if (docs.theming?.cssProperties?.length) {
    const cssPropNames = docs.theming.cssProperties
      .map(p => `${p.name} (${p.default || '—'})`)
      .join(', ');
    output.push(`  CSS Props: ${cssPropNames}`);
  }

// Theme targets (class names, variants, states) with theme variant merging
  if (docs.theming?.targets?.length) {
    const { themeData = null } = options;
    const targetParts = docs.theming.targets.map(t => {
      const parts = [t.className];
      if (t.visualProps?.length) parts.push(`variants: ${t.visualProps.join(', ')}`);
      if (t.states?.length) parts.push(`states: ${t.states.join(', ')}`);
      // Merge theme variants
      const componentKey = targetKey(t);
      const themeVars = themeData?.variants?.[componentKey];
      if (themeVars?.length) parts.push(`theme: ${themeVars.map(v => v + '*').join(', ')}`);
      return parts.join(' ');
    });
    output.push(`  Targets: ${targetParts.join(' | ')}`);
  }

  // Other props
  if (otherProps.length > 0) {
    output.push(`  ${otherProps.join(' · ')}`);
  }

  // First code example
  if (examples.length > 0) {
    const code = examples[0].code;
    const codeLine =
      code.split('\n').find(l => l.trim().startsWith('<XDS')) ||
      code.split('\n')[0];
    output.push(`  ${codeLine.trim()}`);
  }

  return output.join('\n') + '\n';
}

/**
 * Format only the props tables (replaces extractProps).
 */
export function formatProps(docs, componentName) {
  if ('props' in docs) {
    return `## Props\n\n${formatPropsTable(docs.props)}\n`;
  }

  if ('components' in docs) {
    const sections = [];
    for (const comp of docs.components) {
      sections.push(`### ${comp.name} Props\n`);
      sections.push(formatPropsTable(comp.props) + '\n');
    }
    return sections.join('\n');
  }

  return `No props documentation found for ${componentName}.\n`;
}

/**
 * Format brief summaries for ALL components in one output.
 */
export async function formatBriefAll(coreDir, {zh = false, lang, themeData = null} = {}) {
  const components = discoverComponents(coreDir);
  const output = [];

  for (const [category, comps] of Object.entries(components)) {
    output.push(`## ${category}\n`);
    for (const comp of comps) {
      const readmePath = findComponentReadme(coreDir, comp);
      if (readmePath && readmePath.endsWith('.doc.mjs')) {
        const docs = await loadDocs(readmePath, {zh, lang});
        const importPath = resolveImportPath(coreDir, comp);
        output.push(formatBrief(docs, comp, importPath, { themeData }));
      } else if (readmePath) {
        // Legacy README.md path
        const content = fs.readFileSync(readmePath, 'utf-8');
        const importPath = resolveImportPath(coreDir, comp);
        output.push(extractBrief(content, comp, importPath));
      } else {
        output.push(`XDS${comp}\n  (no docs)\n`);
      }
    }
  }

  return output.join('\n');
}
