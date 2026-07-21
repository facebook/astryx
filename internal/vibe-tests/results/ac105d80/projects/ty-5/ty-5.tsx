import React from 'react';
import {Button} from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[500px] p-12 text-center gap-6">
      <h1 className="text-5xl font-bold tracking-tight">Build faster with Astryx</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">A modern design system for building beautiful, accessible React applications at scale.</p>
      <div className="flex gap-3">
        <Button size="lg">Get started</Button>
        <Button size="lg" variant="outline">View docs</Button>
      </div>
    </section>
  );
}
