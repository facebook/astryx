import {useState} from 'react';
import {Button} from '@/components/ui/button';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => { setIsDark(!isDark); document.documentElement.classList.toggle('dark'); };

  return (
    <div className="p-6 space-y-3">
      <p className="text-sm font-medium">Current theme: {isDark ? 'Dark' : 'Light'}</p>
      <Button variant="outline" onClick={toggleTheme}>Switch to {isDark ? 'Light' : 'Dark'} Mode</Button>
    </div>
  );
}
