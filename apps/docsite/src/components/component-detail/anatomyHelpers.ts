// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file anatomyHelpers.ts
 * @input A component's `usage.anatomy` elements (name, required, description).
 * @output Pure helpers that shape anatomy data for the component-detail Anatomy
 *   section — currently folding the `required` flag into the description as a
 *   bold lead-in.
 * @position Consumed by Anatomy.tsx; kept separate so the logic is unit-testable
 *   without rendering React.
 *
 * The lead-in mirrors how the CLI marks its guidance rows (`**Do:**` /
 * `**Don't:**` in packages/cli/clients/cli/lib/component-format.mjs), so a
 * required part reads the same way in both surfaces.
 */

import type {AnatomyElement} from '../../generated/componentRegistry';

const REQUIRED_LEAD_IN = '**Required:**';

/**
 * The description to render for one anatomy element. Required elements get a
 * bold `Required:` lead-in rather than a separate badge column, keeping the flag
 * inline with the prose it qualifies.
 */
export function anatomyDescription(element: AnatomyElement): string {
  const description = element.description.trim();

  if (!element.required) {
    return description;
  }

  return description ? `${REQUIRED_LEAD_IN} ${description}` : REQUIRED_LEAD_IN;
}
