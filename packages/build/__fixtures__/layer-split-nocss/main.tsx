// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The same app as the `layer-split` fixture, importing NO stylesheet of its
 * own. That is the whole point of it: with no CSS asset in the bundle, StyleX
 * writes its own file outside Rollup's graph, and both the split and the
 * `<link>` have to be handled by us.
 */

import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {App} from '../layer-split/App';
import {fixtureTheme} from '../layer-split/theme';

createRoot(document.getElementById('root')!).render(
  <Theme theme={fixtureTheme} mode="light">
    <App />
  </Theme>,
);
