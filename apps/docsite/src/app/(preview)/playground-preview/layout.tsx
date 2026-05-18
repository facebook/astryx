// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function PreviewLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <style>{`html, body { height: 100%; margin: 0; }`}</style>
      {children}
    </>
  );
}
