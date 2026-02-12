#!/usr/bin/env node

/**
 * Test script to verify PR enrichment output with mock data.
 * Writes mock JSON files and invokes generate-pr-comment.js directly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Mock data: 1 new component + 1 modified component ---

const mockAnalysis = {
  newComponents: ['DatePicker'],
  modifiedComponents: ['Button'],
  componentStats: {
    DatePicker: {
      esmSize: '4.2KB',
      esmBytes: 4300,
      cjsSize: '4.8KB',
      cjsBytes: 4900,
      linesOfCode: 320,
      fileCount: 4,
      complexity: 12,
      complexityRating: 'Medium',
      exports: ['XDSDatePicker', 'DatePickerProps'],
      propsCount: 12,
      hasTests: true,
      hasStories: true,
    },
    Button: {
      esmSize: '2.4KB',
      esmBytes: 2450,
      cjsSize: '2.8KB',
      cjsBytes: 2870,
      linesOfCode: 150,
      fileCount: 2,
      complexity: 6,
      complexityRating: 'Low',
      exports: ['XDSButton', 'ButtonProps'],
      propsCount: 15,
      hasTests: true,
      hasStories: true,
    },
  },
  baseComponentStats: {
    Button: {
      esmSize: '2.2KB',
      esmBytes: 2250,
      linesOfCode: 130,
      complexityRating: 'Low',
    },
  },
  totalBundle: {
    esmSize: '45.2KB',
    esmBytes: 46280,
    cjsSize: '52.1KB',
    cjsBytes: 53350,
    gzipSize: '12.4KB',
  },
  bundleDelta: 850,
  analyzedAt: new Date().toISOString(),
};

const mockA11y = {
  components: {
    DatePicker: {
      storiesAudited: 3,
      violations: [
        {
          id: 'label',
          impact: 'critical',
          description: 'Form elements must have labels',
        },
      ],
      storyDetails: [],
    },
  },
  summary: {
    componentsAudited: 1,
    totalViolations: 1,
    auditedAt: new Date().toISOString(),
  },
};

const mockScreenshots = {
  screenshots: [
    {
      storyId: 'core-xdsdatepicker--default',
      title: 'Core/XDSDatePicker',
      name: 'Default',
      filename: 'core-xdsdatepicker--default.png',
      videoFilename: 'core-xdsdatepicker--default.gif',
      mp4Filename: 'core-xdsdatepicker--default.mp4',
    },
    {
      storyId: 'core-xdsbutton--primary',
      title: 'Core/XDSButton',
      name: 'Primary',
      filename: 'core-xdsbutton--primary.png',
      videoFilename: 'core-xdsbutton--primary.gif',
      // no mp4 — tests GIF fallback
    },
  ],
  hasVideos: true,
  capturedAt: new Date().toISOString(),
};

// --- Write mock files ---

const tmpDir = '/tmp/pr-enrichment-test';
fs.mkdirSync(tmpDir, { recursive: true });

const files = {
  'analysis.json': mockAnalysis,
  'a11y-report.json': mockA11y,
  'screenshots.json': mockScreenshots,
};

for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(tmpDir, name), JSON.stringify(data, null, 2));
}

console.log('Mock data written to:', tmpDir);
console.log('\n--- Generated PR Comment ---\n');

// --- Invoke the real generator ---

const generatorPath = path.join(__dirname, 'generate-pr-comment.js');
const output = execSync([
  `node "${generatorPath}"`,
  `--analysis "${path.join(tmpDir, 'analysis.json')}"`,
  `--a11y "${path.join(tmpDir, 'a11y-report.json')}"`,
  `--screenshots "${path.join(tmpDir, 'screenshots.json')}"`,
  `--storybook-url "https://xds-storybook.example.com"`,
  `--run-url "https://github.com/example/xds/actions/runs/12345"`,
].join(' '), { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

console.log(output);
