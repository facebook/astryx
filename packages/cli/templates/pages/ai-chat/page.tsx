// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HStack, Layout, LayoutContent} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {
  ChatComposer,
  ChatComposerInput,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatTokenizedText,
  ChatToolCalls,
} from '@xds/core/Chat';
import {Avatar} from '@xds/core/Avatar';
import {Markdown} from '@xds/core/Markdown';
import {CodeBlock} from '@xds/core/CodeBlock';
import {Timestamp} from '@xds/core/Timestamp';
import {Token} from '@xds/core/Token';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';

import {AtSymbolIcon, PaperClipIcon} from '@heroicons/react/24/outline';

// ============= TOKENS =============

const MENTION_TOKENS = [
  {value: '@agent', label: '@Agent', variant: 'blue' as const},
];

// ============= SIDENAV =============

// ============= MAIN COMPONENT =============

export default function AIChatConversationTemplate() {
  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <ChatLayout
            style={{height: '100%'}}
            composer={
              <ChatComposer
                onSubmit={() => {}}
                placeholder="Ask anything"
                input={<ChatComposerInput />}
                headerActions={
                  <>
                    <Button
                      label="Mention"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={AtSymbolIcon} size="sm" />}
                      isIconOnly
                    />
                    <Button
                      label="Attach"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={PaperClipIcon} size="sm" />}
                      isIconOnly
                    />
                  </>
                }
              />
            }>
            <ChatMessageList>
              {/* ── System message: date divider ── */}
              <ChatSystemMessage variant="divider">
                Today
              </ChatSystemMessage>

              {/* ── User message with tokenized mention and file attachments ── */}
              <ChatMessage sender="user">
                <HStack gap={1} wrap="wrap">
                  <Token label="auth-service.ts" />
                  <Token label="middleware.ts" />
                </HStack>
                <ChatMessageBubble
                  metadata={
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp
                          value="2026-04-29T10:15:00"
                          format="time"
                        />
                      }
                    />
                  }>
                  <ChatTokenizedText tokens={MENTION_TOKENS}>
                    @agent Can you review these auth files? The JWT refresh
                    logic seems broken — tokens expire but the middleware
                    doesn't catch it.
                  </ChatTokenizedText>
                </ChatMessageBubble>
              </ChatMessage>

              {/* ── Assistant message with tool calls ── */}
              <ChatMessage
                sender="assistant"
                avatar={<Avatar name="Agent" size="small" />}>
                <ChatMessageBubble variant="ghost" name="Agent">
                  Looking into the auth files now. Let me read through the code
                  and trace the token refresh flow.
                </ChatMessageBubble>
                <ChatToolCalls
                  defaultIsExpanded
                  calls={[
                    {
                      name: 'read',
                      target: 'auth-service.ts',
                      status: 'complete',
                      duration: '45ms',
                    },
                    {
                      name: 'read',
                      target: 'middleware.ts',
                      status: 'complete',
                      duration: '38ms',
                    },
                    {
                      name: 'bash',
                      target: 'grep -rn "refreshToken" src/',
                      status: 'complete',
                      duration: '120ms',
                      node: 'cli:remote-server',
                    },
                  ]}
                />

                {/* Markdown response with analysis */}
                <ChatMessageBubble variant="ghost">
                  <Markdown density="compact">{`Found the issue. In \`middleware.ts\`, the token validation runs **before** the refresh check. When a token expires, the middleware rejects the request immediately instead of attempting a refresh.

Here's the problematic sequence:

1. Request arrives with an expired access token
2. \`validateToken()\` throws \`TokenExpiredError\`
3. The catch block returns \`401\` — never reaching \`refreshToken()\`

The fix is to catch \`TokenExpiredError\` specifically and attempt a refresh before rejecting:`}</Markdown>
                </ChatMessageBubble>

                {/* Code block with the fix */}
                <ChatMessageBubble variant="ghost">
                  <CodeBlock
                    title="middleware.ts"
                    language="typescript"
                    code={`async function authMiddleware(req: Request) {
  try {
    const decoded = validateToken(req.headers.authorization);
    req.user = decoded;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      // Attempt silent refresh before rejecting
      const refreshed = await refreshToken(req.cookies.refreshToken);
      if (refreshed) {
        req.user = refreshed.user;
        req.newAccessToken = refreshed.accessToken;
        return next(req);
      }
    }
    return new Response('Unauthorized', { status: 401 });
  }
  return next(req);
}`}
                  />
                </ChatMessageBubble>

                <ChatToolCalls
                  calls={[
                    {
                      name: 'edit',
                      target: 'middleware.ts',
                      status: 'complete',
                      duration: '85ms',
                      additions: 8,
                      deletions: 2,
                    },
                  ]}
                />

                <ChatMessageMetadata
                  timestamp={
                    <Timestamp value="2026-04-29T10:15:30" format="time" />
                  }
                  footer={
                    <Text type="supporting" color="secondary">
                      Agent
                    </Text>
                  }
                />
              </ChatMessage>

              {/* ── User multi-bubble follow-up ── */}
              <ChatMessage sender="user">
                <ChatMessageBubble group="first">
                  Nice catch, that makes sense
                </ChatMessageBubble>
                <ChatMessageBubble
                  group="last"
                  metadata={
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp
                          value="2026-04-29T10:16:00"
                          format="time"
                        />
                      }
                      status="delivered"
                    />
                  }>
                  Can you also add a test for the refresh path?
                </ChatMessageBubble>
              </ChatMessage>

              {/* ── Assistant response with test code ── */}
              <ChatMessage
                sender="assistant"
                avatar={<Avatar name="Agent" size="small" />}>
                <ChatToolCalls
                  defaultIsExpanded
                  calls={[
                    {
                      name: 'read',
                      target: 'middleware.test.ts',
                      status: 'complete',
                      duration: '32ms',
                    },
                    {
                      name: 'edit',
                      target: 'middleware.test.ts',
                      status: 'complete',
                      duration: '110ms',
                      additions: 24,
                      deletions: 0,
                    },
                    {
                      name: 'bash',
                      target: 'yarn test middleware',
                      status: 'complete',
                      duration: '3.2s',
                      node: 'cli:remote-server',
                    },
                  ]}
                />
                <ChatMessageBubble variant="ghost">
                  <Markdown density="compact">{`Added a test for the refresh flow. All **4 tests** pass:

| Test | Status |
|------|--------|
| Valid token passes through | ✅ |
| Expired token triggers refresh | ✅ |
| Expired token with invalid refresh returns 401 | ✅ |
| Malformed token returns 401 immediately | ✅ |`}</Markdown>
                </ChatMessageBubble>

                <ChatMessageBubble variant="ghost">
                  <CodeBlock
                    title="middleware.test.ts"
                    language="typescript"
                    code={`describe('authMiddleware', () => {
  it('refreshes an expired token silently', async () => {
    const expiredToken = createExpiredJWT(mockUser);
    const validRefresh = createRefreshToken(mockUser);

    const req = mockRequest({
      authorization: \`Bearer \${expiredToken}\`,
      cookies: { refreshToken: validRefresh },
    });

    const res = await authMiddleware(req);

    expect(res.status).toBe(200);
    expect(req.user.id).toBe(mockUser.id);
    expect(req.newAccessToken).toBeDefined();
  });
});`}
                  />
                </ChatMessageBubble>
                <ChatMessageMetadata
                  timestamp={
                    <Timestamp value="2026-04-29T10:16:45" format="time" />
                  }
                />
              </ChatMessage>

              {/* ── System message: status ── */}
              <ChatSystemMessage>
                Changes saved to workspace
              </ChatSystemMessage>

              {/* ── User follow-up ── */}
              <ChatMessage sender="user">
                <ChatMessageBubble
                  metadata={
                    <ChatMessageMetadata
                      timestamp={
                        <Timestamp
                          value="2026-04-29T10:17:00"
                          format="time"
                        />
                      }
                    />
                  }>
                  Perfect. Ship it — create a PR with these changes.
                </ChatMessageBubble>
              </ChatMessage>

              {/* ── Assistant with running tool call ── */}
              <ChatMessage
                sender="assistant"
                avatar={<Avatar name="Agent" size="small" />}>
                <ChatMessageBubble variant="ghost">
                  On it — pushing the branch and opening a PR now.
                </ChatMessageBubble>
                <ChatToolCalls
                  calls={[
                    {
                      name: 'bash',
                      target: 'git push -u origin fix/jwt-refresh',
                      status: 'complete',
                      duration: '1.8s',
                      node: 'cli:remote-server',
                    },
                    {
                      name: 'bash',
                      target: 'gh pr create --title "fix: handle expired JWT…"',
                      status: 'running',
                      node: 'cli:remote-server',
                    },
                  ]}
                />
              </ChatMessage>
            </ChatMessageList>
          </ChatLayout>
        </LayoutContent>
      }
    />
  );
}
