// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  oceanCalmDeepTheme,
  oceanCalmTheme,
  oceanMidnightTheme,
  oceanTheme,
} from './ocean-family.js';

const themes = {
  ocean: oceanTheme,
  'ocean-calm': oceanCalmTheme,
  'ocean-calm-deep': oceanCalmDeepTheme,
  'ocean-midnight': oceanMidnightTheme,
};

const switcher = document.querySelector('[data-family-switcher]');
switcher?.addEventListener('click', () => {
  const root = document.querySelector('[data-switch-root]');
  const names = Object.keys(themes);
  const current = root?.getAttribute('data-astryx-theme') ?? names[0];
  root?.setAttribute(
    'data-astryx-theme',
    names[(names.indexOf(current) + 1) % names.length],
  );
});

window.oceanFamily = themes;
window.oceanFamilyFirstPaint = {
  activeBackground: getComputedStyle(document.querySelector('#active-button'))
    .backgroundColor,
  nestedBackground: getComputedStyle(
    document.querySelector('#nested .astryx-button'),
  ).backgroundColor,
};
window.oceanFamilyReady = true;
