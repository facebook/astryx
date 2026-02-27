#!/usr/bin/env node

/**
 * @description Generates and posts PR comment with analysis results and embedded screenshots
 * @input --analysis <file> --a11y <file> --screenshots <file> --screenshot-urls <file> --storybook-url <url> --run-url <url>
 * @output Formatted markdown comment body to stdout
 */

const fs = require('fs');
const { buildA11ySection } = require('./lib/a11y-format');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const analysisFile = getArg('analysis') || 'analysis.json';
const a11yFile = getArg('a11y') || 'a11y-report.json';
const screenshotsFile = getArg('screenshots') || 'screenshots/screenshots.json';
const screenshotUrlsFile = getArg('screenshot-urls') || 'screenshot-urls.json';
const runUrl = getArg('run-url') || '';
const prNumber = getArg('pr-number') || '';
const storybookUrl = getArg('storybook-url') || '';
const sandboxUrl = getArg('sandbox-url') || '';

// Read analysis results
let analysis = { newComponents: [], modifiedComponents: [], componentStats: {}, totalBundle: {} };
let a11yReport = { components: {} };
let screenshotsData = { screenshots: [] };
let screenshotUrls = {};

try {
  analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read analysis file:', e.message);
}

try {
  a11yReport = JSON.parse(fs.readFileSync(a11yFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read a11y report:', e.message);
}

try {
  screenshotsData = JSON.parse(fs.readFileSync(screenshotsFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read screenshots manifest:', e.message);
}

try {
  screenshotUrls = JSON.parse(fs.readFileSync(screenshotUrlsFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read screenshot URLs:', e.message);
}

// Build a Storybook deep link URL for a component
// Story titles like "Core/XDSButton" become path "/docs/core-xdsbutton--docs"
function getStorybookLink(storybookBaseUrl, storyTitle) {
  if (!storybookBaseUrl || !storyTitle || typeof storyTitle !== 'string') return null;
  // Storybook converts "Core/XDSButton" to "core-xdsbutton" as the story ID prefix
  const storyPath = storyTitle.toLowerCase().replace(/\//g, '-');
  return `${storybookBaseUrl}?path=/docs/${storyPath}--docs`;
}

// Build an external link that opens in a new tab
function extLink(text, url) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

// Build component stats section
let componentSection = '';
if (analysis.newComponents && analysis.newComponents.length > 0) {
  componentSection += `### New Components\n\n`;
  for (const comp of analysis.newComponents) {
    const stats = analysis.componentStats[comp] || {};
    const sbLink = getStorybookLink(storybookUrl, stats.storyTitle);
    const sbBadge = sbLink ? ` · ${extLink('View in Storybook', sbLink)}` : '';
    componentSection += `<details>\n<summary><strong>${comp}</strong>${sbBadge}</summary>\n\n`;
    componentSection += `| Metric | Value |\n|--------|-------|\n`;
    componentSection += `| Bundle Size (ESM) | ${stats.esmSize || 'N/A'} |\n`;
    componentSection += `| Bundle Size (CJS) | ${stats.cjsSize || 'N/A'} |\n`;
    componentSection += `| Lines of Code | ${stats.linesOfCode || 'N/A'} |\n`;
    componentSection += `| Source Files | ${stats.fileCount || 'N/A'} |\n`;
    componentSection += `| Complexity | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0}) |\n`;
    componentSection += `| Exports | ${stats.exports?.join(', ') || 'N/A'} |\n`;
    componentSection += `| Props Count | ${stats.propsCount || 'N/A'} |\n`;
    componentSection += `| Has Tests | ${stats.hasTests ? 'Yes' : 'No'} |\n`;
    componentSection += `| Has Stories | ${stats.hasStories ? 'Yes' : 'No'} |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

if (analysis.modifiedComponents && analysis.modifiedComponents.length > 0) {
  componentSection += `### Modified Components\n\n`;
  for (const comp of analysis.modifiedComponents) {
    const stats = analysis.componentStats[comp] || {};
    const baseStats = analysis.baseComponentStats?.[comp] || {};
    const sbLink = getStorybookLink(storybookUrl, stats.storyTitle);
    const sbBadge = sbLink ? ` · ${extLink('View in Storybook', sbLink)}` : '';

    // Check if this modified directory has new exports
    const newExports = analysis.newExports || [];
    const compExports = stats.exports || [];
    const newInComp = compExports.filter(e => newExports.includes(e));
    const newBadge = newInComp.length > 0 ? ` · 🆕 ${newInComp.join(', ')}` : '';

    componentSection += `<details>\n<summary><strong>${comp}</strong>${sbBadge}${newBadge}</summary>\n\n`;
    componentSection += `| Metric | Before | After | Delta |\n|--------|--------|-------|-------|\n`;

    const esmDelta = stats.esmBytes && baseStats.esmBytes
      ? (stats.esmBytes - baseStats.esmBytes)
      : null;
    const esmDeltaStr = esmDelta !== null
      ? (esmDelta > 0 ? `+${esmDelta}B` : `${esmDelta}B`)
      : 'N/A';

    componentSection += `| Bundle Size (ESM) | ${baseStats.esmSize || 'N/A'} | ${stats.esmSize || 'N/A'} | ${esmDeltaStr} |\n`;
    componentSection += `| Lines of Code | ${baseStats.linesOfCode || 'N/A'} | ${stats.linesOfCode || 'N/A'} | - |\n`;
    componentSection += `| Complexity | ${baseStats.complexityRating || 'N/A'} | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0}) | - |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

// Build accessibility section using shared module
const a11ySection = buildA11ySection(a11yReport);

// Build bundle size section
let bundleSection = '### Bundle Size Summary\n\n';
bundleSection += `| Package | Size (ESM) | Size (CJS) | Gzipped |\n`;
bundleSection += `|---------|------------|------------|----------|\n`;
bundleSection += `| @xds/core | ${analysis.totalBundle?.esmSize || 'N/A'} | ${analysis.totalBundle?.cjsSize || 'N/A'} | ${analysis.totalBundle?.gzipSize || 'N/A'} |\n\n`;

if (analysis.bundleDelta) {
  const delta = analysis.bundleDelta;
  const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
  bundleSection += `**Bundle size ${direction}:** ${delta > 0 ? '+' : ''}${delta} bytes\n\n`;
}

// Build screenshots section with embedded images
let screenshotSection = '';
const hasAffectedComponents = (analysis.newComponents?.length > 0) || (analysis.modifiedComponents?.length > 0);
const screenshots = screenshotsData.screenshots || [];

if (hasAffectedComponents && screenshots.length > 0) {
  screenshotSection = `### Component Previews\n\n`;

  const hasVideos = screenshots.some(s => s.videoFilename);
  if (hasVideos) {
    screenshotSection += `_Includes interactive hover previews as animated GIFs._\n\n`;
  }

  // Group screenshots by component title
  const byComponent = {};
  for (const shot of screenshots) {
    const compName = shot.title?.split('/').pop() || shot.title || 'Unknown';
    if (!byComponent[compName]) {
      byComponent[compName] = [];
    }
    byComponent[compName].push(shot);
  }

  for (const [compName, shots] of Object.entries(byComponent)) {
    screenshotSection += `#### ${compName}\n\n`;

    for (const shot of shots) {
      const storyName = shot.name || shot.storyId;
      const filename = shot.filename;
      const imageUrl = screenshotUrls[filename];
      const videoFilename = shot.videoFilename;
      const videoUrl = videoFilename ? screenshotUrls[videoFilename] : null;
      const mp4Filename = shot.mp4Filename;
      const mp4Url = mp4Filename ? screenshotUrls[mp4Filename] : null;

      if (imageUrl || videoUrl) {
        screenshotSection += `<details>\n<summary><strong>${storyName}</strong></summary>\n\n`;

        if (imageUrl) {
          screenshotSection += `**Screenshot:**\n\n![${storyName}](${imageUrl})\n\n`;
        }

        if (videoUrl) {
          // Link to mp4 if available, otherwise link to gif
          const fullVideoUrl = mp4Url || videoUrl;
          screenshotSection += `**Interaction Preview:** (${extLink('view video', fullVideoUrl)})\n\n![${storyName} interaction](${videoUrl})\n\n`;
        }

        // Build a direct Storybook link for this specific story
        const storyLink = storybookUrl ? `${storybookUrl}?path=/story/${shot.storyId}` : null;
        if (storyLink) {
          screenshotSection += `${extLink('View in Storybook', storyLink)} · `;
        }
        screenshotSection += `\`${shot.storyId}\`\n\n`;

        screenshotSection += `</details>\n\n`;
      } else {
        screenshotSection += `- **${storyName}** _(media not available)_\n`;
      }
    }
  }
}

// Build storybook link section
let storybookSection = '';
if (storybookUrl) {
  storybookSection = `### 📚 Storybook Preview

**${extLink('View Storybook for this PR', storybookUrl)}**
_GitHub Pages may take up to a minute to hydrate after deploy._

`;
}

// Build sandbox link section
let sandboxSection = '';
if (sandboxUrl) {
  sandboxSection = `### 🧪 Sandbox Preview

**${extLink('View Sandbox for this PR', sandboxUrl)}**
_GitHub Pages may take up to a minute to hydrate after deploy._

`;
}

// Build footer with links
let footerLinks = [];
if (storybookUrl) footerLinks.push(extLink('Storybook', storybookUrl));
if (sandboxUrl) footerLinks.push(extLink('Sandbox', sandboxUrl));
if (runUrl) footerLinks.push(extLink('View full report', runUrl));
const footerLinksStr = footerLinks.length > 0 ? ` | ${footerLinks.join(' | ')}` : '';

// Build the full comment
const body = `## PR Analysis Report

${storybookSection}${sandboxSection}${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
${screenshotSection}
---

<sub>Generated by PR Enrichment workflow${footerLinksStr}</sub>
`;

// Output to stdout
console.log(body);
