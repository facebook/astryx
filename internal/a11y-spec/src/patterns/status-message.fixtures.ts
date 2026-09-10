// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Plain-HTML proof fixtures for the reusable status-message contract. */

import type {StatusMessageStateFacts} from './status-message';

export const STATUS_MESSAGE_SUBJECT_SELECTOR = '[data-a11y-subject]';

export interface StatusMessageFixture {
  readonly id: string;
  readonly facts: StatusMessageStateFacts;
  readonly html: string;
}

const POLITE_FACTS: StatusMessageStateFacts = {
  kind: 'live-region',
  politeness: 'polite',
};

export const STATUS_MESSAGE_FIXTURES: readonly StatusMessageFixture[] = [
  {
    id: 'conforming-polite-channel',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status" aria-live="polite" aria-atomic="true"></div>',
  },
  {
    id: 'violating-unexposed-channel',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject></div>',
  },
];

export function statusMessageFixture(id: string): StatusMessageFixture {
  const found = STATUS_MESSAGE_FIXTURES.find(candidate => candidate.id === id);
  if (found == null) {
    throw new Error(`unknown status-message fixture "${id}"`);
  }
  return found;
}
