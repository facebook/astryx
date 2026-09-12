// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Colocated public types for `gapReport()` and `astryx gap-report`.
 */

/**
 * @typedef {'missing_component'|'missing_variant'|'layout_gap'|'styling_gap'|'a11y_gap'|'api_friction'|'docs_gap'|'other'} GapReportCategory
 */

/**
 * @typedef {object} GapReportCategoryEntry
 * @property {GapReportCategory} value
 * @property {string} label
 */

/**
 * @typedef {object} GapReportOptions
 * @property {string} [cwd] Project directory used for config and owner routing.
 * @property {GapReportCategory} [category] Fixed report category.
 * @property {string} [reason] What capability was missing or difficult.
 * @property {string} [detail] Optional additional context.
 * @property {string} [package] Explicit owner package for ambiguous routes.
 * @property {boolean} [confirmPublic] Explicit consent for public handlers or GitHub issue creation.
 * @property {boolean} [listCategories] Return the category vocabulary without routing or writing.
 */

/**
 * @typedef {object} GapReportCategoriesResponse
 * @property {'gap-report.categories'} type
 * @property {GapReportCategoryEntry[]} data
 */

/**
 * @typedef {'filed'|'partial'|'failed'|'routed_only'|'consent_required'|'skipped'} GapReportAggregateStatus
 */

/**
 * @typedef {'filed'|'routed_only'|'skipped'|'failed'|'consent_required'} GapReportDeliveryStatus
 */

/**
 * One handler's outcome in the fan-out.
 * @typedef {object} GapReportDelivery
 * @property {'project'|'integration'|'fallback'} handlerType
 * @property {string} handler Project, integration package, or fallback name.
 * @property {'internal'|'public'|null} audience
 * @property {GapReportDeliveryStatus} status
 * @property {string|null} url
 * @property {string|null} message
 */

/**
 * @typedef {object} GapReportReceipt
 * @property {GapReportAggregateStatus} status Overall outcome.
 * @property {string} package Selected owner package.
 * @property {string|null} issuesUrl Selected issue destination, when configured.
 * @property {GapReportDelivery[]} deliveries Ordered handler outcomes.
 * @property {number} filedCount Count of handlers that filed the report.
 * @property {number} routedOnlyCount Count of handlers that routed only.
 */

/**
 * @typedef {object} GapReportReceiptResponse
 * @property {'gap-report.file'} type
 * @property {GapReportReceipt} data
 */

export {};
