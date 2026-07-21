import React from 'react';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import {Badge} from '@astryxdesign/core/Badge';
import {Heading} from '@astryxdesign/core/Heading';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({ container: { padding: 24, maxWidth: 800 } });

interface ContentItem extends Record<string, unknown> {
  id: string; title: string; type: string; author: string; date: string;
}

const data: ContentItem[] = [
  {id: '1', title: 'Getting Started with React 19', type: 'Article', author: 'Jane Smith', date: '2024-06-15'},
  {id: '2', title: 'Advanced TypeScript Patterns', type: 'Video', author: 'Bob Chen', date: '2024-06-12'},
  {id: '3', title: 'Design Systems Deep Dive', type: 'Podcast', author: 'Alice Park', date: '2024-06-10'},
  {id: '4', title: 'Weekly Product Update', type: 'Newsletter', author: 'Team', date: '2024-06-08'},
  {id: '5', title: 'Building Accessible UIs', type: 'Webinar', author: 'Sam Lee', date: '2024-06-05'},
  {id: '6', title: 'CSS-in-JS Performance', type: 'Article', author: 'Chris Wang', date: '2024-06-03'},
  {id: '7', title: 'State Management in 2024', type: 'Video', author: 'Dana Fox', date: '2024-06-01'},
  {id: '8', title: 'Interview: Framework Authors', type: 'Podcast', author: 'Alex Kim', date: '2024-05-28'},
];

const TYPE_COLORS: Record<string, string> = { Article: 'blue', Video: 'purple', Podcast: 'teal', Newsletter: 'orange', Webinar: 'green' };

const columns = [
  {key: 'title' as const, header: 'Title', width: proportional(3)},
  {key: 'type' as const, header: 'Type', width: pixel(120), renderCell: (row: ContentItem) => <Badge label={row.type} variant={TYPE_COLORS[row.type] as any} />},
  {key: 'author' as const, header: 'Author', width: proportional(1)},
  {key: 'date' as const, header: 'Date', width: pixel(120)},
];

export default function ContentLibrary() {
  return (
    <div {...stylex.props(styles.container)}>
      <Heading level={2}>Content Library</Heading>
      <Table data={data} columns={columns} idKey="id" hasHover />
    </div>
  );
}
