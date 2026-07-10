// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const isValid = subject.trim() !== '' && description.trim() !== '' && priority !== '';
  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14};

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto', padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 'bold'}}>Submit a Support Ticket</h2>
      <div>
        <label style={{fontWeight: 500}}>Subject *</label>
        <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" />
      </div>
      <div>
        <label style={{fontWeight: 500}}>Description *</label>
        <textarea style={{...inputStyle, minHeight: 100}} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" />
      </div>
      <div>
        <label style={{fontWeight: 500}}>Priority</label>
        <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Select priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <button disabled={!isValid} style={{padding: '10px 20px', backgroundColor: isValid ? '#0066cc' : '#ccc', color: '#fff', border: 'none', borderRadius: 6, cursor: isValid ? 'pointer' : 'not-allowed'}}>Submit Ticket</button>
    </form>
  );
}
