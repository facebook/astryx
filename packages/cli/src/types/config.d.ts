// Copyright (c) Meta Platforms, Inc. and affiliates.

/** User config exported from astryx.config.mjs. */
export interface AstryxConfig {
  /** External package directories to scan for package.json astryx.docs metadata. */
  packages?: string | string[];
  /** Integration package names or manifest paths. */
  integrations?: string | string[];
  /** Gap report delivery override. Omit for default GitHub issue filing. */
  gapReport?: false | {command: string};
  /** Template hooks. */
  template?: {
    get?: (id: string) => string | Promise<string>;
  };
  [key: string]: unknown;
}

export interface AstryxIntegrationCodemod {
  name: string;
  from?: string;
  to?: string;
  title?: string;
  description?: string;
  pr?: string;
  optional?: boolean;
  fileExtensions?: string[];
  transform:
    | string
    | ((file: unknown, api: unknown) => string | undefined | null);
}

export interface AstryxPostCodemodContext {
  packageDir: string;
  codemodDir: string;
  changedFiles: string[];
  absoluteChangedFiles: string[];
  packageChangedFiles: string[];
  apply: boolean;
  run: (
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      timeoutMs?: number;
      env?: Record<string, string>;
    },
  ) => Promise<void>;
}

export interface AstryxPostCodemodHook {
  name?: string;
  run?: (context: AstryxPostCodemodContext) => void | Promise<void>;
  command?: (context: AstryxPostCodemodContext) =>
    | {
        command: string;
        args?: string[];
        cwd?: string;
        timeoutMs?: number;
        env?: Record<string, string>;
      }
    | null
    | undefined
    | Promise<
        | {
            command: string;
            args?: string[];
            cwd?: string;
            timeoutMs?: number;
            env?: Record<string, string>;
          }
        | null
        | undefined
      >;
}

/** Integration manifest exported from an astryx.integration.mjs file. */
export interface AstryxIntegration {
  name: string;
  version?: string;
  displayName?: string;
  description?: string;
  /** Relative docs root containing *.doc.mjs files. */
  docs?: string;
  category?: string;
  /** Relative block-template root. */
  blocks?: string;
  gapReport?: false | {command: string};
  template?: {
    get?: string | ((id: string) => string | Promise<string>);
  };
  codemods?: AstryxIntegrationCodemod[];
  postCodemod?: AstryxPostCodemodHook[];
  [key: string]: unknown;
}

export declare function createConfig<T extends AstryxConfig>(config: T): T;
export declare function createIntegration<T extends AstryxIntegration>(
  integration: T,
): T;
