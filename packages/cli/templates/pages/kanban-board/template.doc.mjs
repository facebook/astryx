// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Kanban Board',
  displayName: 'Kanban Board',
  description:
    'Product delivery board with frame-first chrome: header with title, segmented filter, sprint selector, and primary action above a horizontal scroller of fixed-width columns (scroll-snap per column on narrow screens). Tasks are ClickableCard tiles with Token labels, StatusDot priority, and Avatar assignees; emptied columns show an EmptyState. Cards move between columns interactively — native HTML5 drag-and-drop for pointer users plus a per-card "Move to" MoreMenu for touch/keyboard, with aria-live announcements on every move.',
  isReady: true,
  category: 'Tools - Kanban Board',
};
