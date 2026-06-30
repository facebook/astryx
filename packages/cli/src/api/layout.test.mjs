// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration tests for the layout API against the real @astryxdesign/core
 * registry and real template blocks. Every expansion is additionally
 * checked for TSX syntactic validity with the TypeScript parser, so the
 * "expansion emits compilable JSX" contract is enforced, not assumed.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ts from 'typescript';
import {layoutExpand, layoutCheck, layoutGrammar} from './layout.mjs';
import {buildRegistry} from '../lib/xle/registry.mjs';

// The registry imports ~140 .doc.mjs modules on first use; under full-suite
// parallel load that can exceed the default 5s test timeout. Warm it once.
beforeAll(async () => {
  await buildRegistry();
}, 120_000);

const SLOW = 30_000;

/** Assert TSX parses cleanly; returns the source file for inspection. */
function expectValidTsx(code) {
  const sourceFile = ts.createSourceFile('generated.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const diagnostics = sourceFile.parseDiagnostics || [];
  const messages = diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' '));
  expect(messages).toEqual([]);
  return sourceFile;
}

const LOGIN_COMPACT =
  'Ctr[h="100dvh"] > C[w=400 p8] > V[g6] > ' +
  '(V[g1] > Tx"Welcome back" + Tx[t=supporting]"Sign in to your account") + ' +
  '(F > TI"Email"[t=email req] + TI"Password"[t=password req]) + ' +
  '(H[j=between a=center] > CB"Remember me" + Lk[href="/forgot"]"Forgot password?") + ' +
  'B.primary"Sign in"';

const CHAT_OUTLINE = `
AppShell
  topNav: TN
  Layout > LC !scroll
    ChL
      composer:
        ChC
      ChML
        ChS "Today"
        repeat 2:
          ChM
            ChB "Reply $"
    Tbar "Actions"
      B "Delete" opens=#confirm

overlays:
  AD#confirm "Delete item?"
`;

const DASHBOARD_COMPACT =
  'A[@topNav=TN @sideNav=SN] > L > V[g6] > ' +
  '(G[c4 g4] > C{card-callout}*4) + ' +
  '(C[p0] > T[striped] > (TR > THC"Name" + THC"Amount") + (TR > TC"Order $" + TC"\\$12.00")*3)';

describe('layoutExpand', () => {
  it('expands the login card with typed state scaffolds', async () => {
    const result = await layoutExpand(LOGIN_COMPACT);
    expect(result.type).toBe('layout.expand');
    const {code} = result.data;
    expectValidTsx(code);

    expect(code).toContain(`const [email, setEmail] = useState('');`);
    expect(code).toContain(`const [rememberMe, setRememberMe] = useState(false);`);
    expect(code).toContain('<XDSCenter height="100dvh">');
    expect(code).toContain('variant="primary"');
    // axis-neutral j/a resolved onto the HStack's real props
    expect(code).toContain('hAlign="between"');
    expect(code).toContain('vAlign="center"');
    // payload routed to label props, not duplicated as children
    expect(code).not.toMatch(/label="Forgot password\?"[\s\S]{0,80}Forgot password\?/);
  }, SLOW);

  it('expands the outline chat page: slots, repeat blocks, overlays, triggers', async () => {
    const result = await layoutExpand(CHAT_OUTLINE);
    const {code, form} = result.data;
    expect(form).toBe('outline');
    expectValidTsx(code);

    expect(code).toContain('composer={');
    // slot satisfied required prop — no double assignment, no TODO for it
    expect(code.match(/composer=/g)).toHaveLength(1);
    expect(code).toContain('TODO(xle): open #confirm');
    expect(code).toContain('overlays — wire open state');
    expect((code.match(/<XDSChatMessage\b/g) || [])).toHaveLength(2);
  }, SLOW);

  it('expands the dashboard: table partition, repeats with $ counter and \\$ escape', async () => {
    const result = await layoutExpand(DASHBOARD_COMPACT);
    const {code} = result.data;
    expectValidTsx(code);

    expect(code).toContain('<XDSTableHeader>');
    expect(code).toContain('<XDSTableBody>');
    expect(code).toContain('Order 1');
    expect(code).toContain('Order 3');
    expect(code).toContain('$12.00');
    expect(code).not.toContain('112.00');
    // {card-callout} now splices: the block is co-defined once and referenced
    // four times — no TODO marker.
    expect((code.match(/^function CardCallout\(\)/gm) || [])).toHaveLength(1);
    expect((code.match(/<CardCallout \/>/g) || [])).toHaveLength(4);
    expect(code).not.toContain("TODO(xle): content block 'CardCallout'");
  }, SLOW);

  it('compact and outline surfaces expand to identical TSX', async () => {
    const check = await layoutCheck(LOGIN_COMPACT);
    const fromCompact = await layoutExpand(LOGIN_COMPACT);
    const fromOutline = await layoutExpand(check.data.outline, {form: 'outline'});
    expect(fromOutline.data.code).toEqual(fromCompact.data.code);
  }, SLOW);

  it('expansion is deterministic', async () => {
    const a = await layoutExpand(DASHBOARD_COMPACT);
    const b = await layoutExpand(DASHBOARD_COMPACT);
    expect(a.data.code).toEqual(b.data.code);
  }, SLOW);

  it('throws structured errors with suggestions on invalid expressions', async () => {
    await expect(layoutExpand('A[p6] > Grdi')).rejects.toMatchObject({
      code: 'ERR_LAYOUT_INVALID',
      message: expect.stringMatching(/AppShell has no prop 'padding'/),
    });
  });

  it('rejects non-PascalCase --name', async () => {
    await expect(layoutExpand('V > C', {name: 'not pascal'})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  });

  it('surfaces parse errors with positions', async () => {
    await expect(layoutExpand('V > > C')).rejects.toMatchObject({
      code: 'ERR_LAYOUT_PARSE',
      message: expect.stringMatching(/line 1/),
    });
  });
});

describe('layoutCheck', () => {
  it('returns both canonical surfaces for valid input', async () => {
    const result = await layoutCheck('V[g6] > C{card-callout}*2');
    expect(result.data.valid).toBe(true);
    expect(result.data.compact).toContain('{card-callout}');
    expect(result.data.outline).toContain('C {card-callout} x2');
  });

  it('collects all errors instead of stopping at the first', async () => {
    const result = await layoutCheck('A[p6] > V[g7] > Bd.sucess"x" + C{not-a-block}');
    expect(result.data.valid).toBe(false);
    expect(result.data.errors.length).toBeGreaterThanOrEqual(4);
    const all = result.data.errors.map(e => e.message).join('\n');
    expect(all).toMatch(/no prop 'padding'/);
    expect(all).toMatch(/must be one of/);
    expect(all).toMatch(/Unknown block/);
  });
});

describe('template referencing', () => {
  it('splices a template block: co-defined once, referenced, imports merged', async () => {
    const result = await layoutExpand('S[p6] > C{card-callout}*3', {name: 'Demo'});
    const {code} = result.data;
    expectValidTsx(code);
    // co-defined exactly once, referenced three times, no TODO
    expect((code.match(/^function CardCallout\(\)/gm) || [])).toHaveLength(1);
    expect((code.match(/<CardCallout \/>/g) || [])).toHaveLength(3);
    expect(code).not.toContain('TODO(xle)');
    // the block's own import is hoisted, and shared specifiers dedupe
    expect((code.match(/from '@astryxdesign\/core\/Card'/g) || [])).toHaveLength(1);
    // the block lost its export — it's a local declaration now
    expect(code).not.toContain('export default function CardCallout');
    expect(result.data.blocksReferenced).toEqual([{name: 'CardCallout', mode: 'splice'}]);
  }, SLOW);

  it('merges a stateful block useState into a single react import', async () => {
    const result = await layoutExpand(
      'V > TI"Search"[t=text] + {table-column-settings-table}',
      {name: 'Demo'},
    );
    const {code} = result.data;
    expectValidTsx(code);
    // page TextInput scaffolds useState; block also uses useState → one import
    expect((code.match(/^import \{useState\} from 'react';$/gm) || [])).toHaveLength(1);
    expect(code).toContain('function TableColumnSettingsTable()');
  }, SLOW);

  it('imports app-registered local components (the local-component bridge)', async () => {
    // Inside the workspace so @astryxdesign/core resolves; cleaned up after.
    // A package.json beside the config makes loadConfig resolve it as the
    // sibling-of-nearest-package.json (the standard config resolution).
    const cwd = mkdtempSync(join(process.cwd(), '.xle-imp-test-'));
    try {
      writeFileSync(join(cwd, 'package.json'), '{"name": "xle-imp-fixture"}\n');
      writeFileSync(
        join(cwd, 'astryx.config.mjs'),
        `export default {experimental: {xle: {components: {KpiCard: {from: '@/components/KpiCard'}, TimeRangePicker: {from: '@/components/TimeRangePicker'}}}}};\n`,
      );
      const result = await layoutExpand('S[p6] > (G[c4 g4] > {kpi-card}*4) + {time-range-picker}', {
        name: 'Demo',
        cwd,
      });
      const {code} = result.data;
      expectValidTsx(code);
      expect(code).toContain("import {KpiCard} from '@/components/KpiCard';");
      expect(code).toContain("import {TimeRangePicker} from '@/components/TimeRangePicker';");
      expect((code.match(/<KpiCard \/>/g) || [])).toHaveLength(4);
      expect(code).toContain('<TimeRangePicker />');
      expect(result.data.blocksReferenced).toContainEqual({name: 'KpiCard', mode: 'import'});
    } finally {
      rmSync(cwd, {recursive: true, force: true});
    }
  }, SLOW);

  it('parses a standalone {block} in both surfaces', async () => {
    const check = await layoutCheck('G[c4 g4] > {card-callout}*2');
    expect(check.data.valid).toBe(true);
    expect(check.data.compact).toContain('{card-callout}*2');
    expect(check.data.outline).toMatch(/\{card-callout\} x2/);
  });
});

describe('layoutGrammar', () => {
  it('emits the cheatsheet with branch-generated aliases', async () => {
    const result = await layoutGrammar();
    expect(result.data.text).toContain('TWO SURFACES');
    expect(result.data.aliases.V).toBe('VStack');
    expect(result.data.aliases.TB).toBe('TableBody');
    // every alias target must exist — the table is registry-filtered
    expect(Object.values(result.data.aliases)).not.toContain(undefined);
  });
});
