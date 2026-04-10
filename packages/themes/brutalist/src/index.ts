// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/brutalist.js at runtime.
export {brutalistTheme} from '../dist/brutalist';
