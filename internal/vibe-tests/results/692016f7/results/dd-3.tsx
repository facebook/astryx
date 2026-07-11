// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';

const products = [
  { id: 1, title: 'Wireless Headphones', price: 79.99, image: 'https://placehold.co/300x200' },
  { id: 2, title: 'Smart Watch', price: 199.99, image: 'https://placehold.co/300x200' },
  { id: 3, title: 'Portable Speaker', price: 49.99, image: 'https://placehold.co/300x200' },
  { id: 4, title: 'Phone Case', price: 24.99, image: 'https://placehold.co/300x200' },
  { id: 5, title: 'USB-C Cable', price: 12.99, image: 'https://placehold.co/300x200' },
  { id: 6, title: 'Laptop Stand', price: 39.99, image: 'https://placehold.co/300x200' },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
            <Button size="sm" className="w-full">Add to Cart</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
