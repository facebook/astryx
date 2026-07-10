// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Button} from '@/components/ui/button';

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Build faster with Astryx</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        A modern design system that helps you ship beautiful, accessible interfaces in record time.
      </p>
      <div className="flex gap-3">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">View Docs</Button>
      </div>
    </div>
  );
}
