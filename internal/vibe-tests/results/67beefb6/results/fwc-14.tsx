import {useState} from 'react';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';

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
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const lightboxMedia = mediaItems.map(item => ({
    src: item.src,
    alt: item.alt,
    type: item.type as 'image' | 'video',
  }));

  return (
    <div className="p-6">
      <Heading level={2}>Media Gallery</Heading>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {mediaItems.map((item, index) => (
          <Card key={index} padding={0}>
            <button
              className="w-full aspect-square overflow-hidden rounded-lg cursor-pointer border-0 p-0"
              onClick={() => {
                setCurrentIndex(index);
                setIsOpen(true);
              }}
              aria-label={`Open ${item.alt}`}>
              {item.type === 'image' ? (
                <img className="w-full h-full object-cover" src={item.src} alt={item.alt} />
              ) : (
                <video className="w-full h-full object-cover" src={item.src} muted />
              )}
            </button>
          </Card>
        ))}
      </div>
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={lightboxMedia}
        index={currentIndex}
        onIndexChange={setCurrentIndex}
        hasZoom
      />
    </div>
  );
}
