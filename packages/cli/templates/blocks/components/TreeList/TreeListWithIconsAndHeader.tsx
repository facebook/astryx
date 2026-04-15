'use client';

import {XDSTreeList} from '@xds/core/TreeList';

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TreeListWithIconsAndHeader() {
  return (
    <XDSTreeList
      header={<strong>Project Files</strong>}
      density="compact"
      items={[
        { id: 'src', label: 'src', isExpanded: true, startContent: <FolderIcon />, children: [
          { id: 'app', label: 'App.tsx', startContent: <FileIcon /> },
        ]},
      ]}
    />
  );
}
