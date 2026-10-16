// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Documented props against a component's TypeScript props: each kind
 * of finding, the props a doc never needs, and the visible skip when the
 * project has no TypeScript.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {comparePropDocs, TYPESCRIPT_MISSING_REASON} from './prop-drift.mjs';

const require = createRequire(import.meta.url);
const TYPESCRIPT_DIR = path.dirname(require.resolve('typescript/package.json'));

/** @type {string} */
let pkg;

beforeEach(() => {
  pkg = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-prop-drift-'));
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkg, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        target: 'es2022',
      },
    }),
  );
});

afterEach(() => {
  fs.rmSync(pkg, {recursive: true, force: true});
});

function withTypeScript() {
  fs.mkdirSync(path.join(pkg, 'node_modules'), {recursive: true});
  fs.symlinkSync(
    TYPESCRIPT_DIR,
    path.join(pkg, 'node_modules', 'typescript'),
    'dir',
  );
}

/**
 * Write `components/<name>.tsx` and its doc; returns the component record.
 * @param {string} name
 * @param {string} source
 * @param {Record<string, unknown>} doc
 */
function component(name, source, doc) {
  const dir = path.join(pkg, 'components');
  fs.mkdirSync(dir, {recursive: true});
  const sourcePath = path.join(dir, `${name}.tsx`);
  const docPath = path.join(dir, `${name}.doc.mjs`);
  fs.writeFileSync(sourcePath, source);
  fs.writeFileSync(
    docPath,
    `export default ${JSON.stringify({
      type: 'component',
      name,
      displayName: name,
      description: 'Fixture.',
      ...doc,
    })};\n`,
  );
  return {name, sourcePath, docPath};
}

/**
 * @param {string} name
 * @param {string} type
 * @param {Record<string, unknown>} [extra]
 */
const prop = (name, type, extra = {}) => ({
  name,
  type,
  description: 'Fixture prop.',
  ...extra,
});

/** @param {Array<{name: string, sourcePath: string, docPath: string}>} components */
function compare(components) {
  return comparePropDocs(components, {packageDir: pkg, resolveFrom: [pkg]});
}

/** @param {{findings: Array<{component: string, prop: string, kind: string}>}} report */
const kinds = report =>
  report.findings.map(f => `${f.component}.${f.prop} ${f.kind}`);

describe('comparePropDocs', () => {
  it('skips with a reason, and compares nothing, when the project has no TypeScript', async () => {
    const badge = component(
      'Badge',
      'export function Badge(props: {label: string}) { return null; }\n',
      {props: [prop('label', 'number')]},
    );

    const report = await compare([badge]);

    expect(report).toEqual({
      status: 'skipped',
      reason: TYPESCRIPT_MISSING_REASON,
      components: 0,
      findings: [],
      unchecked: [],
    });
  });

  it('reports a prop missing from the code, one missing from the doc, and a wrong required flag', async () => {
    withTypeScript();
    const badge = component(
      'Badge',
      [
        "export type Tone = 'neutral' | 'info' | 'danger';",
        'export interface BadgeProps {',
        '  label: string;',
        '  tone?: Tone;',
        '  count?: number;',
        '}',
        'export function Badge(props: BadgeProps) { return null; }',
      ].join('\n'),
      {
        props: [
          prop('label', 'string'),
          prop('tone', "'neutral' | 'info'"),
          prop('size', "'sm' | 'md'"),
        ],
      },
    );

    const report = await compare([badge]);

    expect(report.status).toBe('checked');
    expect(report.typescript).toMatch(/^\d+\.\d+/);
    expect(report.components).toBe(1);
    expect(kinds(report)).toEqual([
      'Badge.count not_in_doc',
      'Badge.label required_mismatch',
      'Badge.size not_in_code',
    ]);
    expect(report.findings.every(f => f.severity === 'warning')).toBe(true);
    expect(
      report.findings.find(f => f.kind === 'required_mismatch'),
    ).toMatchObject({
      docRequired: false,
      codeRequired: true,
      doc: 'components/Badge.doc.mjs',
      source: 'components/Badge.tsx',
    });
  });

  it('does not ask a doc for props from other packages, styling props, or deprecated props', async () => {
    withTypeScript();
    const base = path.join(pkg, 'node_modules', '@acme', 'base');
    fs.mkdirSync(base, {recursive: true});
    fs.writeFileSync(
      path.join(base, 'package.json'),
      JSON.stringify({name: '@acme/base', types: 'index.d.ts'}),
    );
    fs.writeFileSync(
      path.join(base, 'index.d.ts'),
      'export interface BaseProps { id?: string; onBlur?: () => void }\n',
    );
    const panel = component(
      'Panel',
      [
        "import type {BaseProps} from '@acme/base';",
        'export interface PanelProps extends BaseProps {',
        '  title?: string;',
        '  className?: string;',
        '  style?: {color?: string};',
        '  xstyle?: unknown;',
        "  'data-testid'?: string;",
        '  ref?: unknown;',
        '  /** @deprecated Use `title`. */',
        '  heading?: string;',
        '  /** @internal */',
        '  debugName?: string;',
        '}',
        'export function Panel(props: PanelProps) { return null; }',
      ].join('\n'),
      {props: [prop('title', 'string'), prop('id', 'number')]},
    );

    expect(kinds(await compare([panel]))).toEqual([]);
  });

  it('accepts a data-* prop that an index signature takes', async () => {
    withTypeScript();
    const chip = component(
      'Chip',
      [
        'export interface ChipProps {',
        '  label?: string;',
        '  [key: `data-${string}`]: string | undefined;',
        '}',
        'export function Chip(props: ChipProps) { return null; }',
      ].join('\n'),
      {props: [prop('label', 'string'), prop('data-testid', 'string')]},
    );

    expect(kinds(await compare([chip]))).toEqual([]);
  });

  it('reads names that list several props, fields of a prop, and spreads', async () => {
    withTypeScript();
    const menu = component(
      'Menu',
      [
        'export interface MenuProps {',
        '  onOpen?: () => void;',
        '  onClose?: () => void;',
        '  value?: {label: string; items: ReadonlyArray<{id: string}>};',
        '}',
        'export function Menu(props: MenuProps) { return null; }',
      ].join('\n'),
      {
        props: [
          prop('onOpen / onClose', '() => void / () => void'),
          prop('value.label', 'string'),
          prop('value.items[].id', 'string'),
          prop('value.missing', 'string'),
          prop('...rest', 'Omit<OtherProps, "x">'),
        ],
      },
    );

    expect(kinds(await compare([menu]))).toEqual([
      'Menu.value.missing not_in_code',
    ]);
  });

  it('compares each entry of a multi-component doc against its own export, and skips hooks', async () => {
    withTypeScript();
    const tabs = component(
      'Tabs',
      [
        'export function Tabs(props: {value: string}) { return null; }',
        'export function Tab(props: {value: string; isDisabled?: boolean}) { return null; }',
        'export function useTabs(options: {value: string}) { return options; }',
      ].join('\n'),
      {
        components: [
          {
            name: 'Tabs',
            displayName: 'Tabs',
            description: 'Fixture.',
            props: [prop('value', 'string', {required: true})],
          },
          {
            name: 'Tab',
            displayName: 'Tab',
            description: 'Fixture.',
            props: [
              prop('value', 'string', {required: true}),
              prop('isSelected', 'boolean'),
            ],
          },
          {
            name: 'useTabs',
            displayName: 'useTabs',
            description: 'Fixture.',
            params: [
              {
                name: 'options',
                type: '{value: string}',
                description: 'Fixture.',
              },
            ],
          },
        ],
      },
    );

    const report = await compare([tabs]);

    expect(report.components).toBe(2);
    expect(kinds(report)).toEqual([
      'Tab.isDisabled not_in_doc',
      'Tab.isSelected not_in_code',
    ]);
  });

  it('compares a member record only against its own source, and the family record leaves that member alone', async () => {
    withTypeScript();
    const dir = path.join(pkg, 'components');
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'Status.tsx'),
      'export function Status(props: {value: string}) { return null; }\n',
    );
    fs.writeFileSync(
      path.join(dir, 'StatusView.tsx'),
      'export function StatusGlyph(props: {size?: number}) { return null; }\n',
    );
    const docPath = path.join(dir, 'Status.doc.mjs');
    fs.writeFileSync(
      docPath,
      `export default ${JSON.stringify({
        type: 'component',
        name: 'Status',
        displayName: 'Status',
        description: 'Fixture.',
        components: [
          {
            name: 'Status',
            displayName: 'Status',
            description: 'Fixture.',
            props: [prop('value', 'string', {required: true})],
          },
          {
            name: 'StatusGlyph',
            displayName: 'StatusGlyph',
            description: 'Fixture.',
            props: [prop('size', 'number'), prop('tone', 'string')],
          },
        ],
      })};\n`,
    );

    const report = await compare([
      {name: 'Status', docPath, sourcePath: path.join(dir, 'Status.tsx')},
      {
        name: 'StatusGlyph',
        docPath,
        sourcePath: path.join(dir, 'StatusView.tsx'),
      },
    ]);

    expect(report.unchecked).toEqual([]);
    expect(report.components).toBe(2);
    expect(kinds(report)).toEqual(['StatusGlyph.tone not_in_code']);
    expect(report.findings[0].source).toBe('components/StatusView.tsx');
  });

  it("compares a doc's own props with the export its name names, which another file can hold", async () => {
    withTypeScript();
    const dir = path.join(pkg, 'components');
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'Status.tsx'),
      'export function Status(props: {value: string}) { return null; }\n',
    );
    fs.writeFileSync(
      path.join(dir, 'StatusView.tsx'),
      'export function StatusView(props: {size?: number}) { return null; }\n',
    );
    const docPath = path.join(dir, 'Status.doc.mjs');
    fs.writeFileSync(
      docPath,
      `export default ${JSON.stringify({
        type: 'component',
        name: 'StatusView',
        displayName: 'Status view',
        description: 'Fixture.',
        props: [prop('size', 'number')],
      })};\n`,
    );
    const statusSource = path.join(dir, 'Status.tsx');
    const viewSource = path.join(dir, 'StatusView.tsx');

    // Discovery names the record after the file, or after the export.
    const byFile = await compare([
      {name: 'Status', docPath, sourcePath: statusSource},
    ]);
    const byExport = await compare([
      {name: 'StatusView', docPath, sourcePath: viewSource},
    ]);

    for (const report of [byFile, byExport]) {
      expect(report.unchecked).toEqual([]);
      expect(report.components).toBe(1);
      expect(report.findings).toEqual([]);
    }
  });

  it("leaves a requirement that varies across a union's members alone", async () => {
    withTypeScript();
    const picker = component(
      'Picker',
      [
        'type Single = {isMulti?: false; value: string; onChange: (value: string) => void};',
        'type Multi = {isMulti: true; value: string[]; onChange: (value: string[]) => void};',
        'export type PickerProps = (Single | Multi) & {label: string};',
        'export function Picker(props: PickerProps) { return null; }',
      ].join('\n'),
      {
        props: [
          prop('label', 'string', {required: true}),
          prop('isMulti', 'boolean'),
          prop('value', 'string', {required: true}),
          prop('onChange', '(value: string) => void', {required: true}),
        ],
      },
    );

    expect(kinds(await compare([picker]))).toEqual([]);
  });

  it('shows a method prop the doc leaves out with its function type, optional or not', async () => {
    withTypeScript();
    const picker = component(
      'Picker',
      [
        'export interface PickerProps {',
        '  label?: string;',
        '  onPick(value: string, index: number): void;',
        '  onClear?(reason: string): void;',
        '  get size(): number;',
        '}',
        'export function Picker(props: PickerProps) { return null; }',
      ].join('\n'),
      {props: [prop('label', 'string')]},
    );

    const report = await compare([picker]);

    expect(
      report.findings.map(({prop, kind, codeType}) => ({prop, kind, codeType})),
    ).toEqual([
      {
        prop: 'onClear',
        kind: 'not_in_doc',
        codeType: '(reason: string) => void',
      },
      {
        prop: 'onPick',
        kind: 'not_in_doc',
        codeType: '(value: string, index: number) => void',
      },
      {prop: 'size', kind: 'not_in_doc', codeType: 'number'},
    ]);
  });

  it('reads every overload of a component', async () => {
    withTypeScript();
    const select = component(
      'Select',
      [
        'type Single = {multiple?: false; value?: string};',
        'type Multi = {multiple: true; value?: string[]; max?: number};',
        'export function Select(props: Single): null;',
        'export function Select(props: Multi): null;',
        'export function Select(props: Single | Multi) { return null; }',
      ].join('\n'),
      {
        props: [
          prop('multiple', 'boolean'),
          prop('value', 'string | string[]'),
          prop('max', 'number'),
        ],
      },
    );

    const report = await compare([select]);

    expect(report.findings).toEqual([]);
    expect(report.components).toBe(1);
  });

  it('lists each component whose props it cannot read as not compared', async () => {
    withTypeScript();
    const missing = (
      /** @type {string} */ name,
      /** @type {string[]} */ lines,
    ) =>
      component(
        name,
        [
          "import type {MissingProps} from '@acme/not-installed';",
          ...lines,
          `export function ${name}(props: ${name}Props) { return null; }`,
        ].join('\n'),
        {props: [prop('label', 'string')]},
      );
    const unread = [
      missing('Ghost', [
        'export interface GhostProps extends MissingProps { label?: string }',
      ]),
      missing('Omitted', [
        "export interface OmittedProps extends Omit<MissingProps, 'title'> { label?: string }",
      ]),
      missing('Phantom', [
        'export type PhantomProps = Partial<MissingProps> & {label?: string};',
      ]),
      missing('Named', [
        "type Base = Omit<MissingProps, 'title'>;",
        'export interface NamedProps extends Base { label?: string }',
      ]),
      missing('Nested', [
        "export type NestedProps = Partial<Omit<MissingProps, 'title'>> & {label?: string};",
      ]),
      missing('Deep', [
        'interface L1 extends MissingProps {}',
        'interface L2 extends L1 {}',
        'interface L3 extends L2 {}',
        'interface L4 extends L3 {}',
        'interface L5 extends L4 {}',
        'export interface DeepProps extends L5 { label?: string }',
      ]),
    ];
    const lonely = component(
      'Lonely',
      'export function Other(props: {label: string}) { return null; }\n',
      {props: [prop('label', 'string', {required: true})]},
    );
    // An `any` index signature the package declares itself is no reason.
    const open = component(
      'Open',
      'export function Open(props: {label?: string; [key: string]: any}) { return null; }\n',
      {props: [prop('label', 'string')]},
    );

    const report = await compare([...unread, lonely, open]);

    expect(report.findings).toEqual([]);
    expect(report.components).toBe(1);
    expect(report.unchecked.map(u => u.component)).toEqual([
      'Deep',
      'Ghost',
      'Lonely',
      'Named',
      'Nested',
      'Omitted',
      'Phantom',
    ]);
    for (const entry of report.unchecked) {
      expect(entry.reason).toContain(
        entry.component === 'Lonely'
          ? 'Lonely.tsx has no export named Lonely'
          : 'could not resolve',
      );
    }
  });

  it('compares a table for one component in each doc that has one', async () => {
    withTypeScript();
    const dir = path.join(pkg, 'components');
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'List.tsx'),
      'export function List(props: {label: string}) { return null; }\n',
    );
    fs.writeFileSync(
      path.join(dir, 'ListGroup.tsx'),
      'export function ListGroup(props: {title: string}) { return null; }\n',
    );
    const familyDoc = path.join(dir, 'List.doc.mjs');
    fs.writeFileSync(
      familyDoc,
      `export default ${JSON.stringify({
        type: 'component',
        name: 'List',
        displayName: 'List',
        description: 'Fixture.',
        components: [
          {
            name: 'List',
            displayName: 'List',
            description: 'Fixture.',
            props: [prop('label', 'string', {required: true})],
          },
          {
            name: 'ListGroup',
            displayName: 'Group',
            description: 'Fixture.',
            props: [prop('title', 'string', {required: true})],
          },
        ],
      })};\n`,
    );
    const groupDoc = path.join(dir, 'ListGroup.doc.mjs');
    fs.writeFileSync(
      groupDoc,
      `export default ${JSON.stringify({
        type: 'component',
        name: 'ListGroup',
        displayName: 'Group',
        description: 'Fixture.',
        props: [
          prop('title', 'string', {required: true}),
          prop('stale', 'string'),
        ],
      })};\n`,
    );

    const report = await compare([
      {
        name: 'List',
        docPath: familyDoc,
        sourcePath: path.join(dir, 'List.tsx'),
      },
      {
        name: 'ListGroup',
        docPath: groupDoc,
        sourcePath: path.join(dir, 'ListGroup.tsx'),
      },
    ]);

    expect(report.components).toBe(3);
    expect(kinds(report)).toEqual(['ListGroup.stale not_in_code']);
    expect(report.findings[0].doc).toBe('components/ListGroup.doc.mjs');
  });
});
