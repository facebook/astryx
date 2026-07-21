import React from 'react';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';

function BoldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 2.93 6.69A4.5 4.5 0 0 1 15.5 20H6V4zm2 8v6h5.5a2.5 2.5 0 0 0 0-5H8zm0-2h4a2 2 0 1 0 0-4H8v4z"/></svg>;
}
function ItalicIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/></svg>;
}
function UnderlineIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 3v9a4 4 0 0 0 8 0V3h2v9a6 6 0 0 1-12 0V3h2zM4 20h16v2H4v-2z"/></svg>;
}
function LinkIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636l1.415-1.414a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/></svg>;
}

export default function FormattingToolbar() {
  return (
    <Toolbar label="Text formatting">
      <Tooltip content="Bold (Ctrl+B)">
        <IconButton icon={<BoldIcon />} label="Bold" variant="ghost" />
      </Tooltip>
      <Tooltip content="Italic (Ctrl+I)">
        <IconButton icon={<ItalicIcon />} label="Italic" variant="ghost" />
      </Tooltip>
      <Tooltip content="Underline (Ctrl+U)">
        <IconButton icon={<UnderlineIcon />} label="Underline" variant="ghost" />
      </Tooltip>
      <Tooltip content="Link (Ctrl+K)">
        <IconButton icon={<LinkIcon />} label="Link" variant="ghost" />
      </Tooltip>
    </Toolbar>
  );
}
