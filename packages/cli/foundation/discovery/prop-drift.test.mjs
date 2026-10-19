// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Documented props against a component's TypeScript props: each kind
 * of finding, and each component it cannot read.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {comparePropDocs, comparePropTables} from './prop-drift.mjs';

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
 * Write `components/<name>.tsx` and its doc; returns its prop table, which
 * also carries the component record (name, docPath, sourcePath).
 * @param {string} name
 * @param {string} source
 * @param {Record<string, any>} doc
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
  return {
    name,
    docPath,
    sourcePath,
    doc: `components/${name}.doc.mjs`,
    props: doc.props ?? [],
    sources: [sourcePath],
  };
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

/** @param {import('./prop-drift.mjs').PropDriftTable[]} tables */
function compare(tables) {
  return comparePropTables(tables, {packageDir: pkg, resolveFrom: [pkg]});
}

/** @param {{findings: Array<{component: string, prop: string, kind: string}>}} report */
const kinds = report =>
  report.findings.map(f => `${f.component}.${f.prop} ${f.kind}`);

describe('comparePropTables', () => {
  it("reports a prop missing from the code, one missing from the doc, and a wrong required flag, each component's together", async () => {
    withTypeScript();
    const badge = component(
      'Badge',
      `export type Tone = 'neutral' | 'info' | 'danger';
export interface BadgeProps {
  label: string;
  tone?: Tone;
  count?: number;
}
export function Badge(props: BadgeProps) { return null; }`,
      {
        props: [
          prop('label', 'string'),
          prop('tone', "'neutral' | 'info'"),
          prop('size', "'sm' | 'md'"),
        ],
      },
    );
    // A name that starts with another's sorts after all of the other's.
    const count = component(
      'BadgeCount',
      'export function BadgeCount(props: {amount?: number}) { return null; }',
      {props: []},
    );

    const report = await compare([count, badge]);

    expect(report.status).toBe('checked');
    expect(report.typescript).toMatch(/^\d+\.\d+/);
    expect(report.components).toBe(2);
    expect(kinds(report)).toEqual([
      'Badge.count not_in_doc',
      'Badge.label required_mismatch',
      'Badge.size not_in_code',
      'BadgeCount.amount not_in_doc',
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

  it('reads every overload, one without props included, reads a prop only some members of a union require as optional, and holds every prop one entry names to its `required`', async () => {
    withTypeScript();
    const picker = component(
      'Picker',
      `type Single = {isMulti?: false; value: string; onChange: (value: string) => void};
type Multi = {isMulti: true; value: string[]; onChange: (value: string[]) => void};
export type PickerProps = (Single | Multi) & {label: string};
export function Picker(props: PickerProps) { return null; }`,
      {
        props: [
          prop('label', 'string', {required: true}),
          prop('isMulti', 'boolean'),
          prop('value', 'string', {required: true}),
          prop('onChange', '(value: string) => void', {required: true}),
        ],
      },
    );

    const select = component(
      'Select',
      `type Single = {multiple?: false; value?: string};
type Multi = {multiple: true; value?: string[]; max?: number};
export function Select(props: Single): null;
export function Select(props: Multi): null;
export function Select(props: Single | Multi) { return null; }`,
      {
        props: [
          prop('multiple', 'boolean'),
          prop('value', 'string | string[]'),
          prop('max', 'number'),
        ],
      },
    );
    // An overload that takes no props makes every prop optional; a typed
    // props type beside a `Record<string, any>` or a mapped `any` index is
    // compared as it is beside an inline `[key: string]: any`.
    const propless = component(
      'Propless',
      'export function Propless(): null;\nexport function Propless(props: {label: string}): null;\nexport function Propless(props?: {label: string}) { return null; }',
      {props: [prop('label', 'string', {required: true})]},
    );
    const open = [
      'Record<string, any>',
      'Record<`data-${string}`, any>',
      '{[K in string]?: any}',
    ].map((index, i) =>
      component(
        `Open${i}`,
        `export function Open${i}(props: {label?: string; size?: number} & ${index}) { return null; }`,
        {props: [prop('label', 'string')]},
      ),
    );

    // Required in one variant only: a caller may leave it out, so optional.
    const menu = component(
      'Menu',
      'export function Menu(props: {items: string[]} | {alt: string}) { return null; }',
      {props: [prop('items', 'X[]', {required: true}), prop('alt', 'X')]},
    );
    // One entry's `required` is a claim about every prop it names.
    const pairs = ['label: string', 'label?: string'].map((label, i) =>
      component(
        `Pair${i}`,
        `export function Pair${i}(props: {value: string; ${label}}) { return null; }`,
        {props: [prop('value / label', 'string / string', {required: true})]},
      ),
    );
    // Typed `any` through the package's own alias of `Omit`, written in the
    // signature, as a named alias, or as an interface's base.
    const without = ['Without<any>', 'P', 'Q', 'R'].map((props, i) =>
      component(
        `Without${i}`,
        `type Without<T> = Omit<T, 'as'>; type P = Without<any>; interface Q extends Omit<any, 'as'> {} type R = Omit<P, 'ref'>;\nexport function Without${i}(props: ${props}) { return null; }`,
        {props: [prop('label', 'string')]},
      ),
    );

    const tables = [
      picker,
      select,
      propless,
      ...open,
      menu,
      ...pairs,
      ...without,
    ];
    const report = await compare(tables);

    expect(kinds(report)).toEqual([
      'Menu.items required_mismatch',
      'Open0.size not_in_doc',
      'Open1.size not_in_doc',
      'Open2.size not_in_doc',
      'Pair1.label required_mismatch',
      'Propless.label required_mismatch',
    ]);
    expect(report.components).toBe(9);
    expect(report.propsNotChecked).toBeUndefined();
    expect(report.unchecked.map(entry => entry.reason)).toEqual(
      [0, 1, 2, 3].map(i =>
        expect.stringMatching(`^Without${i}'s props are typed`),
      ),
    );
  });

  it('shows a method prop the doc leaves out with its function type, optional or not', async () => {
    withTypeScript();
    const picker = component(
      'Picker',
      `export interface PickerProps {
  label?: string;
  onPick(value: string, index: number): void;
  onClear?(reason: string): void;
  get size(): number;
}
export function Picker(props: PickerProps) { return null; }`,
      {props: [prop('label', 'string')]},
    );

    const report = await compare([picker]);

    expect(
      report.findings.map(f => `${f.prop} ${f.kind}: ${f.codeType}`),
    ).toEqual([
      'onClear not_in_doc: (reason: string) => void',
      'onPick not_in_doc: (value: string, index: number) => void',
      'size not_in_doc: number',
    ]);
  });

  it("prints a union's members in the order the source declares them", async () => {
    withTypeScript();
    // The same literals, made first in another order, would set the
    // compiler's own order.
    const ordered = component(
      'Ordered',
      [
        "type Other = 'md' | 'sm' | 'lg';",
        'export type Unrelated = Other;',
        "type Small = 'lg' | 'sm';",
        "export function Ordered(props: {size?: Small} | {size?: 'md'; label?: string}) { return null; }",
      ].join('\n'),
      {props: [prop('label', 'string')]},
    );

    const report = await compare([ordered]);

    expect(
      report.findings.find(finding => finding.prop === 'size')?.codeType,
    ).toBe("'lg' | 'sm' | 'md'");
  });

  it("reads a prop that the package's defaultProps fills as optional", async () => {
    withTypeScript();
    // A library type that declares an optional `defaultProps`, as React's
    // component types do, fills nothing; without strict null checks it reads
    // as filling every prop.
    const lib = path.join(pkg, 'node_modules', '@acme', 'lib');
    fs.mkdirSync(lib, {recursive: true});
    fs.writeFileSync(
      path.join(lib, 'package.json'),
      JSON.stringify({name: '@acme/lib', types: 'index.d.ts'}),
    );
    fs.writeFileSync(
      path.join(lib, 'index.d.ts'),
      `export interface Kind<P> { new (props: P): {}; defaultProps?: Partial<P> }
export declare function memo<T extends (p: any) => any>(c: T): {(p: Parameters<T>[0]): null; $$typeof: symbol; type: T};
export declare function lazy<T extends (p: any) => any>(f: () => Promise<{default: T}>): {(p: Parameters<T>[0]): null; $$typeof: symbol; _result: T};\n`,
    );
    fs.writeFileSync(
      path.join(pkg, 'tsconfig.json'),
      JSON.stringify({compilerOptions: {strict: false, jsx: 'react-jsx'}}),
    );
    const source = `import {type Kind, lazy, memo} from '@acme/lib';
declare class Component<P> { constructor(props: P); props: P }
export class Klass extends Component<{label: string; size: number}> {
  static defaultProps = {size: 1};
}
export function Fn(props: {label: string; size: number}) { return null; }
Fn.defaultProps = {size: 1};
export function Gn(props: {label: string; size: number}) { return null; }
Gn.defaultProps = {size: 1};
export declare const Typed: Kind<{label: string; size: number}>;
export const Memoed = memo(Fn);
export const Lazied = lazy(() => Promise.resolve({default: Fn}));
export const Thrice = memo(memo(memo(Fn)));
export class Loose extends Component<{label: string; size: number}> { static defaultProps: any = {}; }`;
    const props = [
      prop('label', 'string'),
      prop('size', 'number', {required: true}),
    ];

    const report = await compare([
      ...'Klass Fn Typed Memoed Lazied Thrice Loose'
        .split(' ')
        .map(name => component(name, source, {props})),
      component('Gn', source, {
        props: [prop('label', 'string'), prop('size', 'number')],
      }),
    ]);

    // JSX callers may leave out a prop defaultProps fills (for `memo` and
    // `lazy`, the wrapped component's, two layers deep as React's types read
    // it; `any` fills every prop), so a doc that marks it required disagrees
    // with the code, and one that doesn't agrees.
    expect(kinds(report)).toEqual([
      'Fn.label required_mismatch',
      'Fn.size required_mismatch',
      'Gn.label required_mismatch',
      'Klass.label required_mismatch',
      'Klass.size required_mismatch',
      'Lazied.label required_mismatch',
      'Lazied.size required_mismatch',
      'Loose.size required_mismatch',
      'Memoed.label required_mismatch',
      'Memoed.size required_mismatch',
      'Thrice.label required_mismatch',
      'Typed.label required_mismatch',
    ]);
    expect(
      report.findings.find(f => f.component === 'Fn' && f.prop === 'size'),
    ).toMatchObject({docRequired: true, codeRequired: false});
  });

  it('lists each component whose props it cannot read as not compared', async () => {
    withTypeScript();
    const tsconfig = path.join(pkg, 'tsconfig.json');
    const config = JSON.parse(fs.readFileSync(tsconfig, 'utf8'));
    config.compilerOptions.allowJs = true;
    fs.writeFileSync(tsconfig, JSON.stringify(config));
    /** @param {Record<string, string>} sources each component's props types */
    const missing = sources =>
      Object.entries(sources).map(([name, types]) =>
        component(
          name,
          `import type {MissingProps} from '@acme/not-installed';\n${types}\nexport function ${name}(props: ${name}Props) { return null; }`,
          {props: [prop('label', 'string')]},
        ),
      );
    const unread = [
      ...missing({
        Ghost:
          'export interface GhostProps extends MissingProps { label?: string }',
        Omitted:
          "export interface OmittedProps extends Omit<MissingProps, 'title'> { label?: string }",
        Phantom:
          'export type PhantomProps = Partial<MissingProps> & {label?: string};',
        Named:
          "type Base = Omit<MissingProps, 'title'>; export interface NamedProps extends Base { label?: string }",
        Joined:
          "type Base = Omit<MissingProps, 'title'>; export type JoinedProps = Base & {label?: string};",
        Bare: "type Base = Omit<MissingProps, 'title'>; export type BareProps = Base;",
        Mapped:
          'export type MappedProps = {[K in keyof MissingProps]?: string};',
        Prefixed:
          'type On<K extends string> = {[P in `on${K}`]?: () => void}; export type PrefixedProps = On<MissingProps> & {label?: string};',
        Picked:
          "type Base = Pick<MissingProps, 'title'>; export type PickedProps = Base;",
        Kept: "type W<T> = T & {label?: string}; export type KeptProps = W<Required<Pick<MissingProps, 'title'>>>;",
        Nested:
          "export type NestedProps = Partial<Omit<MissingProps, 'title'>> & {label?: string};",
        Deep: 'interface L1 extends MissingProps {} interface L2 extends L1 {} interface L3 extends L2 {} interface L4 extends L3 {} interface L5 extends L4 {} export interface DeepProps extends L5 { label?: string }',
      }),
      component(
        'Wrapped',
        `import {forwardRef} from 'react';
export const Wrapped = forwardRef<HTMLButtonElement, {label?: string}>((props, ref) => null);`,
        {props: [prop('label', 'string')]},
      ),
      component(
        'Classy',
        "import {MissingBase} from '@acme/not-installed';\nexport class Classy extends MissingBase<{label?: string}> {}\n",
        {props: [prop('label', 'string')]},
      ),
    ];
    // Each of these is the only reference in its files that does not resolve:
    // a name its module does not export, a dependency's own missing import, a
    // missing type package, and a side-effect import.
    fs.writeFileSync(
      path.join(pkg, 'components', 'theme.ts'),
      'export interface Theme { tone?: string }\n',
    );
    const dep = path.join(pkg, 'node_modules', '@acme', 'dep');
    fs.mkdirSync(dep, {recursive: true});
    fs.writeFileSync(
      path.join(dep, 'package.json'),
      JSON.stringify({name: '@acme/dep', types: 'index.d.ts'}),
    );
    fs.writeFileSync(
      path.join(dep, 'index.d.ts'),
      "import type {MissingProps} from '@acme/not-installed';\nexport type DepProps = MissingProps & {label?: string};\n",
    );
    const references = Object.entries({
      Unnamed:
        "import type {Gone} from './theme';\nexport function Unnamed(props: {label?: string; tone?: Gone}) { return null; }\n",
      Peered:
        "import type {DepProps} from '@acme/dep';\nexport function Peered(props: DepProps) { return null; }\n",
      Referenced:
        '/// <reference types="@acme/not-installed-types" />\nexport function Referenced(props: {label?: string}) { return null; }\n',
      Effect:
        "import '@acme/not-installed-effect';\nexport function Effect(props: {label?: string}) { return null; }\n",
      // A type name declared nowhere, which only `keyof`, a `Record`'s keys
      // or a template literal key reaches.
      Omitting:
        'export function Omitting(props: Omit<{label: string; size?: number}, keyof NowhereProps>) { return null; }\n',
      Recorded:
        'export function Recorded(props: Partial<Record<keyof NowhereProps, string>>) { return null; }\n',
      Handlers:
        'export function Handlers(props: {[K in `on${NowhereKey}`]?: () => void}) { return null; }\n',
      Aliased:
        'type Keys = keyof NowhereProps;\nexport function Aliased(props: {[K in Keys]?: string}) { return null; }\n',
      // A value declared nowhere behind a binding, and a property that
      // doesn't exist: the compiler can only give either its error type.
      Valued:
        'const d = missingValue;\nexport function Valued(props: Omit<{label: string; size?: number}, keyof typeof d>) { return null; }\n',
      Sized:
        "interface Theme { colors: {a: string} }\nexport function Sized(props: Partial<Record<keyof Theme['sizes'], string>>) { return null; }\n",
      // A value the compiler can't type, spread into an object, makes the
      // object `any`.
      Spread:
        'interface Theme { colors: {a: string} }\ndeclare const theme: Theme;\nconst defaults = {...theme.sizes};\nexport function Spread(props: Omit<{label: string; size?: number}, keyof typeof defaults>) { return null; }\n',
      Toned:
        'const tones = {...undeclaredTones};\nexport function Toned(props: Partial<Record<keyof typeof tones, string>>) { return null; }\n',
    }).map(([name, source]) =>
      component(name, source, {props: [prop('label', 'string')]}),
    );
    // A name declared nowhere in a JavaScript component's JSDoc, which `tsc`
    // doesn't report there.
    const documented = component(
      'Documented',
      '/** @param {Omit<{label: string; size?: number}, keyof NowhereJs>} props */\nexport function Documented(props) { return null; }\n',
      {props: [prop('label', 'string')]},
    );
    const jsx = documented.sourcePath.replace(/\.tsx$/, '.jsx');
    fs.renameSync(documented.sourcePath, jsx);
    references.push({...documented, sourcePath: jsx, sources: [jsx]});
    // A module found without types resolves: its names are `any`.
    const untypedDir = path.join(pkg, 'node_modules', 'untyped-dep');
    fs.mkdirSync(untypedDir, {recursive: true});
    fs.writeFileSync(
      path.join(untypedDir, 'package.json'),
      JSON.stringify({name: 'untyped-dep', main: 'index.js'}),
    );
    fs.writeFileSync(
      path.join(untypedDir, 'index.js'),
      'export const fmt = text => text;\n',
    );
    const untyped = component(
      'Untyped',
      "import {fmt} from 'untyped-dep';\nexport function Untyped(props: {label?: string}) { fmt(props.label); return null; }\n",
      {props: [prop('label', 'string')]},
    );
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
    // A missing import in the files a component comes from lists it, however
    // the props reach it: only a member's type, a value's property, a
    // conditional, `??`, a comma, or an own HOC that maps over `keyof P`.
    const reached = Object.entries({
      Member:
        'interface Holder<T> { label?: T } export function Member(props: Holder<MissingProps>) { return null; }',
      Header:
        'function Inner(props: {label?: string}) { return null; } const Card = Object.assign(Inner, {Header: Inner}); export const Header = Card.Header;',
      Chosen:
        'function Inner(props: {label?: string}) { return null; } export const Chosen = (globalThis as {x?: 1}).x ? Inner : Inner;',
      Fallback:
        'function Inner(props: {label?: string}) { return null; } export const Fallback = (undefined as typeof Inner | undefined) ?? Inner;',
      Comma:
        'function Inner(props: {label?: string}) { return null; } export const Comma = (0, Inner);',
      Keyed:
        'function withKeys<P>(c: (props: P) => null) { return (props: {[K in keyof P]?: string}) => c(props as P); } export const Keyed = withKeys((props: MissingProps) => null);',
    }).map(([name, source]) =>
      component(
        name,
        `import type {MissingProps} from '@acme/not-installed';\n${source}\n`,
        {props: [prop('label', 'string')]},
      ),
    );

    // Props that take names from a type parameter, such as the element a
    // component renders, accept any name until it is used.
    const PROPS_OF = [
      'interface Intrinsic { div: {title?: string}; span: {lang?: string} }',
      'type ElementType = keyof Intrinsic | ((props: any) => unknown);',
      'type PropsOf<E> = E extends (props: infer P) => unknown ? P : E extends keyof Intrinsic ? Intrinsic[E] : {};',
      "type Prefixed<N extends string> = {[K in 'value' | 'change' as `${N}${Capitalize<K>}`]: string};",
      "type Pair<N extends string> = {label: string} & {[K in 'a' | 'b' as `${N}${K}`]: string};",
      'type Relayed<M extends string> = Prefixed<M>;',
      'type Except<O, X extends keyof O> = {[K in keyof O as K extends X ? never : K]: O[K]};',
      'type PickByValue<O, V> = {[K in keyof O as O[K] extends V ? K : never]: O[K]};',
    ];
    const generics = Object.entries({
      Poly: "export type PolyProps<E extends ElementType> = {as?: E; padding?: number} & Omit<PropsOf<E>, 'as' | 'padding'>; export function Poly<E extends ElementType = 'div'>(props: PolyProps<E>) { return null; }",
      Joint:
        "export function Joint<E extends ElementType = 'div'>(props: {as?: E} & PropsOf<E>) { return null; }",
      Partly:
        "export function Partly<E extends ElementType = 'div'>(props: Partial<PropsOf<E>>) { return null; }",
      Remapped:
        'export function Remapped<T extends Record<string, unknown> = {value: string}>(props: {[K in keyof T & string as `on${Capitalize<K>}Change`]?: (value: T[K]) => void}) { return null; }',
      Inferred:
        'interface InferredBase { label?: string } export function Inferred<P extends InferredBase>(props: P) { return null; }',
      // An `as` clause that names props from one: through an alias (in an
      // intersection, or through another alias), inline, or behind a
      // condition; and keys made from one.
      PrefixAlias:
        'export function PrefixAlias<N extends string>(props: Prefixed<N>) { return null; }',
      PrefixNested:
        'export function PrefixNested<N extends string>(props: Pair<N>) { return null; }',
      PrefixDeep:
        'export function PrefixDeep<N extends string>(props: Relayed<N>) { return null; }',
      Templated:
        'export function Templated<K extends string>(props: {[P in `on${K}`]?: () => void}) { return null; }',
      PrefixInline:
        "export function PrefixInline<N extends string>(props: {[K in 'value' | 'change' as `${N}${Capitalize<K>}`]?: string}) { return null; }",
      PrefixGated:
        "export function PrefixGated<T extends boolean>(props: {[K in 'value' | 'change' as T extends true ? K : never]?: string}) { return null; }",
      // Props made from one that show the compiler no members at all.
      Bagged:
        'interface Bag<T> {} export function Bagged<T>(props: Bag<T>) { return null; }',
    }).map(([name, source]) =>
      component(name, [...PROPS_OF, source].join('\n'), {
        props: [prop('elevation', 'number')],
      }),
    );
    // A generic whose own props take any name, or map keys of its own (an
    // `as` clause over its own key, or an alias or key filter given fixed
    // arguments), has names of its own: compared.
    const own = (/** @type {string} */ names) =>
      names.split(' ').map(name => prop(name, 'X', {required: true}));
    const owned = [
      ['GenericOpen', '{items: T[]; [key: string]: any}', 'items'],
      ['GenericRecord', '{items: T[]} & Record<string, any>', 'items'],
      ['GenericRecordKeys', "Record<'value' | 'initial', T>", 'initial value'],
      ['GenericFiltered', "{[K in 'a' | 'b' as Exclude<K, 'b'>]: T}", 'a'],
      ['GenericPrefixed', "Prefixed<'my'>", 'myChange myValue'],
      ['GenericPair', "Pair<'my'>", 'label mya myb'],
      ['GenericRelayed', "Relayed<'my'>", 'myChange myValue'],
      [
        'GenericExcept',
        "{items: T[]} & Except<{a: string; b: string}, 'b'>",
        'a items',
      ],
      [
        'GenericByValue',
        '{items: T[]} & PickByValue<{onPick: () => void; size: number}, Function>',
        'items onPick',
      ],
    ].map(([name, props, names]) =>
      component(
        name,
        [
          ...PROPS_OF,
          `export function ${name}<T>(props: ${props}) { return null; }`,
        ].join('\n'),
        {props: own(names)},
      ),
    );
    // Props that are plainly empty, generic or not, are compared: TypeScript
    // takes none of the documented props.
    const empty = ['NoProps', 'NoPropsT<T>'].map(name =>
      component(
        name.replace('<T>', ''),
        `export function ${name}(props: {}) { return null; }\n`,
        {props: [prop('label', 'string')]},
      ),
    );

    const report = await compare([
      ...unread,
      lonely,
      open,
      ...reached,
      ...references,
      untyped,
      ...generics,
      ...owned,
      ...empty,
    ]);

    expect(kinds(report)).toEqual([
      'NoProps.label not_in_code',
      'NoPropsT.label not_in_code',
    ]);
    expect(report.components).toBe(13);
    const generic_ =
      'Bagged Inferred Joint Partly Poly PrefixAlias PrefixDeep PrefixGated PrefixInline PrefixNested Remapped Templated'.split(
        ' ',
      );
    expect(report.unchecked.map(u => u.component)).toEqual(
      'Aliased Bagged Bare Chosen Classy Comma Deep Documented Effect Fallback Ghost Handlers Header Inferred Joined Joint Kept Keyed Lonely Mapped Member Named Nested Omitted Omitting Partly Peered Phantom Picked Poly PrefixAlias PrefixDeep Prefixed PrefixGated PrefixInline PrefixNested Recorded Referenced Remapped Sized Spread Templated Toned Unnamed Valued Wrapped'.split(
        ' ',
      ),
    );
    // A type the compiler can't work out, though every reference resolves.
    const untyped_ =
      'Aliased Documented Handlers Omitting Recorded Sized Spread Toned Valued'.split(
        ' ',
      );
    for (const {component: name, reason} of report.unchecked) {
      expect(reason).toContain(
        name === 'Lonely'
          ? 'Lonely.tsx has no export named Lonely'
          : generic_.includes(name)
            ? 'from a type parameter'
            : untyped_.includes(name)
              ? "a type the compiler can't work out"
              : 'could not resolve',
      );
    }
  });
});

/**
 * A multi-component doc's entry.
 * @param {string} name
 * @param {any[]} props
 */
const entry = (name, props) => ({
  name,
  displayName: name,
  description: 'Fixture.',
  props,
});

/** @param {import('./prop-drift.mjs').PropDriftComponent[]} components */
function compareDocs(components) {
  return comparePropDocs(components, {packageDir: pkg, resolveFrom: [pkg]});
}

describe('comparePropDocs', () => {
  it('compares each entry of a multi-component doc against its own export, and skips hooks', async () => {
    withTypeScript();
    const tabs = component(
      'Tabs',
      `export function Tabs(props: {value: string}) { return null; }
export function Tab(props: {value: string; isDisabled?: boolean}) { return null; }
export function useTabs(options: {value: string}) { return options; }`,
      {
        components: [
          entry('Tabs', [prop('value', 'string', {required: true})]),
          entry('Tab', [
            prop('value', 'string', {required: true}),
            prop('isSelected', 'boolean'),
          ]),
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

    const report = await compareDocs([tabs]);

    expect(report.components).toBe(2);
    expect(kinds(report)).toEqual([
      'Tab.isDisabled not_in_doc',
      'Tab.isSelected not_in_code',
    ]);
  });

  it('compares a member record only against its own source, and the family record leaves that member alone', async () => {
    withTypeScript();
    const status = component(
      'Status',
      'export function Status(props: {value: string}) { return null; }\n',
      {
        components: [
          entry('Status', [prop('value', 'string', {required: true})]),
          entry('StatusGlyph', [
            prop('size', 'number'),
            prop('tone', 'string'),
          ]),
        ],
      },
    );
    const glyphSource = path.join(pkg, 'components', 'StatusView.tsx');
    fs.writeFileSync(
      glyphSource,
      'export function StatusGlyph(props: {size?: number}) { return null; }\n',
    );

    const report = await compareDocs([
      status,
      {...status, name: 'StatusGlyph', sourcePath: glyphSource},
    ]);

    expect(report.unchecked).toEqual([]);
    expect(report.components).toBe(2);
    expect(kinds(report)).toEqual(['StatusGlyph.tone not_in_code']);
    expect(report.findings[0].source).toBe('components/StatusView.tsx');
  });

  it('lists a member record that no file in the package declares as not compared', async () => {
    withTypeScript();
    const status = component(
      'Status',
      'export function Status(props: {value: string}) { return null; }\n',
      {
        components: [
          entry('Status', [prop('value', 'string', {required: true})]),
          entry('StatusGlyph', [prop('size', 'number')]),
        ],
      },
    );

    // Only another folder, or built output, declares the member.
    const report = await compareDocs([
      status,
      {...status, name: 'StatusGlyph', sourcePath: null},
    ]);

    expect(report.components).toBe(1);
    expect(report.findings).toEqual([]);
    expect(report.unchecked).toEqual([
      {
        component: 'StatusGlyph',
        doc: 'components/Status.doc.mjs',
        reason: 'no source file for StatusGlyph',
      },
    ]);
  });

  it('compares every entry of a family doc named after another export, and lists one with no source as not compared', async () => {
    withTypeScript();
    const menu = component(
      'Menu',
      [
        'export function MenuRoot(props: {open?: boolean}) { return null; }',
        'export function MenuItem(props: {value: string}) { return null; }',
      ].join('\n'),
      {
        name: 'MenuRoot',
        hiddenComponents: ['MenuItem', 'MenuPart'],
        components: [
          entry('MenuItem', [prop('label', 'string')]),
          entry('MenuGhost', [prop('tone', 'string')]),
          entry('MenuPart', [prop('tone', 'string')]),
        ],
      },
    );
    // A hidden entry declared in another file of the doc's folder.
    fs.writeFileSync(
      path.join(pkg, 'components', 'menu-parts.tsx'),
      'export function MenuPart(props: {depth?: number}) { return null; }\n',
    );

    // Discovery records the doc under `MenuRoot` and leaves the hidden
    // `MenuItem` and `MenuPart` and the unbuilt `MenuGhost` without records
    // of their own.
    const report = await compareDocs([{...menu, name: 'MenuRoot'}]);

    expect(kinds(report)).toEqual([
      'MenuItem.label not_in_code',
      'MenuItem.value not_in_doc',
      'MenuPart.depth not_in_doc',
      'MenuPart.tone not_in_code',
    ]);
    expect(report.unchecked).toEqual([
      {
        component: 'MenuGhost',
        doc: 'components/Menu.doc.mjs',
        reason: 'Menu.tsx has no export named MenuGhost',
      },
    ]);
  });

  it("compares a doc's own props with the export its name names, which another file can hold", async () => {
    withTypeScript();
    const status = component(
      'Status',
      'export function Status(props: {value: string}) { return null; }\n',
      {name: 'StatusView', props: [prop('size', 'number')]},
    );
    const viewSource = path.join(pkg, 'components', 'StatusView.tsx');
    fs.writeFileSync(
      viewSource,
      'export function StatusView(props: {size?: number}) { return null; }\n',
    );

    // Discovery names the record after the file, or after the export.
    const byFile = await compareDocs([status]);
    const byExport = await compareDocs([
      {...status, name: 'StatusView', sourcePath: viewSource},
    ]);

    for (const report of [byFile, byExport]) {
      expect(report.unchecked).toEqual([]);
      expect(report.components).toBe(1);
      expect(report.findings).toEqual([]);
    }
  });

  it('compares a table for one component in each doc that has one', async () => {
    withTypeScript();
    const title = prop('title', 'string', {required: true});
    const list = component(
      'List',
      'export function List(props: {label: string}) { return null; }\n',
      {
        components: [
          entry('List', [prop('label', 'string', {required: true})]),
          entry('ListGroup', [title]),
        ],
      },
    );
    const group = component(
      'ListGroup',
      'export function ListGroup(props: {title: string}) { return null; }\n',
      {props: [title, prop('stale', 'string')]},
    );

    const report = await compareDocs([list, group]);

    expect(report.components).toBe(3);
    expect(kinds(report)).toEqual(['ListGroup.stale not_in_code']);
    expect(report.findings[0].doc).toBe('components/ListGroup.doc.mjs');
  });

  it('lists every component as not compared when a declaration file the config includes, or a type package it names, does not resolve', async () => {
    withTypeScript();
    const tsconfig = path.join(pkg, 'tsconfig.json');
    const config = JSON.parse(fs.readFileSync(tsconfig, 'utf8'));
    /** @param {object} options */
    const configure = options =>
      fs.writeFileSync(
        tsconfig,
        JSON.stringify({
          ...config,
          compilerOptions: {...config.compilerOptions, ...options},
          include: ['components', 'types'],
        }),
      );
    fs.mkdirSync(path.join(pkg, 'types'));
    const globals = path.join(pkg, 'types', 'globals.d.ts');
    const tables = () => [
      component(
        'Omitted',
        'export function Omitted(props: Omit<{label: string; size?: number}, keyof MissingProps>) { return null; }\n',
        {
          props: [
            prop('label', 'string', {required: true}),
            prop('size', 'number'),
          ],
        },
      ),
      component(
        'Plain',
        'export function Plain(props: {label?: string}) { return null; }\n',
        {props: [prop('label', 'string')]},
      ),
    ];
    /** @param {RegExp} reason */
    const unread = reason =>
      ['Omitted', 'Plain'].map(name => ({
        component: name,
        doc: `components/${name}.doc.mjs`,
        reason: expect.stringMatching(reason),
      }));

    // A global type made from a package that isn't installed.
    configure({});
    fs.writeFileSync(
      globals,
      "import type {Props} from '@acme/not-installed';\ndeclare global { type MissingProps = Props; }\n",
    );
    let report = await compare(tables());
    expect(report.findings).toEqual([]);
    expect(report.unchecked).toEqual(
      unread(
        /depends on `@acme\/not-installed` \(imported in \.\.\/types\/globals\.d\.ts\)/,
      ),
    );

    // A global type made from a name declared nowhere.
    fs.writeFileSync(
      globals,
      'declare global { type MissingProps = NowhereProps; }\nexport {};\n',
    );
    report = await compare(tables());
    expect(report.findings).toEqual([]);
    expect(report.unchecked).toEqual(
      unread(
        /depends on `NowhereProps` \(used in \.\.\/types\/globals\.d\.ts\)/,
      ),
    );

    // A type package the config names that isn't installed.
    fs.writeFileSync(
      globals,
      'declare global { type MissingProps = {id?: string}; }\nexport {};\n',
    );
    configure({types: ['@acme/not-installed-globals']});
    report = await compare(tables());
    expect(report.findings).toEqual([]);
    expect(report.unchecked).toEqual(
      unread(
        /depends on the types `@acme\/not-installed-globals` \(named in \.\.\/tsconfig\.json\)/,
      ),
    );

    // Both resolved: compared.
    configure({types: []});
    report = await compare(tables());
    expect(report.unchecked).toEqual([]);
    expect(report.components).toBe(2);
  });

  it("lists every table, with the error, when the package's TypeScript config has an error", async () => {
    withTypeScript();
    fs.writeFileSync(
      path.join(pkg, 'tsconfig.json'),
      JSON.stringify({extends: './missing-base.json'}),
    );
    const titled = component(
      'Titled',
      'export function Titled(props: {title?: string}) { return null; }\n',
      {props: [prop('title', 'string')]},
    );

    const report = await compare([titled]);

    expect(report.components).toBe(0);
    expect(report.unchecked).toEqual([
      expect.objectContaining({
        component: 'Titled',
        reason: expect.stringMatching(
          /config has an error.*missing-base\.json/,
        ),
      }),
    ]);
  });

  it('accepts a name through an index signature only as TypeScript would', async () => {
    withTypeScript();
    const keyed = component(
      'Keyed',
      [
        'export interface KeyedProps {',
        '  [key: `data-${string}`]: string | undefined;',
        '  [key: `${string}:${string}`]: string;',
        '  [key: `col${number}`]: number;',
        '  [key: `on${Capitalize<string>}`]: () => void;',
        '}',
        'export function Keyed(props: KeyedProps) { return null; }',
      ].join('\n'),
      {
        props: [
          prop('data-section', 'string'),
          prop('a:b', 'string'),
          prop('col2', 'number'),
          prop('onClick', '() => void'),
          prop('elevation', 'string'),
          prop('colSpan', 'string'),
          prop('onclick', 'string'),
        ],
      },
    );
    const empty = component(
      'Empty',
      `interface EmptyProps { label?: string }
export function Empty(props: EmptyProps | Record<string, never>) { return null; }`,
      {props: [prop('label', 'string'), prop('elevation', 'number')]},
    );
    const typedAny = component(
      'TypedAny',
      'export function TypedAny(props: any) { return null; }\n',
      {props: [prop('label', 'string')]},
    );
    const anyConst = component(
      'AnyConst',
      'export const AnyConst: any = null;\n',
      {props: [prop('label', 'string')]},
    );

    const report = await compare([keyed, empty, typedAny, anyConst]);

    expect(kinds(report)).toEqual([
      'Empty.elevation not_in_code',
      'Keyed.colSpan not_in_code',
      'Keyed.elevation not_in_code',
      'Keyed.onclick not_in_code',
    ]);
    expect(report.unchecked.map(u => [u.component, u.reason])).toEqual([
      ['AnyConst', expect.stringContaining('typed `any`')],
      ['TypedAny', expect.stringContaining('typed `any`')],
    ]);
  });

  it("reads props through React's component types, lists the ones typed any, and loads the ambient types tsconfig includes", async () => {
    withTypeScript();
    fs.mkdirSync(path.join(pkg, 'node_modules', '@types'), {recursive: true});
    fs.symlinkSync(
      path.dirname(require.resolve('@types/react/package.json')),
      path.join(pkg, 'node_modules', '@types', 'react'),
      'dir',
    );
    const tsconfig = path.join(pkg, 'tsconfig.json');
    const config = JSON.parse(fs.readFileSync(tsconfig, 'utf8'));
    fs.writeFileSync(
      tsconfig,
      JSON.stringify({...config, include: ['components', 'types']}),
    );
    fs.mkdirSync(path.join(pkg, 'types'));
    fs.writeFileSync(
      path.join(pkg, 'types', 'ambient.d.ts'),
      'interface AmbientProps { label?: string }\n',
    );
    const source = `import {forwardRef, memo, type FC, type ComponentType} from 'react';
export const Fc: FC<any> = () => null;
export const Memo = memo((props: any) => null);
export const Fwd = forwardRef<HTMLDivElement, any>((props, ref) => null);
export function Ambient(props: AmbientProps) { return null; }
export const Typed: ComponentType<{label?: string}> = () => null;
const withName = <P,>(c: ComponentType<P>): ComponentType<P> => c;
export const Hoc = withName((props: {label?: string}) => null);`;
    const props = [prop('label', 'string'), prop('elevation', 'number')];

    const report = await compare(
      'Fc Memo Fwd Ambient Typed Hoc'
        .split(' ')
        .map(name => component(name, source, {props})),
    );

    expect(kinds(report)).toEqual(
      'Ambient Hoc Typed'
        .split(' ')
        .map(name => `${name}.elevation not_in_code`),
    );
    expect(report.unchecked.map(u => [u.component, u.reason])).toEqual(
      ['Fc', 'Fwd', 'Memo'].map(name => [
        name,
        expect.stringContaining('typed `any`'),
      ]),
    );
  });
});
