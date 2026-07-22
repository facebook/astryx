export default function ThemedPage() {
  return (
    <div style={{minHeight: '100vh', padding: 32, backgroundColor: '#f5f5f5', fontFamily: 'system-ui'}}>
      <div style={{maxWidth: 600, margin: '0 auto'}}>
        <h1 style={{fontSize: 28}}>Themed Page</h1>
        <p style={{color: '#666'}}>The page background uses a wash/muted color.</p>
        <div style={{backgroundColor: 'white', borderRadius: 8, border: '1px solid #ddd', padding: 24, marginTop: 16}}>
          <p>Card content on the default card background.</p>
        </div>
      </div>
    </div>
  );
}
