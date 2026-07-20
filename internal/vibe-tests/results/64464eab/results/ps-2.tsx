export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b"><div className="container mx-auto px-4 py-3"><h1 className="text-lg font-bold">Internal Tool</h1></div></header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
