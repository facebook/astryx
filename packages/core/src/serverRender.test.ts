// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file serverRender.test.ts
 * @input Loads the `react-server` entries (Button, IconButton, TopNav) and the
 *   directive-free Text, Heading and Kbd under React's `react-server` build,
 *   with every `'use client'` module they reach swapped for a client reference
 * @output Server-render tests: each presentational path renders on the server
 *   with no hook call and no client reference other than its listed client
 *   parts; each interactive path renders exactly one client reference
 * @position Cross-cutting runtime companion of serverSafeComponents.test.ts
 *   (#823). That test proves the import graph; this one renders it the way a
 *   React Server Components bundler would: `react` resolves its
 *   `react-server` export (no useState, useContext or createContext; any hook
 *   call throws, as no client dispatcher is installed), and a `'use client'`
 *   module becomes an opaque reference that is recorded, never run.
 *   react-dom/server cannot load under that condition (it throws by design),
 *   so a small resolver walks the element tree instead. Markup parity with
 *   the client components is proven by ButtonShell.test.tsx and
 *   TopNavShell.test.tsx.
 *
 * SYNC: When a server shell or its client parts change, update
 * __tests__/serverEntryClientParts.ts and the expectations here.
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import ts from 'typescript';
import type * as ReactModule from 'react';
import {SERVER_ENTRY_CLIENT_PARTS} from './__tests__/serverEntryClientParts';
import type {Button as ButtonType} from './Button/ButtonShell';
import type {IconButton as IconButtonType} from './IconButton/IconButtonShell';
import type {TopNav as TopNavType} from './TopNav/TopNavShell';
import type {TopNavItem as TopNavItemType} from './TopNav/TopNavItemShell';
import type {Text as TextType} from './Text';
import type {Heading as HeadingType} from './Heading';
import type {Kbd as KbdType} from './Kbd';

const SRC_DIR = __dirname;
const nodeRequire = createRequire(import.meta.url);
const reactDir = dirname(nodeRequire.resolve('react/package.json'));

const CLIENT_REFERENCE = Symbol.for('test.client.reference');
/** What React marks a `'use server'` function with: Flight passes it by id. */
const SERVER_REFERENCE = Symbol.for('react.server.reference');

/** A stand-in for a Server Action, the one function a Server Component can pass. */
function serverAction(): () => Promise<void> {
  const action = async () => {};
  return Object.assign(action, {$$typeof: SERVER_REFERENCE});
}

type ClientReference = ((props: unknown) => never) & {
  [CLIENT_REFERENCE]: string;
};

/** Every runtime name a module exports. */
function runtimeExportNames(file: string): string[] {
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, 'utf-8'),
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
  const names: string[] = [];
  const isExported = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    ts
      .getModifiers(node)
      ?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
  for (const statement of sourceFile.statements) {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) &&
      isExported(statement) &&
      statement.name
    ) {
      names.push(statement.name.text);
    } else if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        names.push(declaration.name.getText(sourceFile));
      }
    } else if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          names.push(element.name.text);
        }
      }
    }
  }
  return names;
}

/** What an RSC bundler hands the server for a `'use client'` module. */
function clientReferenceModule(rel: string): Record<string, unknown> {
  const exports: Record<string, unknown> = {};
  for (const name of runtimeExportNames(join(SRC_DIR, rel))) {
    const reference = (() => {
      throw new Error(`client reference ${rel}#${name} ran on the server`);
    }) as unknown as ClientReference;
    reference[CLIENT_REFERENCE] = `${rel}#${name}`;
    exports[name] = reference;
  }
  return exports;
}

interface Resolved {
  /** Host elements, text and client references, as the server would emit. */
  tree: unknown;
  /** Every client reference the tree renders, `file#export`. */
  references: string[];
}

type AnyElement = {
  $$typeof: symbol;
  type: unknown;
  props: Record<string, unknown>;
};

let React: typeof ReactModule;

function isElement(value: unknown): value is AnyElement {
  return React.isValidElement(value);
}

/**
 * Props crossing into a client reference must survive React Flight: plain
 * data, arrays and objects, and the already-rendered tree. A function, a
 * symbol or a class instance would fail to serialize in a real RSC bundler.
 */
function assertSerializable(value: unknown, where: string): void {
  if (value == null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return;
  }
  if (isElement(value)) {
    // Flight renders it: a host element, a client reference or a server
    // component, each checked where it renders.
    return;
  }
  if (typeof value === 'function' || typeof value === 'symbol') {
    if (
      typeof value === 'function' &&
      (CLIENT_REFERENCE in value ||
        (value as {$$typeof?: symbol}).$$typeof === SERVER_REFERENCE)
    ) {
      return;
    }
    throw new Error(`${where} receives a non-serializable ${typeof value}`);
  }
  if (Array.isArray(value)) {
    value.forEach(item => assertSerializable(item, where));
    return;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${where} receives a class instance`);
  }
  for (const item of Object.values(value)) {
    assertSerializable(item, where);
  }
}

/**
 * Render a server tree: call server components, keep host elements, and stop
 * at client references, rendering the server-side elements passed to them
 * (children and other element props) as React Flight does.
 */
async function resolveServerTree(node: unknown): Promise<Resolved> {
  const references: string[] = [];
  const resolveProps = async (props: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      out[key] =
        isElement(value) || Array.isArray(value) ? await walk(value) : value;
    }
    return out;
  };
  const walk = async (value: unknown): Promise<unknown> => {
    if (value == null || typeof value === 'boolean') {
      return null;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map(walk));
    }
    if (!isElement(value)) {
      return value;
    }
    const {type, props} = value;
    if (type === React.Fragment) {
      return walk(props.children);
    }
    if (typeof type === 'string') {
      return {host: type, props: await resolveProps(props)};
    }
    if (typeof type === 'function' && CLIENT_REFERENCE in type) {
      const id = (type as ClientReference)[CLIENT_REFERENCE];
      references.push(id);
      const resolved = await resolveProps(props);
      assertSerializable(resolved, id);
      return {client: id, props: resolved};
    }
    if (typeof type === 'function') {
      return walk(await (type as (p: unknown) => unknown)(props));
    }
    throw new Error(`unexpected element type ${String(type)}`);
  };
  const tree = await walk(node);
  return {tree, references};
}

/** Every distinct client reference, file and export, sorted. */
const distinct = (references: string[]) => [...new Set(references)].sort();

const svg = () => React.createElement('svg', {viewBox: '0 0 16 16'});

let Button: typeof ButtonType;
let IconButton: typeof IconButtonType;
let TopNav: typeof TopNavType;
let TopNavItem: typeof TopNavItemType;
let Text: typeof TextType;
let Heading: typeof HeadingType;
let Kbd: typeof KbdType;

/** createElement with children as arguments, for any of the components. */
const h = (type: unknown, props: object, ...children: unknown[]) =>
  React.createElement(type as never, props as never, ...(children as never[]));

beforeAll(async () => {
  vi.resetModules();
  // React's server JSX runtimes `require('react')` and insist on the server
  // build. In this jsdom project the plain specifier resolves the client
  // build, so load them with the server build standing in for it, as the
  // `react-server` condition would.
  const serverReact = nodeRequire(
    join(reactDir, 'react.react-server.js'),
  ) as Record<string, unknown>;
  const withServerReact = (file: string): Record<string, unknown> => {
    const reactIndex = nodeRequire.resolve('react');
    const previous = nodeRequire.cache[reactIndex];
    nodeRequire.cache[reactIndex] = {
      id: reactIndex,
      filename: reactIndex,
      loaded: true,
      exports: serverReact,
    } as NodeJS.Module;
    try {
      return nodeRequire(join(reactDir, file)) as Record<string, unknown>;
    } finally {
      if (previous) {
        nodeRequire.cache[reactIndex] = previous;
      } else {
        nodeRequire.cache[reactIndex] = undefined;
      }
    }
  };
  const jsxRuntime = withServerReact('jsx-runtime.react-server.js');
  const jsxDevRuntime = withServerReact('jsx-dev-runtime.react-server.js');
  vi.doMock('react', () => ({...serverReact, default: serverReact}));
  vi.doMock('react/jsx-runtime', () => jsxRuntime);
  vi.doMock('react/jsx-dev-runtime', () => jsxDevRuntime);
  const clientModules = new Set(
    Object.values(SERVER_ENTRY_CLIENT_PARTS).flatMap(parts =>
      Object.keys(parts),
    ),
  );
  // Client islands of the directive-free Text and Kbd (serverSafeComponents).
  clientModules.add('Text/TruncatedText.tsx');
  clientModules.add('Kbd/PlatformKbd.tsx');
  for (const rel of clientModules) {
    vi.doMock(join(SRC_DIR, rel), () => clientReferenceModule(rel));
  }

  React = await import('react');
  ({Button} = await import('./Button/index.server'));
  ({IconButton} = await import('./IconButton/index.server'));
  ({TopNav, TopNavItem} = await import('./TopNav/index.server'));
  ({Text} = await import('./Text'));
  ({Heading} = await import('./Heading'));
  ({Kbd} = await import('./Kbd'));
});

afterAll(() => {
  vi.doUnmock('react');
  vi.doUnmock('react/jsx-runtime');
  vi.doUnmock('react/jsx-dev-runtime');
  vi.resetModules();
});

const GATE = 'Button/ButtonContextGate.tsx#ButtonContextGate';
const ICON_SCOPE = 'Icon/IconSizeScope.tsx#IconSizeScope';
const CLIENT_BUTTON = 'Button/Button.tsx#Button';

describe('server render under the react-server condition', () => {
  it('loads React’s react-server build', () => {
    // The client-only surface is absent, so a hook call cannot pass silently.
    const names = Object.keys(React);
    expect(names).toContain('createElement');
    expect(names).not.toContain('useState');
    expect(names).not.toContain('useContext');
    expect(names).not.toContain('createContext');
  });

  describe('Button', () => {
    it.each([
      ['defaults', {label: 'Save'}],
      [
        'variant, size, width, elevation',
        {
          label: 'Go',
          variant: 'primary',
          size: 'lg',
          width: 120,
          elevation: 'low',
        },
      ],
      ['ghost', {label: 'More', variant: 'ghost'}],
      ['disabled submit', {label: 'Send', type: 'submit', isDisabled: true}],
      ['link', {label: 'Docs', href: '/docs', target: '_blank'}],
      ['end content', {label: 'Inbox', endContent: '3'}],
    ] as const)('renders %s on the server', async (_name, props) => {
      const {tree, references} = await resolveServerTree(
        React.createElement(Button, props as never),
      );
      expect(distinct(references)).toEqual([GATE]);
      // Inside the gate: the server-rendered element itself.
      const gate = tree as {props: {children: {host: string}}};
      expect(gate.props.children.host).toBe('href' in props ? 'a' : 'button');
    });

    it('renders the icon slot with the icon size client part', async () => {
      const {references} = await resolveServerTree(
        React.createElement(Button, {
          label: 'Edit',
          icon: svg(),
          isIconOnly: true,
        }),
      );
      expect(distinct(references)).toEqual([GATE, ICON_SCOPE]);
    });

    it.each([
      [
        'a Server Action clickAction',
        {label: 'Save', clickAction: serverAction()},
      ],
      ['isLoading', {label: 'Save', isLoading: true}],
      ['tooltip', {label: 'Save', tooltip: 'Saves'}],
    ] as const)('renders the client Button for %s', async (_name, props) => {
      const {references} = await resolveServerTree(
        React.createElement(Button, props as never),
      );
      expect(references).toEqual([CLIENT_BUTTON]);
    });

    it('rejects an event handler, as React Flight does for the client Button today', async () => {
      // A Server Component cannot pass a function other than a Server Action
      // to a client component; the shell routes it to the client Button,
      // where it fails exactly as it did before this entry existed.
      await expect(
        resolveServerTree(
          React.createElement(Button, {label: 'Save', onClick: () => {}}),
        ),
      ).rejects.toThrow(
        /Button\.tsx#Button receives a non-serializable function/,
      );
    });

    it('renders IconButton like Button', async () => {
      const {references} = await resolveServerTree(
        React.createElement(IconButton, {label: 'Settings', icon: svg()}),
      );
      expect(distinct(references)).toEqual([GATE, ICON_SCOPE]);
    });
  });

  describe('TopNav', () => {
    it('renders a header of items and buttons with only its client parts', async () => {
      const header = React.createElement(TopNav, {
        label: 'Main',
        heading: 'Stats',
        startContent: [
          React.createElement(TopNavItem, {
            key: 'a',
            label: 'Home',
            href: '/',
            isSelected: true,
          }),
          React.createElement(TopNavItem, {
            key: 'b',
            label: 'Packages',
            href: '/packages',
          }),
        ],
        endContent: React.createElement(Button, {
          label: 'Docs',
          variant: 'ghost',
          href: '/docs',
        }),
      });
      const {references} = await resolveServerTree(header);
      expect(distinct(references)).toEqual([
        GATE,
        'TopNav/TopNavFrame.tsx#TopNavFrame',
        'TopNav/TopNavFrame.tsx#TopNavSlotScope',
        'TopNav/TopNavItemGate.tsx#TopNavItemGate',
      ]);
      // The client TopNav, MobileNav and the menus are not referenced: they
      // load only in AppShell's mobile bar and drawer.
      expect(references).not.toContain('TopNav/TopNav.tsx#TopNav');
    });

    it('loads the translator only for the default landmark label', async () => {
      const {references} = await resolveServerTree(
        React.createElement(TopNav, {heading: 'Stats'}),
      );
      expect(distinct(references)).toEqual([
        'TopNav/TopNavLocalizedFrame.tsx#TopNavLocalizedFrame',
      ]);
    });

    it('routes an onClick to the client TopNavItem, which Flight rejects as before', async () => {
      await expect(
        resolveServerTree(
          React.createElement(TopNavItem, {label: 'Home', onClick: () => {}}),
        ),
      ).rejects.toThrow(
        /TopNavItem\.tsx#TopNavItem receives a non-serializable function/,
      );
    });
  });

  describe('Text, Heading and Kbd', () => {
    it('render with no client reference at all', async () => {
      for (const element of [
        h(Text, {type: 'body'}, 'Hello'),
        h(Text, {maxLines: 2, hasTruncateTooltip: false}, 'Clipped by CSS'),
        h(Heading, {level: 2}, 'Title'),
        React.createElement(Kbd, {keys: 'shift+k'}),
      ]) {
        const {references} = await resolveServerTree(element);
        expect(references).toEqual([]);
      }
    });

    it('take the truncation island for any explicit maxLines, so toggling keeps it', async () => {
      expect(
        (await resolveServerTree(h(Text, {maxLines: 0}, 'Short'))).references,
      ).toEqual(['Text/TruncatedText.tsx#TruncatedText']);
    });

    it('reference their client islands only for the props that need them', async () => {
      expect(
        (await resolveServerTree(h(Text, {maxLines: 1}, 'Long'))).references,
      ).toEqual(['Text/TruncatedText.tsx#TruncatedText']);
      expect(
        (await resolveServerTree(React.createElement(Kbd, {keys: 'mod+k'})))
          .references,
      ).toEqual(['Kbd/PlatformKbd.tsx#PlatformKbd']);
    });
  });
});
