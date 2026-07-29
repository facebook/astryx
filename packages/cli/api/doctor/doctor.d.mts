/**
 * Check 1 — running Node version meets the CLI's minimum.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkNodeVersion(ctx: DoctorContext): DoctorCheck;
/**
 * Check 2 — @astryxdesign/core is installed and resolvable from the project.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkCoreInstalled(ctx: DoctorContext): DoctorCheck;
/**
 * Check 3 — installed @astryxdesign/core is in step with @astryxdesign/cli (major/minor drift).
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkVersionAlignment(ctx: DoctorContext): DoctorCheck;
/**
 * Check 4 — at least one @astryxdesign/theme-* is installed and a theme is wired.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkThemes(ctx: DoctorContext): DoctorCheck;
/**
 * Check 5 — astryx.config.mjs (if present) loads and has a valid shape.
 * @param {DoctorContext} ctx
 * @returns {Promise<DoctorCheck>}
 */
export function checkConfig(ctx: DoctorContext): Promise<DoctorCheck>;
/**
 * Check 6 — agent docs exist and contain the Astryx section markers.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkAgentDocs(ctx: DoctorContext): DoctorCheck;
/**
 * Check 7 — @astryxdesign/core peer dependencies are satisfied by installed packages.
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkPeerDeps(ctx: DoctorContext): DoctorCheck;
/**
 * Check 8 — report the detected package manager (informational).
 * @param {DoctorContext} ctx
 * @returns {DoctorCheck}
 */
export function checkPackageManager(ctx: DoctorContext): DoctorCheck;
/**
 * Run all diagnostic checks and return a structured report.
 *
 * @param {object} [options]
 * @param {string} [options.cwd] - Directory to diagnose (default: process.cwd()).
 * @returns {Promise<DoctorReport>}
 */
export function runChecks(options?: {
    cwd?: string | undefined;
}): Promise<DoctorReport>;
/**
 * Programmatic API: run the doctor and return the same envelope shape that
 * `astryx doctor --json` emits.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{type: 'doctor', data: DoctorReport}>}
 */
export function doctor(options?: {
    cwd?: string | undefined;
}): Promise<{
    type: "doctor";
    data: DoctorReport;
}>;
/**
 * Ordered list of synchronous check functions. Append here to add a check.
 * (checkConfig is async and is awaited separately by {@link runChecks}.)
 * @type {Array<(ctx: DoctorContext) => DoctorCheck>}
 */
export const SYNC_CHECKS: Array<(ctx: DoctorContext) => DoctorCheck>;
export type DoctorStatus = "pass" | "warn" | "fail" | "info";
export type DoctorCheck = {
    /**
     * - Stable machine-readable id (e.g. 'node-version').
     */
    id: string;
    /**
     * - Human-readable check name.
     */
    label: string;
    status: DoctorStatus;
    /**
     * - One-line result summary.
     */
    message: string;
    /**
     * - Actionable remediation, present when not 'pass'.
     */
    fix?: string | undefined;
};
export type DoctorReport = {
    checks: DoctorCheck[];
    summary: {
        pass: number;
        warn: number;
        fail: number;
        info: number;
    };
};
export type DoctorContext = {
    /**
     * - Directory to diagnose.
     */
    cwd: string;
    /**
     * - Running Node version.
     */
    nodeVersion: string;
    /**
     * - Resolved core package directory, or null.
     */
    coreDir: string | null;
    /**
     * - Resolved astryx.config.mjs path, or null.
     */
    configPath: string | null;
    /**
     * - theme value read from config, or null.
     */
    configTheme: string | null;
};
