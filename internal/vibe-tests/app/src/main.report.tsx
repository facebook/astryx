import React, {Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';

/**
 * Report entry point — no StyleX build dependency.
 *
 * Imports pre-compiled CSS from @xds/core dist and the default theme.
 * Report components use plain CSS classes (report.css) instead of stylex.create.
 *
 * The xds.css and theme.css paths are resolved by Vite aliases in
 * vite.config.report.ts.
 */
import '@xds/core/reset.css';
import 'xds-css';
import 'xds-theme-css';

const Report = lazy(() =>
  import('./report/Report').then(m => ({default: m.Report})),
);

const root = createRoot(document.getElementById('root')!);
root.render(
  <Suspense fallback={<div>Loading report...</div>}>
    <Report />
  </Suspense>,
);
