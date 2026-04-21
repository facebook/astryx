/** @type {import('../../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'block',
  name: 'Avatar — Fallback Chain',
  description:
    'The avatar tries each source in order: src image, then fallbackSrc, then initials from name, then a default person icon. Use fallbackSrc for a lower-resolution or cached backup image when the primary src may be slow or unavailable.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Avatar'],
};
