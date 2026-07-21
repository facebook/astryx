import React, {useState} from 'react';

export default function FormattingToolbar() {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const buttons = [{icon: 'B', label: 'Bold', shortcut: 'Ctrl+B'}, {icon: 'I', label: 'Italic', shortcut: 'Ctrl+I'}, {icon: 'U', label: 'Underline', shortcut: 'Ctrl+U'}, {icon: '🔗', label: 'Link', shortcut: 'Ctrl+K'}];
  return (
    <div role="toolbar" aria-label="Text formatting" style={{display: 'flex', gap: 4, padding: 4, border: '1px solid #e0e0e0', borderRadius: 6, position: 'relative'}}>
      {buttons.map(b => (
        <div key={b.label} style={{position: 'relative'}} onMouseEnter={() => setTooltip(b.label)} onMouseLeave={() => setTooltip(null)}>
          <button aria-label={b.label} style={{width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent', fontWeight: b.icon === 'B' ? 'bold' : undefined, fontStyle: b.icon === 'I' ? 'italic' : undefined, textDecoration: b.icon === 'U' ? 'underline' : undefined, fontSize: 14}}>{b.icon}</button>
          {tooltip === b.label && <div role="tooltip" style={{position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, padding: '4px 8px', backgroundColor: '#333', color: '#fff', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none'}}>{b.label} ({b.shortcut})</div>}
        </div>
      ))}
    </div>
  );
}
