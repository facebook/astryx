import {useState, useEffect, useRef} from 'react';

interface Suggestion {id: number; name: string; category: string}

const all: Suggestion[] = [
  {id: 1, name: 'React', category: 'Framework'}, {id: 2, name: 'TypeScript', category: 'Language'},
  {id: 3, name: 'Next.js', category: 'Framework'}, {id: 4, name: 'Tailwind', category: 'Styling'},
  {id: 5, name: 'Vite', category: 'Build Tool'}, {id: 6, name: 'ESLint', category: 'Linting'},
  {id: 7, name: 'Prettier', category: 'Formatting'}, {id: 8, name: 'Jest', category: 'Testing'},
  {id: 9, name: 'Playwright', category: 'Testing'}, {id: 10, name: 'GraphQL', category: 'API'},
];

export default function AutocompleteInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!query) { setResults([]); setOpen(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setResults(all.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))); setOpen(true); }, 200);
    return () => clearTimeout(timer.current);
  }, [query]);

  return (
    <div style={{padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 8}}>Technology Search</h2>
      <p style={{color: '#666', marginBottom: 12}}>Start typing to search</p>
      <div style={{position: 'relative'}}>
        <input placeholder="Type to search..." value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }} onFocus={() => query && setOpen(true)} style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4}} />
        {open && results.length > 0 && (
          <div style={{position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, border: '1px solid #e0e0e0', borderRadius: 4, background: 'white', maxHeight: 240, overflow: 'auto', zIndex: 10}}>
            {results.map(r => <div key={r.id} onClick={() => { setSelected(r); setQuery(r.name); setOpen(false); }} style={{padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0'}}><span style={{fontWeight: 500}}>{r.name}</span><span style={{marginLeft: 8, fontSize: 12, color: '#999'}}>{r.category}</span></div>)}
          </div>
        )}
      </div>
      {selected && <div style={{marginTop: 12, padding: 12, border: '1px solid #e0e0e0', borderRadius: 4}}><p style={{fontWeight: 500}}>Selected: {selected.name}</p><p style={{fontSize: 12, color: '#666'}}>Category: {selected.category}</p></div>}
    </div>
  );
}
