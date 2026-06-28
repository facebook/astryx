// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit() {
    console.log('Feedback:', {title, message});
    setTitle('');
    setMessage('');
    setIsOpen(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{padding: '10px 20px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
        Give Feedback
      </button>
      {isOpen && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{backgroundColor: '#fff', borderRadius: 8, padding: 24, width: 400, maxWidth: '90vw'}}>
            <h2 style={{margin: '0 0 16px', fontSize: 20, fontWeight: 'bold'}}>Send Feedback</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div>
                <label htmlFor="fb-title" style={{display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500}}>Title</label>
                <input id="fb-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" style={{width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box'}} />
              </div>
              <div>
                <label htmlFor="fb-message" style={{display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500}}>Message</label>
                <textarea id="fb-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you think..." rows={5} style={{width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box', resize: 'vertical'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Cancel</button>
                <button onClick={handleSubmit} disabled={!title || !message} style={{padding: '8px 16px', backgroundColor: !title || !message ? '#ccc' : '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
