// Copyright (c) Meta Platforms, Inc. and affiliates.

const changelogContent = `
<h1>Changelog</h1>
<h2>v2.4.0 (2026-07-15)</h2>
<h3>New Features</h3>
<ul>
<li>Added <strong>dark mode</strong> support across all components</li>
<li>Introduced <code>useTheme</code> hook for programmatic theme switching</li>
<li>New <code>Carousel</code> component with touch gesture support</li>
</ul>
<h3>Bug Fixes</h3>
<ul>
<li>Fixed focus trap escaping in nested dialogs</li>
<li>Resolved <code>z-index</code> stacking issues with overlays</li>
<li>Corrected <code>aria-expanded</code> state on collapsible sections</li>
</ul>
<h3>Breaking Changes</h3>
<ul>
<li>Removed deprecated <code>color</code> prop from Badge; use <code>variant</code> instead</li>
<li>Dialog.onClose renamed to Dialog.onOpenChange for consistency</li>
</ul>
<h2>v2.3.1 (2026-06-28)</h2>
<h3>Bug Fixes</h3>
<ul>
<li>Fixed SSR hydration mismatch in Tooltip</li>
<li>Resolved infinite re-render in useMediaQuery on Safari</li>
</ul>
<h3>Performance</h3>
<ul>
<li>Reduced bundle size by <strong>12%</strong> through tree-shaking improvements</li>
<li>Memoized expensive style computations in Table</li>
</ul>
`;

export function ChangelogView() {
  return (
    <div style={{maxWidth: 640, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24}}>
        <div dangerouslySetInnerHTML={{__html: changelogContent}} style={{lineHeight: 1.6}} />
      </div>
    </div>
  );
}

export default ChangelogView;
