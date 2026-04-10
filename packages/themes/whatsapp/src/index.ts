// Re-export the built theme (produced by `xds theme build`, has __built: true).
// tsup externalizes this — it resolves to the sibling dist/whatsapp.js at runtime.
export {whatsappTheme} from '../dist/whatsapp';
export {whatsappIconRegistry} from './icons';
