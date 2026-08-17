// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Project Status Dashboard',
  displayName: 'Project Status Dashboard',
  description:
    'Project / program / launch status tracker: a task progress bar (a stacked horizontal bar breaking overall completion down by task status, weighted by story points rather than task count), a milestone Gantt timeline with a today marker, a full-width workstream table with owner, %-complete, due date and status pill, a blockers & risks side panel docked to the end of the layout, and a scope burndown chart. A release-phase control filters milestones, workstreams, and risks.',
  isReady: true,
  category: 'Dashboard - Project Status',
  isHiddenFromOverview: true,
};
