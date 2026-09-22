// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for provider, artifact, and immutable instance identity.
 * @position packages/cli/authoring/identity — identity documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'provider-identity',
  displayName: 'Provider and artifact identity',
  namespace: 'authoring',
  description:
    'Separates stable provider/artifact identity from package instances and runtime lifecycle state.',
  appliesTo: 'Compiler inputs, manifests, search, Build, and Doctor',
  fields: [
    {
      name: 'ProviderId',
      type: 'string',
      description:
        'Canonical logical provider ID. It defaults to the lowercase npm package name; Core uses the same model without publishing an integration manifest.',
      required: true,
    },
    {
      name: 'ArtifactId',
      type: 'string',
      description:
        'Versioned serialization of provider ID, contribution kind, and stable artifact name. Every segment uses RFC 3986 escaping.',
      required: true,
    },
    {
      name: 'DocId',
      type: 'ArtifactId',
      description:
        'Artifact ID restricted to one authored doc kind. Navigation changes do not change it.',
      required: true,
    },
    {
      name: 'ProviderInstance',
      type: '{ id; providerId; packageName; packageVersion; sourceDigest }',
      description:
        'One immutable package version and source/content digest. Installed, configured, loaded, selected, and healthy state is a separate runtime overlay.',
      required: true,
    },
    {
      name: 'AuthoredDocEntry',
      type: '{ id; provider; kind; stableName; source; authored }',
      description:
        'Normalized compiler input. Discovery supplies stableName independently from the authored display name, source paths remain package-relative, and provider provenance plus the authored snapshot are immutable.',
      required: true,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'Provider package renames require an explicit mapping: a ProviderInstance may retain its stable providerId while packageName changes. Silent identity changes are not inferred.',
    },
  ],
};
