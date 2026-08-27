// Copyright (c) Meta Platforms, Inc. and affiliates.

const MAINTAINER_PERMISSIONS = new Set(['maintain', 'admin']);

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
