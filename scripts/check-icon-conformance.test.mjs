// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generated inventory and negative source-conformance tests.
 * @input Synthetic owner source, including aliases and deliberate invalid mutations
 * @output Discovery, coverage, stateless compatibility and mechanically detected failures
 * @position Node lane; no compiled Core or browser required
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
  discoverIconRoles,
  generateIconInventoryModule,
  hasGeneratedIconInventoryCoverage,
  assertIconPolicyParity,
} from './lib/icon-role-inventory.mjs';

const roots = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});
const api = `export function declareComponentIconRole(input: any) {}
export function getComponentIconState(slot: any, states: any) {}
export function renderComponentIconSlot(slot: any, icon: any, props?: any, state?: any) {}
export function renderIconSlot(icon: any) {}
export function Icon(props: any) {return null;}
export function defineTheme(input: any) {return input;}`;
const declaration = `import {declareComponentIconRole as declareRole, getComponentIconState, renderComponentIconSlot, renderIconSlot, Icon, defineTheme} from './api';
type Conditions = 'disabled' | 'selected';
declare module '@astryxdesign/core/Icon' {interface ComponentIconSlotMap {
 'sample-leading': {slot: true; states: Conditions};
 'sample-source': {slot: true};
 'sample-legacy': true;
}}
const precedence = ['disabled', 'selected'] as const;
const input = {slot: 'sample-leading', defaultSize: 'sm', statePrecedence: precedence} as const;
declareRole(input);
getComponentIconState('sample-leading', {selected: true});
renderComponentIconSlot('sample-leading', 'check', {}, 'selected');`;
function scan(source = declaration, additional = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-conformance-'));
  roots.push(root);
  const files = {'owner.tsx': source, 'api.ts': api, ...additional};
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), text);
  }
  return discoverIconRoles(root, Object.keys(files));
}
describe('generated icon role conformance', () => {
  const story = `import {slots as roster} from 'virtual:astryx-icon-roles'; import {IconRoleInventory as Inventory} from './icon-role-inventory/Inventory'; export const render=()=> <Inventory slots={roster} />;`;
  it('checks the generated roster reaches the actual visual entry point', () => {
    expect(hasGeneratedIconInventoryCoverage(story)).toBe(true);
  });
  it.each([
    story.replace('slots={roster}', 'slots={[]}'),
    story.replace(
      'export const render=()=> <Inventory slots={roster} />;',
      '// <Inventory slots={roster} />',
    ),
    story.replace(
      "from 'virtual:astryx-icon-roles'",
      "from './manual-catalog'",
    ),
  ])('rejects missing actual visual inventory coverage', source => {
    expect(hasGeneratedIconInventoryCoverage(source)).toBe(false);
  });
  it('derives aliased state types, constant declarations, every state and true slots', () => {
    const result = scan();
    expect(result.errors).toEqual([]);
    expect(result.slots.map(slot => [slot.slot, slot.states])).toEqual([
      ['sample-leading', ['disabled', 'selected']],
      ['sample-legacy', []],
      ['sample-source', []],
    ]);
    const module = generateIconInventoryModule(result, '/repository');
    expect(module).toContain('import "/@fs//repository/owner.tsx";');
    for (const slot of result.slots)
      expect(module).toContain(JSON.stringify(slot));
    expect(module.match(/import /g)).toHaveLength(1);
  });
  it('automatically includes a newly added owner, with no central enrollment', () => {
    const next = declaration.replaceAll('sample-', 'next-');
    const result = scan(declaration, {'next.tsx': next});
    expect(result.errors).toEqual([]);
    expect(result.slots).toHaveLength(6);
    expect(generateIconInventoryModule(result, '/repository')).toContain(
      'import "/@fs//repository/next.tsx";',
    );
  });
  it.each([
    [
      'shorthand fields',
      declaration.replace(
        'declareRole(input);',
        "const slot='sample-leading' as const; const defaultSize='sm' as const; const statePrecedence=precedence; declareRole({slot,defaultSize,statePrecedence});",
      ),
    ],
    [
      'spread tuple',
      declaration.replace(
        'statePrecedence: precedence',
        'statePrecedence: [...precedence]',
      ),
    ],
  ])(
    'supports %s without a hand-maintained declaration format',
    (_name, source) => {
      expect(scan(source).errors).toEqual([]);
    },
  );
  it('reads imported constant declaration objects', () => {
    const source =
      declaration.replace('declareRole(input);', 'declareRole(imported);') +
      "\nimport {input as imported} from './metadata';";
    expect(
      scan(source, {
        'metadata.ts':
          "export const input={slot:'sample-leading',defaultSize:'sm',statePrecedence:['disabled','selected']} as const;",
      }).errors,
    ).toEqual([]);
  });
  it.each([
    [
      'undeclared role',
      declaration.replaceAll(
        "slot: 'sample-leading'",
        "slot: 'missing-leading'",
      ),
    ],
    [
      'duplicate spread tuple',
      declaration
        .replace(
          "['disabled', 'selected']",
          "['disabled', 'selected', 'selected']",
        )
        .replace(
          'statePrecedence: precedence',
          'statePrecedence: [...precedence]',
        ),
    ],
    [
      'false slot marker',
      declaration.replace('slot: true; states', 'slot: false; states'),
    ],
    [
      'bracket theme-map read',
      declaration + "\nconst map=theme['componentIcons'];",
    ],
    [
      'destructured theme-map read',
      declaration + '\nconst {componentIcons: map}=theme;',
    ],
    [
      'renderer alias',
      declaration + "\nconst render=renderIconSlot; render('check');",
    ],
    ['Icon alias', declaration + '\nconst Glyph=Icon; const glyph=<Glyph />;'],
    [
      'undeclared slot use',
      declaration + "\ngetComponentIconState('missing-leading', {});",
    ],
    [
      'undeclared state condition',
      declaration.replace('{selected: true}', '{invented: true}'),
    ],
    [
      'undeclared renderer state',
      declaration.replace("{}, 'selected'", "{}, 'invented'"),
    ],
    [
      'dropped state',
      declaration.replace("['disabled', 'selected']", "['disabled']"),
    ],
    [
      'duplicate state',
      declaration.replace(
        "['disabled', 'selected']",
        "['disabled', 'selected', 'selected']",
      ),
    ],
    [
      'missing inventory coverage',
      declaration.replace('declareRole(input);', ''),
    ],
    [
      'true-slot promotion',
      declaration.replace("slot: 'sample-leading'", "slot: 'sample-source'"),
    ],
    [
      'broad states',
      declaration.replace(
        "type Conditions = 'disabled' | 'selected'",
        'type Conditions = string',
      ),
    ],
    [
      'pixel default metadata',
      declaration.replace("defaultSize: 'sm'", "defaultSize: '16px'"),
    ],
    [
      'default policy pixel metadata',
      declaration +
        "\ndefineTheme({iconCapabilities: {presentation: {default: {size: '16px'}}}});",
    ],
    [
      'undeclared theme role',
      declaration +
        "\ndefineTheme({iconCapabilities: {roleSizeOverrides: {'missing-leading': 'sm'}}});",
    ],
    [
      'undeclared theme state',
      declaration +
        "\ndefineTheme({iconCapabilities: {presentation: {byState: {invented: {appearance: 'filled'}}}}});",
    ],
    [
      'state weight',
      declaration +
        '\ndefineTheme({iconCapabilities: {presentation: {byState: {selected: {weight: 600}}}}});',
    ],
    ['hardcoded SVG', declaration + '\nconst glyph = <svg />;'],
    ['bare Icon', declaration + '\nconst glyph = <Icon />;'],
    ['bare slot renderer', declaration + "\nrenderIconSlot('check');"],
    [
      'direct theme-map read',
      declaration + '\nconst map = theme.componentIcons;',
    ],
  ])(
    'rejects %s and refuses to generate a partial inventory',
    (_name, source) => {
      const result = scan(source);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(() => generateIconInventoryModule(result)).toThrow();
    },
  );
  it('does not migrate or audit unrelated legacy SVG components', () => {
    expect(
      scan(declaration, {'legacy.tsx': 'export const glyph = <svg />;'}).errors,
    ).toEqual([]);
  });
  it.each(['roleSizeOverrides', 'byState', 'componentIcons'])(
    'detects dropped build data: %s',
    field => {
      const source = {
        componentIcons: {'sample-leading': 'check'},
        iconCapabilities: {
          roleSizeOverrides: {'sample-leading': 'sm'},
          presentation: {byState: {selected: {appearance: 'filled'}}},
        },
      };
      const built = structuredClone(source);
      expect(() => assertIconPolicyParity(source, built)).not.toThrow();
      if (field === 'componentIcons') delete built.componentIcons;
      else if (field === 'roleSizeOverrides')
        delete built.iconCapabilities.roleSizeOverrides;
      else delete built.iconCapabilities.presentation.byState;
      expect(() => assertIconPolicyParity(source, built)).toThrow(
        /build dropped/,
      );
    },
  );
});
