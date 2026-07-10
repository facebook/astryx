// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function ThemedPage() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8f9fa', padding: 24}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold'}}>Themed Page</h1>
        <p style={{color: '#666'}}>This page uses a wash background color. Without a design system, the background color is hardcoded. With a theme system, this would be a token like --color-background-wash that adapts to light/dark mode.</p>
      </div>
    </div>
  );
}
