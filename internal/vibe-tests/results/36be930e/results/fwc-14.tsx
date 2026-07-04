import {useState} from 'react';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    padding: 24,
  },
  thumbnail: {
    cursor: 'pointer',
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: '1',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

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
    <div>
      <Heading level={2}>Media Gallery</Heading>
      <div {...stylex.props(styles.gallery)}>
        {mediaItems.map((item, index) => (
          <Card key={index} padding={0}>
            <div
              {...stylex.props(styles.thumbnail)}
              onClick={() => {
                setCurrentIndex(index);
                setIsOpen(true);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${item.alt}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentIndex(index);
                  setIsOpen(true);
                }
              }}>
              {item.type === 'image' ? (
                <img {...stylex.props(styles.img)} src={item.src} alt={item.alt} />
              ) : (
                <video {...stylex.props(styles.video)} src={item.src} muted />
              )}
            </div>
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
