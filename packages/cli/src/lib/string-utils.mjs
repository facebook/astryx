/**
 * @file String utilities — fuzzy matching and semantic search for component names
 */

export function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

/**
 * Find the closest component names to a given (possibly misspelled) name.
 * Returns matches sorted by distance, filtered to maxDistance.
 */
export function findClosestComponents(name, components, maxDistance = 3) {
  const allNames = Object.values(components).flat();
  const needle = name.toLowerCase();

  const matches = allNames
    .map(comp => ({
      name: comp,
      distance: levenshteinDistance(needle, comp.toLowerCase()),
    }))
    .filter(m => m.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return matches;
}

/**
 * Unified component search that scores matches across multiple signals:
 * name similarity, keyword matches, and description/feature text search.
 *
 * Always returns results (top 5 minimum). Scores determine confidence:
 *   100  exact name match
 *    90  exact keyword match
 *    80  name Levenshtein distance 1
 *    70  keyword substring or Levenshtein distance 1
 *    60  substring match on component name (min 4 chars, 50%+ coverage)
 *    50  description or feature text contains the search term
 *    40  name Levenshtein distance 2
 *    30  keyword Levenshtein distance 2
 *    20  name Levenshtein distance 3
 *
 * Each result: { name, score, reason }
 */
export async function searchComponents(needle, coreDir, components) {
  const {pathToFileURL} = await import('node:url');
  const fs = await import('node:fs');
  const path = await import('node:path');

  const term = needle.toLowerCase();
  const allNames = Object.values(components).flat();
  const scored = new Map();

  function addMatch(name, score, reason) {
    const existing = scored.get(name);
    if (!existing || score > existing.score) {
      scored.set(name, {name, score, reason});
    }
  }

  // --- Pass 1: Name matching (sync, fast) ---
  for (const comp of allNames) {
    const compLower = comp.toLowerCase();

    // Exact name
    if (compLower === term) {
      addMatch(comp, 100, 'exact name');
      continue;
    }

    // Substring match on name (both directions)
    const shorter = term.length < compLower.length ? term : compLower;
    const longer = term.length < compLower.length ? compLower : term;
    if (shorter.length >= 4 && longer.includes(shorter)) {
      const coverage = shorter.length / longer.length;
      if (coverage >= 0.5) {
        addMatch(comp, 60, 'name contains "' + shorter + '"');
      }
    }

    // Levenshtein on name
    const dist = levenshteinDistance(term, compLower);
    if (dist === 1) addMatch(comp, 80, 'similar name (distance ' + dist + ')');
    else if (dist === 2) addMatch(comp, 40, 'similar name (distance ' + dist + ')');
    else if (dist === 3) addMatch(comp, 20, 'similar name (distance ' + dist + ')');
  }

  // --- Pass 2: Keyword + description matching (async, reads doc files) ---
  for (const comp of allNames) {
    const srcDir = path.join(coreDir, 'src');

    let docPath = null;
    const direct = path.join(srcDir, comp, comp + '.doc.mjs');
    if (fs.existsSync(direct)) {
      docPath = direct;
    }
    if (!docPath) {
      const xdsDirect = path.join(srcDir, comp, 'XDS' + comp + '.doc.mjs');
      if (fs.existsSync(xdsDirect)) {
        docPath = xdsDirect;
      }
    }
    if (!docPath && fs.existsSync(srcDir)) {
      const entries = fs.readdirSync(srcDir, {withFileTypes: true});
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const nested = path.join(srcDir, entry.name, comp, comp + '.doc.mjs');
        if (fs.existsSync(nested)) { docPath = nested; break; }
      }
    }

    if (!docPath) continue;

    try {
      const mod = await import(pathToFileURL(docPath).href);
      const docs = mod.docs;
      if (!docs) continue;

      // Keyword matching
      if (docs.keywords && Array.isArray(docs.keywords)) {
        for (const kw of docs.keywords) {
          const kwLower = kw.toLowerCase();

          // Exact keyword
          if (kwLower === term) {
            addMatch(comp, 90, 'keyword "' + kw + '"');
            break;
          }

          // Substring: term contains keyword or keyword contains term
          const s = term.length < kwLower.length ? term : kwLower;
          const l = term.length < kwLower.length ? kwLower : term;
          if (s.length >= 4 && l.includes(s)) {
            const coverage = s.length / l.length;
            if (coverage >= 0.5) {
              addMatch(comp, 70, 'keyword "' + kw + '"');
            }
          }

          const dist = levenshteinDistance(term, kwLower);
          if (dist === 1) addMatch(comp, 70, 'keyword "' + kw + '" (distance ' + dist + ')');
          else if (dist === 2) addMatch(comp, 30, 'keyword "' + kw + '" (distance ' + dist + ')');
        }
      }

      // Description search (whole word boundary)
      if (docs.description && term.length >= 3) {
        const descLower = docs.description.toLowerCase();
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b' + escaped + '\\b');
        if (re.test(descLower)) {
          addMatch(comp, 50, 'description mentions "' + term + '"');
        }
      }

      // Feature search (whole word boundary)
      if (docs.features && Array.isArray(docs.features) && term.length >= 3) {
        for (const feat of docs.features) {
          const featLower = feat.toLowerCase();
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp('\\b' + escaped + '\\b');
          if (re.test(featLower)) {
            addMatch(comp, 50, 'feature mentions "' + term + '"');
            break;
          }
        }
      }
    } catch {
      continue;
    }
  }

  const results = Array.from(scored.values())
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return results;
}
