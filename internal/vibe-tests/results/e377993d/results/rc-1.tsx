import {useState} from 'react';
import {Button} from '@/components/ui/button';

const navLinks = ['Home', 'Products', 'About', 'Contact', 'Blog'];

export default function ResponsiveNav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <nav className="border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">MyApp</span>
          <div className="hidden md:flex gap-2">
            {navLinks.map(link => (<Button key={link} variant="ghost" size="sm">{link}</Button>))}
          </div>
          <Button variant="ghost" className="md:hidden" onClick={() => setIsMobileOpen(true)} aria-label="Open menu">&#9776;</Button>
        </div>
      </nav>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-xl">MyApp</span>
            <Button variant="ghost" onClick={() => setIsMobileOpen(false)} aria-label="Close menu">&times;</Button>
          </div>
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (<Button key={link} variant="ghost" onClick={() => setIsMobileOpen(false)}>{link}</Button>))}
          </div>
        </div>
      )}
    </>
  );
}
