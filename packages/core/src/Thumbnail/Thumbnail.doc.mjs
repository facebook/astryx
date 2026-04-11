/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  description:
    'A square preview card for image attachments. Shows a skeleton shimmer while uploading, the image on success, or a placeholder icon when no source is provided.',
  keywords: ["thumbnail","attachment","preview","image","upload","dismiss","remove","loading"],
  features: [
    'Square 1:1 aspect ratio via CSS aspect-ratio',
    'Skeleton shimmer during upload (isLoading)',
    'Upload overlay with spinner when isLoading + src',
    'Image preview with object-fit: cover',
    'APCA-based luminance detection for adaptive remove button contrast',
    'Concentric radius: button radius derived from container radius minus inset',
    'Hover shadow on interactive thumbnails (onClick)',
    'Label shown as tooltip on hover, used as aria-label',
    'Placeholder icon when no src',
    'Disabled state blocks all interactions and reduces opacity',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL.',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for the image.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label (e.g. file name). Shown as tooltip on hover.',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description: 'Callback for the overlaid remove button.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description: 'Click handler. Adds button semantics and hover shadow.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows skeleton (no src) or upload overlay (with src).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the thumbnail is disabled.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Image with remove',
      code: '<XDSThumbnail src="/photo.jpg" alt="Vacation" label="vacation.jpg" onRemove={() => {}} />',
    },
    {
      label: 'Clickable',
      code: '<XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />',
    },
  ],
};
