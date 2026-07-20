export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <div style={{minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'}}>
      <header style={{borderBottom: '1px solid #e0e0e0', padding: '12px 16px'}}>
        <h1 style={{margin: 0, fontSize: 18, fontWeight: 700}}>Internal Tool</h1>
      </header>
      <main style={{padding: 24}}>
        {children}
      </main>
    </div>
  );
}
