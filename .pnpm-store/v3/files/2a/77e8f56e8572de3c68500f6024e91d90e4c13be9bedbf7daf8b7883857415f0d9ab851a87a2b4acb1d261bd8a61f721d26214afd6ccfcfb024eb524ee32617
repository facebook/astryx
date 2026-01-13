'use strict';

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
function addSpecificityLevel(cssText, index) {
  if (cssText.startsWith('@keyframes')) {
    return cssText;
  }
  const pseudoSelector = Array.from({
    length: index
  }).map(() => ':not(#\\#)').join('');
  const lastOpenCurly = cssText.includes('::') ? cssText.indexOf('::') : cssText.lastIndexOf('{');
  let beforeCurly = cssText.slice(0, lastOpenCurly);
  const afterCurly = cssText.slice(lastOpenCurly);
  if (index > 0) {
    beforeCurly = beforeCurly.trimEnd();
  }
  return `${beforeCurly}${pseudoSelector}${afterCurly}`;
}

function createCSSStyleSheet(rootNode, textContent) {
  if (canUseDOM) {
    const root = rootNode != null ? rootNode : document;
    let element = root?.querySelector('[data-stylex]');
    if (element == null) {
      element = document.createElement('style');
      element.setAttribute('data-stylex', 'true');
      if (typeof textContent === 'string') {
        element.appendChild(document.createTextNode(textContent));
      }
      const container = root.nodeType === Node.DOCUMENT_NODE ? root.head : root;
      if (container) {
        const firstChild = container.firstChild;
        if (firstChild != null) {
          container.insertBefore(element, firstChild);
        } else {
          container.appendChild(element);
        }
      }
    }
    return element.sheet;
  } else {
    return null;
  }
}

function createOrderedCSSStyleSheet(sheet) {
  const groups = {};
  const seenRules = {};
  if (sheet != null) {
    let group = 0;
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const cssRule = sheet.cssRules[i];
      const cssText = cssRule.cssText;
      if (cssText.indexOf('stylesheet-group') > -1) {
        group = decodeGroupRule(cssRule);
        groups[group] = {
          start: i,
          rules: [cssText]
        };
      } else {
        const key = getSeenRuleKey(cssText);
        if (key != null) {
          seenRules[key] = true;
          groups[group].rules.push(cssText);
        }
      }
    }
  }
  function sheetInsert(sheet, group, text) {
    const orderedGroups = getOrderedGroups(groups);
    const groupIndex = orderedGroups.indexOf(group);
    const nextGroupIndex = groupIndex + 1;
    const nextGroup = orderedGroups[nextGroupIndex];
    const position = nextGroup != null && groups[nextGroup].start != null ? groups[nextGroup].start : sheet.cssRules.length;
    const isInserted = insertRuleAt(sheet, text, position);
    if (isInserted) {
      if (groups[group].start == null) {
        groups[group].start = position;
      }
      for (let i = nextGroupIndex; i < orderedGroups.length; i += 1) {
        const groupNumber = orderedGroups[i];
        const previousStart = groups[groupNumber].start || 0;
        groups[groupNumber].start = previousStart + 1;
      }
    }
    return isInserted;
  }
  function insert(cssText, groupValue) {
    const group = Number(groupValue);
    if (groups[group] == null) {
      const markerRule = encodeGroupRule(group);
      groups[group] = {
        start: null,
        rules: [markerRule]
      };
      if (sheet != null) {
        sheetInsert(sheet, group, markerRule);
      }
    }
    const key = getSeenRuleKey(cssText);
    if (key != null && seenRules[key] == null) {
      seenRules[key] = true;
      let shouldUpdate = true;
      if (sheet != null) {
        const isInserted = sheetInsert(sheet, group, cssText);
        if (!isInserted) {
          shouldUpdate = false;
        }
      }
      if (shouldUpdate) {
        groups[group].rules.push(cssText);
      }
    }
  }
  function update(oldCssText, newCssText, groupValue) {
    const group = Number(groupValue);
    const oldKey = getSeenRuleKey(oldCssText);
    const newKey = getSeenRuleKey(newCssText);
    if (oldKey !== newKey || oldKey == null) {
      insert(newCssText, groupValue);
      return;
    }
    if (seenRules[oldKey]) {
      if (groups[group] && groups[group].rules) {
        const rules = groups[group].rules;
        let foundIndex = -1;
        for (let i = 0; i < rules.length; i++) {
          if (getSeenRuleKey(rules[i]) === oldKey) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex !== -1) {
          rules[foundIndex] = newCssText;
        }
      }
      if (sheet != null) {
        const cssRules = sheet.cssRules;
        for (let i = cssRules.length - 1; i >= 0; i--) {
          const rule = cssRules[i];
          const ruleCssText = rule.cssText;
          const ruleKey = getSeenRuleKey(ruleCssText);
          if (ruleKey === oldKey) {
            try {
              sheet.deleteRule(i);
              sheetInsert(sheet, group, newCssText);
              break;
            } catch (e) {}
          }
        }
      }
    } else {
      insert(newCssText, groupValue);
    }
  }
  const OrderedCSSStyleSheet = {
    getTextContent() {
      return getOrderedGroups(groups).map(group => {
        const rules = groups[group].rules;
        const marker = rules.shift();
        rules.sort();
        if (marker !== undefined) {
          rules.unshift(marker);
        }
        return rules.join('\n');
      }).join('\n');
    },
    insert,
    update
  };
  return OrderedCSSStyleSheet;
}
function encodeGroupRule(group) {
  return `[stylesheet-group="${group}"]{}`;
}
const groupPattern = /["']/g;
function decodeGroupRule(cssRule) {
  return Number(cssRule.selectorText.split(groupPattern)[1]);
}
function getOrderedGroups(obj) {
  return Object.keys(obj).map(Number).sort((a, b) => a > b ? 1 : -1);
}
const selectorPattern = /\s*([,])\s*/g;
const conditionalRulePattern = /^@(media|supports|container)\s*\([^)]+\)\s*{/;
function getSeenRuleKey(cssText) {
  if (conditionalRulePattern.test(cssText)) {
    const index = cssText.indexOf('{');
    const query = cssText.substring(0, index).trim();
    const rest = cssText.substring(index + 1).trim();
    const next = getSeenRuleKey(rest);
    const normalizedNext = next !== null && next !== '' ? next.replace(selectorPattern, '$1') : '';
    return `${query} { ${normalizedNext}`;
  } else {
    const selector = cssText.split('{')[0].trim();
    return selector !== '' ? selector.replace(selectorPattern, '$1') : null;
  }
}
function insertRuleAt(root, cssText, position) {
  try {
    root.insertRule(cssText, position);
    return true;
  } catch (e) {
    return false;
  }
}

const roots = new WeakMap();
const sheets = [];
function createSheet(root) {
  let sheet;
  if (canUseDOM) {
    const rootNode = document;
    if (sheets.length === 0) {
      sheet = createOrderedCSSStyleSheet(createCSSStyleSheet(rootNode));
      roots.set(rootNode, sheets.length);
      sheets.push(sheet);
    } else {
      const index = roots.get(rootNode);
      if (index == null) {
        const initialSheet = sheets[0];
        const textContent = initialSheet != null ? initialSheet.getTextContent() : '';
        sheet = createOrderedCSSStyleSheet(createCSSStyleSheet(rootNode, textContent));
        roots.set(rootNode, sheets.length);
        sheets.push(sheet);
      } else {
        sheet = sheets[index];
      }
    }
  } else {
    if (sheets.length === 0) {
      sheet = createOrderedCSSStyleSheet(createCSSStyleSheet());
      sheets.push(sheet);
    } else {
      sheet = sheets[0];
    }
  }
  return {
    getTextContent() {
      return sheet.getTextContent();
    },
    insert(cssText, groupValue) {
      sheets.forEach(s => {
        s.insert(cssText, groupValue);
      });
    },
    update(oldCssText, newCssText, groupValue) {
      sheets.forEach(s => {
        s.update(oldCssText, newCssText, groupValue);
      });
    }
  };
}

const sheet = createSheet();
const constants = {};
const dependencies = {};
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function resolveConstants(cssText) {
  let resolved = cssText;
  const varPattern = /var\(--([a-z0-9]+)\)/gi;
  varPattern.lastIndex = 0;
  const replacements = [];
  let match = varPattern.exec(cssText);
  while (match != null) {
    const constKey = match[1];
    if (constKey != null && constants[constKey] !== undefined) {
      const constVal = constants[constKey];
      const constValStr = String(constVal);
      replacements.push([`var(--${constKey})`, constValStr]);
    }
    match = varPattern.exec(cssText);
  }
  for (const [search, replace] of replacements) {
    const regex = new RegExp(escapeRegex(search), 'g');
    resolved = resolved.replace(regex, replace);
  }
  return resolved;
}
function trackDependencies(originalCssText, priority, resolvedCss) {
  const varPattern = /var\(--([a-z0-9]+)\)/gi;
  let match = varPattern.exec(originalCssText);
  while (match != null) {
    const constKey = match[1];
    if (constKey != null && constants[constKey] !== undefined) {
      if (!dependencies[constKey]) {
        dependencies[constKey] = new Map();
      }
      dependencies[constKey].set(originalCssText, {
        priority,
        resolvedCss
      });
    }
    match = varPattern.exec(originalCssText);
  }
}
function updateDependentRules(constKey) {
  const deps = dependencies[constKey];
  if (!deps || deps.size === 0) {
    return;
  }
  deps.forEach(({
    priority,
    resolvedCss: oldResolvedCss
  }, cssText) => {
    const newResolvedCss = resolveConstants(cssText);
    const oldText = addSpecificityLevel(oldResolvedCss, Math.floor(priority / 1000));
    const newText = addSpecificityLevel(newResolvedCss, Math.floor(priority / 1000));
    deps.set(cssText, {
      priority,
      resolvedCss: newResolvedCss
    });
    sheet.update(oldText, newText, priority);
  });
}
function inject(args) {
  const {
    ltr: cssText,
    priority,
    constKey,
    constVal
  } = args;
  if (constKey !== undefined && constVal !== undefined) {
    const hadPreviousValue = constants[constKey] !== undefined;
    const valueChanged = hadPreviousValue && constants[constKey] !== constVal;
    constants[constKey] = constVal;
    if (valueChanged) {
      updateDependentRules(constKey);
    }
    return '';
  }
  const resolved = resolveConstants(cssText);
  const text = addSpecificityLevel(resolved, Math.floor(priority / 1000));
  sheet.insert(text, priority);
  trackDependencies(cssText, priority, resolved);
  return text;
}

module.exports = inject;
