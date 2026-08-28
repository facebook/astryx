// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {
  isVisualAcceptanceEndpointMaintainer,
  isVisualAcceptanceRecordMaintainer,
  visualAcceptanceIdentity,
} from './authorization.mjs';

const endpointAllows = payload =>
  isVisualAcceptanceEndpointMaintainer(visualAcceptanceIdentity(payload));

const payload = (permission, permissions, roleName = 'Custom role') => ({
  permission,
  role_name: roleName,
  user: {permissions},
});

describe('visual acceptance endpoint authorization', () => {
  it.each([
    [
      'repository owner with effective maintain capability',
      payload('write', {maintain: true}, 'Repo Owner'),
      true,
    ],
    ['effective maintainer', payload('write', {maintain: true}), true],
    ['effective administrator', payload('write', {admin: true}), true],
    ['ordinary writer', payload('write', {admin: false, maintain: false}), false],
    [
      'top-level admin overridden by nested false capabilities',
      payload('admin', {admin: false, maintain: false}),
      false,
    ],
    [
      'top-level maintain overridden by nested false capabilities',
      payload('maintain', {admin: false, maintain: false}),
      false,
    ],
    [
      'repository owner role without effective capability',
      payload('write', {admin: false, maintain: false}, 'Repo Owner'),
      false,
    ],
    ['string true capability', payload('write', {maintain: 'true'}), false],
    ['string false capability', payload('write', {maintain: 'false'}), false],
    ['null capabilities', payload('admin', null), false],
    ['array capabilities', payload('admin', [true]), false],
    ['missing capability fields', payload('admin', {}), false],
    ['missing capability object', {permission: 'admin', user: {}}, false],
    ['unknown collaborator', {}, false],
  ])('%s', (_label, endpointPayload, expected) => {
    expect(endpointAllows(endpointPayload)).toBe(expected);
  });

  it('keeps reported permission and role as provenance', () => {
    expect(
      visualAcceptanceIdentity(
        payload('write', {maintain: true}, 'Repo Owner'),
      ),
    ).toEqual({
      permission: 'write',
      roleName: 'Repo Owner',
      effectivePermission: 'maintain',
    });
  });
});

describe('visual acceptance record compatibility', () => {
  it.each([
    ['legacy maintainer', {permission: 'maintain'}, true],
    ['legacy administrator', {permission: 'admin'}, true],
    ['legacy writer', {permission: 'write'}, false],
    [
      'new record never falls back to raw admin',
      {permission: 'admin', effectivePermission: 'none'},
      false,
    ],
    [
      'new effective maintainer',
      {permission: 'write', effectivePermission: 'maintain'},
      true,
    ],
    [
      'new effective administrator',
      {permission: 'write', effectivePermission: 'admin'},
      true,
    ],
  ])('%s', (_label, record, expected) => {
    expect(isVisualAcceptanceRecordMaintainer(record)).toBe(expected);
  });
});
