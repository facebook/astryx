// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Service Monitoring Dashboard',
  displayName: 'Service Monitoring Dashboard',
  description:
    'Live-ops service-health dashboard: traffic-light KPI tiles with sparklines, and multi-line latency and request-volume charts with a 1h/1d/7d window, beside a triage rail split into two independently scrolling sections: active alerts over a worst-first per-service breakdown with inline status coloring. Global environment, region, and auto-refresh controls; the rail folds into the content column as two cards below 1024px.',
  isReady: false,
  category: 'Dashboard - Monitoring',
};
