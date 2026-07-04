import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {IconButton} from '@astryxdesign/core/IconButton';

const navLinks = ['Home', 'Products', 'About', 'Contact', 'Blog'];

export default function ResponsiveNav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <nav className="border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <Text type="label">MyApp</Text>
          <div className="hidden md:flex gap-2">
            {navLinks.map(link => (
              <Button key={link} label={link} variant="ghost" size="sm" />
            ))}
          </div>
          <div className="md:hidden">
            <IconButton label="Open menu" icon={<span>&#9776;</span>} variant="ghost" onClick={() => setIsMobileOpen(true)} />
          </div>
        </div>
      </nav>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <Text type="label">MyApp</Text>
            <IconButton label="Close menu" icon={<span>&times;</span>} variant="ghost" onClick={() => setIsMobileOpen(false)} />
          </div>
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Button key={link} label={link} variant="ghost" onClick={() => setIsMobileOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
