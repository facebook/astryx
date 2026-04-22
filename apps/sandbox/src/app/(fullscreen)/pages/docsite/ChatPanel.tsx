'use client';

import * as stylex from '@stylexjs/stylex';
import React, {useState, useEffect, useRef} from 'react';
import {XDSButton} from '@xds/core/Button';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {ArrowLeftIcon, CursorIcon, SparklesIcon} from './docsite-icons';
import {ShimmerText} from './ShimmerText';
import {MOCK_CODE} from './constants';

const composerStyles = stylex.create({
  border: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-emphasized, #CCD3DB)',
  },
});

export type PanelTab = 'configure' | 'properties' | 'code';

function PropertyInputs() {
  const [fontFamily, setFontFamily] = useState('System UI');
  const [fontSize, setFontSize] = useState('32px');
  const [fontWeight, setFontWeight] = useState('700');
  const [lineHeight, setLineHeight] = useState('1.25');
  const [letterSpacing, setLetterSpacing] = useState('-0.02em');
  const [color, setColor] = useState('#1C2B33');
  const [marginTop, setMarginTop] = useState('0px');
  const [marginBottom, setMarginBottom] = useState('16px');
  const [padding, setPadding] = useState('0px');
  const [imgSrc, setImgSrc] = useState('hero-banner.png');
  const [altText, setAltText] = useState('Hero banner illustration');
  const [objectFit, setObjectFit] = useState('cover');
  const [aspectRatio, setAspectRatio] = useState('16 / 9');
  const [background, setBackground] = useState('transparent');
  const [borderRadius, setBorderRadius] = useState('0px');
  const [opacity, setOpacity] = useState('1');

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <XDSText type="label" color="secondary">
        Typography
      </XDSText>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <XDSTextInput
          label="Font family"
          value={fontFamily}
          onChange={setFontFamily}
          size="sm"
        />
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Font size"
              value={fontSize}
              onChange={setFontSize}
              size="sm"
            />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Weight"
              value={fontWeight}
              onChange={setFontWeight}
              size="sm"
            />
          </div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Line height"
              value={lineHeight}
              onChange={setLineHeight}
              size="sm"
            />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Letter spacing"
              value={letterSpacing}
              onChange={setLetterSpacing}
              size="sm"
            />
          </div>
        </div>
        <XDSTextInput
          label="Color"
          value={color}
          onChange={setColor}
          size="sm"
        />
      </div>

      <XDSDivider variant="strong" />

      <XDSText type="label" color="secondary">
        Spacing
      </XDSText>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Margin top"
              value={marginTop}
              onChange={setMarginTop}
              size="sm"
            />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Margin bottom"
              value={marginBottom}
              onChange={setMarginBottom}
              size="sm"
            />
          </div>
        </div>
        <XDSTextInput
          label="Padding"
          value={padding}
          onChange={setPadding}
          size="sm"
        />
      </div>

      <XDSDivider variant="strong" />

      <XDSText type="label" color="secondary">
        Image
      </XDSText>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <XDSTextInput
          label="Source"
          value={imgSrc}
          onChange={setImgSrc}
          size="sm"
        />
        <XDSTextInput
          label="Alt text"
          value={altText}
          onChange={setAltText}
          size="sm"
        />
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Object fit"
              value={objectFit}
              onChange={setObjectFit}
              size="sm"
            />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Aspect ratio"
              value={aspectRatio}
              onChange={setAspectRatio}
              size="sm"
            />
          </div>
        </div>
      </div>

      <XDSDivider variant="strong" />

      <XDSText type="label" color="secondary">
        Appearance
      </XDSText>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <XDSTextInput
          label="Background"
          value={background}
          onChange={setBackground}
          size="sm"
        />
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Border radius"
              value={borderRadius}
              onChange={setBorderRadius}
              size="sm"
            />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSTextInput
              label="Opacity"
              value={opacity}
              onChange={setOpacity}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeEditor() {
  const [code, setCode] = useState(MOCK_CODE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCount = code.split('\n').length;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom:
            '1px solid var(--color-border-default, rgba(0,0,0,0.1))',
        }}>
        <XDSText type="supporting" color="secondary">
          useUser.ts
        </XDSText>
        <XDSText type="supporting" color="secondary">
          TypeScript
        </XDSText>
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          background: 'var(--color-background-wash, #F5F6F7)',
        }}>
        <div
          aria-hidden
          style={{
            padding: '12px 0',
            textAlign: 'right',
            userSelect: 'none',
            minWidth: 40,
            flexShrink: 0,
          }}>
          {Array.from({length: lineCount}, (_, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: '20px',
                padding: '0 10px',
                color: 'var(--color-text-quaternary, #BCC0C4)',
              }}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '12px 12px 12px 4px',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: '20px',
            background: 'transparent',
            color: 'var(--color-text-primary, #1C2B33)',
            tabSize: 2,
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
          }}
          onKeyDown={e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const ta = textareaRef.current;
              if (!ta) return;
              const start = ta.selectionStart;
              const end = ta.selectionEnd;
              const val = ta.value;
              setCode(val.substring(0, start) + '  ' + val.substring(end));
              requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export type PointedElement = {
  tagName: string;
  componentName?: string;
  rect?: {x: number; y: number; width: number; height: number};
} | null;

export function ChatPanel({
  isGenerating,
  onSend,
  reply,
  activeView: _activeView,
  setActiveView: _setActiveView,
  templateName,
  onBack,
  activeTab,
  onTabChange,
  pointedElement,
  hideHeader = false,
}: {
  isGenerating: boolean;
  onSend?: (prompt: string) => void;
  reply?: string | null;
  activeView: 'craft' | 'explore' | 'docs' | 'profile' | 'theme';
  setActiveView: (
    view: 'craft' | 'explore' | 'docs' | 'profile' | 'theme',
  ) => void;
  templateName?: string;
  onBack?: () => void;
  activeTab?: PanelTab;
  onTabChange?: (tab: PanelTab) => void;
  pointedElement?: PointedElement;
  hideHeader?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    {role: 'user' | 'assistant'; text: string}[]
  >([]);
  const tab = activeTab ?? 'configure';
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevReplyRef = useRef<string | null>(null);

  useEffect(() => {
    if (reply && reply !== prevReplyRef.current) {
      setMessages(prev => [...prev, {role: 'assistant', text: reply}]);
      prevReplyRef.current = reply;
    }
  }, [reply]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isGenerating]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        width: '100%',
      }}>
      {/* Tab bar (editor mode only) */}
      {!hideHeader && templateName && onTabChange && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 16px',
            borderBottom: 'none',
            flexShrink: 0,
          }}>
          {onBack && (
            <XDSButton
              label="Back"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              isIconOnly
              onClick={onBack}
              style={{flexShrink: 0, marginRight: 4}}
            />
          )}
          {(['configure', 'properties', 'code'] as const).map(t => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom:
                  tab === t
                    ? '2px solid var(--color-text-primary, #111)'
                    : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                textAlign: 'center' as const,
                transition: 'border-color 150ms ease',
              }}>
              <XDSText type="body" color={tab === t ? 'primary' : 'secondary'}>
                {t === 'configure'
                  ? 'Craft'
                  : t === 'properties'
                    ? 'Properties'
                    : 'Code'}
              </XDSText>
            </button>
          ))}
        </div>
      )}

      {/* Configure tab (or default when no tabs) */}
      {(!templateName || !onTabChange || tab === 'configure') && (
        <>
          <div
            ref={scrollAreaRef}
            style={{flex: 1, padding: 16, overflow: 'auto'}}>
            {messages.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 8,
                  textAlign: 'center',
                  padding: '0 24px',
                }}>
                <XDSText type="display-3">
                  What would you
                  <br />
                  like to change?
                </XDSText>
                <XDSText type="body" color="secondary">
                  Describe layout changes, swap components, or ask for a
                  different style.
                </XDSText>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{marginBottom: 16}}>
                <XDSChatMessage
                  sender={msg.role === 'user' ? 'user' : 'assistant'}>
                  <XDSChatMessageBubble>{msg.text}</XDSChatMessageBubble>
                </XDSChatMessage>
              </div>
            ))}
          </div>

          <div
            style={
              {
                padding: 12,
                // Override shadow tokens so the composer body inherits none
                '--shadow-low': 'none',
                '--shadow-med': 'none',
              } as React.CSSProperties
            }>
            <XDSChatComposer
              onSubmit={() => {
                if (!prompt.trim()) return;
                setMessages(prev => [
                  ...prev,
                  {role: 'user', text: prompt.trim()},
                ]);
                onSend?.(prompt);
                setPrompt('');
              }}
              value={prompt}
              onChange={setPrompt}
              placeholder="Ask for changes"
              input={<XDSChatComposerInput placeholder="Ask for changes" />}
              xstyle={composerStyles.border}
              style={
                {
                  '--shadow-low': 'none',
                  '--shadow-med': 'none',
                  '--_chat-composer-radius': 'var(--radius-container)',
                  '--_button-radius': 'var(--radius-full)',
                } as React.CSSProperties
              }
            />
          </div>
        </>
      )}

      {/* Properties tab */}
      {templateName && onTabChange && tab === 'properties' && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: pointedElement ? '16px 16px 32px' : 16,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            ...(pointedElement
              ? {}
              : {alignItems: 'center', justifyContent: 'center'}),
          }}>
          {pointedElement ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 16,
              }}>
              <div>
                <XDSText type="supporting" color="secondary">
                  Element
                </XDSText>
                <XDSText type="body" style={{fontWeight: 600, marginTop: 4}}>
                  {'<'}
                  {pointedElement.tagName.toLowerCase()}
                  {'>'}
                  {pointedElement.componentName && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: 'var(--color-text-secondary, #65676B)',
                        fontWeight: 400,
                      }}>
                      {pointedElement.componentName}
                    </span>
                  )}
                </XDSText>
              </div>
              <XDSDivider variant="strong" />
              <PropertyInputs />
            </div>
          ) : (
            <XDSEmptyState
              icon={
                <CursorIcon
                  style={{
                    width: 32,
                    height: 32,
                    color: 'var(--color-text-quaternary, #BCC0C4)',
                  }}
                />
              }
              title="No element selected"
              description="Click the Point tool in the toolbar, then click an element in the preview"
              isCompact
            />
          )}
        </div>
      )}

      {/* Code tab */}
      {templateName && onTabChange && tab === 'code' && <CodeEditor />}
    </div>
  );
}
