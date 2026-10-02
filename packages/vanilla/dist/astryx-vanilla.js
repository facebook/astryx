/* Copyright (c) Meta Platforms, Inc. and affiliates. */

(() => {
  'use strict';

  let switchesReady = false;

  function setTheme(value) {
    if (value) document.documentElement.dataset.astryxTheme = value;
  }

  function setMode(value) {
    if (value) document.documentElement.dataset.theme = value;
  }

  function initThemeModeSwitchers(doc = document) {
    if (switchesReady) return;
    switchesReady = true;

    doc.addEventListener('change', event => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.matches('[data-ax-theme-switch]')) setTheme(target.value);
      if (target.matches('[data-ax-mode-switch]')) setMode(target.value);
    });
  }

  initThemeModeSwitchers();

  globalThis.AstryxVanilla = Object.freeze({
    initThemeModeSwitchers,
    setMode,
    setTheme,
  });
})();
