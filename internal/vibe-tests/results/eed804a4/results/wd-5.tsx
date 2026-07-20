import {useState} from 'react';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentiment, setSentiment] = useState('neutral');

  if (!isOpen) return <button onClick={() => setIsOpen(true)} style={{padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Give Feedback</button>;

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
      <div style={{background: 'white', borderRadius: 8, padding: 24, width: 400, maxWidth: '90vw'}}>
        <h2 style={{margin: '0 0 16px', fontSize: 18, fontWeight: 600}}>Send Feedback</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div><label style={{display: 'block', marginBottom: 4, fontSize: 14}}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary" style={{width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4}} /></div>
          <div><label style={{display: 'block', marginBottom: 4, fontSize: 14}}>Details</label><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us more..." style={{width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, minHeight: 80}} /></div>
          <div><label style={{display: 'block', marginBottom: 4, fontSize: 14}}>Sentiment</label>
            <div style={{display: 'flex', gap: 8}}>
              {(['positive', 'neutral', 'negative'] as const).map(s => (
                <button key={s} onClick={() => setSentiment(s)} style={{padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, background: sentiment === s ? '#1976d2' : 'white', color: sentiment === s ? 'white' : 'inherit', cursor: 'pointer'}}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16}}>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Cancel</button>
          <button onClick={() => { console.log({title, body, sentiment}); setIsOpen(false); }} style={{padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Submit</button>
        </div>
      </div>
    </div>
  );
}
