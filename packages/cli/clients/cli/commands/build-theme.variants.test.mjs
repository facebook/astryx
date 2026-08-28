// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for the custom-variant type augmentations emitted by
 * `astryx theme build` (#3391 companion: #3371).
 *
 * When a theme declares a custom component prop value (e.g.
 * `button['variant:accentOutline']`), the build emits a `<name>.variants.d.ts`
 * with a module augmentation so the custom value type-checks. This suite pins
 * the two bugs that made that augmentation dead code:
 *
 *   1. The augmentation targeted a non-existent, `XDS`-prefixed interface
 *      (`XDSButtonVariantMap`) instead of core's real `ButtonVariantMap`, so it
 *      created a new unused interface and never widened the prop union.
 *   2. Props with no augmentation point (closed literal-union types such as
 *      Button `size` or Heading `type`/`level`) still got a `declare module`
 *      block against a `*Map` interface that doesn't exist.
 *   3. The generated `.variants.d.ts` was never referenced by the main
 *      `<name>.d.ts`, so even a correct augmentation never loaded.
 *   4. The augmentation targeted the public component subpath while the prop
 *      type read a map from the implementation module, so TypeScript merged the
 *      public interface but the component still saw the original closed union.
 *
 * Building `astryx theme build` requires a compiled @astryxdesign/core, so this
 * suite builds core once in beforeAll (mirrors build-theme.prose.test.mjs).
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(HERE, '../../..');

function writeTheme(dir, contents) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, 'variants-theme.mjs');
  fs.writeFileSync(file, contents);
  return file;
}

// Build core through the shared lock helper — this suite previously ran its
// own unguarded `if (!exists) pnpm -F core build`, and when Vitest scheduled
// it alongside the other build-theme suites on a fresh checkout, the
// concurrent builds collided on packages/core/dist (core's build starts by
// wiping dist), nondeterministically breaking whichever suite was mid-read.
beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-variants-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build custom-variant augmentations', () => {
  it('targets the real (un-prefixed) core interface for a custom variant', async () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'variant:accentOutline': { backgroundColor: 'transparent' } },
        },
      };\n`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const variantsPath = path.join(tmpDir, 'variants-theme.variants.d.ts');
    expect(fs.existsSync(variantsPath)).toBe(true);
    const dts = fs.readFileSync(variantsPath, 'utf-8');

    // Targets core's actual augmentation point…
    expect(dts).toContain("declare module '@astryxdesign/core/Button'");
    expect(dts).toMatch(/interface ButtonVariantMap\b/);
    expect(dts).toContain("'accentOutline': true;");
    // …and NOT the old, non-existent XDS-prefixed interface.
    expect(dts).not.toMatch(/XDSButtonVariantMap/);
  });

  it('skips props with no augmentation point (Button size, Heading type)', async () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: {
            'variant:accentOutline': { backgroundColor: 'transparent' },
            'size:jumbo': { paddingBlock: '40px' },
          },
          heading: { 'type:hero': { fontSize: '80px' } },
        },
      };\n`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const variantsPath = path.join(tmpDir, 'variants-theme.variants.d.ts');
    expect(fs.existsSync(variantsPath)).toBe(true);
    const dts = fs.readFileSync(variantsPath, 'utf-8');

    // The augmentable variant is emitted…
    expect(dts).toMatch(/interface ButtonVariantMap\b/);
    // …but closed literal-union props get no dead augmentation.
    expect(dts).not.toMatch(/ButtonSizeMap/);
    expect(dts).not.toMatch(/HeadingTypeMap/);
    expect(dts).not.toContain("declare module '@astryxdesign/core/Heading'");
  });

  it('does not emit a .variants.d.ts when every custom value is non-augmentable', async () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'size:jumbo': { paddingBlock: '40px' } },
        },
      };\n`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);
    expect(
      fs.existsSync(path.join(tmpDir, 'variants-theme.variants.d.ts')),
    ).toBe(false);
  });

  it('makes generated custom component prop values type-check through public subpaths', async () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          'app-shell': { 'variant:customAppShell': { backgroundColor: 'transparent' } },
          'avatar-status-dot': { 'variant:customAvatarDot': { backgroundColor: 'transparent' } },
          badge: { 'variant:customBadge': { backgroundColor: 'transparent' } },
          banner: {
            'status:customBannerStatus': { backgroundColor: 'transparent' },
            'container:customBannerContainer': { padding: '1px' },
          },
          breadcrumbs: { 'variant:customBreadcrumbs': { color: 'currentColor' } },
          button: { 'variant:customButton': { backgroundColor: 'transparent' } },
          card: { 'variant:customCard': { backgroundColor: 'transparent' } },
          dialog: { 'variant:customDialog': { backgroundColor: 'transparent' } },
          divider: { 'variant:customDivider': { borderColor: 'currentColor' } },
          'field-status': { 'variant:customFieldStatus': { color: 'currentColor' } },
          pagination: { 'variant:customPagination': { color: 'currentColor' } },
          progressbar: { 'variant:customProgressBar': { backgroundColor: 'transparent' } },
          section: { 'variant:customSection': { backgroundColor: 'transparent' } },
          statusdot: { 'variant:customStatusDot': { backgroundColor: 'transparent' } },
          text: { 'color:customTextColor': { color: 'currentColor' } },
          token: { 'color:customTokenColor': { backgroundColor: 'transparent' } },
        },
      };
`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const projectDir = path.join(CLI_ROOT, `.tmp-variant-consumer-${process.pid}`);
    fs.rmSync(projectDir, {recursive: true, force: true});
    fs.mkdirSync(projectDir);
    fs.copyFileSync(
      path.join(tmpDir, 'variants-theme.d.ts'),
      path.join(projectDir, 'variants-theme.d.ts'),
    );
    fs.copyFileSync(
      path.join(tmpDir, 'variants-theme.variants.d.ts'),
      path.join(projectDir, 'variants-theme.variants.d.ts'),
    );
    fs.writeFileSync(
      path.join(projectDir, 'probe.tsx'),
      `import './variants-theme';\n` +
        `import {AppShell} from '@astryxdesign/core/AppShell';\n` +
        `import {AvatarStatusDot} from '@astryxdesign/core/Avatar';\n` +
        `import {Badge} from '@astryxdesign/core/Badge';\n` +
        `import {Banner} from '@astryxdesign/core/Banner';\n` +
        `import {Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';\n` +
        `import {Button} from '@astryxdesign/core/Button';\n` +
        `import {Card} from '@astryxdesign/core/Card';\n` +
        `import {Dialog} from '@astryxdesign/core/Dialog';\n` +
        `import {Divider} from '@astryxdesign/core/Divider';\n` +
        `import {FieldStatus} from '@astryxdesign/core/FieldStatus';\n` +
        `import {Pagination} from '@astryxdesign/core/Pagination';\n` +
        `import {ProgressBar} from '@astryxdesign/core/ProgressBar';\n` +
        `import {Section} from '@astryxdesign/core/Section';\n` +
        `import {StatusDot} from '@astryxdesign/core/StatusDot';\n` +
        `import {Text} from '@astryxdesign/core/Text';\n` +
        `import {Token} from '@astryxdesign/core/Token';\n\n` +
        `export function Probe() {\n` +
        `  return (\n` +
        `    <>\n` +
        `      <AppShell variant="customAppShell">Shell</AppShell>\n` +
        `      <AvatarStatusDot variant="customAvatarDot" />\n` +
        `      <Badge label="Badge" variant="customBadge" />\n` +
        `      <Banner title="Banner" status="customBannerStatus" container="customBannerContainer" />\n` +
        `      <Breadcrumbs variant="customBreadcrumbs">Crumbs</Breadcrumbs>\n` +
        `      <Button label="Button" variant="customButton" />\n` +
        `      <Card variant="customCard">Card</Card>\n` +
        `      <Dialog isOpen onOpenChange={() => {}} variant="customDialog">Body</Dialog>\n` +
        `      <Divider variant="customDivider" />\n` +
        `      <FieldStatus type="success" message="Ok" variant="customFieldStatus" />\n` +
        `      <Pagination page={1} totalPages={2} onChange={() => {}} variant="customPagination" />\n` +
        `      <ProgressBar label="Progress" value={50} variant="customProgressBar" />\n` +
        `      <Section variant="customSection">Section</Section>\n` +
        `      <StatusDot label="Status" variant="customStatusDot" />\n` +
        `      <Text color="customTextColor">Text</Text>\n` +
        `      <Token label="Token" color="customTokenColor" />\n` +
        `    </>\n` +
        `  );\n` +
        `}\n`,
    );
    fs.writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            module: 'esnext',
            target: 'es2022',
            jsx: 'react-jsx',
            moduleResolution: 'bundler',
            strict: true,
            skipLibCheck: true,
          },
          include: ['*.tsx', '*.d.ts'],
        },
        null,
        2,
      ),
    );

    try {
      execFileSync('pnpm', ['exec', 'tsc', '--project', 'tsconfig.json', '--noEmit'], {
        cwd: projectDir,
        stdio: 'pipe',
      });
    } finally {
      fs.rmSync(projectDir, {recursive: true, force: true});
    }
  });

  it('references the variants file from the main .d.ts so the augmentation loads', async () => {
    const themeFile = writeTheme(
      tmpDir,
      `export default {
        name: 'variants-theme',
        tokens: { '--color-bg': '#fff' },
        components: {
          button: { 'variant:accentOutline': { backgroundColor: 'transparent' } },
        },
      };\n`,
    );

    const result = await runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const dts = fs.readFileSync(
      path.join(tmpDir, 'variants-theme.d.ts'),
      'utf-8',
    );
    // A triple-slash reference to the variants file, so importing the theme's
    // types also loads the module augmentation.
    expect(dts).toMatch(
      /\/\/\/\s*<reference path="\.\/variants-theme\.variants\.d\.ts"\s*\/>/,
    );
  });
});
