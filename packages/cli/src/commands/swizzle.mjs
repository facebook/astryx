// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle command — Copy component source for customization
 *
 * Resolves a component's owning package (core or a configured integration),
 * copies its non-test/non-doc source files to the output directory, and
 * rewrites escaping relative imports to use the OWNER package's subpaths.
 *
 * After swizzling, prints a short maintainer feedback note pointing users at
 * the owner's issue tracker so they can let the team know what gap led them to
 * customize the component. The core feedback URL is routed through app config
 * (`config.issuesUrl`); integration components use their manifest `issuesUrl`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findCoreDir, listComponents} from '../utils/paths.mjs';
import {
  assertWithin,
  PathSafetyError,
  isNonInteractive,
} from '../utils/path-safety.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {checkGhCli} from '../utils/github.mjs';
import {Project} from '../lib/project.mjs';
import {
  CORE_PACKAGE,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
} from '../lib/component-discovery.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports that stay inside the copied component
 * tree (and same-level `./x` imports) are left untouched.
 *
 * e.g. with ownerPackage '@astryxdesign/core':
 *      '../theme/tokens.stylex' -> '@astryxdesign/core/theme'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
 *
 * `ownerPackage` defaults to '@astryxdesign/core' so existing core behavior is
 * unchanged; integration components pass their own owning package.
 *
 * When `location` is supplied (`{fromDir, componentDir}`), rewriting is
 * location-aware: each `../` import is resolved from the source file's own
 * directory, and only imports that actually escape `componentDir` are
 * rewritten. This keeps intra-component imports from NESTED files relative —
 * e.g. `../../types` in `Table/plugins/pagination/*` still points at the
 * copied `Table/types` rather than becoming a broken `@astryxdesign/core/..`.
 * Without `location`, the legacy behavior applies (every `../` is treated as
 * escaping and mapped by its first segment) — correct for top-level files and
 * preserved for existing callers/tests.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {{fromDir: string, componentDir: string}} [location]
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, location) {
  // Match import/export from statements with relative paths going up
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (location) {
        const {fromDir, componentDir} = location;
        const resolved = path.resolve(fromDir, importPath);
        const relFromComponent = path.relative(componentDir, resolved);
        // Stays inside the copied component tree — leave it relative so it
        // resolves against the sibling files we also copied.
        if (
          relFromComponent === '' ||
          (!relFromComponent.startsWith('..') &&
            !path.isAbsolute(relFromComponent))
        ) {
          return match;
        }
        // Escapes the component: map to the owner subpath. The owner exposes
        // each top-level src dir as a package subpath, so take the first
        // segment below the component's parent (e.g. src/theme -> theme).
        const parentDir = path.dirname(componentDir);
        const topDir = path.relative(parentDir, resolved).split(path.sep)[0];
        return `${prefix}${ownerPackage}/${topDir}${suffix}`;
      }

      // Legacy mode (no location context): treat every ../ as escaping.
      // e.g. '../theme/tokens.stylex' -> 'theme'
      // e.g. '../utils/mergeProps' -> 'utils'
      const parts = importPath.replace(/^\.\.\//, '').split('/');
      const topDir = parts[0];

      // Map to the owner package subpath
      return `${prefix}${ownerPackage}/${topDir}${suffix}`;
    },
  );
}

/**
 * Build the maintainer feedback note for a swizzled component.
 *
 * Returns { issuesUrl, ghCommand? } or null when no issues URL is available
 * (an integration that ships no `issuesUrl`). When the issues URL is a GitHub
 * issues URL and the `gh` CLI is available, a ready-to-run `gh issue create`
 * command is included so the user can file feedback without leaving the
 * terminal.
 *
 * @param {string} component bare component name (used in the issue title)
 * @param {string|undefined} issuesUrl owner's issue tracker URL
 * @returns {{issuesUrl: string, ghCommand?: string} | null}
 */
function buildFeedback(component, issuesUrl) {
  if (!issuesUrl) return null;

  const feedback = {issuesUrl};

  // Accept any github.com/<owner>/<repo>/issues(/new)? form.
  const match = issuesUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues(?:\/new)?\/?$/,
  );
  if (match && checkGhCli()) {
    const [, owner, repo] = match;
    feedback.ghCommand = `gh issue create --repo ${owner}/${repo} --title "[${component}] Swizzle feedback"`;
  }

  return feedback;
}

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

/**
 * Load the configured integrations + core issues URL for `cwd`, swallowing any
 * config errors so swizzle never hard-fails on a malformed/absent config. An
 * empty list means "core only". The core issues URL is routed through the
 * Project (config.issuesUrl, falling back to the default core tracker).
 * @param {string} cwd
 * @returns {Promise<{loadedIntegrations: Array<object>, issuesUrl: string|undefined, project: Project|null}>}
 */
async function loadConfigSafely(cwd) {
  try {
    const project = await Project.load(cwd);
    return {
      loadedIntegrations: project.loadedIntegrations,
      issuesUrl: project.config.issuesUrl,
      project,
    };
  } catch {
    return {loadedIntegrations: [], issuesUrl: undefined, project: null};
  }
}

/**
 * Build the set of OWNER packages that provide a component with `name` across
 * core + every loaded integration.
 *
 * Core ownership is determined by the source directory existing on disk
 * (`coreDir/src/<name>`) so plain core components without a `.doc.mjs` still
 * resolve as today. Integration ownership is determined by a same-stem doc file
 * (`<name>.doc.{ts,mjs,js}`) via findIntegrationComponentDoc.
 *
 * @param {string} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} loadedIntegrations
 * @param {string} name bare component name (no XDS/Astryx prefix)
 * @param {string|undefined} coreIssuesUrl
 * @returns {Array<{package: string, sourceDir: string|null, ownerPackage: string, issuesUrl: string|undefined}>}
 */
function resolveOwners(coreDir, loadedIntegrations, name, coreIssuesUrl) {
  const owners = [];

  const coreComponentDir = path.join(coreDir, 'src', name);
  if (fs.existsSync(coreComponentDir)) {
    owners.push({
      package: CORE_PACKAGE,
      sourceDir: coreComponentDir,
      ownerPackage: CORE_PACKAGE,
      issuesUrl: coreIssuesUrl || DEFAULT_ISSUES_URL,
    });
  }

  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, name);
    if (!docPath) continue;
    const sourcePath = findIntegrationComponentSource(integration, name);
    owners.push({
      package: integration.name,
      // The component's own folder — the directory containing its source.
      sourceDir: sourcePath ? path.dirname(sourcePath) : null,
      ownerPackage: integration.name,
      issuesUrl: integration.issuesUrl,
    });
  }

  return owners;
}

/** Whether a filename should be excluded from the swizzle copy. */
function isExcludedFromCopy(file) {
  return (
    file.includes('.test.') || file.includes('.doc.') || file === 'README.md'
  );
}

/**
 * Recursively collect swizzle-eligible files under `dir`, returned as paths
 * relative to `baseDir` (so nested structure is preserved on copy). Excluded
 * files (tests, docs, README) are skipped at every level. Symlinks are not
 * followed — only real files and directories are traversed.
 *
 * @param {string} dir
 * @param {string} [baseDir]
 * @returns {string[]} relative file paths (e.g. 'index.ts', 'plugins/selection/index.ts')
 */
function collectSourceFiles(dir, baseDir = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (isExcludedFromCopy(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectSourceFiles(full, baseDir));
    } else if (entry.isFile()) {
      out.push(path.relative(baseDir, full));
    }
  }
  return out;
}

export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy component source for customization')
    .option('--output <dir>', 'Output directory', './components/astryx')
    .option('--package <pkg>', 'Scope to a specific owning package')
    .option('--list', 'List available components')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .action(async (component, options) => {
      const coreDir = findCoreDir(process.cwd());
      const json = program.opts().json || false;

      if (!coreDir) {
        cliError(
          'Could not find @astryxdesign/core package. Make sure you are inside the design system monorepo or have @astryxdesign/core installed.',
          {code: ERROR_CODES.ERR_CORE_NOT_FOUND},
        );
        return;
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        if (json) return jsonOut('swizzle.list', components);
        humanLog('\nAvailable components:\n');
        for (const name of components) {
          humanLog(`  ${name}`);
        }
        humanLog(`\nUsage: astryx swizzle <component>\n`);
        humanLog('Example: astryx swizzle Button');
        humanLog(
          '         astryx swizzle XDSButton  (XDS prefix also works)\n',
        );
        return;
      }

      const dirName = component.replace(/^XDS/, '');

      // Resolve the component's owning package(s) across core + integrations.
      const {loadedIntegrations, project} = await loadConfigSafely(
        process.cwd(),
      );
      // Core feedback URL is routed through the Project (config.issuesUrl,
      // falling back to the default core tracker). When config load failed,
      // resolveOwners applies the same default fallback.
      const coreIssuesUrl = project
        ? project.issuesUrl({package: CORE_PACKAGE})
        : undefined;
      const allOwners = resolveOwners(
        coreDir,
        loadedIntegrations,
        dirName,
        coreIssuesUrl,
      );

      if (allOwners.length === 0) {
        cliError(`Component "${component}" not found.`, {
          suggestions: components.slice(0, 10).map(n => ({name: n})),
          code: ERROR_CODES.ERR_UNKNOWN_COMPONENT,
        });
        return;
      }

      let owner;
      if (options.package) {
        owner = allOwners.find(o => o.package === options.package);
        if (!owner) {
          cliError(
            `Component "${dirName}" is not provided by package "${options.package}".`,
            {
              suggestions: allOwners.map(o => ({
                name: o.package,
                reason: 'provides this component',
              })),
              code: ERROR_CODES.ERR_UNKNOWN_COMPONENT,
            },
          );
          return;
        }
      } else if (allOwners.length > 1) {
        cliError(
          `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
          {
            suggestions: allOwners.map(o => ({
              name: o.package,
              reason: 'provides this component',
            })),
            code: ERROR_CODES.ERR_AMBIGUOUS_COMPONENT,
          },
        );
        return;
      } else {
        owner = allOwners[0];
      }

      if (!owner.sourceDir || !fs.existsSync(owner.sourceDir)) {
        cliError(
          `No source found for "${dirName}" in package "${owner.package}".`,
          {code: ERROR_CODES.ERR_NO_SOURCE},
        );
        return;
      }

      const componentDir = owner.sourceDir;

      // Path-safety: --output must resolve inside cwd. Reject absolute
      // paths and `..` traversal up front, before any directory is created.
      let outputBase;
      try {
        outputBase = assertWithin(options.output, process.cwd(), {
          label: 'output directory',
        });
      } catch (err) {
        if (err instanceof PathSafetyError) {
          cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
          return;
        }
        throw err;
      }
      const outputDir = path.join(outputBase, dirName);

      // Pre-flight overwrite check: collect files we'd write (recursively, so
      // nested component source like Table/plugins/* is included) and detect
      // collisions before mkdir/writeFile so we never half-clobber.
      const sourceFiles = collectSourceFiles(componentDir);

      const existingFiles = sourceFiles.filter(f =>
        fs.existsSync(path.join(outputDir, f)),
      );

      if (existingFiles.length > 0 && !options.overwrite) {
        const relOutputForMsg = path.relative(process.cwd(), outputDir) || '.';
        if (json || isNonInteractive({json})) {
          const msg =
            `Refusing to overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/. ` +
            `Re-run with --overwrite (or -f) to replace them.`;
          cliError(msg, {code: ERROR_CODES.ERR_FILE_EXISTS});
          return;
        }
        const confirmed = isCancel(
          await p.confirm({
            message:
              `Overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/? ` +
              `(${existingFiles.slice(0, 3).join(', ')}${existingFiles.length > 3 ? ', …' : ''})`,
            initialValue: false,
          }),
        );
        if (!confirmed) {
          humanLog('Aborted. Re-run with --overwrite to replace files.');
          return;
        }
      }

      fs.mkdirSync(outputDir, {recursive: true});

      // Copy all eligible files, preserving nested directory structure.
      let copied = 0;

      for (const rel of sourceFiles) {
        const srcPath = path.join(componentDir, rel);

        // Path-safety: every destination must stay inside outputDir. `rel`
        // comes from readdir of a trusted tree, but assert defensively before
        // any mkdir/write so a hostile path can never escape the output dir.
        let destPath;
        try {
          destPath = assertWithin(rel, outputDir, {
            label: 'swizzle destination',
          });
        } catch (err) {
          if (err instanceof PathSafetyError) {
            cliError(err.message, {code: ERROR_CODES.ERR_PATH_TRAVERSAL});
            return;
          }
          throw err;
        }

        let content = fs.readFileSync(srcPath, 'utf-8');

        // Rewrite escaping imports for .ts/.tsx files to the owner package.
        // Pass the file's own location so imports that stay inside the copied
        // component tree (common in nested files) are left relative.
        if (rel.endsWith('.ts') || rel.endsWith('.tsx')) {
          content = rewriteImports(content, owner.ownerPackage, {
            fromDir: path.dirname(srcPath),
            componentDir,
          });
        }

        fs.mkdirSync(path.dirname(destPath), {recursive: true});
        fs.writeFileSync(destPath, content);
        copied++;
      }

      const relOutput = path.relative(process.cwd(), outputDir);
      const copiedFiles = sourceFiles;

      const feedback = buildFeedback(dirName, owner.issuesUrl);

      if (json) {
        /** @type {Record<string, unknown>} */
        const payload = {
          component: dirName,
          package: owner.package,
          outputDir: relOutput,
          filesCopied: copied,
          files: copiedFiles.map(f => f),
        };
        if (feedback) payload.feedback = feedback;
        return jsonOut('swizzle.copy', payload);
      }

      humanLog(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      humanLog(
        `Relative imports have been rewritten to use ${owner.ownerPackage}.`,
      );
      humanLog('You can now customize the component source freely.\n');

      // Maintainer feedback note. If we couldn't swizzle cleanly, the team
      // wants to know — point users at the issue tracker. Skipped when the
      // owning package ships no issues URL.
      if (feedback) {
        humanLog(
          'Customizing a component often signals a gap in the design system.',
        );
        humanLog('Let the maintainers know what you needed:');
        if (feedback.ghCommand) {
          humanLog(`  ${feedback.ghCommand}`);
        } else {
          humanLog(`  ${feedback.issuesUrl}`);
        }
        humanLog('');
      }
    });
}
