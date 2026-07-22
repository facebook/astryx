export default function ProductDetailPage() {
  return (
    <div style={{maxWidth: 700, margin: '0 auto', fontFamily: 'system-ui', padding: 24}}>
      <nav style={{fontSize: 14, color: '#666', marginBottom: 24}}>
        <a href="/" style={{color: '#0066cc'}}>Home</a> &gt; <a href="/cat" style={{color: '#0066cc'}}>Category</a> &gt; <a href="/cat/sub" style={{color: '#0066cc'}}>Subcategory</a> &gt; <span>Product Name</span>
      </nav>
      <h1 style={{fontSize: 28}}>Wireless Headphones Pro</h1>
      <div style={{border: '1px solid #ddd', borderRadius: 8, padding: 24, marginTop: 16}}>
        <p style={{fontSize: 20, fontWeight: 600}}>$299.99</p>
        <p style={{color: '#666'}}>Premium headphones.</p>
        <div style={{display: 'flex', gap: 8, marginTop: 16}}>
          <button style={{padding: '10px 20px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: 4}}>Add to Cart</button>
          <button onClick={() => history.back()} style={{padding: '10px 20px', border: '1px solid #ccc', borderRadius: 4}}>Back</button>
        </div>
      </div>
    </div>
  );
}
