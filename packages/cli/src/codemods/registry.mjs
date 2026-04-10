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
  ['0.0.8', () => import('./transforms/v0.0.8/index.mjs')],
  ['0.0.10', () => import('./transforms/v0.0.10/index.mjs')],
  ['0.0.12', () => import('./transforms/v0.0.12/index.mjs')],
]);

/**
 * Compare two semver strings numerically.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function semverCompare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

/**
 * All registered versions, sorted ascending.
 */
export const versions = [...registry.keys()].sort(semverCompare);

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
  const applicable = versions.filter(
    (v) => semverCompare(v, from) > 0 && semverCompare(v, to) <= 0,
  );
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
