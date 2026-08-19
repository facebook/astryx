import './globals.css';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto max-w-6xl px-6 py-4">{children}</div>
      </body>
    </html>
  );
}
