import {describe, it, expect} from 'vitest';
import {validateOutput, fixDirectiveCorruption} from '../runner.mjs';

async function getJscodeshift(parser = 'tsx') {
  const jscodeshift = (await import('jscodeshift')).default;
  return jscodeshift.withParser(parser);
}

describe('validateOutput', () => {
  it('accepts valid transformed output', async () => {
    const j = await getJscodeshift();
    const source = '<XDSButton variant="primary" />';
    const result = '<XDSButton container="primary" />';
    expect(validateOutput(result, source, j)).toEqual({valid: true});
  });

  it('rejects output with syntax errors', async () => {
    const j = await getJscodeshift();
    const source = 'const x = 1;';
    const result = 'const x = {{{;';
    const validation = validateOutput(result, source, j);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toMatch(/unparseable/);
  });

  it('rejects [native code] corruption in parseable output', async () => {
    const j = await getJscodeshift();
    // This is syntactically valid JS but contains corruption
    const source = 'const name = "toString";';
    const result = 'const name = "[native code] toString";';
    const validation = validateOutput(result, source, j);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toMatch(/corruption/);
  });

  it('allows pre-existing [native code] strings', async () => {
    const j = await getJscodeshift();
    const source = 'const msg = "[native code] is a thing";';
    const result = 'const msg = "[native code] is a thing";\nconst x = 1;';
    expect(validateOutput(result, source, j)).toEqual({valid: true});
  });

  it('catches prototype pollution that produces unparseable output', async () => {
    const j = await getJscodeshift();
    const source = `
import {lineHeightVars} from '@xds/core/tokens';
const x = someValue.toString();
`;
    // Buggy codemod replaces toString identifier with native function string
    const result = `
import {typeScaleVars} from '@xds/core/tokens';
const x = someValue.function toString() { [native code] }();
`;
    const validation = validateOutput(result, source, j);
    expect(validation.valid).toBe(false);
    // Could fail on parse OR corruption pattern — either is correct
    expect(validation.reason).toMatch(/unparseable|corruption|native/i);
  });

  it('rejects when new [native code] appears even if parseable', async () => {
    const j = await getJscodeshift();
    const source = 'const x = "hello";';
    // Someone somehow produced valid JS with [native code] in a string
    const result = 'const x = "function toString() { [native code] }";';
    const validation = validateOutput(result, source, j);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toMatch(/corruption/);
  });
});

describe('fixDirectiveCorruption', () => {
  it('fixes double semicolon on use client', () => {
    const input = "'use client';;\nimport {X} from 'y';";
    expect(fixDirectiveCorruption(input)).toBe("'use client';\nimport {X} from 'y';");
  });

  it('fixes double semicolon on use server', () => {
    const input = "'use server';;\nimport {X} from 'y';";
    expect(fixDirectiveCorruption(input)).toBe("'use server';\nimport {X} from 'y';");
  });

  it('fixes double semicolon on use strict', () => {
    const input = "'use strict';;\nvar x = 1;";
    expect(fixDirectiveCorruption(input)).toBe("'use strict';\nvar x = 1;");
  });

  it('handles double-quoted directives', () => {
    const input = '"use client";;\nimport {X} from "y";';
    expect(fixDirectiveCorruption(input)).toBe('"use client";\nimport {X} from "y";');
  });

  it('does not modify correct directives', () => {
    const input = "'use client';\nimport {X} from 'y';";
    expect(fixDirectiveCorruption(input)).toBe(input);
  });

  it('does not modify double semicolons elsewhere', () => {
    const input = "for (;;) {}";
    expect(fixDirectiveCorruption(input)).toBe(input);
  });

  it('handles whitespace between semicolons', () => {
    const input = "'use client'; ;\nimport {X} from 'y';";
    expect(fixDirectiveCorruption(input)).toBe("'use client';\nimport {X} from 'y';");
  });
});
