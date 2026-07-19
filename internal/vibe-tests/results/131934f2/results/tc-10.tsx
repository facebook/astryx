// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function InstallSnippet() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Install the package using your preferred package manager:</p>
          <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs">
              <span>Terminal</span>
            </div>
            <code>npm install @shadcn/ui tailwindcss</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Then import and use any component in your React project.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
