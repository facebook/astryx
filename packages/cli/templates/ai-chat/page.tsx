'use client';

import {useRef, useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSChatComposer, XDSChatComposerAttachments, XDSChatComposerInput, type XDSChatComposerInputHandle} from '@xds/core/Chat';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid} from '@xds/core/Grid';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  ChatBubbleOvalLeftIcon,
  FolderIcon,
  DocumentTextIcon,
  CubeIcon,
  Cog6ToothIcon,
  AtSymbolIcon,
  SparklesIcon,
  PencilSquareIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  ClockIcon,
  PaperClipIcon,
  MicrophoneIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import {
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';

const TOKEN_MODES: Record<string, string> = {
  sensitive: '/sensitive',
  deep: '/deep-mode',
};

// Suggestion prompts per category
const CATEGORY_SUGGESTIONS: Record<
  string,
  Array<{heading: string; body: string; prompt: string}>
> = {
  writing: [
    {heading: 'Draft a professional email', body: 'Compose a clear, polished email for any audience', prompt: 'Help me draft a professional email'},
    {heading: 'Improve my writing', body: 'Enhance the clarity, tone, and flow of my text', prompt: 'Review and improve the following text:'},
    {heading: 'Create a project proposal', body: 'Write a proposal with goals, timeline, and deliverables', prompt: 'Help me write a project proposal for'},
    {heading: 'Summarize a document', body: 'Condense a long document into key takeaways', prompt: 'Summarize the following document into key points:'},
  ],
  coding: [
    {heading: 'Debug my code', body: 'Find and fix issues in a code snippet', prompt: 'Help me debug the following code:'},
    {heading: 'Write a function', body: 'Generate a well-typed function with error handling', prompt: 'Write a function that'},
    {heading: 'Explain this code', body: 'Break down complex code into understandable pieces', prompt: 'Explain what the following code does:'},
    {heading: 'Review my pull request', body: 'Check for bugs, performance, and best practices', prompt: 'Review this code for bugs and improvements:'},
  ],
  research: [
    {heading: 'Compare options', body: 'Analyze pros and cons of different approaches', prompt: 'Compare the pros and cons of'},
    {heading: 'Explain a concept', body: 'Break down a complex topic in simple terms', prompt: 'Explain the concept of'},
    {heading: 'Find best practices', body: 'Research standards and recommended approaches', prompt: 'What are the best practices for'},
    {heading: 'Summarize findings', body: 'Compile research into a structured overview', prompt: 'Summarize the key findings on'},
  ],
  creative: [
    {heading: 'Brainstorm ideas', body: 'Generate creative concepts for a project', prompt: 'Brainstorm ideas for'},
    {heading: 'Write a story', body: 'Create an engaging narrative with characters', prompt: 'Write a short story about'},
    {heading: 'Design a concept', body: 'Explore product or visual design ideas', prompt: 'Help me design a concept for'},
    {heading: 'Create a tagline', body: 'Craft a memorable phrase for a brand or product', prompt: 'Create a catchy tagline for'},
  ],
};

// Shared category definitions used by both toggle group and mode menu
const CATEGORIES = [
  {key: 'writing', label: 'Writing', icon: PencilSquareIcon},
  {key: 'coding', label: 'Coding', icon: CodeBracketIcon},
  {key: 'research', label: 'Research', icon: MagnifyingGlassIcon},
  {key: 'creative', label: 'Creative', icon: LightBulbIcon},
] as const;

// Mode options for the dropdown (categories + special modes)
const MODE_OPTIONS = [
  {key: 'auto', label: 'Auto', icon: SparklesIcon},
  ...CATEGORIES,
  {key: 'sensitive', label: 'Sensitive', icon: LockClosedIcon},
  {key: 'deep', label: 'Deep Mode', icon: ClockIcon},
] as const;

// ============= SIDENAV =============

function AIChatSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
          }
          heading="My App"
          headingHref="/"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="AI Chat"
          icon={ChatBubbleOvalLeftIcon}
          selectedIcon={ChatBubbleOvalLeftIconSolid}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          selectedIcon={FolderIconSolid}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
          endContent={<XDSBadge label="3" />}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="All Documents"
          icon={DocumentTextIcon}
          isSelected={active === 'documents'}
          onClick={() => setActive('documents')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ============= MAIN COMPONENT =============

export default function AIChatTemplate() {
  const [mode, setMode] = useState<string | null>('auto');
  const [category, setCategory] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<XDSChatComposerInputHandle>(null);
  const shouldFocusComposerRef = useRef(false);
  const activeMode = MODE_OPTIONS.find(m => m.key === mode) ?? MODE_OPTIONS[0];
  const suggestions = category ? CATEGORY_SUGGESTIONS[category] : null;

  const appendSuggestion = (prompt: string) => {
    const input = composerInputRef.current;
    if (!input) return;
    input.focus();
    // Move cursor to end so text is always appended
    const sel = window.getSelection();
    if (sel) {
      sel.selectAllChildren(document.activeElement!);
      sel.collapseToEnd();
    }
    input.insertText(prompt);
    // Dispatch input event to trigger emitChange and clear placeholder
    document.activeElement?.dispatchEvent(
      new Event('input', {bubbles: true}),
    );
  };

  return (
    <XDSAppShell sideNav={<AIChatSideNav />} variant="elevated">
      <XDSVStack
        gap={8}
        style={{
          maxWidth: 720,
          margin: '0 auto',
          paddingBlock: 'var(--spacing-8)',
          paddingInline: 'var(--spacing-4)',
          minHeight: '100%',
          justifyContent: 'center',
        }}>
        {/* Greeting */}
        <XDSVStack gap={1} style={{paddingInline: 'var(--spacing-4)'}}>
          <XDSHStack gap={2} vAlign="center">
            <SparklesIcon style={{width: 20, height: 20, color: 'var(--color-primary, #5B5BD6)'}} />
            <XDSText type="large" as="h2">Hi, Andrew</XDSText>
          </XDSHStack>
          <XDSText type="display-2" as="h1">Where should we start?</XDSText>
        </XDSVStack>

        {/* Composer */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{display: 'none'}}
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            setAttachments(prev => [...prev, ...files.map(f => f.name)]);
            e.target.value = '';
          }}
        />
        <XDSChatComposer
          onSubmit={() => {}}
          placeholder="Ask anything"
          input={<XDSChatComposerInput ref={composerInputRef} style={{minHeight: '44px'}} />}
          attachments={
            attachments.length > 0 ? (
              <XDSChatComposerAttachments>
                {attachments.map((name, i) => (
                  <XDSToken
                    key={i}
                    label={name}
                    onRemove={() =>
                      setAttachments(prev => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </XDSChatComposerAttachments>
            ) : undefined
          }
          headerActions={
            <>
              <XDSButton
                label="Reference"
                variant="ghost"
                size="sm"
                icon={<AtSymbolIcon style={{width: 16, height: 16}} />}
                isIconOnly
                onClick={() => {
                  const input = composerInputRef.current;
                  if (!input) return;
                  input.focus();
                  const sel = window.getSelection();
                  if (sel) {
                    sel.selectAllChildren(document.activeElement!);
                    sel.collapseToEnd();
                  }
                  input.insertText('@');
                  document.activeElement?.dispatchEvent(
                    new Event('input', {bubbles: true}),
                  );
                }}
              />
              <XDSButton
                label="Attach"
                variant="ghost"
                size="sm"
                icon={<PaperClipIcon style={{width: 16, height: 16}} />}
                isIconOnly
                onClick={() => fileInputRef.current?.click()}
              />
            </>
          }
          footerActions={
            <>
              <XDSDropdownMenu
                button={{
                  label: activeMode.label,
                  variant: 'ghost',
                  size: 'md',
                  icon: <activeMode.icon style={{width: 16, height: 16}} />,
                  children: activeMode.label,
                }}
                menuWidth={200}
                isMenuOpen={isModeMenuOpen}
                onOpenChange={isOpen => {
                  setIsModeMenuOpen(isOpen);
                  if (!isOpen && shouldFocusComposerRef.current) {
                    shouldFocusComposerRef.current = false;
                    // Delay focus until after menu restores focus to its trigger button
                    setTimeout(() => {
                      composerInputRef.current?.focus();
                    }, 50);
                  }
                }}
                items={MODE_OPTIONS.flatMap(opt => {
                  const item = {
                    label: opt.label,
                    icon: opt.icon,
                    onClick: () => {
                      const tokenLabel = TOKEN_MODES[opt.key];
                      if (tokenLabel) {
                        composerInputRef.current?.focus();
                        composerInputRef.current?.insertToken({
                          value: tokenLabel,
                          label: tokenLabel,
                          variant: 'orange',
                        });
                        // Dispatch input event to trigger emitChange and clear placeholder
                        document.activeElement?.dispatchEvent(
                          new Event('input', {bubbles: true}),
                        );
                        shouldFocusComposerRef.current = true;
                      } else {
                        setMode(opt.key);
                      }
                    },
                  };
                  return opt.key === 'sensitive'
                    ? [{type: 'divider' as const}, item]
                    : [item];
                })}
              />
              <XDSDropdownMenu
                button={{
                  label: 'Settings',
                  variant: 'ghost',
                  size: 'md',
                  icon: <Cog6ToothIcon style={{width: 16, height: 16}} />,
                  children: 'Settings',
                }}
                menuWidth={200}
                items={[
                  {label: 'Preferences', onClick: () => {}},
                  {label: 'Keyboard shortcuts', onClick: () => {}},
                  {label: 'About', onClick: () => {}},
                ]}
              />
            </>
          }
          sendActions={
            <XDSButton
              label="Voice input"
              variant="ghost"
              size="md"
              icon={<MicrophoneIcon style={{width: 16, height: 16}} />}
              isIconOnly
            />
          }
        />

        {/* Category toggle buttons */}
        <XDSVStack gap={6} style={{paddingInline: 'var(--spacing-3)'}}>
          <XDSToggleButtonGroup
            label="Category"
            value={category}
            onChange={setCategory}
            size="lg">
            {CATEGORIES.map(cat => (
              <XDSToggleButton
                key={cat.key}
                value={cat.key}
                label={cat.label}
                icon={<cat.icon style={{width: 16, height: 16}} />}
              />
            ))}
          </XDSToggleButtonGroup>

          {/* Suggestion cards */}
          {suggestions && (
            <XDSGrid
              minChildWidth={280}
              gap={3}>
              {suggestions.map(suggestion => (
                <XDSCard
                  variant="muted"
                  key={suggestion.heading}
                  padding={3}
                  style={{cursor: 'pointer'}}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    appendSuggestion(suggestion.prompt);
                    setMode(category);
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      appendSuggestion(suggestion.prompt);
                      setMode(category);
                    }
                  }}>
                  <XDSVStack gap={0.5}>
                    <XDSHeading level={4}>{suggestion.heading}</XDSHeading>
                    <XDSText type="body" color="secondary" size="xsm">
                      {suggestion.body}
                    </XDSText>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          )}
        </XDSVStack>
      </XDSVStack>
    </XDSAppShell>
  );
}
