import {useState, useCallback} from 'react';
import {Typeahead} from '@astryxdesign/core/Typeahead';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';

interface Suggestion {
  id: number;
  name: string;
  category: string;
}

const allSuggestions: Suggestion[] = [
  {id: 1, name: 'React', category: 'Framework'},
  {id: 2, name: 'TypeScript', category: 'Language'},
  {id: 3, name: 'Next.js', category: 'Framework'},
  {id: 4, name: 'Tailwind CSS', category: 'Styling'},
  {id: 5, name: 'Vite', category: 'Build Tool'},
  {id: 6, name: 'ESLint', category: 'Linting'},
  {id: 7, name: 'Prettier', category: 'Formatting'},
  {id: 8, name: 'Jest', category: 'Testing'},
  {id: 9, name: 'Playwright', category: 'Testing'},
  {id: 10, name: 'GraphQL', category: 'API'},
];

function createSearchSource() {
  return {
    search: async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return allSuggestions.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    },
    bootstrap: async () => allSuggestions.slice(0, 5),
  };
}

export default function AutocompleteInput() {
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const searchSource = createSearchSource();

  return (
    <VStack gap={4} padding={4}>
      <Heading level={2}>Technology Search</Heading>
      <Text color="secondary">Start typing to search for technologies</Text>
      <Typeahead
        label="Search technologies"
        searchSource={searchSource}
        value={selected}
        onChange={setSelected}
        placeholder="Type to search..."
        hasEntriesOnFocus
        renderItem={(item: Suggestion) => (
          <div>
            <Text type="label">{item.name}</Text>
            <Text type="supporting" color="secondary">
              {' '}{item.category}
            </Text>
          </div>
        )}
      />
      {selected && (
        <Card padding={3}>
          <VStack gap={1}>
            <Text type="label">Selected: {selected.name}</Text>
            <Text type="supporting" color="secondary">Category: {selected.category}</Text>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}
