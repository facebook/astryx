// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  PowerSearch,
  usePowerSearchConfig,
} from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import type {SearchSource, SearchableItem} from '@astryxdesign/core/Typeahead';

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

const themeValues = [
  {value: 'coming-of-age', label: 'Coming of Age'},
  {value: 'dystopia', label: 'Dystopia'},
  {value: 'love', label: 'Love'},
  {value: 'war', label: 'War'},
  {value: 'identity', label: 'Identity'},
  {value: 'adventure', label: 'Adventure'},
];

const fieldDefs = [
  {key: 'title', type: 'string', label: 'Title'},
  {key: 'author', type: 'string', label: 'Author'},
  {key: 'year', type: 'number', label: 'Publication Year'},
  {key: 'genre', type: 'enum', label: 'Genre', enumValues: genreValues},
  {key: 'published', type: 'date', label: 'Published Date'},
  {key: 'inStock', type: 'boolean', label: 'In Stock'},
  {key: 'discontinued', type: 'boolean', label: 'Discontinued'},
  {key: 'tags', type: 'string_list', label: 'Tags'},
  {key: 'themes', type: 'enum_list', label: 'Themes', enumValues: themeValues},
] as const;

// -----------------------------------------------------------------------------
// Author entity source (entity field must be added manually — the config hook
// only supports the 7 built-in shorthand types). We build a PowerSearchField
// manually and merge it into the config below.
// -----------------------------------------------------------------------------

const authorEntities: SearchableItem[] = [
  {id: 'author-herbert', label: 'Frank Herbert'},
  {id: 'author-austen', label: 'Jane Austen'},
  {id: 'author-fitzgerald', label: 'F. Scott Fitzgerald'},
  {id: 'author-orwell', label: 'George Orwell'},
  {id: 'author-lee', label: 'Harper Lee'},
  {id: 'author-tolkien', label: 'J.R.R. Tolkien'},
  {id: 'author-harari', label: 'Yuval Noah Harari'},
  {id: 'author-rothfuss', label: 'Patrick Rothfuss'},
];

const authorSource: SearchSource = {
  search: (query: string) =>
    authorEntities.filter(a =>
      a.label.toLowerCase().includes(query.toLowerCase()),
    ),
  bootstrap: () => authorEntities,
};

const authorEntityField: PowerSearchField = {
  key: 'authorEntity',
  label: 'Author (entity)',
  defaultOperator: 'is_any_of',
  operators: [
    {
      key: 'is_any_of',
      i18nKey: '@astryx.powersearch.operator.isAnyOf',
      value: {type: 'entity_list', searchSource: authorSource},
    },
    {
      key: 'is_none_of',
      i18nKey: '@astryx.powersearch.operator.isNoneOf',
      value: {type: 'entity_list', searchSource: authorSource},
    },
  ],
};

// =============================================================================
// Sample data
// =============================================================================

interface Book extends Record<string, unknown> {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  published: Date;
  inStock: boolean;
  discontinued: boolean;
  tags: ReadonlyArray<string>;
  themes: ReadonlyArray<string>;
}

// Helper to make a Date from a year for the sample data.
const dateOf = (year: number, month = 1, day = 1) =>
  new Date(year, month - 1, day);

const books: Book[] = [
  {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    genre: 'sci-fi',
    published: dateOf(1965, 8, 1),
    inStock: true,
    discontinued: false,
    tags: ['classic', 'award-winner', 'series'],
    themes: ['adventure', 'identity'],
  },
  {
    id: '2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'romance',
    published: dateOf(1813, 1, 28),
    inStock: true,
    discontinued: true,
    tags: ['classic', 'bestseller'],
    themes: ['love', 'identity'],
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    genre: 'fiction',
    published: dateOf(1925, 4, 10),
    inStock: true,
    discontinued: false,
    tags: ['classic', 'staff-pick'],
    themes: ['love', 'identity'],
  },
  {
    id: '4',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    genre: 'sci-fi',
    published: dateOf(1949, 6, 8),
    inStock: false,
    discontinued: true,
    tags: ['classic', 'bestseller'],
    themes: ['dystopia', 'identity'],
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    genre: 'fiction',
    published: dateOf(1960, 7, 11),
    inStock: true,
    discontinued: false,
    tags: ['classic', 'award-winner'],
    themes: ['coming-of-age', 'identity'],
  },
  {
    id: '6',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    genre: 'fantasy',
    published: dateOf(1937, 9, 21),
    inStock: true,
    discontinued: false,
    tags: ['classic', 'series'],
    themes: ['adventure'],
  },
  {
    id: '7',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    genre: 'non-fiction',
    published: dateOf(2011, 1, 1),
    inStock: true,
    discontinued: false,
    tags: ['bestseller', 'staff-pick'],
    themes: ['identity'],
  },
  {
    id: '8',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    year: 2007,
    genre: 'fantasy',
    published: dateOf(2007, 3, 27),
    inStock: false,
    discontinued: true,
    tags: ['series', 'staff-pick'],
    themes: ['adventure', 'coming-of-age'],
  },
  {
    id: '9',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    year: 2012,
    genre: 'mystery',
    published: dateOf(2012, 6, 5),
    inStock: true,
    discontinued: false,
    tags: ['bestseller'],
    themes: ['love', 'identity'],
  },
  {
    id: '10',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    year: 2011,
    genre: 'biography',
    published: dateOf(2011, 10, 24),
    inStock: true,
    discontinued: true,
    tags: ['bestseller'],
    themes: ['identity'],
  },
  {
    id: '11',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: 1988,
    genre: 'non-fiction',
    published: dateOf(1988, 4, 1),
    inStock: false,
    discontinued: false,
    tags: ['classic', 'staff-pick'],
    themes: ['identity'],
  },
  {
    id: '12',
    title: 'The Shining',
    author: 'Stephen King',
    year: 1977,
    genre: 'mystery',
    published: dateOf(1977, 1, 28),
    inStock: true,
    discontinued: false,
    tags: ['classic'],
    themes: ['identity'],
  },
  {
    id: '13',
    title: "The Handmaid's Tale",
    author: 'Margaret Atwood',
    year: 1985,
    genre: 'sci-fi',
    published: dateOf(1985, 8, 17),
    inStock: true,
    discontinued: false,
    tags: ['award-winner', 'series'],
    themes: ['dystopia', 'identity'],
  },
  {
    id: '14',
    title: 'Outlander',
    author: 'Diana Gabaldon',
    year: 1991,
    genre: 'romance',
    published: dateOf(1991, 6, 1),
    inStock: true,
    discontinued: true,
    tags: ['series', 'bestseller'],
    themes: ['love', 'adventure', 'war'],
  },
  {
    id: '15',
    title: 'The Guns of August',
    author: 'Barbara Tuchman',
    year: 1962,
    genre: 'history',
    published: dateOf(1962, 1, 1),
    inStock: false,
    discontinued: false,
    tags: ['classic', 'award-winner'],
    themes: ['war'],
  },
];

const columns: TableColumn<Book>[] = [
  {key: 'title', header: 'Title', width: proportional(2)},
  {key: 'author', header: 'Author', width: proportional(2)},
  {key: 'year', header: 'Year', width: pixel(80)},
  {
    key: 'genre',
    header: 'Genre',
    width: pixel(120),
    renderCell: (book: Book) =>
      genreValues.find(g => g.value === book.genre)?.label ?? book.genre,
  },
  {
    key: 'published',
    header: 'Published',
    width: pixel(120),
    renderCell: (book: Book) => book.published.toLocaleDateString(),
  },
  {
    key: 'inStock',
    header: 'In Stock',
    width: pixel(90),
    renderCell: (book: Book) => (book.inStock ? 'Yes' : 'No'),
  },
];

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Core/PowerSearchWithTable',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{width: 1000}}>
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
        <PowerSearch
          config={config}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          placeholder="Filter books by title, author, year, genre..."
          resultCount={filteredBooks.length}
        />
        <Table data={filteredBooks} columns={columns} idKey="id" hasHover />
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
        <PowerSearch
          config={config}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          placeholder="Filter books..."
          resultCount={filteredBooks.length}
        />
        <Table
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

// -----------------------------------------------------------------------------
// WithMixedFilters — one preset filter of each new field type.
//
// The i18n operator labels come from `usePowerSearchConfig` (built-in). The
// entity field is added manually (see `authorEntityField` above) because the
// shorthand config hook doesn't have an entity type — its operators still use
// the same @astryx.powersearch.operator.* i18n keys as enum_list.
// -----------------------------------------------------------------------------
export const WithMixedFilters: Story = {
  render: () => {
    const {config: baseConfig, applyFilters} = usePowerSearchConfig(
      fieldDefs,
      'Books',
    );
    const config: PowerSearchConfig = {
      ...baseConfig,
      fields: [...baseConfig.fields, authorEntityField],
    };
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'published',
        operator: 'after',
        value: {
          type: 'date_absolute',
          unixSeconds: Math.floor(new Date('1970-01-01').getTime() / 1000),
        },
      },
      {
        field: 'inStock',
        operator: 'is_true',
        value: {type: 'empty'},
      },
      {
        field: 'discontinued',
        operator: 'is_false',
        value: {type: 'empty'},
      },
      {
        field: 'tags',
        operator: 'is_any_of',
        value: {type: 'string_list', value: ['classic']},
      },
      {
        field: 'themes',
        operator: 'is_any_of',
        value: {type: 'enum_list', value: ['identity']},
      },
      {
        field: 'authorEntity',
        operator: 'is_any_of',
        value: {
          type: 'entity_list',
          value: [{id: 'author-tolkien', label: 'J.R.R. Tolkien'}],
        },
      },
    ]);
    const filteredBooks = applyFilters(filters, books);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <PowerSearch
          config={config}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          placeholder="Mixed filters..."
          resultCount={filteredBooks.length}
        />
        <Table
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
