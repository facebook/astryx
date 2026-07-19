// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function InstallSnippet() {
  return (
    <div style={{maxWidth: 500, margin: '0 auto', padding: 24}}>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24}}>
        <h2 style={{fontSize: 20, fontWeight: 600, marginBottom: 12}}>Getting Started</h2>
        <p style={{marginBottom: 16}}>Install the package using your preferred package manager:</p>
        <div style={{background: '#1e1e1e', borderRadius: 8, padding: 16}}>
          <div style={{color: '#9ca3af', fontSize: 12, marginBottom: 8}}>Terminal</div>
          <code style={{color: '#e5e7eb', fontFamily: 'monospace', fontSize: 14}}>npm install my-component-library</code>
        </div>
        <p style={{fontSize: 13, color: '#6b7280', marginTop: 12}}>Then import and use any component in your React project.</p>
      </div>
    </div>
  );
}
