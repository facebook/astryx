import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSPowerSearch, usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSTable, pixel, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

// =============================================================================
// Field definitions
// =============================================================================

const genreValues = [
  {value: 'fiction', label: 'Fiction'},
  {value: 'non-fiction', label: 'Non-Fiction'},
  {value: 'sci-fi', label: 'Science Fiction'},
  {value: 'fantasy', label: 'Fantasy'},
  {value: 'mystery', label: 'Mystery'},
  {value: 'romance', label: 'Romance'},
  {value: 'biography', label: 'Biography'},
  {value: 'history', label: 'History'},
];

const fieldDefs = [
  {key: 'title', type: 'string', label: 'Title'},
  {key: 'author', type: 'string', label: 'Author'},
  {key: 'year', type: 'number', label: 'Publication Year'},
  {key: 'genre', type: 'enum', label: 'Genre', enumValues: genreValues},
] as const;

// =============================================================================
// Sample data
// =============================================================================

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
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    genre: 'fiction',
  },
  {
    id: '4',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'sci-fi',
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    genre: 'fiction',
  },
  {
    id: '6',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    genre: 'fantasy',
  },
  {
    id: '7',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    genre: 'non-fiction',
  },
  {
    id: '8',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    year: 2007,
    genre: 'fantasy',
  },
  {
    id: '9',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    year: 2012,
    genre: 'mystery',
  },
  {
    id: '10',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    year: 2011,
    genre: 'biography',
  },
  {
    id: '11',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: 1988,
    genre: 'non-fiction',
  },
  {
    id: '12',
    title: 'The Shining',
    author: 'Stephen King',
    year: 1977,
    genre: 'mystery',
  },
  {
    id: '13',
    title: "The Handmaid's Tale",
    author: 'Margaret Atwood',
    year: 1985,
    genre: 'sci-fi',
  },
  {
    id: '14',
    title: 'Outlander',
    author: 'Diana Gabaldon',
    year: 1991,
    genre: 'romance',
  },
  {
    id: '15',
    title: 'The Guns of August',
    author: 'Barbara Tuchman',
    year: 1962,
    genre: 'history',
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

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Patterns/PowerSearch + Table',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{width: 800}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  render: () => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs, 'Books');
    const filteredBooks = applyFilters(filters, books);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSPowerSearch
          config={config}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          placeholder="Filter books by title, author, year, genre..."
          resultCount={filteredBooks.length}
        />
        <XDSTable data={filteredBooks} columns={columns} idKey="id" hasHover />
      </div>
    );
  },
};

export const WithPresetFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {field: 'genre', operator: 'is', value: {type: 'enum', value: 'sci-fi'}},
    ]);
    const {config, applyFilters} = usePowerSearchConfig(fieldDefs, 'Books');
    const filteredBooks = applyFilters(filters, books);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSPowerSearch
          config={config}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          placeholder="Filter books..."
          resultCount={filteredBooks.length}
        />
        <XDSTable
          data={filteredBooks}
          columns={columns}
          idKey="id"
          hasHover
          isStriped
        />
      </div>
    );
  },
};
