import React from 'react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Button} from '@/components/ui/button';

function BoldIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 2.93 6.69A4.5 4.5 0 0 1 15.5 20H6V4zm2 8v6h5.5a2.5 2.5 0 0 0 0-5H8zm0-2h4a2 2 0 1 0 0-4H8v4z"/></svg>; }
function ItalicIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/></svg>; }
function UnderlineIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 3v9a4 4 0 0 0 8 0V3h2v9a6 6 0 0 1-12 0V3h2zM4 20h16v2H4v-2z"/></svg>; }
function LinkIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636l1.415-1.414a7 7 0 0 1 9.9 9.9l-1.415 1.414z"/></svg>; }

export default function FormattingToolbar() {
  return (
    <TooltipProvider>
      <div role="toolbar" aria-label="Text formatting" className="flex gap-1 p-1 border rounded-md">
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Bold"><BoldIcon /></Button></TooltipTrigger><TooltipContent>Bold (Ctrl+B)</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Italic"><ItalicIcon /></Button></TooltipTrigger><TooltipContent>Italic (Ctrl+I)</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Underline"><UnderlineIcon /></Button></TooltipTrigger><TooltipContent>Underline (Ctrl+U)</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Link"><LinkIcon /></Button></TooltipTrigger><TooltipContent>Link (Ctrl+K)</TooltipContent></Tooltip>
      </div>
    </TooltipProvider>
  );
}
