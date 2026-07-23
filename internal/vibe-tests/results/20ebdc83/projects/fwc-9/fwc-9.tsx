// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';

export default function MeetingScheduler() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const duration = 30;

  const getEndTime = () => {
    if (!startTime) {return '';}
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  return (
    <div style={{maxWidth: 400, padding: 24, fontFamily: 'system-ui'}}>
      <h2 style={{margin: '0 0 16px', fontSize: 24}}>Schedule Meeting</h2>
      <div style={{marginBottom: 16}}>
        <label style={{display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500}}>
          Meeting Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6}}
        />
      </div>
      <div style={{marginBottom: 16}}>
        <label style={{display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500}}>
          Start Time
        </label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6}}
        />
      </div>
      <p style={{fontSize: 14, color: '#666', marginBottom: 16}}>
        Duration: {duration} minutes{startTime && ` (ends at ${getEndTime()})`}
      </p>
      <button
        disabled={!date || !startTime}
        style={{
          width: '100%', padding: '10px 16px', backgroundColor: !date || !startTime ? '#ccc' : '#0066cc',
          color: 'white', border: 'none', borderRadius: 6, cursor: !date || !startTime ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 500,
        }}
      >
        Schedule Meeting
      </button>
    </div>
  );
}
