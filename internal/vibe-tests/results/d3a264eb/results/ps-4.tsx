// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ProductDetail() {
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
      <nav aria-label="Breadcrumb" style={{marginBottom: 16}}>
        <ol style={{display: 'flex', gap: 8, listStyle: 'none', padding: 0, fontSize: 14, color: '#64748b'}}>
          <li><a href="/" style={{color: '#4f46e5', textDecoration: 'none'}}>Home</a> /</li>
          <li><a href="/electronics" style={{color: '#4f46e5', textDecoration: 'none'}}>Electronics</a> /</li>
          <li><a href="/electronics/audio" style={{color: '#4f46e5', textDecoration: 'none'}}>Audio</a> /</li>
          <li aria-current="page">Premium Wireless Headphones</li>
        </ol>
      </nav>

      <button onClick={() => window.history.back()} style={{padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', marginBottom: 16}}>Back</button>

      <div style={{border: '1px solid #e2e8f0', borderRadius: 12, padding: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
          <h1 style={{fontSize: 28, fontWeight: 700, margin: 0}}>Premium Wireless Headphones</h1>
          <span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#dcfce7', color: '#16a34a'}}>In Stock</span>
        </div>
        <hr style={{border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0'}} />
        <p style={{fontSize: 28, fontWeight: 700}}>$299.99</p>
        <p style={{fontSize: 14, color: '#64748b'}}>Free shipping on orders over $50</p>
        <hr style={{border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0'}} />
        <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 8}}>Description</h3>
        <p style={{color: '#475569', lineHeight: 1.6}}>
          Experience crystal-clear audio with active noise cancellation, 30-hour battery life,
          and premium comfort. Features Bluetooth 5.3 and multi-device pairing.
        </p>
        <div style={{display: 'flex', gap: 12, marginTop: 24}}>
          <button style={{padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'}}>Add to Cart</button>
          <button style={{padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer'}}>Add to Wishlist</button>
        </div>
      </div>
    </div>
  );
}
