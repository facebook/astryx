// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';

export function BrutalistDemo() {
  return (
    <div className="min-h-screen bg-white text-black p-8 font-mono">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-5xl font-black uppercase tracking-tight border-b-4 border-black pb-2">
          BRUTALIST UI
        </h1>
        <p className="text-lg">Zero radius. High contrast. Bold borders. Nothing else.</p>
        <div className="flex gap-3">
          <Button className="rounded-none border-4 border-black font-black uppercase">
            PRIMARY ACTION
          </Button>
          <Button variant="outline" className="rounded-none border-4 border-black font-black uppercase">
            SECONDARY
          </Button>
          <Button variant="ghost" className="rounded-none font-black uppercase">
            GHOST
          </Button>
        </div>
        <Card className="rounded-none border-4 border-black">
          <CardHeader>
            <CardTitle className="font-black uppercase">CARD ELEMENT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">Content with bold borders and no rounded corners.</p>
            <Badge className="rounded-none border-2 border-black font-black uppercase">BRUTALIST</Badge>
          </CardContent>
        </Card>
        <Input
          placeholder="Type here..."
          className="rounded-none border-4 border-black font-bold uppercase"
        />
      </div>
    </div>
  );
}

export default BrutalistDemo;
