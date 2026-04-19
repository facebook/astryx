#!/usr/bin/env node
/**
 * @file Build live preview pages from vibe test results
 *
 * Takes .tsx result files and builds each into a standalone HTML page
 * that renders the component. Supports XDS, baseline, and raw HTML targets.
 *
 * Usage:
 *   tsx src/build-previews.ts --iterations 8734233a,d4ff8c2c,68ef2a62
 *   tsx src/build-previews.ts --iterations 8734233a --prompts tc-4
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {execSync} from 'node:child_process';
import {
  getResultsDir,
  ensureDir,
  readJson,
  writeJson,
  ensureTsxFiles,
} from './utils.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const VIBE_DIR = path.resolve(__dirname, '..');
const _APP_DIR = path.join(VIBE_DIR, 'app');
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');

/**
 * Browser targets for lightningcss.
 * Prevents lowering native light-dark() into --lightningcss-light/--lightningcss-dark
 * polyfill variables. XDS tokens use native light-dark() which is baseline 2024:
 * Chrome 123+, Firefox 120+, Safari 17.5+
 *
 * Must match the targets in apps/storybook/.storybook/main.ts and
 * internal/vibe-tests/app/vite.config.*.ts
 */
const LIGHTNINGCSS_TARGETS_JS = `{
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
}`;

/**
 * Fix missing XDS component imports in AI-generated .tsx files.
 * Scans for XDS* identifiers used in JSX that aren't imported,
 * and prepends the missing import. Returns list of auto-imported components.
 */
function fixMissingXDSImports(filePath: string): string[] {
  const code = fs.readFileSync(filePath, 'utf-8');
  const usedComponents = new Set<string>();
  const jsxPattern = /(?:<|jsxs?\(\s*)(XDS\w+)/g;
  let match;
  while ((match = jsxPattern.exec(code)) !== null) {
    usedComponents.add(match[1]);
  }
  if (usedComponents.size === 0) return [];
  const importedComponents = new Set<string>();
  const importPattern =
    /import\s*\{([^}]+)\}\s*from\s*['"]@xds\/core[^'"]*['"]/g;
  while ((match = importPattern.exec(code)) !== null) {
    for (const specifier of match[1].split(',')) {
      const name = specifier
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (name.startsWith('XDS')) importedComponents.add(name);
    }
  }
  const missing = [...usedComponents].filter(c => !importedComponents.has(c));
  if (missing.length === 0) return [];
  const importLine = `import {${missing.sort().join(', ')}} from '@xds/core';\n`;
  fs.writeFileSync(filePath, importLine + code);
  return missing.sort();
}

/**
 * Validate a built preview HTML for unresolved XDS component references.
 * Returns list of unresolved component names (empty if clean).
 */
function validatePreviewHtml(htmlPath: string): string[] {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const unresolved = new Set<string>();
  const pattern = /\.jsxs?\((XDS[A-Z]\w+)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    unresolved.add(match[1]);
  }
  return [...unresolved].sort();
}

interface PreviewManifest {
  [promptId: string]: {
    [target: string]: string; // relative path to preview HTML
  };
}

function parseArgs(): {
  iterations: string[];
  prompts?: string[];
  outDir: string;
} {
  const args = process.argv.slice(2);
  let iterations: string[] = [];
  let prompts: string[] | undefined;
  let outDir = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = args[++i].split(',');
    } else if (args[i] === '--prompts' && args[i + 1]) {
      prompts = args[++i].split(',');
    } else if (args[i] === '--out' && args[i + 1]) {
      outDir = args[++i];
    }
  }

  if (iterations.length === 0) {
    console.error(
      'Usage: tsx src/build-previews.ts --iterations <id1,id2,...> [--prompts <p1,p2,...>] [--out <dir>]',
    );
    process.exit(1);
  }

  // Default output to first iteration's directory
  if (!outDir) {
    outDir = path.join(getResultsDir(), iterations[0], 'previews');
  }

  return {iterations, prompts, outDir};
}

/**
 * Create a temporary entry file that imports and renders the component
 */
function createEntryFile(
  componentPath: string,
  target: string,
  tmpDir: string,
): string {
  const entryPath = path.join(tmpDir, 'entry.tsx');

  // For XDS and XDS+Tailwind targets, wrap in theme provider and import reset
  if (target === 'xds') {
    fs.writeFileSync(
      entryPath,
      `import React from 'react';
import {createRoot} from 'react-dom/client';
import '@xds/core/reset.css';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme/default';
import Component from '${componentPath.replace(/\\/g, '/')}';

function App() {
  return (
    <XDSTheme theme={defaultTheme} mode="light">
      <Component />
    </XDSTheme>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
`,
    );
  } else {
    // Baseline and HTML: just render directly
    fs.writeFileSync(
      entryPath,
      `import React from 'react';
import {createRoot} from 'react-dom/client';
import Component from '${componentPath.replace(/\\/g, '/')}';

createRoot(document.getElementById('root')!).render(<Component />);
`,
    );
  }

  return entryPath;
}

/**
 * Create a minimal index.html for the preview
 */
function createIndexHtml(
  tmpDir: string,
  title: string,
  target: string,
): string {
  const htmlPath = path.join(tmpDir, 'index.html');

  // Baseline previews need Tailwind CSS for styling
  const tailwindCdn =
    target === 'baseline'
      ? `\n  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 222.2 84% 4.9%;
      --radius: 0.5rem;
    }
  </style>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
            secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
            destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
            muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
            accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
            popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
            card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
    }
  </script>`
      : '';

  fs.writeFileSync(
    htmlPath,
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>${tailwindCdn}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./entry.tsx"></script>
</body>
</html>`,
  );
  return htmlPath;
}

/**
 * Create a Vite config for building the preview
 */
function createViteConfig(tmpDir: string, target: string): string {
  const configPath = path.join(tmpDir, 'vite.config.ts');

  // For XDS and XDS+Tailwind previews, the generated component may use
  // patterns that StyleX's babel plugin rejects (e.g. createTheme with
  // type casts). We use a pre-transform plugin to strip TypeScript type
  // assertions before StyleX processes the file.
  const plugins =
    target === 'xds'
      ? `
    {
      name: 'stylex-inline-vars',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.tsx') || !id.includes('/results/')) return null;

        let result = code;

        // Step 1: Collect all 'const xxxRaw = { ... } as const;' blocks
        // so we can inline them into createTheme calls
        const varBlocks = new Map();
        const blockRe = /const\\s+(\\w+Raw)\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*as\\s+const;/g;
        let match;
        while ((match = blockRe.exec(code)) !== null) {
          varBlocks.set(match[1], match[2]);
        }

        // Step 2: Inline variable references in createTheme calls
        // Pattern: stylex.createTheme(vars, someRaw as unknown as SomeType)
        // Replace with: stylex.createTheme(vars, { ...inlined object... })
        for (const [varName, objLiteral] of varBlocks) {
          // Match the variable reference with optional type cast
          const refRe = new RegExp(
            varName + '(?:\\\\s+as\\\\s+unknown\\\\s+as\\\\s+\\\\w+)?',
            'g'
          );
          // Only replace in createTheme contexts (second arg)
          result = result.replace(
            new RegExp(
              '(createTheme\\\\([^,]+,\\\\s*)' + varName + '(?:\\\\s+as\\\\s+unknown\\\\s+as\\\\s+\\\\w+)?\\\\s*\\\\)',
              'g'
            ),
            '$1' + objLiteral + ')'
          );
        }

        // Step 3: Strip remaining type casts (but not in import lines)
        result = result.split('\\n').map(line => {
          if (line.trimStart().startsWith('import ')) return line;
          line = line.replace(/\\s+as\\s+unknown\\s+as\\s+\\w+/g, '');
          return line;
        }).join('\\n');

        return { code: result, map: null };
      },
    },
    stylex.vite({
      dev: false,
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: '${REPO_ROOT.replace(/\\/g, '/')}',
      },
      aliases: {
        '@xds/core/theme/tokens.stylex': '${path
          .resolve(REPO_ROOT, 'packages/core/src/theme/tokens.stylex.ts')
          .replace(/\\/g, '/')}',
      },
      lightningcssOptions: {
        targets: ${LIGHTNINGCSS_TARGETS_JS},
      },
    }),
    react(),
    viteSingleFile(),`
      : `
    react(),
    viteSingleFile(),`;

  const imports =
    target === 'xds'
      ? `import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';`
      : `import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';`;

  const xdsAliases = `
    alias: {
      '@xds/core/theme/tokens.stylex': '${path
        .resolve(REPO_ROOT, 'packages/core/src/theme/tokens.stylex.ts')
        .replace(/\\/g, '/')}',
      '@xds/core': '${path
        .resolve(REPO_ROOT, 'packages/core/src')
        .replace(/\\/g, '/')}',
      '@xds/theme/default': '${path
        .resolve(REPO_ROOT, 'packages/themes/default/src/source.ts')
        .replace(/\\/g, '/')}',
      '@xds/theme/neutral': '${path
        .resolve(REPO_ROOT, 'packages/themes/neutral/src/source.ts')
        .replace(/\\/g, '/')}',
    },`;

  const aliases =
    target === 'xds'
      ? xdsAliases
      : target === 'baseline'
        ? `
    alias: {
      '@/components/ui': '${path
        .resolve(VIBE_DIR, '.baseline-shims/components/ui')
        .replace(/\\/g, '/')}',
      '@/lib/utils': '${path
        .resolve(VIBE_DIR, '.baseline-shims/lib/utils')
        .replace(/\\/g, '/')}',
    },`
        : '';

  const cssConfig = '';

  fs.writeFileSync(
    configPath,
    `import {defineConfig} from 'vite';
${imports}

export default defineConfig({
  root: '${tmpDir.replace(/\\/g, '/')}',
  plugins: [${plugins}
  ],${cssConfig}
  resolve: {${aliases}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Don't use lightningcss for minification — it lowers light-dark()
    // into --lightningcss-light/--lightningcss-dark polyfill variables
    // which breaks XDS theming.
    cssMinify: false,
  },
  logLevel: 'warn',
});
`,
  );

  return configPath;
}

/**
 * Create baseline component shims so imports resolve
 */
function ensureBaselineShims(): void {
  const shimsDir = path.join(VIBE_DIR, '.baseline-shims');
  const componentsDir = path.join(shimsDir, 'components', 'ui');
  const libDir = path.join(shimsDir, 'lib');

  if (fs.existsSync(path.join(libDir, 'utils.ts'))) return;

  ensureDir(componentsDir);
  ensureDir(libDir);

  // cn() utility
  fs.writeFileSync(
    path.join(libDir, 'utils.ts'),
    `export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
`,
  );

  // Generic shim components — render as plain HTML with basic styling
  const components: Record<string, string> = {
    button: `import React from 'react';
import {cn} from '@/lib/utils';
export function Button({className, variant, size, children, ...props}: any) {
  return <button className={cn('px-4 py-2 rounded-md text-sm font-medium', className)} {...props}>{children}</button>;
}
export const buttonVariants = () => '';
`,
    card: `import React from 'react';
import {cn} from '@/lib/utils';
export function Card({className, children, ...props}: any) { return <div className={cn('rounded-lg border bg-white shadow-sm', className)} {...props}>{children}</div>; }
export function CardHeader({className, children, ...props}: any) { return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>{children}</div>; }
export function CardTitle({className, children, ...props}: any) { return <h3 className={cn('text-2xl font-semibold', className)} {...props}>{children}</h3>; }
export function CardDescription({className, children, ...props}: any) { return <p className={cn('text-sm text-gray-500', className)} {...props}>{children}</p>; }
export function CardContent({className, children, ...props}: any) { return <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>; }
export function CardFooter({className, children, ...props}: any) { return <div className={cn('flex items-center p-6 pt-0', className)} {...props}>{children}</div>; }
`,
    badge: `import React from 'react';
import {cn} from '@/lib/utils';
export function Badge({className, variant, children, ...props}: any) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', className)} {...props}>{children}</span>;
}
`,
    input: `import React from 'react';
import {cn} from '@/lib/utils';
export const Input = React.forwardRef<HTMLInputElement, any>(({className, ...props}, ref) => {
  return <input ref={ref} className={cn('flex h-10 w-full rounded-md border px-3 py-2 text-sm', className)} {...props} />;
});
Input.displayName = 'Input';
`,
    label: `import React from 'react';
import {cn} from '@/lib/utils';
export const Label = React.forwardRef<HTMLLabelElement, any>(({className, ...props}, ref) => {
  return <label ref={ref} className={cn('text-sm font-medium', className)} {...props} />;
});
Label.displayName = 'Label';
`,
    checkbox: `import React from 'react';
export function Checkbox({checked, onCheckedChange, ...props}: any) {
  return <input type="checkbox" checked={checked} onChange={e => onCheckedChange?.(e.target.checked)} {...props} />;
}
`,
    select: `import React from 'react';
import {cn} from '@/lib/utils';
export function Select({children, value, onValueChange, ...props}: any) { return <div {...props}>{children}</div>; }
export function SelectTrigger({className, children, ...props}: any) { return <button className={cn('flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm', className)} {...props}>{children}</button>; }
export function SelectValue({placeholder}: any) { return <span>{placeholder}</span>; }
export function SelectContent({children}: any) { return <div>{children}</div>; }
export function SelectItem({value, children}: any) { return <div data-value={value}>{children}</div>; }
`,
    progress: `import React from 'react';
import {cn} from '@/lib/utils';
export function Progress({value = 0, className, ...props}: any) {
  return <div className={cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-200', className)} {...props}>
    <div className="h-full bg-blue-600 transition-all" style={{width: \`\${value}%\`}} />
  </div>;
}
`,
    skeleton: `import React from 'react';
import {cn} from '@/lib/utils';
export function Skeleton({className, ...props}: any) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
}
`,
    separator: `import React from 'react';
import {cn} from '@/lib/utils';
export function Separator({className, orientation = 'horizontal', ...props}: any) {
  return <div className={cn(orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', 'bg-gray-200', className)} {...props} />;
}
`,
    tabs: `import React, {useState, createContext, useContext} from 'react';
import {cn} from '@/lib/utils';
const TabsContext = createContext<{value: string; onChange: (v: string) => void}>({value: '', onChange: () => {}});
export function Tabs({defaultValue, value: controlledValue, onValueChange, children, className, ...props}: any) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const value = controlledValue ?? internal;
  const onChange = onValueChange ?? setInternal;
  return <TabsContext.Provider value={{value, onChange}}><div className={className} {...props}>{children}</div></TabsContext.Provider>;
}
export function TabsList({className, children, ...props}: any) { return <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1', className)} {...props}>{children}</div>; }
export function TabsTrigger({value, className, children, ...props}: any) {
  const ctx = useContext(TabsContext);
  return <button className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium', ctx.value === value && 'bg-white shadow-sm', className)} onClick={() => ctx.onChange(value)} {...props}>{children}</button>;
}
export function TabsContent({value, className, children, ...props}: any) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={className} {...props}>{children}</div>;
}
`,
    table: `import React from 'react';
import {cn} from '@/lib/utils';
export function Table({className, children, ...props}: any) { return <div className="relative w-full overflow-auto"><table className={cn('w-full caption-bottom text-sm', className)} {...props}>{children}</table></div>; }
export function TableHeader({className, children, ...props}: any) { return <thead className={cn('[&_tr]:border-b', className)} {...props}>{children}</thead>; }
export function TableBody({className, children, ...props}: any) { return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>{children}</tbody>; }
export function TableRow({className, children, ...props}: any) { return <tr className={cn('border-b transition-colors hover:bg-gray-50', className)} {...props}>{children}</tr>; }
export function TableHead({className, children, ...props}: any) { return <th className={cn('h-12 px-4 text-left align-middle font-medium text-gray-500', className)} {...props}>{children}</th>; }
export function TableCell({className, children, ...props}: any) { return <td className={cn('p-4 align-middle', className)} {...props}>{children}</td>; }
export function TableCaption({className, children, ...props}: any) { return <caption className={cn('mt-4 text-sm text-gray-500', className)} {...props}>{children}</caption>; }
`,
    sheet: `import React from 'react';
import {cn} from '@/lib/utils';
export function Sheet({children, open, onOpenChange}: any) { return <>{children}</>; }
export function SheetTrigger({children, asChild, ...props}: any) { return <>{children}</>; }
export function SheetContent({className, children, side = 'right', ...props}: any) {
  return <div className={cn('fixed inset-y-0 z-50 flex flex-col bg-white p-6 shadow-lg', side === 'right' ? 'right-0' : 'left-0', className)} style={{width: 300}} {...props}>{children}</div>;
}
export function SheetHeader({className, children, ...props}: any) { return <div className={cn('flex flex-col space-y-2', className)} {...props}>{children}</div>; }
export function SheetTitle({className, children, ...props}: any) { return <h2 className={cn('text-lg font-semibold', className)} {...props}>{children}</h2>; }
export function SheetDescription({className, children, ...props}: any) { return <p className={cn('text-sm text-gray-500', className)} {...props}>{children}</p>; }
export function SheetClose({children, asChild, ...props}: any) { return <>{children}</>; }
`,
    'dropdown-menu': `import React, {useState} from 'react';
import {cn} from '@/lib/utils';
export function DropdownMenu({children}: any) { return <div className="relative inline-block">{children}</div>; }
export function DropdownMenuTrigger({children, asChild}: any) { return <>{children}</>; }
export function DropdownMenuContent({className, children, ...props}: any) { return <div className={cn('z-50 min-w-[8rem] rounded-md border bg-white p-1 shadow-md', className)} {...props}>{children}</div>; }
export function DropdownMenuItem({className, children, ...props}: any) { return <div className={cn('relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100', className)} {...props}>{children}</div>; }
export function DropdownMenuLabel({className, children, ...props}: any) { return <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>{children}</div>; }
export function DropdownMenuSeparator({className, ...props}: any) { return <div className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />; }
export function DropdownMenuCheckboxItem({className, children, checked, ...props}: any) { return <div className={cn('relative flex cursor-pointer items-center rounded-sm py-1.5 pl-8 pr-2 text-sm', className)} {...props}>{children}</div>; }
export function DropdownMenuRadioGroup({children}: any) { return <>{children}</>; }
export function DropdownMenuRadioItem({className, children, ...props}: any) { return <div className={cn('relative flex cursor-pointer items-center rounded-sm py-1.5 pl-8 pr-2 text-sm', className)} {...props}>{children}</div>; }
export function DropdownMenuSub({children}: any) { return <>{children}</>; }
export function DropdownMenuSubTrigger({className, children, ...props}: any) { return <div className={cn('flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm', className)} {...props}>{children}</div>; }
export function DropdownMenuSubContent({className, children, ...props}: any) { return <div className={cn('z-50 min-w-[8rem] rounded-md border bg-white p-1 shadow-md', className)} {...props}>{children}</div>; }
`,
    dialog: `import React from 'react';
import {cn} from '@/lib/utils';
export function Dialog({children, open, onOpenChange}: any) { if (!open) return null; return <>{children}</>; }
export function DialogTrigger({children, asChild}: any) { return <>{children}</>; }
export function DialogContent({className, children, ...props}: any) { return <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="fixed inset-0 bg-black/50" /><div className={cn('relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg', className)} {...props}>{children}</div></div>; }
export function DialogHeader({className, children, ...props}: any) { return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props}>{children}</div>; }
export function DialogTitle({className, children, ...props}: any) { return <h2 className={cn('text-lg font-semibold', className)} {...props}>{children}</h2>; }
export function DialogDescription({className, children, ...props}: any) { return <p className={cn('text-sm text-gray-500', className)} {...props}>{children}</p>; }
export function DialogFooter({className, children, ...props}: any) { return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}>{children}</div>; }
`,
    tooltip: `import React, {useState, useRef, useEffect} from 'react';
import {cn} from '@/lib/utils';
export function TooltipProvider({children}: any) { return <>{children}</>; }
export function Tooltip({children, open, onOpenChange, delayDuration}: any) { return <>{children}</>; }
export function TooltipTrigger({children, asChild, ...props}: any) { return <>{children}</>; }
export function TooltipContent({className, children, side, sideOffset, ...props}: any) {
  return <div className={cn('z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md', className)} {...props}>{children}</div>;
}
`,
    command: `import React, {useState, createContext, useContext} from 'react';
import {cn} from '@/lib/utils';
const CmdCtx = createContext<{search: string; setSearch: (s: string) => void}>({search: '', setSearch: () => {}});
export function Command({className, children, ...props}: any) {
  const [search, setSearch] = useState('');
  return <CmdCtx.Provider value={{search, setSearch}}><div className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)} {...props}>{children}</div></CmdCtx.Provider>;
}
export function CommandInput({className, placeholder, value, onValueChange, ...props}: any) {
  const ctx = useContext(CmdCtx);
  return <input className={cn('flex h-11 w-full rounded-md bg-transparent py-3 px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b', className)} placeholder={placeholder} value={value ?? ctx.search} onChange={e => { ctx.setSearch(e.target.value); onValueChange?.(e.target.value); }} {...props} />;
}
export function CommandList({className, children, ...props}: any) { return <div className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props}>{children}</div>; }
export function CommandEmpty({children, ...props}: any) { const ctx = useContext(CmdCtx); return <div className="py-6 text-center text-sm" {...props}>{children}</div>; }
export function CommandGroup({className, heading, children, ...props}: any) { return <div className={cn('overflow-hidden p-1 text-foreground', className)} {...props}>{heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}{children}</div>; }
export function CommandItem({className, children, onSelect, value, ...props}: any) { return <div className={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground', className)} onClick={() => onSelect?.(value)} {...props}>{children}</div>; }
export function CommandSeparator({className, ...props}: any) { return <div className={cn('-mx-1 h-px bg-border', className)} {...props} />; }
`,
    'scroll-area': `import React from 'react';
import {cn} from '@/lib/utils';
export function ScrollArea({className, children, ...props}: any) {
  return <div className={cn('relative overflow-auto', className)} {...props}>{children}</div>;
}
export function ScrollBar({orientation, ...props}: any) { return null; }
`,
    popover: `import React, {useState} from 'react';
import {cn} from '@/lib/utils';
export function Popover({children, open, onOpenChange}: any) { return <div className="relative inline-block">{children}</div>; }
export function PopoverTrigger({children, asChild, ...props}: any) { return <>{children}</>; }
export function PopoverContent({className, children, align, sideOffset, ...props}: any) {
  return <div className={cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)} {...props}>{children}</div>;
}
`,
  };

  for (const [name, content] of Object.entries(components)) {
    fs.writeFileSync(path.join(componentsDir, `${name}.tsx`), content);
  }
}

/**
 * Build a single preview page
 */
function buildPreview(
  componentPath: string,
  target: string,
  promptId: string,
  outPath: string,
): boolean {
  // Use a unique temp directory per build to prevent race conditions
  // when multiple build-previews processes run concurrently
  const tmpDir = path.join(VIBE_DIR, `.preview-tmp-${crypto.randomUUID()}`);
  ensureDir(tmpDir);

  try {
    createEntryFile(componentPath, target, tmpDir);
    createIndexHtml(tmpDir, `${promptId} — ${target}`, target);
    createViteConfig(tmpDir, target);

    execSync(`npx vite build --config ${path.join(tmpDir, 'vite.config.ts')}`, {
      cwd: VIBE_DIR,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    const distHtml = path.join(tmpDir, 'dist', 'index.html');
    if (!fs.existsSync(distHtml)) {
      console.error(`  ✗ Build produced no output for ${promptId}/${target}`);
      return false;
    }

    // Inline any CSS files
    const assetsDir = path.join(tmpDir, 'dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      let html = fs.readFileSync(distHtml, 'utf-8');
      const cssFiles = fs
        .readdirSync(assetsDir)
        .filter(f => f.endsWith('.css'));
      for (const cssFile of cssFiles) {
        const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
        html = html.replace('</head>', `<style>${css}</style>\n</head>`);
      }
      fs.writeFileSync(distHtml, html);
    }

    ensureDir(path.dirname(outPath));
    fs.copyFileSync(distHtml, outPath);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Failed to build ${promptId}/${target}: ${msg}`);
    return false;
  } finally {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, {recursive: true});
  }
}

async function main() {
  const {iterations, prompts, outDir} = parseArgs();
  const resultsDir = getResultsDir();

  console.log('\n🖼️  Building Preview Pages');
  console.log('='.repeat(40));

  const manifest: PreviewManifest = {};
  /** Track which prompts needed auto-imported components (quality signal) */
  const importFixes: Record<string, string[]> = {};

  for (const iterationId of iterations) {
    const iterDir = path.join(resultsDir, iterationId);
    const manifestPath = path.join(iterDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.error(`  ⚠ No manifest for ${iterationId}, skipping`);
      continue;
    }

    const iterManifest = readJson<{config?: {target?: string}}>(manifestPath);
    const target = iterManifest.config?.target ?? 'xds';
    const codeDir = path.join(iterDir, 'results');

    if (!fs.existsSync(codeDir)) continue;

    // Extract .tsx from JSON results if no .tsx files exist yet
    ensureTsxFiles(codeDir);

    const files = fs.readdirSync(codeDir).filter(f => f.endsWith('.tsx'));

    for (const file of files) {
      const promptId = path.basename(file, '.tsx');
      if (prompts && !prompts.includes(promptId)) continue;

      const componentPath = path.resolve(codeDir, file);
      const previewFile = `${promptId}/${target}.html`;
      const previewPath = path.join(outDir, previewFile);

      console.log(`  📄 ${promptId} (${target})...`);

      // Auto-fix missing XDS imports before building
      if (target === 'xds') {
        const autoImported = fixMissingXDSImports(componentPath);
        if (autoImported.length > 0) {
          console.log(`  ⚡ Auto-imported: ${autoImported.join(', ')}`);
          importFixes[promptId] = autoImported;
        }
      }

      if (target === 'baseline') {
        ensureBaselineShims();
      }

      const ok = buildPreview(componentPath, target, promptId, previewPath);
      if (ok) {
        // Post-build validation: ensure no unresolved XDS references
        if (target === 'xds') {
          const unresolved = validatePreviewHtml(previewPath);
          if (unresolved.length > 0) {
            console.error(
              `  ⚠ Unresolved XDS components in ${previewFile}: ${unresolved.join(', ')}`,
            );
          }
        }

        if (!manifest[promptId]) manifest[promptId] = {};
        manifest[promptId][target] = `previews/${previewFile}`;
        console.log(`  ✓ ${previewFile}`);
      }
    }
  }

  // Merge with existing manifest if present
  const manifestOutPath = path.join(outDir, 'manifest.json');
  ensureDir(outDir);
  if (fs.existsSync(manifestOutPath)) {
    const existing = readJson<PreviewManifest>(manifestOutPath);
    for (const [promptId, targets] of Object.entries(existing)) {
      if (!manifest[promptId]) manifest[promptId] = {};
      for (const [target, url] of Object.entries(targets)) {
        if (!manifest[promptId][target]) manifest[promptId][target] = url;
      }
    }
  }
  writeJson(manifestOutPath, manifest);

  // Write import-fixes sidecar so evaluators can penalize missing imports
  if (Object.keys(importFixes).length > 0) {
    const fixesPath = path.join(outDir, 'import-fixes.json');
    writeJson(fixesPath, importFixes);
    console.log(
      `\n⚠ ${Object.keys(importFixes).length} prompt(s) had missing XDS imports (auto-fixed):`,
    );
    for (const [promptId, components] of Object.entries(importFixes)) {
      console.log(`   ${promptId}: ${components.join(', ')}`);
    }
  }

  const totalPreviews = Object.values(manifest).reduce(
    (sum, targets) => sum + Object.keys(targets).length,
    0,
  );
  console.log(
    `\n✅ Built ${totalPreviews} preview(s) for ${
      Object.keys(manifest).length
    } prompt(s)`,
  );
  console.log(`   Manifest: ${manifestOutPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
