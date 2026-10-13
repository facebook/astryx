// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Public type surface for `@astryxdesign/cli/host`. */

import type {DiscoverSource} from '../authoring/discover/type.js';

/** How one package in a plan resolves. */
export interface HostedPackageProvenance {
  name: string;
  version: string | null;
  source: 'project' | 'package-set';
  dir: string | null;
}

/** What the caller pins for one Astryx package. */
export interface HostedPackagePin {
  name: string;
  packageName: string;
  wanted: string;
  from: 'installed' | 'lockfile' | 'package.json';
  exact: boolean;
  installedDir: string | null;
}

/** What one candidate package root carries. */
export interface HostedRootReport {
  root: string;
  versions: Record<string, string | null>;
  conflicts: string[];
  cli: boolean;
}

/** The CLI selected for one invocation. */
export interface HostedCliSelection {
  dir: string;
  version: string | null;
  bin: string;
  runtime: string | null;
}

export type HostedPackageSetMode =
  'project-cli' | 'project' | 'matched' | 'incompatible' | 'hosted';

/** Complete, inspectable package-source decision for one invocation. */
export interface HostedPackageSetPlan {
  mode: HostedPackageSetMode;
  reason: 'no-project' | 'no-astryx-pins' | null;
  cwd: string;
  projectDir: string | null;
  root: string | null;
  cli: HostedCliSelection | null;
  command: string | null;
  declarations: string[];
  pins: HostedPackagePin[];
  roots: HostedRootReport[];
  packages: HostedPackageProvenance[];
  missing: string[];
  warnings: string[];
  error: string | null;
}

/** Host replacement for one package-set-served integration export. */
export interface HostedIntegrationHandler {
  discover?: DiscoverSource;
}

/** Integration package name to host-supplied handlers. */
export type HostedIntegrationHandlers = Readonly<
  Record<string, HostedIntegrationHandler>
>;

/** Minimal writable stream accepted by the host entry. */
export interface HostedCliOutput {
  write(chunk: string): unknown;
}

/** Inputs for one hosted CLI invocation. */
export interface HostedCliOptions {
  /** Caller working directory. Project files and writes stay here. */
  cwd?: string;
  /** Compatible package roots, newest first. */
  roots: readonly string[];
  /** Arguments after `astryx`. */
  argv?: readonly string[];
  /** Approved integrations for a hosted run. */
  integrations?: readonly string[];
  /** The outer host already attempted the project-local executable. */
  projectCliAlreadyHandled?: boolean;
  /** Replacements for named exports of package-set-served integrations. */
  handlers?: HostedIntegrationHandlers;
  stdout?: HostedCliOutput;
  stderr?: HostedCliOutput;
}

/** The plan used and the unchanged CLI's process status. */
export interface HostedCliResult {
  plan: HostedPackageSetPlan;
  status: number;
}

/** Plan, report, and run one unchanged Astryx CLI invocation. */
export declare function runHostedCli(
  options: HostedCliOptions,
): Promise<HostedCliResult>;
