// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import '@astryxdesign/core/reset.css';

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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- root element must exist in index.html
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
