// Copyright (c) Meta Platforms, Inc. and affiliates.

export const CAPABILITY_GROUPS = ['builtIns', 'skills', 'mcpServers', 'hooks'];

export function parseCapabilityReceipt(text) {
  let receipt;
  try {
    receipt = JSON.parse(text.trim());
  } catch (error) {
    throw new Error(
      `Capability adapter must emit one JSON object: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    throw new Error('Capability adapter must emit one JSON object.');
  }
  if (receipt.schemaVersion !== 1) {
    throw new Error('Capability adapter schemaVersion must be 1.');
  }
  return Object.fromEntries(
    CAPABILITY_GROUPS.map(group => [
      group,
      normalizeStringList(receipt[group], `capability.${group}`),
    ]),
  );
}

export function compareCapabilities(expected, observed) {
  const normalizedExpected = Object.fromEntries(
    CAPABILITY_GROUPS.map(group => [
      group,
      normalizeStringList(expected[group], `expectedCapabilities.${group}`),
    ]),
  );
  const missing = {};
  const additional = {};
  for (const group of CAPABILITY_GROUPS) {
    const expectedSet = new Set(normalizedExpected[group]);
    const observedSet = new Set(observed[group]);
    missing[group] = normalizedExpected[group].filter(
      capability => !observedSet.has(capability),
    );
    additional[group] = observed[group].filter(
      capability => !expectedSet.has(capability),
    );
  }
  return {
    passed: CAPABILITY_GROUPS.every(group => missing[group].length === 0),
    expected: normalizedExpected,
    observed,
    missing,
    additional,
  };
}

function normalizeStringList(value, label) {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
    throw new Error(`${label} must be an array of strings.`);
  }
  return [...new Set(value)].sort();
}
