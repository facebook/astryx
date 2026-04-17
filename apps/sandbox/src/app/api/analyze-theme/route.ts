/**
 * @input  POST { image: string (base64, no data-URI prefix), mimeType: string }
 * @output JSON ThemeExtraction — accent color, fonts, spacing, radius, type scale, size
 * @position apps/sandbox API · Plugboard (devvm) or direct Gemini API (local)
 *
 * Two transport modes:
 *  1. Plugboard mTLS — used on Meta devvm/devgpu (certs at /var/facebook/...)
 *  2. Direct Gemini API — used locally when GEMINI_API_KEY env var is set
 */
import {NextRequest, NextResponse} from 'next/server';
import {execSync} from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CERT = '/var/facebook/x509_identities/server.pem';
const CA = '/var/facebook/rootcanal/ca.pem';
const MODEL = 'gemini-2.5-pro-preview';
const PLUGBOARD_BASE = 'https://plugboard.x2p.facebook.net/v1beta/models';
const PLUGBOARD_KEY = 'sk-plugboard-dummy-1234567890';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface ThemeExtraction {
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  spacingBase: number;
  radiusBase: number;
  typeScaleBase: number;
  typeScaleRatio: number;
  sizeBase: number;
  density: 'compact' | 'default' | 'comfortable' | 'spacious';
  notes: string;
}

const ANALYSIS_PROMPT = `You are a UI design system expert. Analyze this screenshot and extract theme parameters.

Return a JSON object with these fields — pick values ONLY from the allowed options listed:

1. "accentColor": The primary accent / brand color as a hex string (e.g. "#0066FF").
   Look for the most prominent colored button, link, or interactive element. Ignore neutral grays.

2. "headingFont": The closest match for heading text. Pick ONE of:
   "System", "Inter", "Roboto", "DM Sans", "Figtree", "Poppins", "IBM Plex Sans", "Source Sans", "Noto Sans", "Georgia"

3. "bodyFont": The closest match for body/paragraph text. Pick ONE of:
   "System", "Inter", "Roboto", "DM Sans", "Figtree", "Poppins", "IBM Plex Sans", "Source Sans", "Noto Sans", "Georgia"

4. "spacingBase": The base spacing grid in px. Pick ONE of: 2, 4, 6, 8
   - 2 = very tight/compact UI
   - 4 = standard density (most common)
   - 6 = comfortable/relaxed
   - 8 = very spacious

5. "radiusBase": Corner radius base in px. Pick an even number from 0 to 18.
   - 0 = fully sharp corners
   - 2-4 = subtle rounding
   - 6-8 = moderate rounding
   - 10-12 = heavily rounded
   - 14-18 = pill-like

6. "typeScaleBase": The base body text size in px. Pick a whole number from 10 to 24.
   Look at the main paragraph/body text size.

7. "typeScaleRatio": The ratio between type scale steps. Pick ONE of:
   1.067, 1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618
   Compare heading sizes to body text to infer the multiplier.

8. "sizeBase": The height of primary interactive elements (buttons, inputs) in px.
   Pick an even number from 24 to 56.
   - 28 = compact controls
   - 32 = standard
   - 36-44 = comfortable/large
   - 48+ = very large touch targets

9. "density": Overall UI density. Pick ONE of: "compact", "default", "comfortable", "spacious"

10. "notes": A 1-2 sentence description of the UI's visual style.

Respond with ONLY the JSON object. No explanation, no markdown fences.`;

function parseGeminiResponse(responseBody: string): ThemeExtraction {
  const resp = JSON.parse(responseBody);
  if (resp.error) {
    throw new Error(`Gemini API error: ${JSON.stringify(resp.error)}`);
  }

  let text = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('No content in Gemini response');
  }

  text = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  return JSON.parse(text);
}

function buildPayload(image: string, mimeType: string) {
  return {
    contents: [
      {
        role: 'user',
        parts: [{inlineData: {mimeType, data: image}}, {text: ANALYSIS_PROMPT}],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };
}

async function callViaPlugboard(
  image: string,
  mimeType: string,
): Promise<ThemeExtraction> {
  const payload = buildPayload(image, mimeType);
  const tmpFile = path.join(
    os.tmpdir(),
    `xds-theme-analyze-${Date.now()}.json`,
  );
  fs.writeFileSync(tmpFile, JSON.stringify(payload));

  try {
    const result = execSync(
      [
        'curl',
        '-s',
        '-w',
        '\\n%{http_code}',
        '--cert',
        CERT,
        '--cacert',
        CA,
        '--noproxy',
        'x2p.facebook.net',
        '-H',
        'Content-Type: application/json',
        '-H',
        `x-goog-api-key: ${PLUGBOARD_KEY}`,
        '-d',
        `@${tmpFile}`,
        `${PLUGBOARD_BASE}/${MODEL}:generateContent`,
      ].join(' '),
      {encoding: 'utf-8', timeout: 120_000},
    );

    const lines = result.trim().split('\n');
    const httpCode = lines[lines.length - 1];
    const body = lines.slice(0, -1).join('\n');

    if (httpCode !== '200') {
      throw new Error(
        `Plugboard returned HTTP ${httpCode}: ${body.slice(0, 300)}`,
      );
    }

    return parseGeminiResponse(body);
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

async function callViaDirect(
  apiKey: string,
  image: string,
  mimeType: string,
): Promise<ThemeExtraction> {
  const payload = buildPayload(image, mimeType);
  const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  const body = await resp.text();
  if (!resp.ok) {
    throw new Error(
      `Gemini API returned HTTP ${resp.status}: ${body.slice(0, 300)}`,
    );
  }

  return parseGeminiResponse(body);
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {image, mimeType} = reqBody as {image: string; mimeType: string};

    if (!image || !mimeType) {
      return NextResponse.json(
        {error: 'Missing required fields: image (base64), mimeType'},
        {status: 400},
      );
    }

    const hasPlugboard = fs.existsSync(CERT);
    const directKey = process.env.GEMINI_API_KEY;

    if (!hasPlugboard && !directKey) {
      return NextResponse.json(
        {
          error:
            'No Gemini access configured. Either run on a Meta devvm (Plugboard mTLS) or set GEMINI_API_KEY environment variable.',
        },
        {status: 503},
      );
    }

    const extraction = hasPlugboard
      ? await callViaPlugboard(image, mimeType)
      : await callViaDirect(directKey!, image, mimeType);

    return NextResponse.json(extraction);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({error: message}, {status: 500});
  }
}
