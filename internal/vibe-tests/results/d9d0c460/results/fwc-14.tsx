import {useState} from 'react';

type MediaItem = {type: 'image' | 'video'; src: string; alt: string};

const mediaItems: MediaItem[] = [
  {type: 'image', src: 'https://picsum.photos/800/600?random=1', alt: 'Landscape'},
  {type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Video'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=2', alt: 'City'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=3', alt: 'Mountain'},
  {type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Video 2'},
  {type: 'image', src: 'https://picsum.photos/800/600?random=4', alt: 'Ocean'},
];

export default function MediaGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const selected = selectedIndex !== null ? mediaItems[selectedIndex] : null;

  return (
    <div style={{padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 16}}>Media Gallery</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
        {mediaItems.map((item, i) => (
          <div key={i} onClick={() => { setSelectedIndex(i); setZoom(false); }} style={{cursor: 'pointer', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', border: '1px solid #e0e0e0'}}>
            {item.type === 'image' ? <img src={item.src} alt={item.alt} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <video src={item.src} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
          </div>
        ))}
      </div>
      {selected && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <button onClick={() => setSelectedIndex(null)} style={{position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer'}}>&times;</button>
          {selected.type === 'image' ? (
            <img src={selected.src} alt={selected.alt} onDoubleClick={() => setZoom(!zoom)} style={{maxWidth: zoom ? '100%' : '80%', maxHeight: '80vh', transition: 'transform 0.3s', transform: zoom ? 'scale(2)' : 'scale(1)', cursor: 'zoom-in'}} />
          ) : (
            <video src={selected.src} controls style={{maxWidth: '80%', maxHeight: '80vh'}} />
          )}
          <div style={{marginTop: 16, display: 'flex', gap: 16}}>
            <button onClick={() => setSelectedIndex(Math.max(0, (selectedIndex ?? 0) - 1))} disabled={selectedIndex === 0} style={{padding: '8px 16px', background: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Prev</button>
            <button onClick={() => setSelectedIndex(Math.min(mediaItems.length - 1, (selectedIndex ?? 0) + 1))} disabled={selectedIndex === mediaItems.length - 1} style={{padding: '8px 16px', background: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
