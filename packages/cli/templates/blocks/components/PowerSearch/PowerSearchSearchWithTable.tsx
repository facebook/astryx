'use client';

import {useState} from 'react';
import {XDSPowerSearch, usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSTable, pixel, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSVStack} from '@xds/core/Layout';

const genreValues = [
  {value: 'sci-fi', label: 'Science Fiction'},
  {value: 'fantasy', label: 'Fantasy'},
  {value: 'non-fiction', label: 'Non-Fiction'},
  {value: 'romance', label: 'Romance'},
  {value: 'mystery', label: 'Mystery'},
];

const fieldDefs = [
  {key: 'title', type: 'string', label: 'Title'},
  {key: 'author', type: 'string', label: 'Author'},
  {key: 'year', type: 'number', label: 'Publication Year'},
  {key: 'genre', type: 'enum', label: 'Genre', enumValues: genreValues},
] as const;

interface Book extends Record<string, unknown> {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
}

const books: Book[] = [
  {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    genre: 'sci-fi',
  },
  {
    id: '2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'romance',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'sci-fi',
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    genre: 'fantasy',
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    genre: 'non-fiction',
  },
];

const columns: XDSTableColumn<Book>[] = [
  {key: 'title', header: 'Title', width: proportional(2)},
  {key: 'author', header: 'Author', width: proportional(2)},
  {key: 'year', header: 'Year', width: pixel(100)},
  {
    key: 'genre',
    header: 'Genre',
    width: pixel(140),
    renderCell: (book: Book) =>
      genreValues.find(g => g.value === book.genre)?.label ?? book.genre,
  },
];

export default function PowerSearchSearchWithTable() {
  const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
  const {config, applyFilters} = usePowerSearchConfig(fieldDefs, 'Books');
  const filteredBooks = applyFilters(filters, books);

  return (
    <XDSVStack gap={4} width="100%" style={{maxWidth: 500}}>
      <XDSPowerSearch
        config={config}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        placeholder="Filter books by title, author, year, genre..."
        resultCount={filteredBooks.length}
      />
      <XDSTable data={filteredBooks} columns={columns} idKey="id" hasHover />
    </XDSVStack>
  );
}
