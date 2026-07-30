/**
 * The single logger instance. Silent until the CLI enables output.
 * @type {Logger}
 */
export const logger: Logger;
export type Logger = {
    /**
     * Progress / result line (stdout).
     */
    log: (message?: string) => void;
    /**
     * Non-fatal warning line (stderr).
     */
    warn: (message?: string) => void;
    /**
     * Failure line (stderr).
     */
    error: (message?: string) => void;
    /**
     * Whether output is currently suppressed.
     */
    silent: boolean;
    /**
     * Enable/disable output.
     */
    setSilent: (silent: boolean) => void;
};
