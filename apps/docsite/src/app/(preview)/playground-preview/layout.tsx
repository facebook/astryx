// Copyright (c) Meta Platforms, Inc. and affiliates.

import '@xds/core/reset.css';
import '@xds/core/xds.css';

export default function PreviewLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <style>{`html, body { height: 100%; margin: 0; }`}</style>
      {children}
    </>
  );
}
