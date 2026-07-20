import {useState} from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => { setIsDark(!isDark); document.documentElement.classList.toggle('dark'); };

  return (
    <div style={{padding: 24, background: isDark ? '#1a1a1a' : 'white', color: isDark ? 'white' : 'black', minHeight: '100vh'}}>
      <p style={{fontSize: 14, fontWeight: 500}}>Current theme: {isDark ? 'Dark' : 'Light'}</p>
      <button onClick={toggleTheme} style={{marginTop: 12, padding: '8px 16px', border: '1px solid currentColor', borderRadius: 4, background: 'transparent', color: 'inherit', cursor: 'pointer'}}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
