/**
 * @file Component doc loader — load and merge translations
 */

import {pathToFileURL} from 'node:url';

function mergeTranslation(docs, translation) {
  if (!translation) return docs;

  const merged = {...docs};
  if (translation.description) merged.description = translation.description;
  if (translation.features) merged.features = translation.features;
  if (translation.notes) merged.notes = translation.notes;
  if (translation.accessibility) merged.accessibility = translation.accessibility;
  if (translation.keyboard) merged.keyboard = translation.keyboard;

  // Merge prop descriptions for single-component docs
  if (translation.propDescriptions && merged.props) {
    merged.props = merged.props.map(prop => {
      const desc = translation.propDescriptions[prop.name];
      return desc != null ? {...prop, description: desc} : prop;
    });
  }

  // Merge sub-component translations
  if (translation.components && merged.components) {
    merged.components = merged.components.map((comp, i) => {
      const trans = translation.components.find(t => t.name === comp.name)
        || translation.components[i];
      if (!trans) return comp;

      const mergedComp = {...comp};
      if (trans.description) mergedComp.description = trans.description;
      if (trans.propDescriptions && comp.props) {
        mergedComp.props = comp.props.map(prop => {
          const desc = trans.propDescriptions[prop.name];
          return desc != null ? {...prop, description: desc} : prop;
        });
      }
      return mergedComp;
    });
  }

  return merged;
}

/**
 * Load the typed docs object from a .doc.mjs file.
 * Supports --lang flag: 'zh' for Chinese, 'dense' for compressed format.
 * Also supports legacy --zh and --dense flags.
 * Translations are merged onto the base docs, keeping structure intact.
 */
export async function loadDocs(readmePath, {zh = false, dense = false, lang} = {}) {
  const mod = await import(pathToFileURL(readmePath).href);
  const docs = mod.docs;

  // Resolve which translation to use (--lang takes priority over legacy flags)
  const locale = lang || (dense ? 'dense' : zh ? 'zh' : null);
  if (!locale) return docs;

  const translationKey = locale === 'zh' ? 'docsZh' : locale === 'dense' ? 'docsDense' : null;
  if (!translationKey || !mod[translationKey]) return docs;

  const translation = mod[translationKey];

  // If the translation is a full ComponentDoc (legacy docsZh shape), return it directly
  if (translation.props || translation.components?.some(c => c.props)) {
    return translation;
  }

  // Otherwise it's a TranslationDoc — merge it onto docs
  return mergeTranslation(docs, translation);
}

/**
 * Find the doc file for a component, checking both top-level
 * and nested directories. Prefers {Name}.doc.mjs, then README.md
 * (for backward compatibility).
 */