/**
 * Options for `validateIntegration()`.
 */
export type ValidateIntegrationOptions = {
    cwd?: string | undefined;
};
/**
 * `astryx --json validate-integration [package]`.
 */
export type ValidateIntegrationResponse = {
    type: "integration.validate";
    data: {
        name: string | null;
        version: string | null;
        issues: import("../../types/integration").AstryxIntegrationIssue[];
    };
};
