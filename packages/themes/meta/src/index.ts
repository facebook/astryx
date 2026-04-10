// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/meta.js at runtime.
export {metaTheme} from '../dist/meta';
export {metaIconRegistry} from './icons';
