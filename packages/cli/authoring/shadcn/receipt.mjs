// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared provenance receipt contract for ShadCN-copied Astryx source.
 * @input A stable registry identity and the exact copied source bytes.
 * @output Validated, deterministic receipts used by registry generation and upgrade.
 * @position Protocol boundary between the public ShadCN registry and `astryx upgrade`.
 */

import {createHash} from 'node:crypto';
import * as path from 'node:path';
import {z} from 'zod';

export const REGISTRY_RECEIPT_SCHEMA_VERSION = 1;
export const PUBLIC_SHADCN_REGISTRY_ORIGIN = 'https://astryx.atmeta.com/shadcn';

const receiptTargetSchema = z
  .string()
  .regex(/^\.\.\/[^/\\]+$/, 'must point to one adjacent source file');

const registryFilePathSchema = z
  .string()
  .min(1)
  .refine(value => !path.posix.isAbsolute(value), 'must be relative')
  .refine(value => !value.includes('\\'), 'must use forward slashes')
  .refine(
    value =>
      value
        .split('/')
        .every(
          segment => segment !== '' && segment !== '.' && segment !== '..',
        ),
    'must be a normalized registry path',
  );

const registryPathSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    'must be a lowercase registry path',
  );

const sourceVersionSchema = z
  .string()
  .regex(
    /^(?:canary|\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/,
    'must be canary or an exact semantic version',
  );

export const registryReceiptSchema = z
  .object({
    schemaVersion: z.literal(REGISTRY_RECEIPT_SCHEMA_VERSION),
    item: z
      .object({
        name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        path: registryPathSchema,
        aliases: z.array(registryPathSchema),
        kind: z.enum(['showcase', 'example', 'block', 'page']),
      })
      .strict(),
    source: z
      .object({
        package: z.literal('@astryxdesign/cli'),
        version: sourceVersionSchema,
      })
      .strict(),
    files: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            target: receiptTargetSchema,
            registryTarget: registryFilePathSchema,
            registryPath: registryFilePathSchema,
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
            content: z.string(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((receipt, context) => {
    const identities = [
      {label: 'id', values: receipt.files.map(file => file.id)},
      {label: 'target', values: receipt.files.map(file => file.target)},
      {
        label: 'registryTarget',
        values: receipt.files.map(file => file.registryTarget),
      },
      {
        label: 'registryPath',
        values: receipt.files.map(file => file.registryPath),
      },
    ];
    for (const {label, values} of identities) {
      if (new Set(values).size !== values.length) {
        context.addIssue({
          code: 'custom',
          path: ['files'],
          message: `receipt file ${label} values must be unique`,
        });
      }
    }
  });

const registryUpgradeFileSchema = z
  .object({
    path: registryFilePathSchema,
    type: z.string().min(1),
    target: registryFilePathSchema.optional(),
    content: z.string(),
  })
  .passthrough();

const registryUpgradeItemSchema = z
  .object({
    name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(['registry:block', 'registry:page']),
    files: z.array(registryUpgradeFileSchema).min(1),
  })
  .passthrough();

/** @param {unknown} input */
export function parseRegistryUpgradeItem(input) {
  return registryUpgradeItemSchema.parse(input);
}

/** @param {string} content */
export function registryContentHash(content) {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Place a receipt beside its copied source so custom ShadCN aliases resolve
 * both files through the same root.
 * @param {string} sourceTarget
 * @param {string} itemName
 */
export function registryReceiptTarget(sourceTarget, itemName) {
  const sourceDir = path.posix.dirname(sourceTarget);
  return path.posix.join(sourceDir, '.astryx', `${itemName}.json`);
}

/**
 * @param {{
 *   item: {name: string, path: string, aliases: string[], kind: 'showcase'|'example'|'block'|'page'},
 *   sourceVersion: string,
 *   receiptTarget: string,
 *   files: Array<{id: string, target: string, registryPath: string, content: string}>,
 * }} input
 */
export function createRegistryReceipt(input) {
  const receiptDir = path.posix.dirname(input.receiptTarget);
  const receipt = {
    schemaVersion: REGISTRY_RECEIPT_SCHEMA_VERSION,
    item: input.item,
    source: {
      package: '@astryxdesign/cli',
      version: input.sourceVersion,
    },
    files: input.files.map(file => ({
      id: file.id,
      target: path.posix.relative(receiptDir, file.target),
      registryTarget: file.target,
      registryPath: file.registryPath,
      sha256: registryContentHash(file.content),
      content: file.content,
    })),
  };
  return registryReceiptSchema.parse(receipt);
}

/** @param {unknown} input */
export function parseRegistryReceipt(input) {
  return registryReceiptSchema.parse(input);
}

/** @param {ReturnType<typeof createRegistryReceipt>} receipt */
export function serializeRegistryReceipt(receipt) {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}
