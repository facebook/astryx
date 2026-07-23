// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Button} from '@/components/ui/button';

export default function LandingHero() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] p-12 space-y-6">
      <h1 className="text-5xl font-bold tracking-tight">Build faster with Astryx</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        A composable design system that helps teams ship polished interfaces in hours, not weeks.
      </p>
      <div className="flex gap-3">
        <Button size="lg">Get Started</Button>
        <Button variant="outline" size="lg">Documentation</Button>
      </div>
    </div>
  );
}
