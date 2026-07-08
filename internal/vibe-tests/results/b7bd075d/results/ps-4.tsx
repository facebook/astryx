// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '@/components/ui/breadcrumb';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function ProductDetail() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics">Electronics</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/electronics/audio">Audio</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Wireless Headphones</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardContent className="p-8 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Wireless Headphones Pro</h1>
          <span className="text-2xl font-semibold text-primary">$199.99</span>
          <p className="text-muted-foreground">
            Premium noise-cancelling headphones with 30-hour battery life, adaptive EQ, and multipoint connection.
          </p>
          <div className="flex gap-3">
            <Button>Add to Cart</Button>
            <Button variant="ghost">Save for Later</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
