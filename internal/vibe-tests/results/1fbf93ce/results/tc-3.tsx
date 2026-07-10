// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ThemedPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Themed Page</h1>
        <p className="text-muted-foreground">
          This page uses the background token from the theme. The bg-background class applies the wash color from the active theme, ensuring the page background stays consistent with the design system.
        </p>
      </div>
    </div>
  );
}
