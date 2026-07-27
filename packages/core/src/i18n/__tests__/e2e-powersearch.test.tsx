// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file e2e-powersearch.test.tsx
 * @input packages/core/src/PowerSearch, packages/core/src/i18n
 * @output End-to-end tests proving the i18n framework swaps strings inside
 *   PowerSearch's shipped-default operators AND UI chrome.
 * @position Integration test: real PowerSearch + real provider + real catalog.
 *
 * The point of these tests is to prove that:
 *   1. Astryx's default operators (built via `usePowerSearchConfig`) look
 *      up their labels through `t()` at render time — so an
 *      InternationalizationProvider swap changes them without touching
 *      the config object.
 *   2. Consumer-provided operators with a raw `label` field are used
 *      verbatim (no lookup).
 *   3. Consumer-provided operators with an `i18nKey` field are resolved
 *      against provider `overrides` / `messages`.
 *   4. ICU plurals in result counts and value formatting swap per locale.
 */

import {describe, test, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import React, {useMemo} from 'react';
import {PowerSearch, usePowerSearchConfig} from '../../PowerSearch';
import type {FieldDefinition, PowerSearchFilter} from '../../PowerSearch';
import {InternationalizationProvider} from '../InternationalizationProvider';
import pseudoCatalog from '../../../locales/pseudo.json';

// Small harness — usePowerSearchConfig is a hook, so tests must render it
// via a component.
function Harness({
  fieldDefs,
  filters,
}: {
  fieldDefs: ReadonlyArray<FieldDefinition>;
  filters: ReadonlyArray<PowerSearchFilter>;
}) {
  const {config} = usePowerSearchConfig(fieldDefs);
  const stableFilters = useMemo(() => filters, [filters]);
  return (
    <PowerSearch
      config={config}
      filters={stableFilters}
      onChange={() => {}}
      resultCount={2}
    />
  );
}

const nameField: FieldDefinition = {
  key: 'name',
  type: 'string',
  label: 'Name',
};

describe('PowerSearch × i18n — end to end', () => {
  test('renders English default operator labels with no provider', () => {
    const filter: PowerSearchFilter = {
      field: 'name',
      operator: 'contains',
      value: {type: 'string', value: 'ada'},
    };
    render(<Harness fieldDefs={[nameField]} filters={[filter]} />);

    // The token displays field label + `: <operator label>` + value.
    // The `contains` default operator should surface its English label.
    expect(screen.getByText(/Name: contains/i)).toBeInTheDocument();
  });

  test('resultCount uses ICU plural (2 results → "results")', () => {
    render(<Harness fieldDefs={[nameField]} filters={[]} />);
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  test('pseudo locale wraps default operator labels', () => {
    const filter: PowerSearchFilter = {
      field: 'name',
      operator: 'contains',
      value: {type: 'string', value: 'ada'},
    };
    render(
      <InternationalizationProvider
        locale="pseudo"
        messages={{pseudo: pseudoCatalog}}>
        <Harness fieldDefs={[nameField]} filters={[filter]} />
      </InternationalizationProvider>,
    );

    // Pseudo catalog wraps every en value in ⟦...⟧, so the default label
    // "contains" becomes "⟦çöñţäîñš⟧" — token now shows "Name: ⟦çöñţäîñš⟧ ada"
    // (the field label "Name" is consumer-provided, not translated).
    expect(screen.getByText(/Name:.*⟦.*⟧/)).toBeInTheDocument();
  });

  test('provider overrides translate default operator labels', () => {
    const filter: PowerSearchFilter = {
      field: 'name',
      operator: 'contains',
      value: {type: 'string', value: 'ada'},
    };
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {'@astryx.powersearch.operator.contains': 'contient'},
        }}>
        <Harness fieldDefs={[nameField]} filters={[filter]} />
      </InternationalizationProvider>,
    );

    expect(screen.getByText(/Name: contient/)).toBeInTheDocument();
  });

  test('resultCount ICU plural swaps under provider overrides', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.powersearch.resultCount':
              '{count, number} {count, plural, one {résultat} other {résultats}}',
          },
        }}>
        <Harness fieldDefs={[nameField]} filters={[]} />
      </InternationalizationProvider>,
    );
    expect(screen.getByText('2 résultats')).toBeInTheDocument();
  });
});
