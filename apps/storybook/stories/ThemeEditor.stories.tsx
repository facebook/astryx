import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTabList} from '@xds/core/TabList';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSToken} from '@xds/core/Token';
import {XDSSlider} from '@xds/core/Slider';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  lineHeightDefaults,
  fontWeightDefaults,
  sizeDefaults,
  elevationDefaults,
  transitionDefaults,
} from '@xds/core/theme';
import {defaultIconRegistry} from '@xds/theme-default/icons';

// =============================================================================
// Token Groups for the Editor
// =============================================================================

const TOKEN_GROUPS = {
  colors: {
    label: 'Colors',
    description:
      'Semantic color tokens for text, backgrounds, borders, and states',
    tokens: colorDefaults,
  },
  spacing: {
    label: 'Spacing',
    description: 'Consistent spacing scale for margins, padding, and gaps',
    tokens: spacingDefaults,
  },
  radius: {
    label: 'Radius',
    description: 'Border radius tokens for rounded corners',
    tokens: radiusDefaults,
  },
  typography: {
    label: 'Typography',
    description: 'Font families, sizes, weights, and line heights',
    tokens: {
      ...typographyDefaults,
      ...textSizeDefaults,
      ...lineHeightDefaults,
      ...fontWeightDefaults,
    },
  },
  size: {
    label: 'Size',
    description: 'Component size tokens (sm, md, lg)',
    tokens: sizeDefaults,
  },
  elevation: {
    label: 'Elevation',
    description: 'Shadow and elevation tokens',
    tokens: elevationDefaults,
  },
  transition: {
    label: 'Transition',
    description: 'Animation timing tokens',
    tokens: transitionDefaults,
  },
} as const;

type TokenGroupKey = keyof typeof TOKEN_GROUPS;

// =============================================================================
// Color Categories for better organization
// =============================================================================

const COLOR_CATEGORIES = {
  'Core Semantic': [
    '--color-accent',
    '--color-accent-deemphasized',
    '--color-accent-text',
    '--color-surface',
    '--color-wash',
    '--color-overlay',
  ],
  'Interactive States': [
    '--color-hover-overlay',
    '--color-pressed-overlay',
    '--color-focus-outline',
    '--color-focus-outline-error',
    '--color-focus-outline-success',
    '--color-focus-outline-warning',
    '--color-deemphasized',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-link',
    '--color-text-placeholder',
    '--color-text-on-media',
  ],
  Icon: [
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-tertiary',
    '--color-icon-disabled',
    '--color-icon-on-media',
  ],
  'Surface Variants': ['--color-card', '--color-popover', '--color-navbar'],
  'Status/Sentiment': [
    '--color-positive',
    '--color-positive-deemphasized',
    '--color-negative',
    '--color-negative-deemphasized',
    '--color-warning',
    '--color-warning-deemphasized',
    '--color-educational',
    '--color-educational-deemphasized',
  ],
  Divider: [
    '--color-divider',
    '--color-divider-high-contrast',
    '--color-divider-emphasized',
  ],
  Effects: [
    '--color-disabled-overlay',
    '--color-glimmer',
    '--color-glimmer-high-contrast',
    '--color-shadow-elevation',
    '--color-hover-tint',
  ],
  'Palette: Blue': [
    '--color-blue-background',
    '--color-blue-border',
    '--color-blue-icon',
    '--color-blue-text',
  ],
  'Palette: Green': [
    '--color-green-background',
    '--color-green-border',
    '--color-green-icon',
    '--color-green-text',
  ],
  'Palette: Red': [
    '--color-red-background',
    '--color-red-border',
    '--color-red-icon',
    '--color-red-text',
  ],
  'Palette: Yellow': [
    '--color-yellow-background',
    '--color-yellow-border',
    '--color-yellow-icon',
    '--color-yellow-text',
  ],
  'Palette: Orange': [
    '--color-orange-background',
    '--color-orange-border',
    '--color-orange-icon',
    '--color-orange-text',
  ],
  'Palette: Purple': [
    '--color-purple-background',
    '--color-purple-border',
    '--color-purple-icon',
    '--color-purple-text',
  ],
  'Palette: Pink': [
    '--color-pink-background',
    '--color-pink-border',
    '--color-pink-icon',
    '--color-pink-text',
  ],
  'Palette: Teal': [
    '--color-teal-background',
    '--color-teal-border',
    '--color-teal-icon',
    '--color-teal-text',
  ],
  'Palette: Cyan': [
    '--color-cyan-background',
    '--color-cyan-border',
    '--color-cyan-icon',
    '--color-cyan-text',
  ],
  'Palette: Gray': [
    '--color-gray-background',
    '--color-gray-border',
    '--color-gray-icon',
    '--color-gray-text',
  ],
} as const;

// =============================================================================
// Typography Categories - Organized by semantic usage
// =============================================================================

/**
 * Typography tokens organized by semantic text styles.
 * Each style shows which tokens it uses (size, weight, line-height).
 */
const TYPOGRAPHY_CATEGORIES = {
  'Font Families': ['--font-body', '--font-heading', '--font-code'],
  'Heading 1': {
    description: 'Primary page title',
    tokens: ['--text-2xl', '--font-weight-semibold', '--leading-tight'],
  },
  'Heading 2': {
    description: 'Section title',
    tokens: ['--text-xl', '--font-weight-semibold', '--leading-snug'],
  },
  'Heading 3': {
    description: 'Subsection title',
    tokens: ['--text-lg', '--font-weight-semibold', '--leading-tight'],
  },
  'Heading 4': {
    description: 'Card/component title',
    tokens: ['--text-base', '--font-weight-semibold', '--leading-base'],
  },
  'Heading 5': {
    description: 'Minor heading',
    tokens: ['--text-base', '--font-weight-semibold', '--leading-base'],
  },
  'Heading 6': {
    description: 'Smallest heading',
    tokens: ['--text-xsm', '--font-weight-semibold', '--leading-snug'],
  },
  'Body Text': {
    description: 'Default paragraph text',
    tokens: ['--text-base', '--font-weight-normal', '--leading-base'],
  },
  'Large Text': {
    description: 'Intro/lead paragraphs',
    tokens: ['--text-lg', '--font-weight-normal', '--leading-normal'],
  },
  'Label Text': {
    description: 'Form labels, UI labels',
    tokens: ['--text-base', '--font-weight-medium', '--leading-base'],
  },
  'Supporting Text': {
    description: 'Captions, helper text',
    tokens: ['--text-xsm', '--font-weight-normal', '--leading-snug'],
  },
  'Code Text': {
    description: 'Inline code, code blocks',
    tokens: ['--text-base', '--font-weight-normal', '--leading-base'],
  },
  'All Text Sizes': [
    '--text-4xs',
    '--text-3xs',
    '--text-2xs',
    '--text-xsm',
    '--text-sm',
    '--text-base',
    '--text-lg',
    '--text-xl',
    '--text-2xl',
    '--text-3xl',
    '--text-4xl',
  ],
  'All Font Weights': [
    '--font-weight-normal',
    '--font-weight-medium',
    '--font-weight-semibold',
    '--font-weight-bold',
  ],
  'All Line Heights': [
    '--leading-tight',
    '--leading-snug',
    '--leading-base',
    '--leading-normal',
    '--leading-relaxed',
  ],
} as const;

type TypographyCategoryValue =
  | string[]
  | {description: string; tokens: string[]};

// =============================================================================
// AI Theme Generation
// =============================================================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250514';
const LOCAL_STORAGE_KEY = 'xds-theme-editor-anthropic-key';

interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Build the system prompt that teaches Claude about XDS tokens.
 * Includes the full token schema so it can generate valid overrides.
 */
function buildThemeSystemPrompt(): string {
  return `You are an XDS design system theme generator. Given a description, you output a JSON object with token overrides that create the described theme.

RULES:
- Output ONLY valid JSON — no markdown fences, no explanation, just the JSON object.
- Every color value MUST use the CSS light-dark(lightValue, darkValue) format.
- Only include tokens you want to change from defaults.
- Use the exact token names shown below (e.g. "--color-accent", "--spacing-4").
- For spacing/size/radius values, use CSS units like "4px", "8px", "12px".
- For font weights, use numeric strings like "400", "500", "600", "700".
- For line heights, use unitless numbers as strings like "1.25", "1.5".
- For font families, use standard CSS font stacks.
- For transitions, use CSS shorthand like "0.15s ease".
- For elevations, use CSS box-shadow syntax with light-dark() for colors.
- Ensure good contrast ratios between text and background colors.
- Ensure dark mode colors are appropriate (lighter text on darker backgrounds).

AVAILABLE COLOR TOKENS:
${JSON.stringify(colorDefaults, null, 2)}

AVAILABLE SPACING TOKENS:
${JSON.stringify(spacingDefaults, null, 2)}

AVAILABLE RADIUS TOKENS:
${JSON.stringify(radiusDefaults, null, 2)}

AVAILABLE SIZE TOKENS:
${JSON.stringify(sizeDefaults, null, 2)}

AVAILABLE TYPOGRAPHY TOKENS:
${JSON.stringify(typographyDefaults, null, 2)}

AVAILABLE TEXT SIZE TOKENS:
${JSON.stringify(textSizeDefaults, null, 2)}

AVAILABLE LINE HEIGHT TOKENS:
${JSON.stringify(lineHeightDefaults, null, 2)}

AVAILABLE FONT WEIGHT TOKENS:
${JSON.stringify(fontWeightDefaults, null, 2)}

AVAILABLE ELEVATION TOKENS:
${JSON.stringify(elevationDefaults, null, 2)}

AVAILABLE TRANSITION TOKENS:
${JSON.stringify(transitionDefaults, null, 2)}

EXAMPLE OUTPUT for "warm sunset theme":
{
  "--color-accent": "light-dark(#E8590C, #FF8C42)",
  "--color-accent-deemphasized": "light-dark(#E8590C33, #FF8C423F)",
  "--color-accent-text": "light-dark(#C63B05, #FFB07C)",
  "--color-surface": "light-dark(#FFFAF5, #1A1410)",
  "--color-wash": "light-dark(#FFF3E8, #120E0A)",
  "--color-text-link": "light-dark(#E8590C, #FF8C42)",
  "--color-focus-outline": "light-dark(#E8590C, #FF8C42)",
  "--radius-container": "16px",
  "--radius-element": "10px"
}

Respond with ONLY the JSON object. No other text.`;
}

/**
 * Call Anthropic's Messages API directly from the browser.
 * Requires the "anthropic-dangerous-direct-browser-access" header for CORS.
 */
async function callClaude(
  apiKey: string,
  messages: AIChatMessage[],
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: buildThemeSystemPrompt(),
      messages: messages.map(m => ({role: m.role, content: m.content})),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg =
      (error as {error?: {message?: string}}).error?.message ||
      `API error: ${response.status}`;
    throw new Error(msg);
  }

  const data = (await response.json()) as {
    content: Array<{type: string; text?: string}>;
  };
  const textBlock = data.content.find((b: {type: string}) => b.type === 'text');
  return textBlock?.text || '';
}

/**
 * Parse Claude's response into token overrides.
 * Handles cases where the response might have markdown fences.
 */
function parseTokenOverrides(response: string): Record<string, string> | null {
  let cleaned = response.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as Record<string, string>;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * AI Theme Generation Panel
 */
interface AIThemePanelProps {
  onApplyTokens: (overrides: Record<string, string>) => void;
  allDefaults: Record<string, string>;
  onReset: () => void;
}

function AIThemePanel({
  onApplyTokens,
  allDefaults,
  onReset,
}: AIThemePanelProps) {
  const [apiKey, setApiKey] = React.useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [keyInput, setKeyInput] = React.useState(apiKey);
  const [isKeySet, setIsKeySet] = React.useState(!!apiKey);
  const [messages, setMessages] = React.useState<AIChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
      } catch {
        // localStorage not available
      }
      setApiKey(trimmed);
      setIsKeySet(true);
      setError(null);
    }
  };

  const handleClearKey = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // localStorage not available
    }
    setApiKey('');
    setKeyInput('');
    setIsKeySet(false);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIChatMessage = {role: 'user', content: input.trim()};
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await callClaude(apiKey, newMessages);
      const overrides = parseTokenOverrides(response);

      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: overrides
          ? `Applied ${Object.keys(overrides).length} token overrides.`
          : response,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (overrides) {
        // Merge overrides with defaults so unmentioned tokens stay at default
        const merged = {...allDefaults, ...overrides};
        onApplyTokens(merged);
      } else {
        setError('Could not parse token overrides from response.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setMessages(prev => [
        ...prev,
        {role: 'assistant', content: `Error: ${msg}`},
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // API key setup screen
  if (!isKeySet) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px',
          gap: '16px',
        }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-accent-deemphasized)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
          ✨
        </div>
        <XDSHeading level={4}>AI Theme Generator</XDSHeading>
        <XDSText
          type="supporting"
          style={{textAlign: 'center', maxWidth: '280px'}}>
          Describe a theme in natural language and let Claude generate the token
          values for you.
        </XDSText>
        <div style={{width: '100%', maxWidth: '320px'}}>
          <XDSTextInput
            label="Anthropic API Key"
            value={keyInput}
            onChange={setKeyInput}
            placeholder="sk-ant-..."
            type="password"
            size="sm"
          />
          <XDSText
            type="supporting"
            style={{marginTop: '8px', display: 'block'}}>
            Your key is stored in localStorage and sent directly to Anthropic.
            It never leaves your browser otherwise.{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{color: 'var(--color-text-link)'}}>
              Get an API key →
            </a>
          </XDSText>
        </div>
        <XDSButton
          label="Save & Start"
          variant="primary"
          onClick={handleSaveKey}
          isDisabled={!keyInput.trim()}
        />
      </div>
    );
  }

  // Chat interface
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
      {/* Chat header */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <XDSText type="label">AI Theme Generator</XDSText>
        <div style={{display: 'flex', gap: '4px'}}>
          <XDSButton
            label="Reset Theme"
            variant="ghost"
            size="sm"
            onClick={onReset}
          />
          <XDSButton
            label="Change Key"
            variant="ghost"
            size="sm"
            onClick={handleClearKey}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              opacity: 0.6,
            }}>
            <XDSText type="supporting" style={{textAlign: 'center'}}>
              Describe a theme to generate token values.
            </XDSText>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%',
              }}>
              {[
                'Dark cyberpunk theme with neon purple accents',
                'Clean minimal theme with rounded corners',
                'Warm earth-tones with serif typography',
                'High contrast accessibility theme',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius:
                  msg.role === 'user'
                    ? '12px 12px 4px 12px'
                    : '12px 12px 12px 4px',
                backgroundColor:
                  msg.role === 'user'
                    ? 'var(--color-accent)'
                    : 'var(--color-wash)',
                color:
                  msg.role === 'user'
                    ? '#fff'
                    : msg.content.startsWith('Error:')
                      ? 'var(--color-negative)'
                      : 'var(--color-text-primary)',
                fontSize: '13px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{display: 'flex', justifyContent: 'flex-start'}}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '12px 12px 12px 4px',
                backgroundColor: 'var(--color-wash)',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
              }}>
              Generating theme…
            </div>
          </div>
        )}
        {error && !messages.some(m => m.content.includes(error)) && (
          <XDSText
            type="supporting"
            style={{color: 'var(--color-negative)', textAlign: 'center'}}>
            {error}
          </XDSText>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-divider)',
          display: 'flex',
          gap: '8px',
        }}>
        <div style={{flex: 1}}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a theme..."
            disabled={isLoading}
            rows={1}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--color-divider-emphasized)',
              borderRadius: '8px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
        <XDSButton
          label={isLoading ? '...' : 'Send'}
          variant="primary"
          size="sm"
          onClick={handleSend}
          isDisabled={!input.trim() || isLoading}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse light-dark() values to extract light and dark mode colors
 */
function parseLightDark(value: string): {light: string; dark: string} | null {
  const match = value.match(/^light-dark\(([^,]+),\s*([^)]+)\)$/);
  if (match) {
    return {light: match[1].trim(), dark: match[2].trim()};
  }
  return null;
}

/**
 * Parse a color value to extract hex and alpha components
 * Handles: #RGB, #RRGGBB, #RRGGBBAA, rgba(), etc.
 */
function parseColorWithAlpha(
  value: string,
): {hex: string; alpha: number} | null {
  // Handle #RRGGBBAA format
  const hex8Match = value.match(/^#([0-9A-Fa-f]{8})$/);
  if (hex8Match) {
    const hex = '#' + hex8Match[1].slice(0, 6);
    const alpha = parseInt(hex8Match[1].slice(6, 8), 16) / 255;
    return {hex, alpha: Math.round(alpha * 100) / 100};
  }

  // Handle #RRGGBB format
  const hex6Match = value.match(/^#([0-9A-Fa-f]{6})$/);
  if (hex6Match) {
    return {hex: value, alpha: 1};
  }

  // Handle #RGB format
  const hex3Match = value.match(/^#([0-9A-Fa-f]{3})$/);
  if (hex3Match) {
    const r = hex3Match[1][0];
    const g = hex3Match[1][1];
    const b = hex3Match[1][2];
    return {hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 1};
  }

  // Handle rgba() format
  const rgbaMatch = value.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
    const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    return {hex: `#${r}${g}${b}`, alpha};
  }

  return null;
}

/**
 * Convert hex + alpha back to a color string
 */
function colorWithAlphaToString(hex: string, alpha: number): string {
  if (alpha >= 1) {
    return hex.toUpperCase();
  }
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`.toUpperCase();
}

/**
 * Get a human-readable label from a token name
 */
function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// Token Editor Components
// =============================================================================

interface ColorSwatchProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
  mode: 'light' | 'dark';
}

function ColorSwatch({tokenName, value, onChange, mode}: ColorSwatchProps) {
  const parsed = parseLightDark(value);
  const displayValue = parsed
    ? mode === 'light'
      ? parsed.light
      : parsed.dark
    : value;

  // Parse color with alpha
  const colorParsed = parseColorWithAlpha(displayValue);
  const hasColorPicker = colorParsed !== null;

  const handleColorChange = (newHex: string, newAlpha?: number) => {
    const alpha = newAlpha ?? colorParsed?.alpha ?? 1;
    const newColor = colorWithAlphaToString(newHex, alpha);
    const newValue = parsed
      ? mode === 'light'
        ? `light-dark(${newColor}, ${parsed.dark})`
        : `light-dark(${parsed.light}, ${newColor})`
      : newColor;
    onChange(tokenName, newValue);
  };

  const handleAlphaChange = (newAlpha: number) => {
    if (colorParsed) {
      handleColorChange(colorParsed.hex, newAlpha);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-wash)',
      }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: displayValue,
          border: '1px solid var(--color-divider-emphasized)',
          flexShrink: 0,
          // Checkerboard pattern for alpha preview
          backgroundImage:
            colorParsed && colorParsed.alpha < 1
              ? `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`
              : undefined,
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            backgroundColor: displayValue,
          }}
        />
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
        {hasColorPicker && colorParsed && (
          <>
            <input
              type="color"
              value={colorParsed.hex}
              onChange={e => handleColorChange(e.target.value)}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(colorParsed.alpha * 100)}
              onChange={e => handleAlphaChange(Number(e.target.value) / 100)}
              title="Alpha %"
              style={{
                width: '50px',
                padding: '4px 6px',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                border: '1px solid var(--color-divider-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
              }}>
              %
            </span>
          </>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={e => {
            const newValue = parsed
              ? mode === 'light'
                ? `light-dark(${e.target.value}, ${parsed.dark})`
                : `light-dark(${parsed.light}, ${e.target.value})`
              : e.target.value;
            onChange(tokenName, newValue);
          }}
          style={{
            width: '100px',
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'var(--font-code)',
            border: '1px solid var(--color-divider-emphasized)',
            borderRadius: '4px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
    </div>
  );
}

interface SpacingEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function SpacingEditor({tokenName, value, onChange}: SpacingEditorProps) {
  const numValue = parseInt(value, 10);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-wash)',
      }}>
      <div
        style={{
          width: `${Math.min(numValue, 48)}px`,
          height: '24px',
          backgroundColor: 'var(--color-accent)',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-divider-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

interface RadiusEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function RadiusEditor({tokenName, value, onChange}: RadiusEditorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-wash)',
      }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--color-accent)',
          borderRadius: value,
          flexShrink: 0,
        }}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-divider-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

interface TypographyEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function TypographyEditor({tokenName, value, onChange}: TypographyEditorProps) {
  const isFont = tokenName.includes('font-') && !tokenName.includes('weight');
  const isSize = tokenName.includes('text-');
  const isWeight = tokenName.includes('weight');
  const isLeading = tokenName.includes('leading');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-wash)',
      }}>
      <div
        style={{
          width: '48px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isSize ? value : '14px',
          fontWeight: isWeight ? value : 400,
          fontFamily: isFont ? value : 'inherit',
          lineHeight: isLeading ? value : 1.4,
          color: 'var(--color-text-primary)',
          flexShrink: 0,
        }}>
        Aa
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: isFont ? '200px' : '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-divider-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

// =============================================================================
// Component Preview
// =============================================================================

// =============================================================================
// Spacing Table Data
// =============================================================================

interface SpacingRow extends Record<string, unknown> {
  token: string;
  value: string;
  preview: React.ReactNode;
}

const spacingTableColumns: XDSTableColumn<SpacingRow>[] = [
  {key: 'token', header: 'Token'},
  {key: 'value', header: 'Value'},
  {key: 'preview', header: 'Preview'},
];

function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('overview');
  const [switchValue, setSwitchValue] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('option1');

  // Spacing data for table
  const spacingData: SpacingRow[] = Object.entries(spacingDefaults).map(
    ([token, value]) => ({
      token,
      value,
      preview: (
        <div
          style={{
            width: value,
            height: '16px',
            backgroundColor: 'var(--color-accent)',
            borderRadius: '2px',
          }}
        />
      ),
    }),
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
      {/* Typography Scale - Article Example */}
      <div>
        <XDSText type="label" style={{marginBottom: '16px', display: 'block'}}>
          Typography Scale
        </XDSText>
        <XDSCard padding="lg">
          <article>
            <XDSHeading level={1}>Building Design Systems</XDSHeading>
            <XDSText
              type="supporting"
              style={{
                marginTop: '8px',
                marginBottom: '24px',
                display: 'block',
              }}>
              A guide to creating consistent, scalable UI components
            </XDSText>

            <XDSText
              type="large"
              style={{marginBottom: '16px', display: 'block'}}>
              Design systems provide a shared vocabulary between designers and
              developers, enabling teams to build products faster and more
              consistently.
            </XDSText>

            <XDSDivider style={{margin: '24px 0'}} />

            <XDSHeading level={2} style={{marginBottom: '12px'}}>
              Why Tokens Matter
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '16px', display: 'block'}}>
              Design tokens are the visual design atoms of the design system —
              specifically, they are named entities that store visual design
              attributes. We use them in place of hard-coded values to ensure
              flexibility and consistency.
            </XDSText>

            <XDSHeading level={3} style={{marginBottom: '8px'}}>
              Example: Using Color Tokens
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '12px', display: 'block'}}>
              Instead of using raw hex values, reference semantic tokens:
            </XDSText>

            {/* Code Block */}
            <pre
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-element)',
                backgroundColor: 'var(--color-wash)',
                border: '1px solid var(--color-divider)',
                fontFamily: 'var(--font-code)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-normal)',
                overflow: 'auto',
                margin: '0 0 16px 0',
              }}>
              <code
                style={{
                  color: 'var(--color-text-primary)',
                }}>
                {`// ❌ Don't use raw values
const styles = stylex.create({
  button: {
    backgroundColor: '#0064E0',
    color: '#FFFFFF',
  },
});

// ✅ Use semantic tokens
const styles = stylex.create({
  button: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
  },
});`}
              </code>
            </pre>

            <XDSHeading level={4} style={{marginBottom: '8px'}}>
              Benefits of This Approach
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '8px', display: 'block'}}>
              Using tokens provides several advantages:
            </XDSText>
            <ul
              style={{
                margin: '0 0 16px 0',
                paddingLeft: '24px',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-base)',
              }}>
              <li>Automatic dark mode support via light-dark()</li>
              <li>Centralized theme customization</li>
              <li>Consistent visual language across components</li>
              <li>Easy global updates when design changes</li>
            </ul>

            <XDSText type="supporting">
              Last updated: March 2026 · 5 min read
            </XDSText>
          </article>
        </XDSCard>
      </div>

      {/* Button Sizes */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Button Sizes
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              sm
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="sm" />
            <XDSButton label="Secondary" variant="secondary" size="sm" />
            <XDSButton label="Ghost" variant="ghost" size="sm" />
            <XDSButton label="Destructive" variant="destructive" size="sm" />
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              md
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="md" />
            <XDSButton label="Secondary" variant="secondary" size="md" />
            <XDSButton label="Ghost" variant="ghost" size="md" />
            <XDSButton label="Destructive" variant="destructive" size="md" />
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              lg
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="lg" />
            <XDSButton label="Secondary" variant="secondary" size="lg" />
            <XDSButton label="Ghost" variant="ghost" size="lg" />
            <XDSButton label="Destructive" variant="destructive" size="lg" />
          </div>
        </div>
      </div>

      {/* Button States */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Button States
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSButton label="Default" variant="primary" />
          <XDSButton label="Disabled" variant="primary" isDisabled />
          <XDSButton label="Loading" variant="primary" isLoading />
        </div>
      </div>

      {/* Spacing Table */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Spacing Scale
        </XDSText>
        <XDSTable
          columns={spacingTableColumns}
          data={spacingData}
          getRowKey={row => row.token}
          density="compact"
          dividers="rows"
        />
      </div>

      {/* Badges */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Badges
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSBadge label="Default" />
          <XDSBadge label="Primary" variant="primary" />
          <XDSBadge label="Ghost" variant="ghost" />
          <XDSBadge label="Positive" sentiment="positive" />
          <XDSBadge label="Negative" sentiment="negative" />
          <XDSBadge label="Warning" sentiment="warning" />
        </div>
      </div>

      {/* Tokens */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Tokens
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSToken label="Default" />
          <XDSToken label="Blue" color="blue" />
          <XDSToken label="Green" color="green" />
          <XDSToken label="Red" color="red" />
          <XDSToken label="Purple" color="purple" />
          <XDSToken label="Orange" color="orange" />
        </div>
      </div>

      {/* Form Controls */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Form Controls
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '300px',
          }}>
          <XDSTextInput label="Text Input" placeholder="Enter text..." />
          <XDSSwitch
            label="Toggle Switch"
            isSelected={switchValue}
            onChange={setSwitchValue}
          />
          <XDSCheckboxInput
            label="Checkbox"
            isSelected={checkboxValue}
            onChange={setCheckboxValue}
          />
          <XDSSlider
            label="Slider"
            value={sliderValue}
            onChange={setSliderValue}
            minValue={0}
            maxValue={100}
          />
        </div>
      </div>

      {/* Radio List */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Radio List
        </XDSText>
        <XDSRadioList
          label="Select an option"
          value={radioValue}
          onChange={setRadioValue}>
          <XDSRadioListItem value="option1" label="Option 1" />
          <XDSRadioListItem value="option2" label="Option 2" />
          <XDSRadioListItem value="option3" label="Option 3" />
        </XDSRadioList>
      </div>

      {/* Progress */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Progress
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '300px',
          }}>
          <XDSProgressBar value={25} label="25%" />
          <XDSProgressBar value={50} label="50%" />
          <XDSProgressBar value={75} label="75%" />
        </div>
      </div>

      {/* Tabs */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Tabs
        </XDSText>
        <XDSTabList
          tabs={[
            {id: 'overview', label: 'Overview'},
            {id: 'details', label: 'Details'},
            {id: 'settings', label: 'Settings'},
          ]}
          selectedId={selectedTab}
          onSelect={setSelectedTab}
        />
      </div>

      {/* Avatar */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Avatars
        </XDSText>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <XDSAvatar name="John Doe" size="sm" />
          <XDSAvatar name="Jane Smith" size="md" />
          <XDSAvatar name="Bob Wilson" size="lg" />
        </div>
      </div>

      {/* Banner */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Banners
        </XDSText>
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <XDSBanner
            title="Information"
            description="This is an informational banner."
            status="info"
          />
          <XDSBanner
            title="Success"
            description="Operation completed successfully."
            status="success"
          />
          <XDSBanner
            title="Warning"
            description="Please review before continuing."
            status="warning"
          />
          <XDSBanner
            title="Error"
            description="Something went wrong."
            status="error"
          />
        </div>
      </div>

      {/* Card */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Card
        </XDSText>
        <XDSCard padding="md">
          <XDSStack gap="sm">
            <XDSHeading level={4}>Card Title</XDSHeading>
            <XDSText type="body">
              This is a sample card with some content to demonstrate how cards
              look with the current theme.
            </XDSText>
            <div style={{display: 'flex', gap: '8px'}}>
              <XDSButton label="Action" variant="primary" size="sm" />
              <XDSButton label="Cancel" variant="ghost" size="sm" />
            </div>
          </XDSStack>
        </XDSCard>
      </div>

      {/* Dialog trigger */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Dialog
        </XDSText>
        <XDSButton
          label="Open Dialog"
          variant="secondary"
          onClick={() => setDialogOpen(true)}
        />
        <XDSDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Sample Dialog">
          <div style={{padding: '0 24px 24px 24px'}}>
            <XDSStack gap="md">
              <XDSText type="body">
                This is a sample dialog to preview how dialogs look with the
                current theme settings.
              </XDSText>
              <XDSTextInput
                label="Example Input"
                placeholder="Type something..."
              />
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                }}>
                <XDSButton
                  label="Cancel"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                />
                <XDSButton
                  label="Confirm"
                  variant="primary"
                  onClick={() => setDialogOpen(false)}
                />
              </div>
            </XDSStack>
          </div>
        </XDSDialog>
      </div>
    </div>
  );
}

// =============================================================================
// Code Generator
// =============================================================================

function generateThemeCode(
  themeName: string,
  tokens: Record<string, string>,
  defaults: Record<string, string>,
): string {
  const changedTokens: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (value !== defaults[key]) {
      changedTokens[key] = value;
    }
  }

  if (Object.keys(changedTokens).length === 0) {
    return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
  tokens: {},
});`;
  }

  const tokenEntries = Object.entries(changedTokens)
    .map(([key, value]) => {
      const parsed = parseLightDark(value);
      if (parsed) {
        return `    '${key}': ['${parsed.light}', '${parsed.dark}'],`;
      }
      return `    '${key}': '${value}',`;
    })
    .join('\n');

  return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
  tokens: {
${tokenEntries}
  },
});`;
}

// =============================================================================
// Main Theme Editor Component
// =============================================================================

type EditorTab = TokenGroupKey | 'ai';

function ThemeEditorComponent() {
  const [activeGroup, setActiveGroup] = React.useState<EditorTab>('colors');
  const [activeColorCategory, setActiveColorCategory] =
    React.useState<string>('Core Semantic');
  const [activeTypographyCategory, setActiveTypographyCategory] =
    React.useState<string>('Heading 1');
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [themeName, setThemeName] = React.useState('custom');
  const [showCode, setShowCode] = React.useState(false);

  // Collect all defaults
  const allDefaults = React.useMemo(
    () => ({
      ...colorDefaults,
      ...spacingDefaults,
      ...radiusDefaults,
      ...typographyDefaults,
      ...textSizeDefaults,
      ...lineHeightDefaults,
      ...fontWeightDefaults,
      ...sizeDefaults,
      ...elevationDefaults,
      ...transitionDefaults,
    }),
    [],
  );

  const [tokens, setTokens] =
    React.useState<Record<string, string>>(allDefaults);

  const handleTokenChange = React.useCallback(
    (tokenName: string, value: string) => {
      setTokens(prev => ({...prev, [tokenName]: value}));
    },
    [],
  );

  const handleApplyTokens = React.useCallback(
    (overrides: Record<string, string>) => {
      setTokens(overrides);
    },
    [],
  );

  const handleReset = React.useCallback(() => {
    setTokens(allDefaults);
  }, [allDefaults]);

  // Create a theme from current tokens
  const currentTheme = React.useMemo(() => {
    const tokenOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      if (value !== allDefaults[key]) {
        tokenOverrides[key] = value;
      }
    }
    return defineTheme({
      name: themeName,
      tokens: tokenOverrides as Partial<Record<string, string>>,
      icons: defaultIconRegistry,
    });
  }, [tokens, themeName, allDefaults]);

  const renderTokenEditor = () => {
    // AI tab is handled separately
    if (activeGroup === 'ai') return null;

    const group = TOKEN_GROUPS[activeGroup];

    if (activeGroup === 'colors') {
      const categoryTokens =
        COLOR_CATEGORIES[
          activeColorCategory as keyof typeof COLOR_CATEGORIES
        ] || [];

      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {/* Color category selector */}
          <div style={{marginBottom: '8px'}}>
            <select
              value={activeColorCategory}
              onChange={e => setActiveColorCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--color-divider-emphasized)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}>
              {Object.keys(COLOR_CATEGORIES).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {categoryTokens.map(tokenName => (
            <ColorSwatch
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
              mode={mode}
            />
          ))}
        </div>
      );
    }

    if (activeGroup === 'spacing' || activeGroup === 'size') {
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {Object.keys(group.tokens).map(tokenName => (
            <SpacingEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    if (activeGroup === 'radius') {
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {Object.keys(group.tokens).map(tokenName => (
            <RadiusEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    if (activeGroup === 'typography') {
      const categoryValue = TYPOGRAPHY_CATEGORIES[
        activeTypographyCategory as keyof typeof TYPOGRAPHY_CATEGORIES
      ] as TypographyCategoryValue | undefined;

      // Get the list of tokens for this category
      const categoryTokens: string[] = categoryValue
        ? Array.isArray(categoryValue)
          ? categoryValue
          : categoryValue.tokens
        : [];

      const categoryDescription =
        categoryValue && !Array.isArray(categoryValue)
          ? categoryValue.description
          : null;

      // Determine sample text rendering for semantic categories
      const isSemanticStyle = categoryValue && !Array.isArray(categoryValue);

      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {/* Typography category selector */}
          <div style={{marginBottom: '8px'}}>
            <select
              value={activeTypographyCategory}
              onChange={e => setActiveTypographyCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--color-divider-emphasized)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}>
              <optgroup label="Semantic Styles">
                {Object.keys(TYPOGRAPHY_CATEGORIES)
                  .filter(k => {
                    const v = TYPOGRAPHY_CATEGORIES[
                      k as keyof typeof TYPOGRAPHY_CATEGORIES
                    ] as TypographyCategoryValue;
                    return !Array.isArray(v);
                  })
                  .map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Raw Tokens">
                {Object.keys(TYPOGRAPHY_CATEGORIES)
                  .filter(k => {
                    const v = TYPOGRAPHY_CATEGORIES[
                      k as keyof typeof TYPOGRAPHY_CATEGORIES
                    ] as TypographyCategoryValue;
                    return Array.isArray(v);
                  })
                  .map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Description for semantic styles */}
          {categoryDescription && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent-deemphasized)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
              }}>
              {categoryDescription}
            </div>
          )}

          {/* Sample text preview for semantic styles */}
          {isSemanticStyle && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-wash)',
                border: '1px solid var(--color-divider)',
                marginBottom: '8px',
              }}>
              <div
                style={{
                  fontSize: tokens[categoryTokens[0]] || 'inherit',
                  fontWeight: tokens[categoryTokens[1]] || 'inherit',
                  lineHeight: tokens[categoryTokens[2]] || 'inherit',
                  color: 'var(--color-text-primary)',
                }}>
                {activeTypographyCategory === 'Code Text'
                  ? 'const theme = defineTheme({...});'
                  : `The quick brown fox jumps over the lazy dog`}
              </div>
            </div>
          )}

          {/* Token editors */}
          {categoryTokens.map(tokenName => (
            <TypographyEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    // Default: generic text input
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {Object.keys(group.tokens).map(tokenName => (
          <div
            key={tokenName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-wash)',
            }}>
            <div style={{flex: 1, minWidth: 0}}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  marginBottom: '2px',
                }}>
                {getTokenLabel(tokenName)}
              </div>
              <code
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-code)',
                }}>
                {tokenName}
              </code>
            </div>
            <input
              type="text"
              value={tokens[tokenName] || ''}
              onChange={e => handleTokenChange(tokenName, e.target.value)}
              style={{
                width: '200px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                border: '1px solid var(--color-divider-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-wash)',
      }}>
      {/* Left Panel - Token Editor */}
      <div
        style={{
          width: '400px',
          borderRight: '1px solid var(--color-divider-emphasized)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
        }}>
        {/* Token group tabs */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-divider)',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
          }}>
          <XDSButton
            key="ai"
            label="✨ AI"
            variant={activeGroup === 'ai' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveGroup('ai')}
          />
          {(Object.keys(TOKEN_GROUPS) as TokenGroupKey[]).map(groupKey => (
            <XDSButton
              key={groupKey}
              label={TOKEN_GROUPS[groupKey].label}
              variant={activeGroup === groupKey ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveGroup(groupKey)}
            />
          ))}
        </div>

        {/* AI panel or token editor */}
        {activeGroup === 'ai' ? (
          <div style={{flex: 1, overflow: 'hidden'}}>
            <AIThemePanel
              onApplyTokens={handleApplyTokens}
              allDefaults={allDefaults}
              onReset={handleReset}
            />
          </div>
        ) : (
          <>
            {/* Group description */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-divider)',
              }}>
              <XDSText type="supporting">
                {TOKEN_GROUPS[activeGroup].description}
              </XDSText>
            </div>

            {/* Token list */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
              }}>
              {renderTokenEditor()}
            </div>
          </>
        )}

        {/* Actions */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-divider)',
            display: 'flex',
            gap: '8px',
          }}>
          <XDSButton label="Reset All" variant="ghost" onClick={handleReset} />
          <XDSButton
            label={showCode ? 'Hide Code' : 'Export Code'}
            variant="secondary"
            onClick={() => setShowCode(!showCode)}
          />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        {/* Preview header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-divider)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div>
            <XDSHeading level={4}>Live Preview</XDSHeading>
            <XDSText type="supporting">See your changes in real-time</XDSText>
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <XDSButton
              label="Light"
              variant={mode === 'light' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('light')}
            />
            <XDSButton
              label="Dark"
              variant={mode === 'dark' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('dark')}
            />
          </div>
        </div>

        {/* Code panel (collapsible) */}
        {showCode && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-divider)',
              backgroundColor: 'var(--color-wash)',
              maxHeight: '300px',
              overflow: 'auto',
            }}>
            <XDSText
              type="label"
              style={{marginBottom: '8px', display: 'block'}}>
              Generated Theme Code
            </XDSText>
            <pre
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-divider-emphasized)',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                overflow: 'auto',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
              {generateThemeCode(themeName, tokens, allDefaults)}
            </pre>
          </div>
        )}

        {/* Preview content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
          }}>
          <XDSTheme theme={currentTheme} mode={mode}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '24px',
                minHeight: '100%',
              }}>
              <ComponentPreview />
            </div>
          </XDSTheme>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Storybook Meta
// =============================================================================

const meta: Meta = {
  title: 'Theme Editor',
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: null,
    },
  },
};

export default meta;

type Story = StoryObj;

export const ThemeEditor: Story = {
  render: () => <ThemeEditorComponent />,
  parameters: {
    // Disable the theme decorator for this story since we manage our own theme
    xdsTheme: 'none',
    xdsThemeDecorator: {disable: true},
  },
};
