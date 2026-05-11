'use client';

// TODO: wire up @xds/theme-y2k/built once the theme package lands on this branch.
// Until then this page renders a placeholder so the route resolves.

export default function Y2kPalettePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#666',
      }}>
      Y2K palette preview is not available on this branch.
    </div>
  );
}
