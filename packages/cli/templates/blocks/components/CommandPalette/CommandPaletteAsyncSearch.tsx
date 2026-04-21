'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette, XDSCommandPaletteInput} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import type {XDSSearchSource} from '@xds/core/Typeahead';

const allFiles = [
  {id: 'readme', label: 'README.md'},
  {id: 'package', label: 'package.json'},
  {id: 'tsconfig', label: 'tsconfig.json'},
  {id: 'index', label: 'src/index.ts'},
  {id: 'app', label: 'src/App.tsx'},
];

export default function CommandPaletteAsyncSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const source = useMemo<XDSSearchSource>(
    () => ({
      async search(query: string) {
        await new Promise(r => setTimeout(r, 400));
        return allFiles.filter(f =>
          f.label.toLowerCase().includes(query.toLowerCase()),
        );
      },
      bootstrap() {
        return [];
      },
    }),
    [],
  );

  return (
    <>
      <XDSButton label="Open File Search" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
        input={<XDSCommandPaletteInput placeholder="Search files..." />}
        emptyBootstrapText="Type a filename to search"
        emptySearchText="No files found"
      />
    </>
  );
}
