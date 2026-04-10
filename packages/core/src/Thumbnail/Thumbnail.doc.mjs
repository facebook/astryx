/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  description:
    'A square preview card for image attachments. Shows a loading spinner while the image loads, the image on success, or a placeholder icon on failure.',
  keywords: ["thumbnail","attachment","preview","image","upload","dismiss","remove","loading"],
  features: [
    'Square 1:1 aspect ratio via CSS aspect-ratio',
    'Loading spinner while image is being fetched',
    'Image preview with object-fit: cover on successful load',
    'Placeholder icon when no src or on load error',
    'Inset border overlay for visual containment (only on loaded images)',
    'Overlaid remove button with expanded hit area',
    'Interactive mode with button semantics when onClick is set',
    'Label and caption slots for file name and metadata',
    'Disabled state blocks all interactions and reduces opacity',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL. Shows spinner while loading.',
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
      title: 'With label and caption',
      code: '<XDSThumbnail src="/photo.jpg" alt="Photo" label="vacation.jpg" caption="2.4 MB" />',
    },
    {
      title: 'Clickable thumbnail',
      code: '<XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />',
    },
  ],
};
