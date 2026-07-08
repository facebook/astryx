// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function FeedbackDialog({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) {return null;}

  const handleSubmit = () => {
    onClose();
  };

  const isValid = title.trim().length > 0 && feedback.trim().length > 0;

  return (
    <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
      <div style={{backgroundColor: 'white', borderRadius: 8, padding: 24, width: 500, maxWidth: '90vw'}} role="dialog" aria-labelledby="feedback-title">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
          <h2 id="feedback-title" style={{margin: 0}}>Submit Feedback</h2>
          <button onClick={onClose} aria-label="Close" style={{background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'}}>\u2715</button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div>
            <label htmlFor="fb-title" style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Title *</label>
            <input id="fb-title" type="text" value={title} onChange={e => setTitle(e.target.value)} style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4}} />
          </div>
          <div>
            <label htmlFor="fb-body" style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Feedback *</label>
            <textarea id="fb-body" value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, resize: 'vertical'}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
            <button onClick={onClose} style={{padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, background: 'none', cursor: 'pointer'}}>Cancel</button>
            <button onClick={handleSubmit} disabled={!isValid} style={{padding: '8px 16px', backgroundColor: isValid ? '#0d6efd' : '#ccc', color: 'white', border: 'none', borderRadius: 4, cursor: isValid ? 'pointer' : 'not-allowed'}}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
