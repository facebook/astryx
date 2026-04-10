/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  description:
    'A square preview card for file attachments. Shows an image thumbnail or fallback icon with an overlaid remove button and optional caption.',
  keywords: ["thumbnail","attachment","preview","image","file","upload","dismiss","remove","media"],
  features: [
    'Square 1:1 aspect ratio via CSS aspect-ratio',
    'Image preview with object-fit: cover',
    'Inset border overlay for visual containment on light images',
    'Fallback icon when no image source or on load error',
    'Overlaid remove button with expanded hit area',
    'Interactive mode with button semantics when onClick is set',
    'Label and caption slots for file name and metadata',
    'Disabled state blocks all interactions and reduces opacity',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL for the thumbnail preview.',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for the image. Required for accessibility when src is provided.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Text label displayed below the image (e.g. file name).',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description: 'Callback fired when the overlaid remove button is clicked.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description: 'Click handler for the thumbnail area. When set, renders as interactive with button semantics.',
    },
    {
      name: 'fallbackIcon',
      type: 'string',
      description: 'Icon name for the fallback state when no image is available.',
      default: "'info'",
    },
    {
      name: 'caption',
      type: 'ReactNode',
      description: 'Content rendered below the thumbnail (e.g. file size, duration).',
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
      title: 'Image thumbnail with remove',
      code: '<XDSThumbnail src="/photo.jpg" alt="Vacation" onRemove={() => {}} />',
    },
    {
      title: 'File attachment with label',
      code: '<XDSThumbnail label="report.pdf" caption="2.4 MB" />',
    },
    {
      title: 'Clickable thumbnail',
      code: '<XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />',
    },
  ],
};
