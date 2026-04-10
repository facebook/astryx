// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/daily.js at runtime.
export {dailyTheme} from '../dist/daily';
export {dailyIconRegistry} from './icons';
