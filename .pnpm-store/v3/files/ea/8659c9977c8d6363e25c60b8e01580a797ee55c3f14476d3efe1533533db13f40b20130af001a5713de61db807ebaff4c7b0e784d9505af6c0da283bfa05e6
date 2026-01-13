/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as t from '@babel/types';
import type { PluginPass } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type {
  CompiledNamespaces,
  StyleXOptions as RuntimeOptions,
} from '@stylexjs/shared';
import type { ImportOptions } from '@babel/helper-module-imports';
type ImportAdditionOptions = Omit<
  Partial<ImportOptions>,
  'ensureLiveReference' | 'ensureNoContext'
>;
export type ImportPathResolution =
  | false
  | ['themeNameRef' | 'filePath', string];
type ModuleResolution =
  | Readonly<{
      type: 'commonJS';
      rootDir?: null | undefined | string;
      themeFileExtension?: null | undefined | string;
    }>
  | Readonly<{ type: 'haste'; themeFileExtension?: null | undefined | string }>
  | Readonly<{
      type: 'experimental_crossFileParsing';
      rootDir?: string;
      themeFileExtension?: null | undefined | string;
    }>;
export type StyleXOptions = Readonly<
  Omit<
    RuntimeOptions,
    keyof ({
      aliases?:
        | null
        | undefined
        | Readonly<{ [$$Key$$: string]: string | ReadonlyArray<string> }>;
      enableDebugClassNames?: boolean;
      enableDebugDataProp?: boolean;
      enableDevClassNames?: boolean;
      genConditionalClasses: boolean;
      importSources: ReadonlyArray<
        string | Readonly<{ from: string; as: string }>
      >;
      rewriteAliases?: boolean;
      runtimeInjection:
        | boolean
        | (null | undefined | string)
        | Readonly<{ from: string; as: string }>;
      treeshakeCompensation?: boolean;
      unstable_moduleResolution?: null | undefined | ModuleResolution;
    })
  > & {
    aliases?:
      | null
      | undefined
      | Readonly<{ [$$Key$$: string]: string | ReadonlyArray<string> }>;
    enableDebugClassNames?: boolean;
    enableDebugDataProp?: boolean;
    enableDevClassNames?: boolean;
    genConditionalClasses: boolean;
    importSources: ReadonlyArray<
      string | Readonly<{ from: string; as: string }>
    >;
    rewriteAliases?: boolean;
    runtimeInjection:
      | boolean
      | (null | undefined | string)
      | Readonly<{ from: string; as: string }>;
    treeshakeCompensation?: boolean;
    unstable_moduleResolution?: null | undefined | ModuleResolution;
  }
>;
type StyleXStateOptions = Readonly<
  Omit<
    StyleXOptions,
    keyof ({
      runtimeInjection:
        | (null | undefined | string)
        | Readonly<{ from: string; as: null | undefined | string }>;
      aliases?:
        | null
        | undefined
        | Readonly<{ [$$Key$$: string]: ReadonlyArray<string> }>;
      rewriteAliases: boolean;
    })
  > & {
    runtimeInjection:
      | (null | undefined | string)
      | Readonly<{ from: string; as: null | undefined | string }>;
    aliases?:
      | null
      | undefined
      | Readonly<{ [$$Key$$: string]: ReadonlyArray<string> }>;
    rewriteAliases: boolean;
  }
>;
declare class StateManager {
  readonly _state: PluginPass;
  readonly importPaths: Set<string>;
  readonly stylexImport: Set<string>;
  readonly stylexPropsImport: Set<string>;
  readonly stylexAttrsImport: Set<string>;
  readonly stylexCreateImport: Set<string>;
  readonly stylexIncludeImport: Set<string>;
  readonly stylexFirstThatWorksImport: Set<string>;
  readonly stylexKeyframesImport: Set<string>;
  readonly stylexDefineVarsImport: Set<string>;
  readonly stylexCreateThemeImport: Set<string>;
  readonly stylexTypesImport: Set<string>;
  injectImportInserted: null | undefined | t.Identifier;
  readonly styleMap: Map<string, CompiledNamespaces>;
  readonly styleVars: Map<string, NodePath>;
  readonly styleVarsToKeep: Set<[string, true | string, true | Array<string>]>;
  inStyleXCreate: boolean;
  readonly options: StyleXStateOptions;
  constructor(state: PluginPass);
  setOptions(options: {
    readonly [$$Key$$: string]: unknown;
  }): StyleXStateOptions;
  get importPathString(): string;
  get importSources(): ReadonlyArray<string>;
  importAs(source: string): null | string;
  get canReferenceTheme(): boolean;
  get metadata(): { [key: string]: any };
  get runtimeInjection():
    | null
    | undefined
    | Readonly<{ from: string; as?: null | undefined | string }>;
  addNamedImport(
    statementPath: NodePath,
    as: string,
    from: string,
    options: ImportAdditionOptions,
  ): t.Identifier;
  addDefaultImport(
    statementPath: NodePath,
    from: string,
    options: ImportAdditionOptions,
  ): t.Identifier;
  get opts(): StyleXStateOptions;
  get isDebug(): boolean;
  get isDev(): boolean;
  get isTest(): boolean;
  get filename(): string | void;
  get cssVars(): any;
  get treeshakeCompensation(): boolean;
  get fileNameForHashing(): null | string;
  getPackageNameAndPath(
    filepath: string,
  ): null | readonly [packageName: string, packageDir: string];
  getCanonicalFilePath(filePath: string): string;
  importPathResolver(importPath: string): ImportPathResolution;
  addStyle(style: [string, { ltr: string; rtl?: string | null }, number]): void;
  registerStyles(
    styles: ReadonlyArray<
      [string, { ltr: string; rtl?: string | null }, number]
    >,
    path?: null | undefined | NodePath,
  ): void;
  markComposedNamespace(
    memberExpression: [string, true | string, true | Array<string>],
  ): void;
}
export default StateManager;
export declare const filePathResolver: (
  relativeFilePath: string,
  sourceFilePath: string,
  aliases: StyleXStateOptions['aliases'],
) => null | undefined | string;
export declare const EXTENSIONS: any;
export declare const matchesFileSuffix: (
  $$PARAM_0$$: string,
) => ($$PARAM_0$$: string) => boolean;
export declare function getRelativePath(from: string, to: string): string;
