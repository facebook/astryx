#!/usr/bin/env node

/**
 * @description Captures screenshots and videos of component stories using Playwright
 * @input --storybook-dir <path> --output-dir <path> --components <comma-separated> --video
 * @output PNG screenshots and GIF videos in output directory with manifest
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const outputDir = getArg('output-dir') || 'screenshots';
const componentsArg = getArg('components') || '';
const components = componentsArg.split(',').filter(Boolean);
const captureVideo = hasFlag('video');

// Simple static file server with proper MIME types
function createServer(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);

      // Handle query strings
      filePath = filePath.split('?')[0];

      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.cjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(port, () => {
      console.log(`Storybook server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Get stories from storybook
async function getStories(storybookPath) {
  const storiesJsonPath = path.join(storybookPath, 'index.json');

  try {
    const content = fs.readFileSync(storiesJsonPath, 'utf8');
    const data = JSON.parse(content);
    return data.entries || data.stories || {};
  } catch (e) {
    console.error('Could not read stories index:', e.message);
    return {};
  }
}

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  console.log(`Components to capture: ${components.length > 0 ? components.join(', ') : 'all'}`);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const storybookPath = path.resolve(process.cwd(), storybookDir);

  if (!fs.existsSync(storybookPath)) {
    console.error(`Storybook build not found at ${storybookPath}`);
    fs.writeFileSync(path.join(outputDir, 'screenshots.json'), JSON.stringify({
      error: 'Storybook not built',
      screenshots: [],
    }));
    return;
  }

  // Start server
  const port = 6006;
  const server = await createServer(storybookPath, port);

  // Get stories
  const stories = await getStories(storybookPath);
  const storyIds = Object.keys(stories);

  console.log(`Found ${storyIds.length} stories`);

  // Filter stories for relevant components - exclude docs pages
  const relevantStories = storyIds.filter(id => {
    // Skip docs pages - they often have rendering issues
    if (id.endsWith('--docs')) return false;

    if (components.length === 0) return true;
    const story = stories[id];
    const title = story.title || '';
    return components.some(comp =>
      title.toLowerCase().includes(comp.toLowerCase()) ||
      id.toLowerCase().includes(comp.toLowerCase())
    );
  });

  console.log(`Capturing ${relevantStories.length} relevant stories`);
  if (captureVideo) {
    console.log('Video capture enabled - will record interactions and convert to GIF');
  }

  const browser = await chromium.launch();

  const screenshots = [];

  for (const storyId of relevantStories) {
    const story = stories[storyId];

    // Create context with video recording if enabled
    const contextOptions = {
      viewport: { width: 800, height: 600 },
      deviceScaleFactor: 2,
    };

    if (captureVideo) {
      contextOptions.recordVideo = {
        dir: path.join(outputDir, 'videos'),
        size: { width: 800, height: 600 },
      };
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
      // Navigate to story in iframe mode
      const url = `http://localhost:${port}/iframe.html?id=${storyId}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for Storybook to render the story
      await page.waitForSelector('#storybook-root', { timeout: 10000 });

      // Wait for all stylesheets to be loaded
      await page.evaluate(async () => {
        // Wait for all link stylesheets
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        await Promise.all(links.map(link => {
          if (link.sheet) return Promise.resolve();
          return new Promise((resolve) => {
            link.addEventListener('load', resolve);
            link.addEventListener('error', resolve);
          });
        }));

        // Wait for any style elements to be processed
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
      });

      // Wait for styles to be injected (StyleX runtime injection)
      await page.waitForTimeout(1500);

      // Wait for any fonts to load
      await page.evaluate(() => document.fonts.ready);

      // Wait for CSS variables to be resolved - check for theme wrapper
      await page.evaluate(async () => {
        // Wait for CSS custom properties to be defined
        const checkStyles = () => {
          const storyRoot = document.querySelector('#storybook-root');
          if (!storyRoot) return false;

          // Check if any element has computed styles (not just default)
          const firstChild = storyRoot.querySelector('*');
          if (firstChild) {
            const styles = getComputedStyle(firstChild);
            // Check if display is not empty (styles are applied)
            return styles.display !== '';
          }
          return true;
        };

        // Poll for styles to be ready
        for (let i = 0; i < 20; i++) {
          if (checkStyles()) break;
          await new Promise(r => setTimeout(r, 100));
        }
      });

      // Additional wait for any CSS transitions/animations
      await page.waitForTimeout(500);

      // Take screenshot of just the story root
      const storyRoot = await page.$('#storybook-root');

      const screenshotFilename = `${storyId.replace(/[^a-z0-9]/gi, '-')}.png`;
      const screenshotPath = path.join(outputDir, screenshotFilename);

      if (storyRoot) {
        await storyRoot.screenshot({ path: screenshotPath });
      } else {
        await page.screenshot({ path: screenshotPath, fullPage: false });
      }

      const result = {
        storyId,
        title: story.title,
        name: story.name,
        filename: screenshotFilename,
      };

      // If capturing video, simulate some interactions
      if (captureVideo) {
        // Hover over interactive elements to show hover states
        // Use short timeout and catch errors to avoid blocking
        const buttons = await page.$$('button');
        for (const button of buttons.slice(0, 3)) {
          try {
            await button.hover({ timeout: 2000 });
            await page.waitForTimeout(300);
          } catch {
            // Element not hoverable, skip
          }
        }

        // Hover over links
        const links = await page.$$('a');
        for (const link of links.slice(0, 2)) {
          try {
            await link.hover({ timeout: 2000 });
            await page.waitForTimeout(300);
          } catch {
            // Element not hoverable, skip
          }
        }

        // Hover over any span with role=button (badges, etc)
        const interactiveSpans = await page.$$('[role="button"], .badge, span[class]');
        for (const span of interactiveSpans.slice(0, 3)) {
          try {
            await span.hover({ timeout: 2000 });
            await page.waitForTimeout(300);
          } catch {
            // Element not hoverable, skip
          }
        }

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }

      // Close page to finalize video recording
      await page.close();

      if (captureVideo) {
        const video = page.video();
        if (video) {
          // Wait for video to be saved - this resolves when the file is ready
          const videoPath = await video.path();

          // Ensure the video file exists and has content
          const videoStats = fs.existsSync(videoPath) ? fs.statSync(videoPath) : null;

          if (videoStats && videoStats.size > 1000) {
            // Convert to GIF using ffmpeg
            const gifFilename = `${storyId.replace(/[^a-z0-9]/gi, '-')}.gif`;
            const gifPath = path.join(outputDir, gifFilename);

            try {
              // Use ffmpeg to convert webm to gif (with palette for better quality)
              // Add -t 5 to limit to 5 seconds max, and use simpler filter for reliability
              execSync(
                `ffmpeg -i "${videoPath}" -t 5 -vf "fps=8,scale=400:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${gifPath}" -y 2>&1`,
                { stdio: 'pipe', timeout: 30000 }
              );

              // Verify GIF was created
              if (fs.existsSync(gifPath) && fs.statSync(gifPath).size > 100) {
                result.videoFilename = gifFilename;
                console.log(`[ok] Video: ${story.title} / ${story.name} (${videoStats.size} bytes webm -> gif)`);
              } else {
                console.error(`[warn] GIF file empty or not created for ${storyId}`);
              }
            } catch (e) {
              console.error(`[warn] GIF conversion failed for ${storyId}: ${e.message}`);
            }

            // Clean up webm file
            try {
              fs.unlinkSync(videoPath);
            } catch {}
          } else {
            console.error(`[warn] Video file too small or missing for ${storyId}: ${videoStats?.size || 0} bytes`);
            // Clean up invalid webm file
            try {
              if (videoPath) fs.unlinkSync(videoPath);
            } catch {}
          }
        }
      }

      await context.close();

      screenshots.push(result);

      console.log(`[ok] Captured: ${story.title} / ${story.name}`);
    } catch (e) {
      console.error(`[fail] Failed: ${storyId} - ${e.message}`);
      await context.close();
    }
  }

  await browser.close();
  server.close();

  // Clean up videos directory if empty
  try {
    const videosDir = path.join(outputDir, 'videos');
    if (fs.existsSync(videosDir) && fs.readdirSync(videosDir).length === 0) {
      fs.rmdirSync(videosDir);
    }
  } catch {}

  // Write manifest
  fs.writeFileSync(
    path.join(outputDir, 'screenshots.json'),
    JSON.stringify({
      screenshots,
      hasVideos: captureVideo,
      capturedAt: new Date().toISOString()
    }, null, 2)
  );

  console.log(`\nCaptured ${screenshots.length} screenshots${captureVideo ? ' with videos' : ''}`);
}

captureScreenshots().catch(e => {
  console.error('Screenshot capture failed:', e);
  process.exit(1);
});
