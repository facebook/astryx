// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ProductDetail() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, padding: 24}}>
      <nav aria-label="Breadcrumb">
        <ol style={{display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14}}>
          <li><a href="/" style={{color: '#0d6efd', textDecoration: 'none'}}>Home</a></li>
          <li>/</li>
          <li><a href="/electronics" style={{color: '#0d6efd', textDecoration: 'none'}}>Electronics</a></li>
          <li>/</li>
          <li><a href="/electronics/audio" style={{color: '#0d6efd', textDecoration: 'none'}}>Audio</a></li>
          <li>/</li>
          <li aria-current="page" style={{color: '#666'}}>Wireless Headphones</li>
        </ol>
      </nav>
      <div style={{padding: 32, border: '1px solid #e5e7eb', borderRadius: 8}}>
        <h1 style={{margin: '0 0 8px', fontSize: 28, fontWeight: 700}}>Wireless Headphones Pro</h1>
        <p style={{fontSize: 24, fontWeight: 600, color: '#0d6efd', margin: '0 0 12px'}}>$199.99</p>
        <p style={{color: '#666', margin: '0 0 20px'}}>
          Premium noise-cancelling headphones with 30-hour battery life, adaptive EQ, and multipoint connection.
        </p>
        <div style={{display: 'flex', gap: 12}}>
          <button style={{padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Add to Cart</button>
          <button style={{padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Save for Later</button>
        </div>
      </div>
    </div>
  );
}
