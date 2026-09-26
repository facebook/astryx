import{J as e,Z as t,q as n}from"./padding.stylex-C-GcuG1E.js";import{t as r}from"./Text-CsUl7g2v.js";import{t as i}from"./Icon-ChU1PKYl.js";import{t as a}from"./Heading-C3NkA3UX.js";import{t as o}from"./Button-D6YzhpPU.js";import{n as s,t as c}from"./LayoutContent-Bxqq0ePR.js";import{t as l}from"./Section-C90bs_CQ.js";import{t as u}from"./DialogHeader-CSoP8nEV.js";import{t as d}from"./StackItem-DR9d8ING.js";import{t as ee}from"./Card-BT-dRL-n.js";import{t as f}from"./Token-Cr0O-0rU.js";import{A as p,M as m,N as h,R as g,ft as _,k as v,pt as y}from"./index-BvsTu2Ox.js";import{n as te,t as b}from"./ChatComposer-VoPRcaJ2.js";import{t as x}from"./ChatTokenizedText-fqvcLv_c.js";import{t as S}from"./ChatMessageList-Czj7B90F.js";import{n as C,t as w}from"./ChatMessageBubble-3Y6OkOQI.js";import{t as T}from"./ChatMessageMetadata-Cagt6sio.js";import{t as E}from"./ChatSystemMessage-C6NXjCQo.js";import{t as ne}from"./ChatLayout-B8AO0r6F.js";import{t as D}from"./ChatToolCalls-Bh5oeDWe.js";import{t as O}from"./Avatar-sbEPe38j.js";import{t as k}from"./Markdown-BFJO3DB3.js";import{t as A}from"./AtSymbolIcon-BgbxZF8K.js";import{t as j}from"./ChevronRightIcon-Bq6NcL3K.js";import{t as M}from"./ClipboardDocumentIcon-CNjevVRz.js";import{t as N}from"./DocumentTextIcon-DJbUARAn.js";import{t as P}from"./PaperClipIcon-DxKC-JgB.js";import{t as F}from"./ShareIcon-BASEcE_W.js";import{t as I}from"./XMarkIcon-C_Pb3Ofj.js";import{t as L}from"./Timestamp-C6ZTK6Jj.js";import{t as R}from"./ClickableCard-BDZ1Jvs5.js";import{t as z}from"./MoreMenu-CdZMk0NU.js";import{t as B}from"./Toolbar-NMMLinVY.js";var V=t(e(),1),H=n(),U=767,W={height:`100dvh`,width:`100%`,containerType:`inline-size`,containerName:`artifact`},G={flex:1,width:`100%`,minWidth:0,height:`100%`},K={flex:1,minHeight:0},q={flex:1,overflowY:`auto`},J={maxWidth:720,marginInline:`auto`},Y=e=>({"--artifact-panel-width":typeof e==`number`?`${e}px`:e}),X=`
.ai-chat-resize-handle {
  display: flex;
}
.ai-chat-artifact-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: var(--artifact-panel-width);
  flex-shrink: 0;
}
@container artifact (max-width: ${U}px) {
  .ai-chat-resize-handle {
    display: none;
  }
  .ai-chat-artifact-panel {
    display: none;
    width: 100%;
    flex-shrink: 1;
  }
}
`,re=[{value:`@agent`,label:`@Agent`,variant:`blue`}],Z=`JWT Token Refresh: Design & Rollout`,Q=`Document · Updated just now`,ie=`## Overview

Our API gateway authenticates every request with a short-lived JWT access token. Until now, an expired token meant an immediate \`401\` — even when the user still held a valid refresh token. This document describes the silent-refresh flow we just shipped and how we're rolling it out.

## The Problem

Token validation ran **before** any refresh logic, so the middleware rejected expired tokens outright:

1. A request arrives with an expired access token
2. \`validateToken()\` throws \`TokenExpiredError\`
3. The catch block returns \`401\` — \`refreshToken()\` is never reached

The result was users getting logged out whenever an access token lapsed mid-session.

## The Fix

The middleware now catches \`TokenExpiredError\` specifically and attempts a silent refresh before rejecting. On success it reissues an access token and continues the request; on failure it falls back to \`401\`.

- **Transparent** — valid sessions never see an interruption
- **Safe** — a missing or invalid refresh token still returns \`401\`
- **Cheap** — refresh only runs on the expiry path, not on every request

## Testing

The refresh path is covered end to end:

| Scenario | Expected |
|----------|----------|
| Valid token passes through | \`200\` |
| Expired token, valid refresh | \`200\` + new access token |
| Expired token, invalid refresh | \`401\` |
| Malformed token | \`401\` |

## Rollout & Monitoring

1. Ship behind the \`silent_refresh\` flag at 5% of traffic
2. Watch the \`auth.refresh.success\` and \`auth.refresh.failure\` counters
3. Alert if the failure rate exceeds **2%** over any 5-minute window
4. Ramp to 100% once metrics hold steady for 24 hours`;function ae({onClose:e}){return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(g,{button:{label:`v2`,variant:`ghost`,size:`sm`},items:[{label:`v2 (current)`},{label:`v1`}]}),(0,H.jsx)(o,{label:`Copy`,variant:`ghost`,size:`sm`,icon:(0,H.jsx)(i,{icon:M,size:`sm`}),isIconOnly:!0}),(0,H.jsx)(o,{label:`Share`,variant:`ghost`,size:`sm`,icon:(0,H.jsx)(i,{icon:F,size:`sm`}),isIconOnly:!0}),e!=null&&(0,H.jsx)(o,{label:`Close document`,variant:`ghost`,size:`sm`,icon:(0,H.jsx)(i,{icon:I,size:`sm`}),isIconOnly:!0,onClick:e})]})}function oe(){return(0,H.jsx)(z,{label:`Document actions`,size:`sm`,items:[{type:`section`,title:`Version`,items:[{label:`v2 (current)`,onClick:()=>{}},{label:`v1`,onClick:()=>{}}]},{type:`divider`},{label:`Copy`,icon:M},{label:`Share`,icon:F}]})}function $(){return(0,H.jsx)(l,{variant:`transparent`,style:q,children:(0,H.jsxs)(v,{gap:2,style:J,children:[(0,H.jsx)(a,{level:1,children:Z}),(0,H.jsx)(k,{children:ie})]})})}function se({onOpen:e}){return(0,H.jsx)(R,{label:`Open ${Z}`,onClick:e,variant:`muted`,padding:3,maxWidth:360,children:(0,H.jsxs)(p,{gap:3,vAlign:`center`,width:`100%`,children:[(0,H.jsx)(i,{icon:N,size:`md`,color:`secondary`}),(0,H.jsx)(d,{size:`fill`,children:(0,H.jsxs)(v,{gap:0,children:[(0,H.jsx)(r,{type:`label`,weight:`semibold`,children:Z}),(0,H.jsx)(r,{type:`supporting`,color:`secondary`,children:`Document`})]})}),(0,H.jsx)(i,{icon:j,size:`sm`,color:`secondary`})]})})}function ce(){let[e,t]=(0,V.useState)(`ask`),[n,a]=(0,V.useState)(!1),[l,d]=(0,V.useState)(!0),j=(0,V.useRef)(null),M=y({defaultSize:640,minSize:480,maxSize:960,autoSaveId:`ai-chat-artifact-panel`});return(0,H.jsxs)(v,{ref:j,style:W,children:[(0,H.jsx)(`style`,{children:X}),(0,H.jsx)(s,{height:`fill`,content:(0,H.jsx)(c,{padding:0,children:(0,H.jsxs)(p,{height:`100%`,children:[(0,H.jsx)(v,{style:G,children:(0,H.jsx)(ne,{density:`spacious`,style:K,composer:(0,H.jsx)(b,{onSubmit:()=>{},placeholder:e===`ask`?`Ask anything...`:`Describe your edit...`,input:(0,H.jsx)(te,{}),headerActions:(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(o,{label:`Mention`,variant:`ghost`,size:`sm`,icon:(0,H.jsx)(i,{icon:A,size:`sm`}),isIconOnly:!0}),(0,H.jsx)(o,{label:`Attach`,variant:`ghost`,size:`sm`,icon:(0,H.jsx)(i,{icon:P,size:`sm`}),isIconOnly:!0})]}),footerActions:(0,H.jsx)(g,{button:{label:e===`ask`?`Ask`:`Edit`,variant:`ghost`,size:`sm`},items:[{label:`Ask`,onClick:()=>t(`ask`)},{label:`Edit`,onClick:()=>t(`edit`)}]})}),children:(0,H.jsxs)(S,{children:[(0,H.jsx)(E,{variant:`divider`,children:`Today`}),(0,H.jsxs)(C,{sender:`user`,children:[(0,H.jsxs)(p,{gap:1,wrap:`wrap`,children:[(0,H.jsx)(f,{label:`auth-service.ts`}),(0,H.jsx)(f,{label:`middleware.ts`})]}),(0,H.jsx)(w,{metadata:(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:15:00`,format:`time`})}),children:(0,H.jsx)(x,{tokens:re,children:`@agent Can you review these auth files? The JWT refresh logic seems broken — tokens expire but the middleware doesn't catch it.`})})]}),(0,H.jsxs)(C,{sender:`assistant`,avatar:(0,H.jsx)(O,{name:`Agent`,size:`md`}),children:[(0,H.jsx)(w,{variant:`ghost`,children:`Looking into the auth files now. Let me read through the code and trace the token refresh flow.`}),(0,H.jsx)(D,{defaultIsExpanded:!0,calls:[{name:`read`,target:`auth-service.ts`,status:`complete`,duration:`45ms`},{name:`read`,target:`middleware.ts`,status:`complete`,duration:`38ms`},{name:`bash`,target:`grep -rn "refreshToken" src/`,status:`complete`,duration:`120ms`,node:`cli:remote-server`}]}),(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(k,{density:`compact`,children:"Found the issue. In `middleware.ts`, the token validation runs **before** the refresh check. When a token expires, the middleware rejects the request immediately instead of attempting a refresh.\n\nHere's the problematic sequence:\n\n1. Request arrives with an expired access token\n2. `validateToken()` throws `TokenExpiredError`\n3. The catch block returns `401` — never reaching `refreshToken()`\n\nThe fix is to catch `TokenExpiredError` specifically and attempt a refresh before rejecting:"})}),(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(h,{title:`middleware.ts`,language:`typescript`,code:`async function authMiddleware(req: Request) {
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
}`})}),(0,H.jsx)(D,{calls:[{name:`edit`,target:`middleware.ts`,status:`complete`,duration:`85ms`,additions:8,deletions:2}]}),(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:15:30`,format:`time`}),footer:(0,H.jsx)(r,{type:`supporting`,color:`secondary`,children:`Agent`})})]}),(0,H.jsxs)(C,{sender:`user`,children:[(0,H.jsx)(w,{group:`first`,children:`Nice catch, that makes sense`}),(0,H.jsx)(w,{group:`last`,metadata:(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:16:00`,format:`time`}),status:`delivered`}),children:`Can you also add a test for the refresh path?`})]}),(0,H.jsxs)(C,{sender:`assistant`,avatar:(0,H.jsx)(O,{name:`Agent`,size:`md`}),children:[(0,H.jsx)(D,{defaultIsExpanded:!0,calls:[{name:`read`,target:`middleware.test.ts`,status:`complete`,duration:`32ms`},{name:`edit`,target:`middleware.test.ts`,status:`complete`,duration:`110ms`,additions:24,deletions:0},{name:`bash`,target:`yarn test middleware`,status:`complete`,duration:`3.2s`,node:`cli:remote-server`}]}),(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(k,{density:`compact`,children:`Added a test for the refresh flow. All **4 tests** pass:

| Test | Status |
|------|--------|
| Valid token passes through | ✅ |
| Expired token triggers refresh | ✅ |
| Expired token with invalid refresh returns 401 | ✅ |
| Malformed token returns 401 immediately | ✅ |`})}),(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(h,{title:`middleware.test.ts`,language:`typescript`,code:`describe('authMiddleware', () => {
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
});`})}),(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:16:45`,format:`time`})})]}),(0,H.jsx)(E,{children:`Changes saved to workspace`}),(0,H.jsx)(C,{sender:`user`,children:(0,H.jsx)(w,{metadata:(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:18:00`,format:`time`})}),children:`Looks solid. Before I open the PR, can you write up a short design doc explaining the token-refresh flow for the team?`})}),(0,H.jsxs)(C,{sender:`assistant`,avatar:(0,H.jsx)(O,{name:`Agent`,size:`md`}),children:[(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(k,{density:`compact`,children:`I've drafted a design doc covering the problem, the fix, and the test matrix — pulling straight from the changes we just made.

Open the document below to review it. Want me to expand any section?`})}),(0,H.jsx)(w,{variant:`ghost`,width:`100%`,metadata:(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:18:40`,format:`time`})}),children:(0,H.jsx)(se,{onOpen:()=>{(j.current?.offsetWidth??1/0)<=U?a(!0):d(!0)}})})]}),(0,H.jsx)(C,{sender:`user`,children:(0,H.jsx)(w,{metadata:(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:20:00`,format:`time`}),status:`delivered`}),children:`This is great. Can you add a section on rollout and monitoring at the end?`})}),(0,H.jsxs)(C,{sender:`assistant`,avatar:(0,H.jsx)(O,{name:`Agent`,size:`md`}),children:[(0,H.jsx)(w,{variant:`ghost`,children:(0,H.jsx)(k,{density:`compact`,children:`On it — adding a **Rollout & Monitoring** section with a staged flag ramp and the alert thresholds. Updating the document now.`})}),(0,H.jsx)(D,{calls:[{name:`edit`,target:`docs/token-refresh.md`,status:`running`,node:`cli:remote-server`}]}),(0,H.jsx)(T,{timestamp:(0,H.jsx)(L,{value:`2026-04-29T10:20:30`,format:`time`})})]})]})})}),l&&(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(_,{direction:`horizontal`,resizable:M.props,isReversed:!0,pillPlacement:`start`,hasDivider:!0,label:`Resize artifact panel`,className:`ai-chat-resize-handle`}),(0,H.jsxs)(ee,{variant:`transparent`,height:`100%`,className:`ai-chat-artifact-panel`,style:Y(M.size),children:[(0,H.jsx)(B,{label:`Artifact actions`,dividers:[`bottom`],startContent:(0,H.jsxs)(p,{gap:3,vAlign:`center`,children:[(0,H.jsx)(i,{icon:N,size:`sm`,color:`secondary`}),(0,H.jsxs)(v,{gap:0,children:[(0,H.jsx)(r,{type:`label`,weight:`semibold`,children:Z}),(0,H.jsx)(r,{type:`supporting`,color:`secondary`,children:Q})]})]}),endContent:(0,H.jsx)(ae,{onClose:()=>d(!1)})}),(0,H.jsx)($,{})]})]})]})})}),(0,H.jsx)(m,{isOpen:n,onOpenChange:a,purpose:`info`,variant:`fullscreen`,children:(0,H.jsx)(s,{header:(0,H.jsx)(u,{title:Z,subtitle:Q,hasDivider:!0,onOpenChange:a,endContent:(0,H.jsx)(oe,{})}),content:(0,H.jsx)(c,{padding:0,children:(0,H.jsx)($,{})})})})]})}export{ce as default};