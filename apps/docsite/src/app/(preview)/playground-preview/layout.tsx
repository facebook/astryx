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
      `}</style>
      {children}
    </>
  );
}
