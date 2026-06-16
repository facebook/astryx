// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function PreviewLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; }
        @keyframes pg-flash-ring {
          0% { outline-color: var(--color-border-focus, #1877f2); }
          100% { outline-color: rgba(24, 119, 242, 0); }
        }
        .pg-flash {
          outline: 3px solid var(--color-border-focus, #1877f2);
          outline-offset: 2px;
          border-radius: var(--radius-element, 6px);
          animation: pg-flash-ring 1s ease forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .pg-flash { animation-duration: 0.01ms; }
        }

        /* ── Targeting overlay ── */
        .pg-targeting { cursor: crosshair !important; }
        .pg-targeting * { cursor: crosshair !important; }

        .pg-target-overlay {
          position: fixed;
          pointer-events: none;
          z-index: 999999;
          border: 2px solid var(--color-border-focus, #1877f2);
          border-radius: var(--radius-element, 6px);
          background: rgba(24, 119, 242, 0.06);
          transition: top 80ms ease-out, left 80ms ease-out,
                      width 80ms ease-out, height 80ms ease-out;
          display: none;
        }
        .pg-target-overlay[data-visible="true"] { display: block; }

        .pg-target-label {
          position: absolute;
          bottom: 100%;
          left: -2px;
          margin-bottom: var(--spacing-1, 4px);
          padding: var(--spacing-0-5, 2px) var(--spacing-3, 12px);
          font: 500 11px/16px ui-sans-serif, system-ui, sans-serif;
          background: var(--color-border-focus, #1877f2);
          border-radius: var(--radius-corner, 4px);
          white-space: nowrap;
          user-select: none;
          pointer-events: auto;
        }
        .pg-target-label-bottom {
          top: 100%;
          bottom: auto;
          margin-top: 4px;
          margin-bottom: 0;
        }

        .pg-target-selection {
          position: fixed;
          pointer-events: none;
          z-index: 999998;
          border: 2px solid var(--color-border-focus, #1877f2);
          border-radius: var(--radius-element, 6px);
          background: rgba(24, 119, 242, 0.06);
          display: none;
        }
        .pg-target-selection[data-visible="true"] { display: block; }

        .pg-target-selection .pg-target-label {
          position: absolute;
          bottom: 100%;
          left: -2px;
          margin-bottom: 4px;
        }
        .pg-target-selection .pg-target-label-bottom {
          top: 100%;
          bottom: auto;
          margin-top: 4px;
          margin-bottom: 0;
        }
      `}</style>
      {children}
    </>
  );
}
