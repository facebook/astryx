// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ProductDetailPage() {
  return (
    <div style={{padding: 16}}>
      <nav style={{marginBottom: 16, fontSize: 14}}>
        <a href="/" style={{color: '#2563eb'}}>Home</a> / <a href="/electronics" style={{color: '#2563eb'}}>Electronics</a> / <a href="/electronics/audio" style={{color: '#2563eb'}}>Audio</a> / <span style={{color: '#6b7280'}}>Wireless Headphones Pro</span>
      </nav>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        <div style={{border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300}}>
          <p style={{color: '#9ca3af'}}>Product Image Placeholder</p>
        </div>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
            <h1 style={{fontSize: 24, fontWeight: 700, margin: 0}}>Wireless Headphones Pro</h1>
            <span style={{background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontSize: 12}}>In Stock</span>
          </div>
          <p style={{fontSize: 20, fontWeight: 600, marginBottom: 8}}>$299.99</p>
          <p style={{color: '#6b7280', marginBottom: 16}}>Premium noise-cancelling headphones with 30-hour battery life, adaptive EQ, and spatial audio support.</p>
          <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0'}} />
          <p style={{fontWeight: 600, marginBottom: 8}}>Key Features:</p>
          <ul style={{marginBottom: 16, paddingLeft: 20}}>
            <li>Active Noise Cancellation</li>
            <li>30-hour battery life</li>
            <li>Bluetooth 5.3</li>
            <li>USB-C fast charging</li>
          </ul>
          <div style={{display: 'flex', gap: 8}}>
            <button style={{padding: '10px 20px', border: 'none', borderRadius: 6, background: '#2563eb', color: 'white', cursor: 'pointer'}}>Add to Cart</button>
            <button style={{padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer'}}>Save for Later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
