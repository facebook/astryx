// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {xdsStylex} from '@xds/build/vite';

export default defineConfig({
  plugins: [...xdsStylex(), react()],
});
