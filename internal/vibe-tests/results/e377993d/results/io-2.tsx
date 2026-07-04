import {useState, useEffect, useRef} from 'react';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';

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

export default function AutocompleteInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!query) { setResults([]); return; }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const filtered = allSuggestions.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
      setResults(filtered);
      setIsOpen(true);
    }, 200);
    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Technology Search</h2>
      <p className="text-gray-600">Start typing to search</p>
      <div className="relative">
        <Input placeholder="Type to search..." value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }} onFocus={() => query && setIsOpen(true)} />
        {isOpen && results.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-60 overflow-auto">
            {results.map(item => (
              <div key={item.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setSelected(item); setQuery(item.name); setIsOpen(false); }}>
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-500 ml-2">{item.category}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
      {selected && (
        <Card className="p-3">
          <p className="font-medium">Selected: {selected.name}</p>
          <p className="text-sm text-gray-500">Category: {selected.category}</p>
        </Card>
      )}
    </div>
  );
}
