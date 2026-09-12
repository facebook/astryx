import {
  oceanCalmTheme,
  oceanDeepTheme,
  oceanMidnightTheme,
  oceanTheme,
} from './ocean-family/current/ocean-family.js';

const themes = {
  ocean: oceanTheme,
  'ocean-calm': oceanCalmTheme,
  'ocean-deep': oceanDeepTheme,
  'ocean-midnight': oceanMidnightTheme,
};

const root = document.querySelector('[data-demo-root]');
const picker = document.querySelector('select');
picker.addEventListener('change', () => {
  root.dataset.astryxTheme = themes[picker.value].name;
});
