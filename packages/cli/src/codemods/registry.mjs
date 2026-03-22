/**
 * @file Codemod version registry
 *
 * Maps XDS versions to their transform manifests. Used by the upgrade
 * command to determine which codemods to run between two versions.
 */

const registry = new Map([
  ['0.0.2', () => import('./transforms/v0.0.2/index.mjs')],
  ['0.0.6', () => import('./transforms/v0.0.6/index.mjs')],
  ['0.0.7', () => import('./transforms/v0.0.7/index.mjs')],
]);

/**
 * All registered versions, sorted ascending.
 */
export const versions = [...registry.keys()].sort();

/**
 * The latest version in the registry.
 */
export const latestVersion = versions[versions.length - 1];

/**
 * Get all transform manifests between two versions (exclusive of `from`, inclusive of `to`).
 * Returns an array of {version, transforms} objects sorted ascending.
 *
 * @param {string} from - Current version (exclusive)
 * @param {string} to - Target version (inclusive)
 * @returns {Promise<Array<{version: string, transforms: Array<{name: string, module: Function}>}>>}
 */
export async function getTransformsBetween(from, to) {
  const applicable = versions.filter((v) => v > from && v <= to);
  const results = [];

  for (const version of applicable) {
    const loader = registry.get(version);
    const manifest = await loader();
    results.push({
      version,
      transforms: manifest.default,
    });
  }

  return results;
}
