'use client';

import {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';

// ---------------------------------------------------------------------------
// Inline SVG Icons
// ---------------------------------------------------------------------------

const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SidebarCollapseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="14 9 11 12 14 15" />
  </svg>
);

const AaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M3 18L8 6h1l5 12" />
    <line x1="5" y1="14" x2="12" y2="14" />
    <path d="M15 18c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4" />
    <line x1="22" y1="18" x2="22" y2="13" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const _ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const FullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ---------------------------------------------------------------------------
// Nav Item Component
// ---------------------------------------------------------------------------

function NavItem({
  label,
  isActive,
  onClick,
  hasIcon = true,
  indent = 0,
  hasChevron = false,
  isExpanded = false,
  onToggle,
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  hasIcon?: boolean;
  indent?: number;
  hasChevron?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={hasChevron ? onToggle : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 12px',
        paddingLeft: 12 + indent * 16,
        cursor: 'pointer',
        borderRadius: 6,
        margin: '1px 8px',
        backgroundColor: isActive
          ? 'rgba(0, 102, 255, 0.08)'
          : hovered
            ? 'rgba(0, 0, 0, 0.04)'
            : 'transparent',
        color: isActive ? '#0066FF' : 'var(--color-text-primary, #1a1a1a)',
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        transition: 'background-color 150ms ease',
        userSelect: 'none' as const,
      }}>
      {hasIcon && (
        <AaIcon
          width={16}
          height={16}
          style={{
            flexShrink: 0,
            opacity: isActive ? 1 : 0.55,
            color: isActive ? '#0066FF' : 'currentColor',
          }}
        />
      )}
      <span style={{flex: 1}}>{label}</span>
      {hasChevron && (
        <span
          style={{
            display: 'flex',
            transition: 'transform 200ms ease',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>
          <ChevronDownIcon width={14} height={14} style={{opacity: 0.5}} />
        </span>
      )}
    </div>
  );
}

function SectionLabel({label, indent = 0}: {label: string; indent?: number}) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--color-text-secondary, #6b7785)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px 12px 4px',
        paddingLeft: 12 + indent * 16,
        margin: '0 8px',
      }}>
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Preview with syntax highlighting
// ---------------------------------------------------------------------------

const BUTTON_CODE_LINES: Array<{spans: Array<{text: string; color: string}>}> =
  [
    {
      spans: [
        {text: 'import ', color: '#c678dd'},
        {text: '{', color: '#abb2bf'},
        {text: 'XDSButton', color: '#e5c07b'},
        {text: '}', color: '#abb2bf'},
        {text: ' from ', color: '#c678dd'},
        {text: "'@xds/core/Button'", color: '#98c379'},
        {text: ';', color: '#abb2bf'},
      ],
    },
    {spans: [{text: '', color: '#abb2bf'}]},
    {
      spans: [
        {text: 'export default ', color: '#c678dd'},
        {text: 'function ', color: '#c678dd'},
        {text: 'Example', color: '#61afef'},
        {text: '() {', color: '#abb2bf'},
      ],
    },
    {
      spans: [
        {text: '  return ', color: '#c678dd'},
        {text: '(', color: '#abb2bf'},
      ],
    },
    {
      spans: [
        {text: '    <', color: '#abb2bf'},
        {text: 'XDSButton', color: '#e5c07b'},
      ],
    },
    {
      spans: [
        {text: '      label', color: '#d19a66'},
        {text: '=', color: '#abb2bf'},
        {text: '"Button"', color: '#98c379'},
      ],
    },
    {
      spans: [
        {text: '      variant', color: '#d19a66'},
        {text: '=', color: '#abb2bf'},
        {text: '"primary"', color: '#98c379'},
      ],
    },
    {
      spans: [
        {text: '      icon', color: '#d19a66'},
        {text: '={<', color: '#abb2bf'},
        {text: 'PlusIcon', color: '#e5c07b'},
        {text: ' />}', color: '#abb2bf'},
      ],
    },
    {spans: [{text: '    />', color: '#abb2bf'}]},
    {spans: [{text: '  );', color: '#abb2bf'}]},
    {spans: [{text: '}', color: '#abb2bf'}]},
  ];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocDocsPage() {
  const [activeNav, setActiveNav] = useState('button');
  const [inputsExpanded, setInputsExpanded] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [activeRightNav, setActiveRightNav] = useState('usage');

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* ================================================================= */}
      {/* LEFT SIDEBAR */}
      {/* ================================================================= */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          height: '100vh',
          borderRight: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
          display: 'flex',
          flexDirection: 'column' as const,
          backgroundColor: 'var(--color-background-surface, #ffffff)',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 8px 10px 8px',
            flexShrink: 0,
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <XDSButton
              label="Menu"
              variant="ghost"
              size="sm"
              icon={<HamburgerIcon />}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary, #1a1a1a)',
              }}>
              XDS
            </span>
            <span
              style={{
                width: 1,
                height: 20,
                backgroundColor: 'var(--color-divider, rgba(0,0,0,0.15))',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--color-text-primary, #1a1a1a)',
              }}>
              Docs
            </span>
          </div>
          <XDSButton
            label="Collapse sidebar"
            variant="ghost"
            size="sm"
            icon={<SidebarCollapseIcon />}
          />
        </div>

        {/* Nav */}
        <nav style={{flex: 1, overflowY: 'auto' as const, paddingBottom: 16}}>
          <NavItem
            label="Getting started"
            isActive={activeNav === 'getting-started'}
            onClick={() => setActiveNav('getting-started')}
          />
          <NavItem
            label="Quick start"
            isActive={activeNav === 'quick-start'}
            onClick={() => setActiveNav('quick-start')}
          />

          <SectionLabel label="Components" />

          <NavItem
            label="Button"
            isActive={activeNav === 'button'}
            onClick={() => setActiveNav('button')}
          />
          <NavItem
            label="Stepper"
            isActive={activeNav === 'stepper'}
            onClick={() => setActiveNav('stepper')}
          />
          <NavItem
            label="Inputs"
            hasChevron
            isExpanded={inputsExpanded}
            onToggle={() => setInputsExpanded(!inputsExpanded)}
          />

          {inputsExpanded && (
            <>
              <SectionLabel label="Text & Number" indent={1} />
              <NavItem
                label="Text input"
                indent={1}
                isActive={activeNav === 'text-input'}
                onClick={() => setActiveNav('text-input')}
              />
              <NavItem
                label="Number input"
                indent={1}
                isActive={activeNav === 'number-input'}
                onClick={() => setActiveNav('number-input')}
              />
              <NavItem
                label="Text area"
                indent={1}
                isActive={activeNav === 'text-area'}
                onClick={() => setActiveNav('text-area')}
              />

              <SectionLabel label="Date" indent={1} />
              <NavItem
                label="Date picker"
                indent={1}
                isActive={activeNav === 'date-picker'}
                onClick={() => setActiveNav('date-picker')}
              />
              <NavItem
                label="Date input"
                indent={1}
                isActive={activeNav === 'date-input'}
                onClick={() => setActiveNav('date-input')}
              />
              <NavItem
                label="Time range picker"
                indent={1}
                isActive={activeNav === 'time-range-picker'}
                onClick={() => setActiveNav('time-range-picker')}
              />
            </>
          )}
        </nav>
      </aside>
      {/* ================================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================================= */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 40px',
        }}>
        <div style={{maxWidth: 840}}>
          {/* Title */}
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary, #0a1317)',
              lineHeight: 1.1,
            }}>
            Button
          </h1>

          {/* Date line */}
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary, #6b7785)',
              margin: '8px 0 32px',
            }}>
            March 30, 2026 · Updated 5:40 p.m. PST
          </p>

          {/* ============================================================= */}
          {/* Live Preview Panel */}
          {/* ============================================================= */}
          <div
            style={{
              border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 40,
            }}>
            {/* Preview Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom:
                  '1px solid var(--color-divider, rgba(0,0,0,0.08))',
                backgroundColor: 'var(--color-background-surface, #ffffff)',
              }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary, #6b7785)',
                }}>
                Live preview
              </span>
              <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                <XDSButton
                  label="Open in Craft"
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLinkIcon />}
                />
                <XDSDropdownMenu
                  button={{
                    label: 'Variant',
                    variant: 'ghost',
                    size: 'sm',
                  }}
                  hasChevron
                  items={[
                    {label: 'Primary', onClick: () => {}},
                    {label: 'Secondary', onClick: () => {}},
                    {label: 'Ghost', onClick: () => {}},
                  ]}
                />
                <XDSDropdownMenu
                  button={{
                    label: 'Light',
                    variant: 'ghost',
                    size: 'sm',
                  }}
                  hasChevron
                  items={[
                    {label: 'Light', onClick: () => {}},
                    {label: 'Dark', onClick: () => {}},
                  ]}
                />
                <XDSButton
                  label="Toggle code"
                  variant={showCode ? 'secondary' : 'ghost'}
                  size="sm"
                  icon={<CodeIcon />}
                  onClick={() => setShowCode(!showCode)}
                />
                <XDSButton
                  label="Fullscreen"
                  variant="ghost"
                  size="sm"
                  icon={<FullscreenIcon />}
                />
              </div>
            </div>

            {/* Preview + Code Split */}
            <div
              style={{
                display: 'flex',
                minHeight: 280,
              }}>
              {/* Preview Area */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-background-body, #f5f6f7)',
                  padding: 32,
                }}>
                <XDSButton
                  label="Button"
                  variant="primary"
                  icon={<PlusIcon />}
                  endContent={<XDSBadge label="New" variant="info" />}
                />
              </div>

              {/* Code Panel */}
              {showCode && (
                <div
                  style={{
                    width: 360,
                    backgroundColor: '#282c34',
                    padding: '20px 0',
                    overflowX: 'auto' as const,
                    borderLeft:
                      '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                  }}>
                  <pre
                    style={{
                      margin: 0,
                      fontFamily:
                        '"SF Mono", "Roboto Mono", "Fira Code", monospace',
                      fontSize: 13,
                      lineHeight: '22px',
                    }}>
                    {BUTTON_CODE_LINES.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}>
                        <span
                          style={{
                            width: 32,
                            textAlign: 'right' as const,
                            color: '#636d83',
                            marginRight: 16,
                            userSelect: 'none' as const,
                            flexShrink: 0,
                          }}>
                          {i + 1}
                        </span>
                        <span>
                          {line.spans.map((s, j) => (
                            <span key={j} style={{color: s.color}}>
                              {s.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* Documentation Content */}
          {/* ============================================================= */}
          <div style={{marginBottom: 32}}>
            <XDSHeading level={2}>
              A button initiates an instantaneous action.
            </XDSHeading>
          </div>

          <div style={{marginBottom: 32}}>
            <XDSText type="body">
              Buttons are clickable elements used to trigger actions. They
              communicate calls to action to the user and allow users to
              interact with pages in a variety of ways. Button labels express
              what action will occur when the user interacts with it. Buttons
              can contain a combination of a clear label and an icon, while
              standalone icon buttons are reserved for recurring, universally
              understood actions.
            </XDSText>
          </div>

          <div style={{marginBottom: 16}}>
            <XDSHeading level={3}>When to use</XDSHeading>
          </div>

          <ul
            style={{
              margin: 0,
              padding: '0 0 0 20px',
              color: 'var(--color-text-primary, #0a1317)',
              fontSize: 15,
              lineHeight: 1.7,
            }}>
            <li>Triggering form submissions or confirming a dialog</li>
            <li>Navigating to a new page or view within the application</li>
            <li>
              Starting a new process or workflow (e.g., &quot;Create new&quot;)
            </li>
            <li>Toggling a UI element or performing an inline action</li>
            <li>
              Performing destructive actions such as deleting items — use the
              danger variant for these
            </li>
          </ul>
        </div>
      </main>
      {/* ================================================================= */}
      {/* RIGHT SIDEBAR */}
      {/* ================================================================= */}
      <aside
        style={{
          width: 200,
          minWidth: 200,
          padding: '32px 20px',
          position: 'sticky' as const,
          top: 0,
          height: '100vh',
          boxSizing: 'border-box' as const,
        }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-secondary, #6b7785)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
          On this page
        </div>
        {[
          {id: 'usage', label: 'Usage'},
          {id: 'code', label: 'Code'},
          {id: 'tokens', label: 'Tokens'},
          {id: 'accessibility', label: 'Accessibility'},
        ].map(item => (
          <div
            key={item.id}
            onClick={() => setActiveRightNav(item.id)}
            style={{
              fontSize: 13,
              padding: '6px 0',
              cursor: 'pointer',
              color:
                activeRightNav === item.id
                  ? '#0066FF'
                  : 'var(--color-text-secondary, #6b7785)',
              fontWeight: activeRightNav === item.id ? 600 : 400,
              borderLeft:
                activeRightNav === item.id
                  ? '2px solid #0066FF'
                  : '2px solid transparent',
              paddingLeft: 12,
              transition: 'color 150ms ease',
            }}>
            {item.label}
          </div>
        ))}
      </aside>
    </div>
  );
}
