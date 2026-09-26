// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file e2e-pagination.test.tsx
 * @input packages/core/src/Pagination, packages/core/src/i18n
 * @output End-to-end tests proving the i18n framework actually swaps
 *   strings in real component output.
 * @position Integration test: real component + real provider + real catalog.
 *   Not a unit test of resolve() — that's covered in resolve.test.ts.
 *
 * These assertions render <Pagination> and check that:
 *   1. Default (no provider): English strings appear
 *   2. With pseudo locale: accented+bracketed strings appear
 *   3. With sparse override: only the overridden key changes
 *   4. Regional locale fallback: pt-BR falls back to pt then en
 *   5. Number formatting respects the locale (en-US vs de-DE separators)
 */

import {describe, test, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Pagination} from '../../Pagination';
import {InternationalizationProvider} from '../InternationalizationProvider';
import pseudoCatalog from '../../../locales/pseudo.json';

describe('Pagination × i18n — end to end', () => {
  test('renders English strings by default (no provider)', () => {
    render(
      <Pagination
        page={2}
        totalItems={100}
        pageSize={10}
        onChange={() => {}}
        variant="count"
      />,
    );

    // The nav landmark uses the default label "Pagination"
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();

    // Prev/Next buttons carry English aria-labels
    expect(
      screen.getByRole('button', {name: 'Go to previous page'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeInTheDocument();

    // The visible count text is "11–20 of 100"
    expect(screen.getByText(/11.20 of 100/)).toBeInTheDocument();
  });

  test('renders pseudo strings when provider locale is pseudo', () => {
    render(
      <InternationalizationProvider
        locale="pseudo"
        messages={{pseudo: pseudoCatalog}}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
          variant="count"
        />
      </InternationalizationProvider>,
    );

    // Nav landmark shows pseudo-translated label
    expect(
      screen.getByRole('navigation', {name: /Þàĝíñàţíóñ/}),
    ).toBeInTheDocument();

    // Prev/Next aria-labels are pseudo-translated
    expect(
      screen.getByRole('button', {name: /Ĝó ţó þřéṽíóúš/}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Ĝó ţó ñéẋţ/}),
    ).toBeInTheDocument();

    // Visible count is pseudo-wrapped; numbers still format
    expect(screen.getByText(/⟦11.20 óƒ 100⟧/)).toBeInTheDocument();
  });

  test('sparse override changes only the overridden key', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {'@astryx.pagination.next': 'Suivant'},
        }}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
        />
      </InternationalizationProvider>,
    );

    // Overridden key: French
    expect(screen.getByRole('button', {name: 'Suivant'})).toBeInTheDocument();

    // NON-overridden keys fall through to English (fr has no other catalog)
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to previous page'}),
    ).toBeInTheDocument();
  });

  test('regional locale (pt-BR) falls back to base language (pt)', () => {
    // pt-BR has one key, pt has another, en fills in the rest.
    // Tests the resolveLocaleChain walking through resolve() end to end.
    render(
      <InternationalizationProvider
        locale="pt-BR"
        messages={{
          'pt-BR': {
            '@astryx.pagination.next': {defaultMessage: 'Próxima (BR)'},
          },
          pt: {
            '@astryx.pagination.previous': {defaultMessage: 'Anterior'},
          },
        }}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
        />
      </InternationalizationProvider>,
    );

    // next: from pt-BR
    expect(
      screen.getByRole('button', {name: 'Próxima (BR)'}),
    ).toBeInTheDocument();

    // previous: from pt (fallback pt-BR → pt)
    expect(screen.getByRole('button', {name: 'Anterior'})).toBeInTheDocument();

    // label: neither pt-BR nor pt has it — falls back to en
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();
  });

  test('ICU number formatting respects the locale', () => {
    // In de-DE, 1000 formats with "." as the thousands separator.
    render(
      <InternationalizationProvider locale="de-DE">
        <Pagination
          page={2}
          totalItems={10000}
          pageSize={10}
          onChange={() => {}}
          variant="count"
        />
      </InternationalizationProvider>,
    );

    // We didn't provide a de-DE catalog — the string is en's pattern but
    // numbers format under the de-DE locale, so "10000" becomes "10.000".
    // Text is: "11–20 of 10.000"
    // The dash between 11 and 20 is unicode en-dash (\u2013), match loosely
    // by asserting the presence of the German-formatted 10.000.
    expect(screen.getByText(/10\.000/)).toBeInTheDocument();
  });
});
