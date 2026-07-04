#!/usr/bin/env tsx
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Accessibility Manifest Generator
 * @description Generates accessibility manifests from official sources for Astryx and baseline (Radix/shadcn)
 *
 * Usage:
 *   pnpm -F @astryxdesign/vibe-tests generate-a11y-manifest
 *
 * This script:
 * 1. Parses Astryx component README.md files for accessibility info
 * 2. Fetches Radix accessibility docs from official sources
 * 3. Generates structured manifests for fair quality assessment
 */

import fs from 'fs';
import path from 'path';

const VIBE_TESTS_DIR = path.join(import.meta.dirname, '..');
const MANIFESTS_DIR = path.join(VIBE_TESTS_DIR, 'a11y-manifests');
const CORE_DIR = path.join(
  VIBE_TESTS_DIR,
  '..',
  '..',
  'packages',
  'core',
  'src',
);

interface ComponentA11yInfo {
  component: string;
  builtIn: string[];
  keyboard: string[];
  developerMust: string[];
  notes: string[];
}

interface A11yManifest {
  source: string;
  generatedAt: string;
  version: string;
  components: Record<string, ComponentA11yInfo>;
}

/**
 * Parse an Astryx component README for accessibility information
 */
function parseAstryxReadme(readmePath: string): ComponentA11yInfo | null {
  if (!fs.existsSync(readmePath)) {
    return null;
  }

  const content = fs.readFileSync(readmePath, 'utf-8');
  const componentName = path.basename(path.dirname(readmePath));

  const info: ComponentA11yInfo = {
    component: componentName,
    builtIn: [],
    keyboard: [],
    developerMust: [],
    notes: [],
  };

  // Extract accessibility section
  const a11yMatch = content.match(
    /## Accessibility\n\n([\s\S]*?)(?=\n##|\n$|$)/,
  );
  if (a11yMatch) {
    const a11yContent = a11yMatch[1].trim();
    // Parse the content - could be a list or prose
    const features = a11yContent
      .split(/[,.]/)
      .map(s => s.trim())
      .filter(Boolean);
    info.builtIn.push(...features);
  }

  // Extract keyboard section
  const keyboardMatch = content.match(
    /## Keyboard\n\n([\s\S]*?)(?=\n##|\n$|$)/,
  );
  if (keyboardMatch) {
    const keyboardContent = keyboardMatch[1].trim();
    info.keyboard.push(keyboardContent);
  }

  // Look for accessibility mentions in Features section
  const featuresMatch = content.match(/## Features\n\n([\s\S]*?)(?=\n##)/);
  if (featuresMatch) {
    const featuresContent = featuresMatch[1];
    const lines = featuresContent.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (
        lower.includes('accessible') ||
        lower.includes('aria') ||
        lower.includes('screen reader') ||
        lower.includes('focus') ||
        lower.includes('keyboard')
      ) {
        // Extract the feature description
        const featureMatch = line.match(/[-*]\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (featureMatch) {
          info.builtIn.push(`${featureMatch[1]}: ${featureMatch[2]}`.trim());
        } else {
          info.builtIn.push(line.replace(/^[-*]\s*/, '').trim());
        }
      }
    }
  }

  // Look for aria mentions in props table
  const propsMatch = content.match(/## Props\n\n([\s\S]*?)(?=\n##)/);
  if (propsMatch) {
    const propsContent = propsMatch[1];
    if (propsContent.includes('aria-invalid')) {
      info.builtIn.push('Sets aria-invalid for error status');
    }
    if (propsContent.includes('aria-describedby')) {
      info.builtIn.push('Uses aria-describedby for descriptions');
    }
    if (propsContent.includes('isLabelHidden')) {
      info.builtIn.push(
        'Supports visually hidden labels (still accessible to screen readers)',
      );
    }
  }

  // Look for implementation notes mentioning accessibility
  const implMatch = content.match(
    /## Implementation Notes\n\n([\s\S]*?)(?=\n##|$)/,
  );
  if (implMatch) {
    const implContent = implMatch[1];
    const lines = implContent.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (
        lower.includes('accessible') ||
        lower.includes('aria') ||
        lower.includes('screen reader') ||
        lower.includes('htmlfor') ||
        lower.includes('label')
      ) {
        info.notes.push(line.replace(/^[-*]\s*/, '').trim());
      }
    }
  }

  // Infer developer responsibilities based on component type
  if (componentName.includes('Button')) {
    info.developerMust.push('Provide aria-label for icon-only buttons');
    info.developerMust.push('Use aria-pressed for toggle buttons');
  }
  if (componentName.includes('Input') || componentName.includes('TextArea')) {
    // These have built-in label support, but note it
    info.notes.push(
      'Label is required prop - component handles label association',
    );
  }

  return info.builtIn.length > 0 || info.keyboard.length > 0 ? info : null;
}

/**
 * Generate Astryx accessibility manifest from component README files
 */
function generateAstryxManifest(): A11yManifest {
  const manifest: A11yManifest = {
    source: 'packages/core/src/*/README.md',
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    components: {},
  };

  // Find all component directories with README.md
  const findReadmes = (dir: string): string[] => {
    const readmes: string[] = [];
    if (!fs.existsSync(dir)) {
      return readmes;
    }

    const entries = fs.readdirSync(dir, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules') {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const readmePath = path.join(fullPath, 'README.md');
        if (fs.existsSync(readmePath)) {
          readmes.push(readmePath);
        }
        readmes.push(...findReadmes(fullPath));
      }
    }
    return readmes;
  };

  const readmePaths = findReadmes(CORE_DIR);
  console.log(`Found ${readmePaths.length} Astryx component README files`);

  for (const readmePath of readmePaths) {
    const info = parseAstryxReadme(readmePath);
    if (info) {
      manifest.components[info.component] = info;
    }
  }

  return manifest;
}

/**
 * Radix component accessibility info (from official docs)
 * Source: https://www.radix-ui.com/primitives/docs/overview/accessibility
 */
const RADIX_A11Y_INFO: Record<string, Omit<ComponentA11yInfo, 'component'>> = {
  Button: {
    builtIn: [
      'Native button element with proper role',
      'Keyboard activation (Enter/Space)',
      'Focus management',
    ],
    keyboard: ['Enter/Space to activate'],
    developerMust: [
      'Provide aria-label for icon-only buttons',
      'Use aria-pressed for toggle buttons',
      'Use aria-expanded for buttons that control expandable content',
    ],
    notes: ['Based on native <button> element'],
  },
  Dialog: {
    builtIn: [
      'Focus trap - focus stays within dialog',
      'Escape key closes dialog',
      'aria-modal="true" on dialog',
      'aria-labelledby pointing to title',
      'aria-describedby pointing to description',
      'Returns focus to trigger on close',
      'Scrolling blocked on body when open',
    ],
    keyboard: ['Escape to close', 'Tab/Shift+Tab to navigate within'],
    developerMust: [
      'Provide DialogTitle for aria-labelledby',
      'Provide DialogDescription for aria-describedby (or use aria-describedby={undefined})',
    ],
    notes: ['WAI-ARIA Dialog pattern'],
  },
  DropdownMenu: {
    builtIn: [
      'role="menu" on content',
      'role="menuitem" on items',
      'Arrow key navigation',
      'Typeahead to jump to items',
      'Focus returns to trigger on close',
      'Escape closes menu',
      'Submenu support with proper aria-haspopup',
    ],
    keyboard: [
      'Arrow Down/Up to navigate',
      'Enter/Space to select',
      'Escape to close',
      'Arrow Right/Left for submenus',
      'A-Z for typeahead',
    ],
    developerMust: [],
    notes: ['WAI-ARIA Menu pattern'],
  },
  Select: {
    builtIn: [
      'role="combobox" on trigger',
      'role="listbox" on content',
      'role="option" on items',
      'aria-expanded on trigger',
      'aria-activedescendant for focus',
      'Arrow key navigation',
      'Typeahead support',
    ],
    keyboard: [
      'Arrow Down/Up to navigate',
      'Enter/Space to select',
      'Escape to close',
      'A-Z for typeahead',
      'Home/End to jump',
    ],
    developerMust: ['Provide accessible label (Label component or aria-label)'],
    notes: ['WAI-ARIA Combobox pattern (Select-Only)'],
  },
  Checkbox: {
    builtIn: [
      'role="checkbox"',
      'aria-checked state',
      'Keyboard activation (Space)',
      'Supports indeterminate state',
    ],
    keyboard: ['Space to toggle'],
    developerMust: ['Provide accessible label (Label component or aria-label)'],
    notes: ['WAI-ARIA Checkbox pattern'],
  },
  Switch: {
    builtIn: [
      'role="switch"',
      'aria-checked state',
      'Keyboard activation (Space)',
    ],
    keyboard: ['Space to toggle'],
    developerMust: ['Provide accessible label (Label component or aria-label)'],
    notes: ['WAI-ARIA Switch pattern'],
  },
  Tabs: {
    builtIn: [
      'role="tablist" on list',
      'role="tab" on triggers',
      'role="tabpanel" on content',
      'aria-selected on active tab',
      'Arrow key navigation between tabs',
      'Automatic activation on focus (or manual mode)',
    ],
    keyboard: [
      'Arrow Left/Right to navigate tabs',
      'Home/End to jump to first/last tab',
      'Tab to move into panel',
    ],
    developerMust: [],
    notes: ['WAI-ARIA Tabs pattern'],
  },
  Tooltip: {
    builtIn: [
      'aria-describedby linking trigger to content',
      'Escape to dismiss',
      'Delay before showing (configurable)',
      'Touch-friendly behavior',
    ],
    keyboard: ['Escape to dismiss'],
    developerMust: [
      'Ensure trigger is focusable (use asChild with focusable element)',
    ],
    notes: ['Content should be supplementary, not essential'],
  },
  Popover: {
    builtIn: [
      'Focus management',
      'Escape to close',
      'Click outside to close',
      'aria-haspopup on trigger',
    ],
    keyboard: ['Escape to close', 'Tab to navigate within'],
    developerMust: ['Manage focus appropriately within popover content'],
    notes: ['Non-modal by default - focus is not trapped'],
  },
  AlertDialog: {
    builtIn: [
      'Focus trap',
      'aria-modal="true"',
      'role="alertdialog"',
      'aria-labelledby pointing to title',
      'aria-describedby pointing to description',
      'Escape is disabled by default (requires explicit action)',
    ],
    keyboard: ['Tab/Shift+Tab to navigate within'],
    developerMust: [
      'Provide AlertDialogTitle',
      'Provide AlertDialogDescription',
      'Include at least one focusable action button',
    ],
    notes: ['WAI-ARIA AlertDialog pattern - for important interruptions'],
  },
  Progress: {
    builtIn: [
      'role="progressbar"',
      'aria-valuenow',
      'aria-valuemin',
      'aria-valuemax',
    ],
    keyboard: [],
    developerMust: ['Provide aria-label or aria-labelledby for context'],
    notes: ['Use aria-valuetext for non-percentage values'],
  },
  Slider: {
    builtIn: [
      'role="slider"',
      'aria-valuenow, aria-valuemin, aria-valuemax',
      'Arrow key adjustment',
      'Home/End for min/max',
      'Page Up/Down for larger steps',
    ],
    keyboard: [
      'Arrow Left/Down to decrease',
      'Arrow Right/Up to increase',
      'Home for minimum',
      'End for maximum',
      'Page Up/Down for larger steps',
    ],
    developerMust: ['Provide aria-label for context'],
    notes: ['WAI-ARIA Slider pattern'],
  },
  Accordion: {
    builtIn: [
      'role="region" on panels (when expanded)',
      'aria-expanded on triggers',
      'aria-controls linking trigger to panel',
      'Arrow key navigation between triggers',
    ],
    keyboard: [
      'Enter/Space to toggle',
      'Arrow Down/Up to navigate',
      'Home/End to jump',
    ],
    developerMust: [],
    notes: ['WAI-ARIA Accordion pattern'],
  },
  RadioGroup: {
    builtIn: [
      'role="radiogroup"',
      'role="radio" on items',
      'aria-checked state',
      'Arrow key navigation',
      'Roving tabindex',
    ],
    keyboard: ['Arrow keys to navigate and select', 'Tab to enter/leave group'],
    developerMust: ['Provide aria-label or aria-labelledby on group'],
    notes: ['WAI-ARIA Radio Group pattern'],
  },
  Label: {
    builtIn: [
      'Native label element',
      'Click on label focuses associated control',
      'Proper htmlFor association',
    ],
    keyboard: [],
    developerMust: [],
    notes: ['Always use with form controls'],
  },
  Input: {
    builtIn: ['Native input element'],
    keyboard: [],
    developerMust: [
      'Provide accessible label (Label component, aria-label, or aria-labelledby)',
      'Use aria-describedby for error/help text',
      'Set aria-invalid for error states',
    ],
    notes: ['shadcn Input is a styled native input'],
  },
  Card: {
    builtIn: [],
    keyboard: [],
    developerMust: [
      'If clickable, use button or link element, not onClick on div',
      'Provide appropriate role if interactive',
    ],
    notes: ['Card is purely visual - has no semantic meaning'],
  },
  Badge: {
    builtIn: [],
    keyboard: [],
    developerMust: [
      'Provide context via aria-label or surrounding text',
      'For status badges, consider aria-live for dynamic updates',
    ],
    notes: ['Badge is purely visual - has no semantic meaning'],
  },
  Avatar: {
    builtIn: [],
    keyboard: [],
    developerMust: [
      'Provide alt text on AvatarImage',
      'AvatarFallback provides fallback for screen readers',
    ],
    notes: ['Decorative avatars should have empty alt=""'],
  },
  Skeleton: {
    builtIn: [],
    keyboard: [],
    developerMust: [
      'Provide aria-busy="true" on parent container',
      'Consider aria-live region for loading announcements',
    ],
    notes: [
      'Skeleton is decorative - loading state should be announced separately',
    ],
  },
  Table: {
    builtIn: [
      'Native table element with proper structure',
      'th elements for headers',
      'Proper table semantics',
    ],
    keyboard: [],
    developerMust: [
      'Use TableCaption for table description',
      'Use scope="col" or scope="row" on headers',
    ],
    notes: ['Use native table semantics, avoid role="presentation"'],
  },
};

/**
 * Generate baseline (Radix/shadcn) accessibility manifest
 */
function generateBaselineManifest(): A11yManifest {
  const manifest: A11yManifest = {
    source: 'https://www.radix-ui.com/primitives/docs/overview/accessibility',
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    components: {},
  };

  for (const [name, info] of Object.entries(RADIX_A11Y_INFO)) {
    manifest.components[name] = {
      component: name,
      ...info,
    };
  }

  return manifest;
}

/**
 * Format manifest as markdown for review
 */
function formatManifestAsMarkdown(
  manifest: A11yManifest,
  title: string,
): string {
  const lines: string[] = [];
  lines.push(`# ${title} Accessibility Manifest`);
  lines.push('');
  lines.push(`**Source:** ${manifest.source}`);
  lines.push(`**Generated:** ${manifest.generatedAt}`);
  lines.push('');

  for (const [name, info] of Object.entries(manifest.components)) {
    lines.push(`## ${name}`);
    lines.push('');

    if (info.builtIn.length > 0) {
      lines.push('**Built-in accessibility:**');
      for (const feature of info.builtIn) {
        lines.push(`- ${feature}`);
      }
      lines.push('');
    }

    if (info.keyboard.length > 0) {
      lines.push('**Keyboard:**');
      for (const feature of info.keyboard) {
        lines.push(`- ${feature}`);
      }
      lines.push('');
    }

    if (info.developerMust.length > 0) {
      lines.push('**Developer must provide:**');
      for (const req of info.developerMust) {
        lines.push(`- ${req}`);
      }
      lines.push('');
    }

    if (info.notes.length > 0) {
      lines.push('**Notes:**');
      for (const note of info.notes) {
        lines.push(`- ${note}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  // Ensure manifests directory exists
  if (!fs.existsSync(MANIFESTS_DIR)) {
    fs.mkdirSync(MANIFESTS_DIR, {recursive: true});
  }

  console.log('Generating accessibility manifests...\n');

  // Generate Astryx manifest
  console.log('📦 Parsing Astryx component README files...');
  const astryxManifest = generateAstryxManifest();
  const astryxJsonPath = path.join(MANIFESTS_DIR, 'astryx.json');
  const astryxMdPath = path.join(MANIFESTS_DIR, 'astryx.md');
  fs.writeFileSync(astryxJsonPath, JSON.stringify(astryxManifest, null, 2));
  fs.writeFileSync(
    astryxMdPath,
    formatManifestAsMarkdown(astryxManifest, 'Astryx'),
  );
  console.log(
    `  ✓ Found ${Object.keys(astryxManifest.components).length} components with a11y info`,
  );
  console.log(`  ✓ Written to ${astryxJsonPath}`);
  console.log(`  ✓ Markdown: ${astryxMdPath}`);

  // Generate baseline manifest
  console.log('\n📦 Generating baseline (Radix/shadcn) manifest...');
  const baselineManifest = generateBaselineManifest();
  const baselineJsonPath = path.join(MANIFESTS_DIR, 'baseline.json');
  const baselineMdPath = path.join(MANIFESTS_DIR, 'baseline.md');
  fs.writeFileSync(baselineJsonPath, JSON.stringify(baselineManifest, null, 2));
  fs.writeFileSync(
    baselineMdPath,
    formatManifestAsMarkdown(baselineManifest, 'Baseline (Radix/shadcn)'),
  );
  console.log(
    `  ✓ Documented ${Object.keys(baselineManifest.components).length} components`,
  );
  console.log(`  ✓ Written to ${baselineJsonPath}`);
  console.log(`  ✓ Markdown: ${baselineMdPath}`);

  console.log('\n✅ Done! Manifests are ready for quality assessment.');
  console.log('\nNext: Update quality-agent.ts to use these manifests.');
}

main().catch(console.error);
