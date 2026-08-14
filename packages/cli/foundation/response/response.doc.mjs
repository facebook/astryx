// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the Astryx CLI JSON output envelope (the `astryx --json`
 * contract). Colocated with the serializer (`json.mjs`) and shared types
 * (`base.d.ts`) it documents.
 * @position packages/cli/foundation/response — schema documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'output',
  displayName: 'Output Envelope',
  namespace: 'cli',
  description:
    'The single JSON envelope every command emits under --json. Success is ' +
    '{ apiVersion, type, data, meta? }; failure is { apiVersion, error, code, ' +
    'suggestions? }. Discriminate by checking whether `error` is present.',
  appliesTo: 'astryx --json',
  fields: [
    {
      name: 'Success envelope',
      type: '{ apiVersion: number; type: string; data: unknown; meta?: Record<string, unknown> }',
      description:
        'Emitted for every successful command in --json mode: a type ' +
        'discriminator, its data payload, and an optional meta sidecar.',
      fields: [
        {
          name: 'apiVersion',
          type: 'number',
          description:
            'Version of the JSON envelope contract. Bump on breaking shape ' +
            'changes so consumers can negotiate. Currently 1.',
          required: true,
          example: '1',
        },
        {
          name: 'type',
          type: 'string',
          description:
            'Discriminator naming the payload shape. Each command guarantees ' +
            'its own `type` at its return; there is no central union.',
          required: true,
        },
        {
          name: 'data',
          type: 'unknown',
          description:
            "The command's payload. Structural by design, narrowed by the " +
            'per-command return type, not by a map in the serializer.',
          required: true,
        },
        {
          name: 'meta',
          type: 'Record<string, unknown>',
          description:
            'Optional sidecar, emitted as a sibling of data (never merged in).',
        },
      ],
    },
    {
      name: 'Error envelope',
      type: '{ apiVersion: number; error: string; code: ErrorCode; suggestions?: Suggestion[] }',
      description:
        'Emitted for every failure in --json mode, including uncaught throws ' +
        'and Commander parse errors, which are converted to this shape.',
      fields: [
        {
          name: 'apiVersion',
          type: 'number',
          description:
            'The same contract version carried on the success envelope.',
          required: true,
          example: '1',
        },
        {
          name: 'error',
          type: 'string',
          description:
            'Human-readable message. It is for people and changes freely, so ' +
            'never branch on it.',
          required: true,
        },
        {
          name: 'code',
          type: 'ErrorCode',
          description:
            'Stable, machine-readable identifier; always present, append-only, ' +
            'and never changes meaning. Branch on this.',
          required: true,
          example: "'ERR_UNKNOWN_COMPONENT'",
        },
        {
          name: 'suggestions',
          type: 'Suggestion[]',
          description:
            'Optional "did you mean..." hints, present only when candidates exist.',
          fields: [
            {
              name: 'suggestions[].name',
              type: 'string',
              description:
                'The suggested value (e.g. a candidate component name).',
              required: true,
            },
            {
              name: 'suggestions[].reason',
              type: 'string',
              description:
                'Optional per-item explanation; some call sites emit a bare ' +
                'name with no reason.',
            },
          ],
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Success',
      code: `{
  "apiVersion": 1,
  "type": "component",
  "data": { "name": "Button" }
}`,
    },
    {
      label: 'Error',
      code: `{
  "apiVersion": 1,
  "error": "No component named \\"Buton\\"",
  "code": "ERR_UNKNOWN_COMPONENT",
  "suggestions": [{ "name": "Button" }]
}`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text:
        'The human-readable (text) output is a deterministic projection of this ' +
        'same JSON: --json exposes the structured source of truth, and the ' +
        'default format is rendered from the same data.',
    },
    {
      type: 'prose',
      text:
        '`code` is the stable contract; see the error-codes enum (ErrorCode) ' +
        'for the full append-only list. Branch on `code`, never on the `error` ' +
        'prose, which can be reworded or localized at any time.',
    },
    {
      type: 'prose',
      text:
        'The process exit code is part of the contract too: successful commands ' +
        'exit 0, and a JSON error envelope is accompanied by a non-zero exit ' +
        '(jsonError exits 1).',
    },
  ],
};
