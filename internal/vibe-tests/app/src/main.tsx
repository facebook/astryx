import React, {Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') ?? 'report';
const theme = params.get('theme') ?? 'light';

function App() {
  if (mode === 'report') {
    const Report = lazy(() =>
      import('./report/Report').then(m => ({default: m.Report})),
    );
    return (
      <Suspense fallback={<div>Loading report...</div>}>
        <Report />
      </Suspense>
    );
  }

  const Preview = lazy(() => import('./preview'));
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Preview theme={theme} />
    </Suspense>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
