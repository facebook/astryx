// Copyright (c) Meta Platforms, Inc. and affiliates.

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {products.map((product) => (
        <div key={product.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
          <img src={product.image} alt={product.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{product.title}</h3>
            <p style={{ margin: 0, color: '#666' }}>${product.price.toFixed(2)}</p>
            <button style={{ padding: '8px 16px', background: '#0066cc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  );
}
