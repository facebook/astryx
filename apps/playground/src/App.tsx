import { useEffect, useState } from 'react';
import { CommandPalette, DocLayout, PageHeader, SideNav } from '@jedi/patterns';
import { ArtifactGallery } from '@jedi/docs';
import { Button, Heading } from '@jedi/react';
import { defaultTheme } from '@jedi/themes';
import { Stack } from '@jedi/foundation';

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = defaultTheme.toStyleTag('light');
    document.head.appendChild(style);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      style.remove();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <DocLayout
        title="Playground"
        sidebar={
          <SideNav
            items={[
              { id: 'patterns', label: 'Patterns', active: true },
              { id: 'gallery', label: 'Gallery' },
            ]}
          />
        }
      >
        <PageHeader
          title="Pattern Playground"
          description="Explore JEDI application patterns — v0.4"
          actions={<Button onClick={() => setPaletteOpen(true)}>⌘K Command</Button>}
        />
        <Stack spacing={6}>
          <Heading level={2}>Artifact Gallery</Heading>
          <ArtifactGallery
            items={[
              { id: '1', title: 'Token Model', description: 'Core → Semantic → Component' },
              { id: '2', title: 'Doc Layout', description: 'Sidebar + content shell' },
            ]}
          />
        </Stack>
      </DocLayout>
      <CommandPalette
        open={paletteOpen}
        query={query}
        onQueryChange={setQuery}
        onClose={() => setPaletteOpen(false)}
        items={[
          { id: 'tokens', label: 'View Tokens', onSelect: () => {} },
          { id: 'docs', label: 'Open Documentation', onSelect: () => {} },
        ]}
      />
    </>
  );
}
