// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component doc loader — load and merge translations
 */

import {pathToFileURL} from 'node:url';

export function mergeTranslation(docs, translation) {
  if (!translation) return docs;

  const merged = {...docs};

  // Merge prose into usage
  if (merged.usage) {
    merged.usage = {...merged.usage};
    if (translation.usage?.description) merged.usage.description = translation.usage.description;
    else if (translation.description) merged.usage.description = translation.description;
    if (translation.usage?.bestPractices) merged.usage.bestPractices = translation.usage.bestPractices;
  }

  // Legacy top-level fields (for docsZh that are full ComponentDoc clones)
  if (translation.description && !merged.usage) merged.description = translation.description;

  // Merge prop descriptions for single-component docs
  if (translation.propDescriptions && merged.props) {
    merged.props = merged.props.map(prop => {
      const desc = translation.propDescriptions[prop.name];
      return desc != null ? {...prop, description: desc} : prop;
    });
  }

  // Merge hook param descriptions (HookTranslationDoc). Params are an array of
  // {name, type, description, required}; override description by name where the
  // translation has an entry. Names may include dots (e.g. 'options.isActive');
  // the lookup is keyed by the exact param name.
  if (translation.paramDescriptions && merged.params) {
    merged.params = merged.params.map(param => {
      const desc = translation.paramDescriptions[param.name];
      return desc != null ? {...param, description: desc} : param;
    });
  }

  // Merge hook return descriptions (HookTranslationDoc). Returns are an array
  // of {name, type, description}; override description by name where present.
  if (translation.returnDescriptions && merged.returns) {
    merged.returns = merged.returns.map(ret => {
      const desc = translation.returnDescriptions[ret.name];
      return desc != null ? {...ret, description: desc} : ret;
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