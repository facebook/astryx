// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createConfig} from './config.mjs';
import {createIntegration} from './integration.mjs';
import {
  AstryxConfigSchema,
  AstryxIntegrationSchema,
} from './lib/config-schema.mjs';

// createConfig/createIntegration are now pure typed-identity helpers: they
// return their argument unchanged and perform NO runtime validation. Validation
// happens at the LOAD boundary (loadModuleWithSchema against the schemas below),
// so the rejection cases that used to assert factory throws now assert the
// schema rejects the same shapes.

describe('createConfig (typed identity)', () => {
  it('returns the config unchanged', () => {
    const config = {integrations: ['@acme/widgets']};
    expect(createConfig(config)).toBe(config);
    expect(createConfig({})).toEqual({});
  });

  it('does NOT validate — returns invalid shapes unchanged', () => {
    const bogus = {packages: ['./libs']};
    expect(createConfig(bogus)).toBe(bogus);
    const badIntegrations = {integrations: '@acme/widgets'};
    expect(createConfig(badIntegrations)).toBe(badIntegrations);
  });
});

describe('AstryxConfigSchema (load-boundary validation)', () => {
  it('accepts a valid minimal config', () => {
    expect(AstryxConfigSchema.parse({})).toEqual({});
    expect(
      AstryxConfigSchema.parse({integrations: ['@acme/widgets']}),
    ).toEqual({integrations: ['@acme/widgets']});
  });

  it('accepts hooks.postCodemod with a buildCommand function', () => {
    const config = {
      hooks: {postCodemod: [{name: 'format', buildCommand: () => null}]},
    };
    expect(() => AstryxConfigSchema.parse(config)).not.toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() => AstryxConfigSchema.parse({packages: ['./libs']})).toThrow(
      /packages|Unrecognized/,
    );
  });

  it('rejects a non-array integrations field', () => {
    expect(() =>
      AstryxConfigSchema.parse({integrations: '@acme/widgets'}),
    ).toThrow();
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(() => AstryxConfigSchema.parse({issuesUrl: 'not-a-url'})).toThrow();
  });

  it('rejects a postCodemod hook without buildCommand', () => {
    expect(() =>
      AstryxConfigSchema.parse({hooks: {postCodemod: [{name: 'empty'}]}}),
    ).toThrow();
  });
});

describe('createIntegration (typed identity)', () => {
  it('returns the integration unchanged', () => {
    const integration = {components: './src'};
    expect(createIntegration(integration)).toBe(integration);
    expect(createIntegration({})).toEqual({});
  });

  it('does NOT validate — returns invalid shapes unchanged', () => {
    const bogus = {name: '@acme/widgets'};
    expect(createIntegration(bogus)).toBe(bogus);
  });
});

describe('AstryxIntegrationSchema (load-boundary validation)', () => {
  it('accepts a valid minimal integration', () => {
    expect(AstryxIntegrationSchema.parse({components: './src'})).toEqual({
      components: './src',
    });
    expect(AstryxIntegrationSchema.parse({})).toEqual({});
  });

  it('rejects unknown keys (strict)', () => {
    expect(() => AstryxIntegrationSchema.parse({name: '@acme/widgets'})).toThrow(
      /name|Unrecognized/,
    );
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(() => AstryxIntegrationSchema.parse({issuesUrl: 'nope'})).toThrow();
  });
});
