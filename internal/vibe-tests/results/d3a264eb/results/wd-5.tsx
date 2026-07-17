// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setTitle('');
      setComments('');
    }, 2000);
  };

  return (
    <div style={{padding: 16}}>
      <button onClick={() => setIsOpen(true)} style={{padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'}}>Give Feedback</button>

      {isOpen && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
          <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" style={{background: '#fff', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
              <h2 id="dialog-title" style={{fontSize: 18, fontWeight: 600, margin: 0}}>Submit Feedback</h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close" style={{border: 'none', background: 'none', fontSize: 20, cursor: 'pointer'}}>x</button>
            </div>
            {submitted ? (
              <p style={{color: '#16a34a'}}>Thank you for your feedback.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <div>
                  <label htmlFor="fb-title" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Title</label>
                  <input id="fb-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" style={{width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label htmlFor="fb-comments" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Comments</label>
                  <textarea id="fb-comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Tell us more..." rows={4} style={{width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, resize: 'vertical', boxSizing: 'border-box'}} />
                </div>
                <button disabled={!title.trim() || !comments.trim()} onClick={handleSubmit} style={{padding: '10px 20px', background: title.trim() && comments.trim() ? '#4f46e5' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, cursor: title.trim() && comments.trim() ? 'pointer' : 'not-allowed'}}>Submit</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
