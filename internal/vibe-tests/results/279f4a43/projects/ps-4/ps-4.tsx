// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '../components/ui/breadcrumb';
import {Button} from '../components/ui/button';
import {Card, CardContent} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Separator} from '../components/ui/separator';

export default function ProductDetail() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics">Electronics</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics/audio">Audio</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Premium Wireless Headphones</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" onClick={() => window.history.back()}>Back</Button>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Premium Wireless Headphones</h1>
            <Badge variant="default">In Stock</Badge>
          </div>
          <Separator />
          <div>
            <p className="text-3xl font-bold">$299.99</p>
            <p className="text-sm text-muted-foreground">Free shipping on orders over $50</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              Experience crystal-clear audio with active noise cancellation, 30-hour battery life,
              and premium comfort. Features Bluetooth 5.3 and multi-device pairing.
            </p>
          </div>
          <div className="flex gap-3">
            <Button>Add to Cart</Button>
            <Button variant="outline">Add to Wishlist</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
