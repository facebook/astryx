// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Collapsible.a11y.test.tsx
 * @input Uses Collapsible and the reusable disclosure specification
 * @output DOM evidence from the real disclosure trigger
 * @position Component-facing binding; local API and group behavior remain separate.
 */

import {cleanup, render, screen} from '@testing-library/react';
import {it} from 'vitest';
import {
  DISCLOSURE_PATTERN,
  expectAccessibilitySpec,
} from '@astryxdesign/a11y-spec';
import {Collapsible} from '../Collapsible';

it('Collapsible exposes its default expanded state — WCAG 2.2 4.1.2', async () => {
  await expectAccessibilitySpec({
    spec: DISCLOSURE_PATTERN,
    binding: 'Collapsible.trigger',
    state: 'default-expanded',
    facts: {expanded: true},
    render: () => {
      render(<Collapsible trigger="Details">Body</Collapsible>);
    },
    subject: () => screen.getByRole('button', {name: 'Details'}),
    cleanup,
  });
});
