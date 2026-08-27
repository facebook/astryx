// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {
  isVisualAcceptanceMaintainer,
  visualAcceptanceIdentity,
} from './authorization.mjs';

const endpointIdentity = overrides =>
  visualAcceptanceIdentity({
    permission: 'write',
    role_name: 'Custom role',
    user: {
      permissions: {
        admin: false,
        maintain: false,
        pull: true,
        push: true,
        triage: true,
      },
    },
    ...overrides,
  });

describe('visual acceptance authorization', () => {
  it.each([
    ['repository owner', endpointIdentity({role_name: 'Repo Owner'}), true],
    [
      'effective maintainer',
      endpointIdentity({user: {permissions: {maintain: true}}}),
      true,
    ],
    [
      'effective administrator',
      endpointIdentity({user: {permissions: {admin: true}}}),
      true,
    ],
    ['ordinary writer', endpointIdentity(), false],
    ['missing collaborator response', visualAcceptanceIdentity(), false],
    ['unknown permission', {permission: 'unknown'}, false],
    ['unknown role', {permission: 'write', roleName: 'Owner'}, false],
    ['legacy maintainer record', {permission: 'maintain'}, true],
    ['legacy administrator record', {permission: 'admin'}, true],
  ])('%s', (_label, identity, expected) => {
    expect(isVisualAcceptanceMaintainer(identity)).toBe(expected);
  });

  it('keeps the endpoint permission and role for the acceptance record', () => {
    expect(
      visualAcceptanceIdentity({
        permission: 'write',
        role_name: 'Repo Owner',
        user: {permissions: {maintain: true}},
      }),
    ).toMatchObject({
      permission: 'write',
      roleName: 'Repo Owner',
      effectivePermission: 'maintain',
    });
  });
});
