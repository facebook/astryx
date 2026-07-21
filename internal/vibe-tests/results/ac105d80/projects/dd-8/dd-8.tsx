import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';

const data = [
  {id: '1', title: 'Getting Started with React 19', type: 'Article', author: 'Jane Smith', date: '2024-06-15'},
  {id: '2', title: 'Advanced TypeScript Patterns', type: 'Video', author: 'Bob Chen', date: '2024-06-12'},
  {id: '3', title: 'Design Systems Deep Dive', type: 'Podcast', author: 'Alice Park', date: '2024-06-10'},
  {id: '4', title: 'Weekly Product Update', type: 'Newsletter', author: 'Team', date: '2024-06-08'},
  {id: '5', title: 'Building Accessible UIs', type: 'Webinar', author: 'Sam Lee', date: '2024-06-05'},
  {id: '6', title: 'CSS-in-JS Performance', type: 'Article', author: 'Chris Wang', date: '2024-06-03'},
  {id: '7', title: 'State Management in 2024', type: 'Video', author: 'Dana Fox', date: '2024-06-01'},
  {id: '8', title: 'Interview: Framework Authors', type: 'Podcast', author: 'Alex Kim', date: '2024-05-28'},
];

const COLORS: Record<string, string> = { Article: 'bg-blue-100 text-blue-800', Video: 'bg-purple-100 text-purple-800', Podcast: 'bg-teal-100 text-teal-800', Newsletter: 'bg-orange-100 text-orange-800', Webinar: 'bg-green-100 text-green-800' };

export default function ContentLibrary() {
  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Content Library</h2>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Author</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
        <TableBody>{data.map(r => <TableRow key={r.id}><TableCell>{r.title}</TableCell><TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[r.type]}`}>{r.type}</span></TableCell><TableCell>{r.author}</TableCell><TableCell>{r.date}</TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  );
}
