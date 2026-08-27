// Copyright (c) Meta Platforms, Inc. and affiliates.

const MAINTAINER_PERMISSIONS = new Set(['maintain', 'admin']);
const REPO_OWNER_ROLE = 'Repo Owner';

export function visualAcceptanceIdentity(permissionLevel = {}) {
  const permission = permissionLevel.permission ?? 'none';
  const effectivePermission = permissionLevel.user?.permissions?.admin
    ? 'admin'
    : permissionLevel.user?.permissions?.maintain
      ? 'maintain'
      : permission;
  return {
    permission,
    roleName: permissionLevel.role_name ?? null,
    effectivePermission,
  };
}

export function isVisualAcceptanceMaintainer({
  permission,
  roleName,
  effectivePermission = permission,
} = {}) {
  return (
    MAINTAINER_PERMISSIONS.has(effectivePermission) ||
    roleName === REPO_OWNER_ROLE
  );
}
