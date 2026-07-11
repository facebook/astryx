// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';

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
    <Grid columns={{ minWidth: 280 }}>
      {products.map((product) => (
        <Card key={product.id} padding={0}>
          <Stack gap={2}>
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <Stack gap={1} style={{ padding: '0 16px 16px' }}>
              <Text weight="semibold">{product.title}</Text>
              <Text color="secondary">${product.price.toFixed(2)}</Text>
              <Button variant="primary" size="sm">Add to Cart</Button>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
