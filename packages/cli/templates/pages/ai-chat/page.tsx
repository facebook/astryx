// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSHStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  XDSChatLayout,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
  XDSChatTokenizedText,
  XDSChatToolCalls,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';

import {AtSymbolIcon, PaperClipIcon} from '@heroicons/react/24/outline';

// ============= TOKENS =============

const MENTION_TOKENS = [
  {value: '@agent', label: '@Agent', variant: 'blue' as const},
];

// ============= SIDENAV =============

// ============= MAIN COMPONENT =============

export default function AIChatConversationTemplate() {
  return (
    <XDSLayout
      height="fill"
      content={
        <XDSLayoutContent padding={0}>
          <XDSChatLayout
            style={{height: '100%'}}
            composer={
              <XDSChatComposer
                onSubmit={() => {}}
                placeholder="Ask anything"
                input={<XDSChatComposerInput />}
                headerActions={
                  <>
                    <XDSButton
                      label="Mention"
                      variant="ghost"
                      size="sm"
                      icon={<XDSIcon icon={AtSymbolIcon} size="sm" />}
                      isIconOnly
                    />
                    <XDSButton
                      label="Attach"
                      variant="ghost"
                      size="sm"
                      icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
                      isIconOnly
                    />
                  </>
                }
              />
            }>
            <XDSChatMessageList>
              {/* ── System message: date divider ── */}
              <XDSChatSystemMessage variant="divider">
                Today
              </XDSChatSystemMessage>

              {/* ── User message with tokenized mention and file attachments ── */}
              <XDSChatMessage sender="user">
                <XDSHStack gap={1} wrap="wrap">
                  <XDSToken label="auth-service.ts" />
                  <XDSToken label="middleware.ts" />
                </XDSHStack>
                <XDSChatMessageBubble
                  metadata={
                    <XDSChatMessageMetadata
                      timestamp={
                        <XDSTimestamp
                          value="2026-04-29T10:15:00"
                          format="time"
                        />
                      }
                    />
                  }>
                  <XDSChatTokenizedText tokens={MENTION_TOKENS}>
                    @agent Can you review these auth files? The JWT refresh
                    logic seems broken — tokens expire but the middleware
                    doesn't catch it.
                  </XDSChatTokenizedText>
                </XDSChatMessageBubble>
              </XDSChatMessage>

              {/* ── Assistant message with tool calls ── */}
              <XDSChatMessage
                sender="assistant"
                avatar={<XDSAvatar name="Agent" size="small" />}>
                <XDSChatMessageBubble variant="ghost" name="Agent">
                  Looking into the auth files now. Let me read through the code
                  and trace the token refresh flow.
                </XDSChatMessageBubble>
                <XDSChatToolCalls
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
                <XDSChatMessageBubble variant="ghost">
                  <XDSMarkdown density="compact">{`Found the issue. In \`middleware.ts\`, the token validation runs **before** the refresh check. When a token expires, the middleware rejects the request immediately instead of attempting a refresh.

Here's the problematic sequence:

1. Request arrives with an expired access token
2. \`validateToken()\` throws \`TokenExpiredError\`
3. The catch block returns \`401\` — never reaching \`refreshToken()\`

The fix is to catch \`TokenExpiredError\` specifically and attempt a refresh before rejecting:`}</XDSMarkdown>
                </XDSChatMessageBubble>

                {/* Code block with the fix */}
                <XDSChatMessageBubble variant="ghost">
                  <XDSCodeBlock
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
                </XDSChatMessageBubble>

                <XDSChatToolCalls
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

                <XDSChatMessageMetadata
                  timestamp={
                    <XDSTimestamp value="2026-04-29T10:15:30" format="time" />
                  }
                  footer={
                    <XDSText type="supporting" color="secondary">
                      Agent
                    </XDSText>
                  }
                />
              </XDSChatMessage>

              {/* ── User multi-bubble follow-up ── */}
              <XDSChatMessage sender="user">
                <XDSChatMessageBubble group="first">
                  Nice catch, that makes sense
                </XDSChatMessageBubble>
                <XDSChatMessageBubble
                  group="last"
                  metadata={
                    <XDSChatMessageMetadata
                      timestamp={
                        <XDSTimestamp
                          value="2026-04-29T10:16:00"
                          format="time"
                        />
                      }
                      status="delivered"
                    />
                  }>
                  Can you also add a test for the refresh path?
                </XDSChatMessageBubble>
              </XDSChatMessage>

              {/* ── Assistant response with test code ── */}
              <XDSChatMessage
                sender="assistant"
                avatar={<XDSAvatar name="Agent" size="small" />}>
                <XDSChatToolCalls
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
                <XDSChatMessageBubble variant="ghost">
                  <XDSMarkdown density="compact">{`Added a test for the refresh flow. All **4 tests** pass:

| Test | Status |
|------|--------|
| Valid token passes through | ✅ |
| Expired token triggers refresh | ✅ |
| Expired token with invalid refresh returns 401 | ✅ |
| Malformed token returns 401 immediately | ✅ |`}</XDSMarkdown>
                </XDSChatMessageBubble>

                <XDSChatMessageBubble variant="ghost">
                  <XDSCodeBlock
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
                </XDSChatMessageBubble>
                <XDSChatMessageMetadata
                  timestamp={
                    <XDSTimestamp value="2026-04-29T10:16:45" format="time" />
                  }
                />
              </XDSChatMessage>

              {/* ── System message: status ── */}
              <XDSChatSystemMessage>
                Changes saved to workspace
              </XDSChatSystemMessage>

              {/* ── User follow-up ── */}
              <XDSChatMessage sender="user">
                <XDSChatMessageBubble
                  metadata={
                    <XDSChatMessageMetadata
                      timestamp={
                        <XDSTimestamp
                          value="2026-04-29T10:17:00"
                          format="time"
                        />
                      }
                    />
                  }>
                  Perfect. Ship it — create a PR with these changes.
                </XDSChatMessageBubble>
              </XDSChatMessage>

              {/* ── Assistant with running tool call ── */}
              <XDSChatMessage
                sender="assistant"
                avatar={<XDSAvatar name="Agent" size="small" />}>
                <XDSChatMessageBubble variant="ghost">
                  On it — pushing the branch and opening a PR now.
                </XDSChatMessageBubble>
                <XDSChatToolCalls
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
              </XDSChatMessage>
            </XDSChatMessageList>
          </XDSChatLayout>
        </XDSLayoutContent>
      }
    />
  );
}
