// Copyright (c) Meta Platforms, Inc. and affiliates.

import {fireEvent} from '@testing-library/react';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {
  __resetInteractionModalityForTest,
  getInteractionModality,
  trackInteractionModality,
} from './interactionModality';

describe('interactionModality', () => {
  beforeAll(() => {
    trackInteractionModality();
  });

  beforeEach(() => {
    __resetInteractionModalityForTest();
    fireEvent.pointerDown(document);
    expect(getInteractionModality()).toBe('pointer');
  });

  it.each<[string, KeyboardEventInit]>([
    ['Alt', {altKey: true}],
    ['Control', {ctrlKey: true}],
    ['Meta', {metaKey: true}],
    ['Shift', {shiftKey: true}],
  ])('keeps pointer modality for a bare %s press', (key, init) => {
    fireEvent.keyDown(document, {key, ...init});

    expect(getInteractionModality()).toBe('pointer');
  });

  it.each<[string, KeyboardEventInit]>([
    ['Alt', {key: 'c', altKey: true}],
    ['Control', {key: 'c', ctrlKey: true}],
    ['Meta', {key: 'c', metaKey: true}],
  ])('keeps pointer modality for a %s-modified chord', (_modifier, init) => {
    fireEvent.keyDown(document, init);

    expect(getInteractionModality()).toBe('pointer');
  });

  it('counts Shift+Tab as keyboard navigation', () => {
    fireEvent.keyDown(document, {key: 'Shift', shiftKey: true});
    fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});

    expect(getInteractionModality()).toBe('keyboard');
  });
});
