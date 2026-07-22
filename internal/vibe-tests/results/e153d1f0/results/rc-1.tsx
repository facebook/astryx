import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Menu} from 'lucide-react';

const NAV_ITEMS = ['Home', 'Products', 'About', 'Contact'];

export default function ResponsiveNav() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b">
      <span className="font-bold text-lg">Logo</span>
      <div className="hidden md:flex gap-2">
        {NAV_ITEMS.map(item => <Button key={item} variant="ghost" size="sm">{item}</Button>)}
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-2 mt-8">
              {NAV_ITEMS.map(item => <Button key={item} variant="ghost">{item}</Button>)}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
