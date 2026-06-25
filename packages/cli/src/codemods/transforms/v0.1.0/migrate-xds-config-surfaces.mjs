// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate XDS config surfaces to Astryx v0.1.0
 *
 * The v0.1.0 CLI reads astryx.config.mjs. This config codemod migrates
 * legacy xds.config.mjs and package.json's top-level `xds` config without
 * changing dependency names or versions.
 */

export const meta = {
  title: 'Migrate xds config surfaces to astryx',
  description:
    'Moves legacy package.json xds config into astryx.config.mjs, or renames ' +
    'xds.config.mjs when no package.json config exists. Bails out if both exist.',
  pr: '#3092',
  codemodType: 'config',
};

function findTopLevelKey(source, targetKey) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let stringStart = -1;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch !== '"') continue;

      inString = false;
      const rawKey = source.slice(stringStart + 1, i);
      if (depth !== 1 || rawKey !== targetKey) continue;

      let j = i + 1;
      while (/\s/.test(source[j] ?? '')) j++;
      if (source[j] !== ':') continue;

      const valueStart = j + 1;
      const value = readJsonValue(source, valueStart);
      if (!value) return null;
      return {keyStart: stringStart, keyEnd: i + 1, colon: j, ...value};
    }

    if (ch === '"') {
      inString = true;
      stringStart = i;
      continue;
    }
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;
  }
  return null;
}

function readJsonValue(source, start) {
  let i = start;
  while (/\s/.test(source[i] ?? '')) i++;
  const valueStart = i;
  let inString = false;
  let escaped = false;
  let depth = 0;

  for (; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{' || ch === '[') {
      depth++;
      continue;
    }
    if (ch === '}' || ch === ']') {
      if (depth === 0) break;
      depth--;
      continue;
    }
    if (depth === 0 && ch === ',') break;
  }

  const valueEnd = i;
  const rawValue = source.slice(valueStart, valueEnd).trim();
  try {
    JSON.parse(rawValue);
  } catch {
    return null;
  }
  return {valueStart, valueEnd, rawValue, terminator: source[i]};
}

function removeTopLevelProperty(source, property) {
  let removeStart = property.keyStart;
  let removeEnd = property.valueEnd;

  if (source[removeEnd] === ',') {
    removeEnd++;
    if (source[removeEnd] === '\n') removeEnd++;
    return source.slice(0, removeStart) + source.slice(removeEnd);
  }

  let i = removeStart - 1;
  while (/\s/.test(source[i] ?? '')) i--;
  if (source[i] === ',') {
    const whitespaceBetweenCommaAndKey = source.slice(i + 1, removeStart);
    const preservedWhitespace = whitespaceBetweenCommaAndKey.includes('\n')
      ? '\n'
      : '';
    return source.slice(0, i) + preservedWhitespace + source.slice(removeEnd);
  }

  return source.slice(0, removeStart) + source.slice(removeEnd);
}

function formatConfigSource(rawConfig) {
  const parsed = JSON.parse(rawConfig);
  return `export default ${JSON.stringify(parsed, null, 2)};\n`;
}

function migratePackageJsonConfig(config) {
  if (!config.packageJson) return {changes: []};

  const packageJson = config.packageJson.source;
  const xdsConfig = findTopLevelKey(packageJson, 'xds');
  const astryxConfig = findTopLevelKey(packageJson, 'astryx');
  if (!xdsConfig && !astryxConfig) return {changes: []};

  if (config.astryxConfig) {
    return {
      errors: [
        {
          file: 'package.json',
          error:
            'package.json contains xds/astryx config and astryx.config.mjs already exists; migrate the config manually.',
        },
      ],
    };
  }

  if (xdsConfig && astryxConfig) {
    return {
      errors: [
        {
          file: 'package.json',
          error:
            'package.json contains both xds and astryx config keys; migrate the config manually.',
        },
      ],
    };
  }

  const configProperty = astryxConfig ?? xdsConfig;
  const packageJsonWithoutConfig = removeTopLevelProperty(
    packageJson,
    configProperty,
  );
  return {
    changes: [
      {path: 'package.json', source: packageJsonWithoutConfig},
      {
        path: 'astryx.config.mjs',
        source: formatConfigSource(configProperty.rawValue),
      },
    ],
  };
}

function migrateXdsConfigFile(config) {
  if (!config.xdsConfig) return {changes: []};
  if (config.astryxConfig) {
    return {
      errors: [
        {
          file: 'xds.config.mjs',
          error:
            'xds.config.mjs and astryx.config.mjs both exist; migrate the config manually.',
        },
      ],
    };
  }
  return {
    changes: [
      {path: 'astryx.config.mjs', source: config.xdsConfig.source},
      {path: 'xds.config.mjs', delete: true},
    ],
  };
}

export default function transformer(_file, api) {
  const config = api.config ?? {};
  const packageResult = migratePackageJsonConfig(config);
  if (packageResult.errors?.length) return packageResult;
  if (packageResult.changes?.length) {
    if (config.xdsConfig) {
      return {
        errors: [
          {
            file: 'package.json',
            error:
              'package.json contains xds/astryx config and xds.config.mjs exists; migrate the config manually.',
          },
        ],
      };
    }
    return packageResult;
  }

  return migrateXdsConfigFile(config);
}
