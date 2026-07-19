// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '@/components/ui/breadcrumb';

export default function ProductDetailPage() {
  return (
    <div className="space-y-4 p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics">Electronics</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics/audio">Audio</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Wireless Headphones Pro</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Product Image Placeholder</p>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Wireless Headphones Pro</h1>
            <Badge>In Stock</Badge>
          </div>
          <p className="text-xl font-semibold">$299.99</p>
          <p className="text-muted-foreground">
            Premium noise-cancelling headphones with 30-hour battery life,
            adaptive EQ, and spatial audio support.
          </p>
          <Separator />
          <div className="space-y-1">
            <p className="font-semibold">Key Features:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Active Noise Cancellation</li>
              <li>30-hour battery life</li>
              <li>Bluetooth 5.3</li>
              <li>USB-C fast charging</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button>Add to Cart</Button>
            <Button variant="outline">Save for Later</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
