// Copyright (c) Meta Platforms, Inc. and affiliates.

const MAINTAINER_PERMISSIONS = new Set(['maintain', 'admin']);
const FULL_SHA = /^[0-9a-f]{40}$/;

export function visualAcceptanceEvidencePath({pr, head, run, attempt}) {
  for (const [name, value] of Object.entries({pr, run, attempt})) {
    if (!Number.isSafeInteger(Number(value)) || Number(value) <= 0) {
      throw new Error(`${name} must be a positive integer`);
    }
  }
  if (!FULL_SHA.test(String(head ?? ''))) {
    throw new Error('head must be a full lowercase SHA');
  }
  return `pr/${Number(pr)}/visual/${head}/${Number(run)}/${Number(attempt)}/evidence.json`;
}

function isCapabilityObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function visualAcceptanceIdentity(permissionLevel = {}) {
  const capabilities = permissionLevel.user?.permissions;
  const effectivePermission = isCapabilityObject(capabilities)
    ? capabilities.admin === true
      ? 'admin'
      : capabilities.maintain === true
        ? 'maintain'
        : 'none'
    : 'none';
  return {
    permission:
      typeof permissionLevel.permission === 'string'
        ? permissionLevel.permission
        : 'none',
    roleName:
      typeof permissionLevel.role_name === 'string'
        ? permissionLevel.role_name
        : null,
    effectivePermission,
  };
}

export function isVisualAcceptanceEndpointMaintainer({
  effectivePermission,
} = {}) {
  return MAINTAINER_PERMISSIONS.has(effectivePermission);
}

export function isVisualAcceptanceRecordMaintainer({
  permission,
  effectivePermission,
} = {}) {
  return MAINTAINER_PERMISSIONS.has(
    effectivePermission === undefined ? permission : effectivePermission,
  );
}
