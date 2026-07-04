import {useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Card} from '@/components/ui/card';

type MediaItem = {
  type: 'image' | 'video';
  src: string;
  alt: string;
};

const mediaItems: MediaItem[] = [
  {type: 'image', src: 'https://picsum.photos/800/600?random=1', alt: 'Landscape photo'},
  {type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Sample video'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=2', alt: 'City skyline'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=3', alt: 'Mountain view'},
  {type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Another video'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=4', alt: 'Ocean sunset'},
];

export default function MediaGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedItem = selectedIndex !== null ? mediaItems[selectedIndex] : null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Media Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mediaItems.map((item, index) => (
          <Card key={index} className="cursor-pointer overflow-hidden" onClick={() => setSelectedIndex(index)}>
            {item.type === 'image' ? (
              <img className="w-full aspect-square object-cover" src={item.src} alt={item.alt} />
            ) : (
              <video className="w-full aspect-square object-cover" src={item.src} muted />
            )}
          </Card>
        ))}
      </div>
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl">
          {selectedItem && (
            <>
              {selectedItem.type === 'image' ? (
                <img className="w-full rounded-lg" src={selectedItem.src} alt={selectedItem.alt} onDoubleClick={e => {
                  const img = e.currentTarget;
                  img.style.transform = img.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
                }} />
              ) : (
                <video className="w-full rounded-lg" src={selectedItem.src} controls />
              )}
              <div className="flex justify-between mt-2">
                <button className="px-3 py-1 border rounded" onClick={() => setSelectedIndex(Math.max(0, (selectedIndex ?? 0) - 1))} disabled={selectedIndex === 0}>Prev</button>
                <button className="px-3 py-1 border rounded" onClick={() => setSelectedIndex(Math.min(mediaItems.length - 1, (selectedIndex ?? 0) + 1))} disabled={selectedIndex === mediaItems.length - 1}>Next</button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
