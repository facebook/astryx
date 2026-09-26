// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the shared parser error formatter. Locks the single
 * message convention every authoring parser depends on: `<label> is invalid:
 * <path>: <message>; <path>: <message>`, using `(root)` for a top-level issue.
 */

import {describe, it, expect} from 'vitest';
import {z} from 'zod';
import {formatZodError} from './errors.mjs';

const schema = z
  .object({
    issuesUrl: z.string().url(),
    integrations: z.array(z.string()),
  })
  .strict();

describe('formatZodError', () => {
  it('renders "label is invalid: path: message"', () => {
    const res = schema.safeParse({issuesUrl: 'bad', integrations: []});
    expect(res.success).toBe(false);
    if (res.success) return;
    const msg = formatZodError('thing', res.error);
    expect(msg).toMatch(/^thing is invalid: /);
    expect(msg).toContain('issuesUrl: ');
  });

  it('uses "(root)" for a top-level (empty-path) issue', () => {
    const res = schema.safeParse(null);
    expect(res.success).toBe(false);
    if (res.success) return;
    expect(formatZodError('thing', res.error)).toContain('(root): ');
  });

  it('joins multiple issues with "; "', () => {
    const res = schema.safeParse({
      issuesUrl: 'https://ok.example',
      integrations: [1, 2],
    });
    expect(res.success).toBe(false);
    if (res.success) return;
    const msg = formatZodError('thing', res.error);
    expect(msg).toContain('; ');
    expect(msg).toContain('integrations.0');
    expect(msg).toContain('integrations.1');
  });
});
