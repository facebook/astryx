import {useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';

const emails = [
  {id: '1', sender: 'Alice Chen', subject: 'Project Update', date: '2024-01-15', preview: 'Hey, just wanted to share...', isRead: false},
  {id: '2', sender: 'Bob Smith', subject: 'Meeting Notes', date: '2024-01-14', preview: 'Here are the notes...', isRead: true},
  {id: '3', sender: 'Carol Davis', subject: 'Review Request', date: '2024-01-14', preview: 'Could you take a look...', isRead: false},
  {id: '4', sender: 'Dan Wilson', subject: 'Lunch plans', date: '2024-01-13', preview: 'Want to grab lunch?', isRead: true},
];

export default function EmailInbox() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => { setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inbox</h2>
        {selected.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions ({selected.size})</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Mark as read</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Table>
        <TableHeader><TableRow><TableHead className="w-10" /><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Preview</TableHead></TableRow></TableHeader>
        <TableBody>
          {emails.map(e => (
            <TableRow key={e.id} className="hover:bg-muted/50">
              <TableCell><Checkbox checked={selected.has(e.id)} onCheckedChange={() => toggle(e.id)} /></TableCell>
              <TableCell className={e.isRead ? '' : 'font-semibold'}>{e.sender}</TableCell>
              <TableCell>{e.subject}</TableCell>
              <TableCell className="text-muted-foreground">{e.date}</TableCell>
              <TableCell className="text-muted-foreground truncate max-w-[200px]">{e.preview}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
