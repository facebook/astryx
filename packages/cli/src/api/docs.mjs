/**
 * @file Programmatic API for the docs command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../utils/paths.mjs';
import {XDSError} from './error.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

function discoverTopics() {
  const topics = {};
  if (!fs.existsSync(DOCS_DIR)) return topics;
  for (const file of fs.readdirSync(DOCS_DIR)) {
    const match = file.match(/^(\w+)\.doc\.mjs$/);
    if (match) topics[match[1]] = path.join(DOCS_DIR, file);
  }
  return topics;
}

async function loadReferenceDocs(docPath, {lang} = {}) {
  const mod = await import(pathToFileURL(docPath).href);
  const docs = mod.docs;
  if (!lang || lang === 'en') return docs;

  const dir = path.dirname(docPath);
  const base = path.basename(docPath, '.doc.mjs');
  const locale = lang === 'dense' ? 'dense' : lang;
  const translationPath = path.join(dir, `${base}.doc.${locale}.mjs`);
  if (!fs.existsSync(translationPath)) return docs;

  const translationMod = await import(pathToFileURL(translationPath).href);
  const translation = translationMod.docsZh || translationMod.docsDense;
  if (!translation) return docs;

  return {
    ...docs,
    description: translation.description || docs.description,
    sections: docs.sections.map((section, si) => {
      const ts = translation.sections?.[si];
      if (!ts) return section;
      return {
        ...section,
        title: ts.title || section.title,
        content: section.content.map((block, bi) => {
          const tb = ts.content?.[bi];
          if (!tb) return block;
          if (tb.type === 'prose' && block.type === 'prose') return {...block, text: tb.text};
          if (tb.type === 'list' && block.type === 'list') return {...block, items: tb.items};
          return block;
        }),
      };
    }),
  };
}

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function docs(topic, section, options = {}) {
  const {lang = null, zh = false, dense = false} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  const topics = discoverTopics();

  if (!topic) {
    /** @type {Array<import('../types/docs').DocsListEntry>} */
    const entries = [];
    for (const [name, docPath] of Object.entries(topics)) {
      try {
        const mod = await import(pathToFileURL(docPath).href);
        entries.push({topic: name, description: mod.docs.description});
      } catch {
        entries.push({topic: name, description: ''});
      }
    }
    return {type: 'docs.list', data: entries};
  }

  const normalized = topic.toLowerCase();
  if (!topics[normalized]) {
    throw new XDSError(
      `Unknown topic "${topic}"`,
      Object.keys(topics).map(t => ({name: t, reason: 'available topic'})),
    );
  }

  const docsData = await loadReferenceDocs(topics[normalized], {lang: effectiveLang});

  if (section) {
    const normalizedSection = section.toLowerCase();
    const match = docsData.sections.find(s => s.title.toLowerCase().includes(normalizedSection));
    if (!match) {
      throw new XDSError(
        `Section "${section}" not found in "${topic}"`,
        docsData.sections.map(s => ({name: s.title, reason: 'available section'})),
      );
    }
    return {type: 'docs.detail.section', data: match};
  }

  return {type: 'docs.detail', data: docsData};
}
