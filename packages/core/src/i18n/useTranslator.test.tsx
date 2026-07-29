// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTranslator.test.tsx
 * @input Uses vitest, @testing-library/react, useTranslator hook, i18n provider
 * @output Unit tests for the client translator bound to the provider locale
 * @position Testing; validates useTranslator.ts. Lookup/format rules
 *   themselves live in __tests__/resolve.test.ts — this file pins the
 *   context wiring and the identity of the returned function.
 *
 * SYNC: When useTranslator.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useState} from 'react';
import {render, screen, fireEvent, renderHook} from '@testing-library/react';
import {useTranslator, type TranslatorFn} from './useTranslator';
import {InternationalizationProvider} from './InternationalizationProvider';
import {__resetForTests} from './resolve';
import type {MessagesByLocale, Overrides} from './types';

// Module scope: the provider memoizes on prop identity, so inline object
// literals would hand back a fresh context value on every render.
const FR_MESSAGES: MessagesByLocale = {
  fr: {'@astryx.pagination.next': {defaultMessage: 'Page suivante'}},
};
const FR_OVERRIDES: Overrides = {
  fr: {'@astryx.pagination.next': 'Suivant'},
};

// resolve() warns once per locale+key for good; reset between tests.
beforeEach(() => {
  __resetForTests();
});

describe('useTranslator — resolution', () => {
  it('resolves a shipped key to English when no provider is mounted', () => {
    const {result} = renderHook(() => useTranslator());
    expect(result.current('@astryx.pagination.next')).toBe('Go to next page');
  });

  it('interpolates values into the message', () => {
    const {result} = renderHook(() => useTranslator());
    expect(result.current('@astryx.pagination.goToPage', {page: 5})).toBe(
      'Go to page 5',
    );
  });

  it('returns the key itself for a key that exists nowhere', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {result} = renderHook(() => useTranslator());

    expect(result.current('@astryx.not.a.real.key')).toBe(
      '@astryx.not.a.real.key',
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing key'));
    warn.mockRestore();
  });

  it('uses the catalog the provider supplies for its locale', () => {
    const {result} = renderHook(() => useTranslator(), {
      wrapper: ({children}) => (
        <InternationalizationProvider locale="fr" messages={FR_MESSAGES}>
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current('@astryx.pagination.next')).toBe('Page suivante');
  });

  it('lets a provider override beat the provider catalog', () => {
    const {result} = renderHook(() => useTranslator(), {
      wrapper: ({children}) => (
        <InternationalizationProvider
          locale="fr"
          messages={FR_MESSAGES}
          overrides={FR_OVERRIDES}>
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current('@astryx.pagination.next')).toBe('Suivant');
  });

  it('falls back to English for keys the provider catalog is missing', () => {
    const {result} = renderHook(() => useTranslator(), {
      wrapper: ({children}) => (
        <InternationalizationProvider locale="fr" messages={FR_MESSAGES}>
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current('@astryx.pagination.previous')).toBe(
      'Go to previous page',
    );
  });

  it('formats numbers with the provider locale', () => {
    const {result} = renderHook(() => useTranslator(), {
      wrapper: ({children}) => (
        <InternationalizationProvider locale="de-DE">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(
      result.current('@astryx.pagination.count', {
        from: 1,
        to: 10,
        total: 1000,
      }),
    ).toBe('1–10 of 1.000');
  });
});

describe('useTranslator — identity', () => {
  function Probe({onRender}: {onRender: (t: TranslatorFn) => void}) {
    const translate = useTranslator();
    onRender(translate);
    return (
      <span data-testid="out">{translate('@astryx.pagination.next')}</span>
    );
  }

  it('hands back the same translator across rerenders of an unchanged provider', () => {
    const seen: TranslatorFn[] = [];
    // Built fresh each time — passing the identical element back to rerender()
    // makes React bail out of the subtree entirely.
    const tree = () => (
      <InternationalizationProvider locale="fr" overrides={FR_OVERRIDES}>
        <Probe onRender={t => seen.push(t)} />
      </InternationalizationProvider>
    );

    const {rerender} = render(tree());
    rerender(tree());

    expect(seen).toHaveLength(2);
    expect(seen[1]).toBe(seen[0]);
  });

  it('hands back a new translator when the locale changes', () => {
    const seen: TranslatorFn[] = [];

    const {rerender} = render(
      <InternationalizationProvider locale="fr" overrides={FR_OVERRIDES}>
        <Probe onRender={t => seen.push(t)} />
      </InternationalizationProvider>,
    );
    expect(screen.getByTestId('out').textContent).toBe('Suivant');

    rerender(
      <InternationalizationProvider locale="es" overrides={FR_OVERRIDES}>
        <Probe onRender={t => seen.push(t)} />
      </InternationalizationProvider>,
    );

    expect(seen[1]).not.toBe(seen[0]);
    // The fr override no longer applies, so es falls through to English.
    expect(screen.getByTestId('out').textContent).toBe('Go to next page');
  });
});

describe('useTranslator — deferred calls', () => {
  it('resolves against the provider locale when called from an event handler', () => {
    function Deferred() {
      const translate = useTranslator();
      const [text, setText] = useState('');
      return (
        <div>
          <button
            type="button"
            onClick={() =>
              setText(translate('@astryx.pagination.goToPage', {page: 3}))
            }>
            announce
          </button>
          <span data-testid="out">{text}</span>
        </div>
      );
    }

    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {'@astryx.pagination.goToPage': 'Aller à la page {page, number}'},
        }}>
        <Deferred />
      </InternationalizationProvider>,
    );

    expect(screen.getByTestId('out').textContent).toBe('');
    fireEvent.click(screen.getByText('announce'));
    expect(screen.getByTestId('out').textContent).toBe('Aller à la page 3');
  });
});
