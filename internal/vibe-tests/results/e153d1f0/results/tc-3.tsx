export default function ThemedPage() {
  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Themed Page</h1>
        <p className="text-muted-foreground">The page background uses the muted/wash color from the theme.</p>
        <div className="bg-card rounded-lg border p-6">
          <p>Card content on the default card background.</p>
        </div>
      </div>
    </div>
  );
}
