// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Deterministic, collision-safe ESM binding allocation for family output. */

const RESERVED = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

/** @param {string} value */
export function sanitizeBinding(value) {
  const words = value.split(/[^A-Za-z0-9_$]+/).filter(Boolean);
  let candidate = words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
  candidate = candidate.replace(/^[^A-Za-z_$]+/, '');
  candidate = candidate.replace(/[^A-Za-z0-9_$]/g, '');
  if (!candidate) candidate = 'theme';
  if (RESERVED.has(candidate)) candidate = `_${candidate}`;
  return candidate;
}

/** @param {string[]} names */
export function allocateMemberBindings(names) {
  const used = new Set(RESERVED);
  const result = new Map();
  for (const name of names) {
    const base = `${sanitizeBinding(name)}Theme`;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) candidate = `${base}_${suffix++}`;
    used.add(candidate);
    result.set(name, candidate);
  }
  return result;
}

/**
 * Allocate legal local names for static imports across the whole family.
 * The same module/export pair is imported once; source-local aliases never
 * define identity and therefore cannot collide in the generated lexical scope.
 *
 * @param {Array<{id: string, specifier: string, importedName: string, importKind?: 'named'|'default'|'namespace', sourceLocalName: string}>} requests
 * @param {Iterable<string>} reserved
 */
export function allocateImportBindings(requests, reserved = []) {
  const used = new Set([...RESERVED, ...reserved]);
  const byImport = new Map();
  const byRequest = new Map();
  const imports = [];

  const ordered = [...requests].sort((a, b) => {
    for (const field of /** @type {Array<'specifier'|'importedName'|'sourceLocalName'|'id'>} */ ([
      'specifier',
      'importedName',
      'sourceLocalName',
      'id',
    ])) {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
    }
    return 0;
  });
  for (const request of ordered) {
    const kind = request.importKind ?? 'named';
    const identity = `${kind}\u0000${request.specifier}\u0000${request.importedName}`;
    let binding = byImport.get(identity);
    if (!binding) {
      const base = sanitizeBinding(request.sourceLocalName);
      binding = base;
      let suffix = 2;
      while (used.has(binding)) binding = `${base}_${suffix++}`;
      used.add(binding);
      byImport.set(identity, binding);
      imports.push({...request, importKind: kind, binding});
    }
    byRequest.set(request.id, binding);
  }
  return {imports, byRequest};
}
