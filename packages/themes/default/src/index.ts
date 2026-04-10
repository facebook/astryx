// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/default.js at runtime.
export {defaultTheme} from '../dist/default';
export {defaultIconRegistry} from './icons';
