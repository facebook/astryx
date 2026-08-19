// Copyright (c) Meta Platforms, Inc. and affiliates.

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/theme-neutral/theme.css';
import './index.css';
import App from './App';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- root element must exist in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
