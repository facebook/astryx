#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * Generates a JSON bundle of all @xds/core .d.ts files for the playground's
 * Monaco editor. Output: public/playground-types.json
 *
 * Structure: { "@xds/core": { "Button/index.d.ts": "...", ... } }
 *
 * Run: node scripts/generate-playground-types.mjs
 * Also runs as part of the prebuild/predev scripts.
 */

import {readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join, dirname, relative} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, '..', '..', 'packages', 'core', 'dist');
const outDir = join(root, 'public');

if (!existsSync(outDir)) mkdirSync(outDir, {recursive: true});

function collectDts(dir, base = dir) {
  const result = {};
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      Object.assign(result, collectDts(full, base));
    } else if (entry.endsWith('.d.ts') && !entry.endsWith('.d.ts.map')) {
      const relPath = relative(base, full);
      result[relPath] = readFileSync(full, 'utf-8');
    }
  }
  return result;
}

console.log(`Scanning ${distDir} for .d.ts files...`);

if (!existsSync(distDir)) {
  console.log('dist/ not found — skipping playground types generation (run pnpm build first)');
  // Write an empty placeholder so the app doesn't 404
  writeFileSync(join(outDir, 'playground-types.json'), '{}');
  process.exit(0);
}

const xdsTypes = collectDts(distDir);
const fileCount = Object.keys(xdsTypes).length;

// Also generate a minimal React types stub
const reactJsxRuntimeTypes = `
declare module 'react/jsx-runtime' {
  export namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
  export function jsx(type: any, props: any, key?: string): JSX.Element;
  export function jsxs(type: any, props: any, key?: string): JSX.Element;
  export const Fragment: any;
}
`;

const reactTypes = `
declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export type ComponentType<P = {}> = (props: P) => ReactElement | null;
  export type FC<P = {}> = ComponentType<P>;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type CSSProperties = Record<string, string | number>;
  export type MouseEvent<T = Element> = { target: T; currentTarget: T; preventDefault(): void; stopPropagation(): void };
  export type ChangeEvent<T = Element> = { target: T & { value: string }; currentTarget: T };
  export type FormEvent<T = Element> = { target: T; currentTarget: T; preventDefault(): void };
  export type KeyboardEvent<T = Element> = { key: string; code: string; target: T };
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;
  export type RefObject<T> = { current: T | null };
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useCallback<T extends Function>(callback: T, deps: readonly unknown[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useRef<T>(initialValue: T): RefObject<T>;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, Dispatch<A>];
  export function useContext<T>(context: any): T;
  export function useId(): string;
  export function useTransition(): [boolean, (callback: () => void) => void];
  export function useDeferredValue<T>(value: T): T;
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => ReactElement | null): ComponentType<P & { ref?: Ref<T> }>;
  export function memo<P>(component: ComponentType<P>): ComponentType<P>;
  export function createContext<T>(defaultValue: T): { Provider: ComponentType<{ value: T; children?: ReactNode }>; Consumer: ComponentType<{ children: (value: T) => ReactNode }> };
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export function cloneElement(element: ReactElement, props?: any, ...children: any[]): ReactElement;
  export function isValidElement(object: any): boolean;
  export const Fragment: any;
  export const Suspense: ComponentType<{ fallback?: ReactNode; children?: ReactNode }>;
  export const StrictMode: ComponentType<{ children?: ReactNode }>;
  export default { createElement, Fragment, useState, useEffect, useCallback, useMemo, useRef, useReducer, useContext, useId, useTransition, useDeferredValue, forwardRef, memo, createContext, cloneElement, isValidElement, Suspense, StrictMode };
}
`;

const stylexTypes = `
declare module '@stylexjs/stylex' {
  type StyleValue = string | number | null | undefined | false;
  type NestedStyle = { [key: string]: StyleValue | NestedStyle };
  type StyleMap<T extends Record<string, NestedStyle>> = { [K in keyof T]: unknown };
  interface StyleX {
    create<T extends Record<string, NestedStyle>>(styles: T): StyleMap<T>;
    props(...styles: Array<unknown | false | null | undefined>): { className?: string; style?: Record<string, string> };
    defineVars<T extends Record<string, string>>(vars: T): T;
    keyframes(kf: Record<string, NestedStyle>): string;
    firstThatWorks<T>(...values: T[]): T;
    types: {
      angle: <T extends string>(v: T) => T;
      color: <T extends string>(v: T) => T;
      image: <T extends string>(v: T) => T;
      integer: <T extends string>(v: T) => T;
      length: <T extends string>(v: T) => T;
      lengthPercentage: <T extends string>(v: T) => T;
      number: <T extends string>(v: T) => T;
      percentage: <T extends string>(v: T) => T;
      resolution: <T extends string>(v: T) => T;
      time: <T extends string>(v: T) => T;
      url: <T extends string>(v: T) => T;
    };
  }
  const stylex: StyleX;
  export default stylex;
  export const create: StyleX['create'];
  export const props: StyleX['props'];
  export const defineVars: StyleX['defineVars'];
  export const keyframes: StyleX['keyframes'];
  export const firstThatWorks: StyleX['firstThatWorks'];
  export const types: StyleX['types'];
}
`;

// Heroicons ambient module declarations. Template and example code still
// imports icons from '@heroicons/react/{16,20,24}/{outline,solid}'. Bundling
// the package's ~10k individual .d.ts files would bloat the payload, so we
// synthesize one ambient module per variant exposing each icon as a named
// export. Icon names are read from the installed package's per-variant
// index.d.ts so the set stays accurate (e.g. 16/solid ships fewer icons).
function buildHeroiconTypes() {
  const variants = ['16/solid', '20/solid', '24/outline', '24/solid'];
  const heroRoot = join(root, '..', '..', 'node_modules', '@heroicons', 'react');
  const iconType =
    'React.ComponentType<React.SVGProps<SVGSVGElement> & ' +
    '{title?: string; titleId?: string}>';
  const files = {};

  for (const variant of variants) {
    const indexPath = join(heroRoot, variant, 'index.d.ts');
    if (!existsSync(indexPath)) continue;

    const src = readFileSync(indexPath, 'utf-8');
    const names = [
      ...src.matchAll(/export \{ default as (\w+) \}/g),
    ].map(m => m[1]);
    if (names.length === 0) continue;

    const exports = names.map(n => `  export const ${n}: HeroIcon;`).join('\n');
    files[`${variant}.d.ts`] =
      `declare module '@heroicons/react/${variant}' {\n` +
      `  type HeroIcon = ${iconType};\n` +
      `${exports}\n}`;
  }

  return files;
}

const heroiconTypes = buildHeroiconTypes();
console.log(
  `Generated heroicon types: ${Object.keys(heroiconTypes).length} variants`,
);

const output = {
  '@xds/core': xdsTypes,
  react: {'index.d.ts': reactTypes, 'jsx-runtime.d.ts': reactJsxRuntimeTypes},
  '@stylexjs/stylex': {'index.d.ts': stylexTypes},
  '@heroicons/react': heroiconTypes,
};

const json = JSON.stringify(output);
writeFileSync(join(outDir, 'playground-types.json'), json);
console.log(`Generated playground-types.json: ${fileCount} XDS type files, ${(json.length / 1024).toFixed(0)}KB`);
