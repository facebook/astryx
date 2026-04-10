// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/neutral.js at runtime.
export {neutralTheme} from '../dist/neutral';
export {neutralIconRegistry} from './icons';
