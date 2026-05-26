// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Community page — contribution guidance + live GitHub contributors.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';
import {GITHUB_REPO} from '../../../constants';

const WIKI_BASE = `${GITHUB_REPO}/wiki`;

const styles = stylex.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  contributorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
});

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/facebookexperimental/xds/contributors?per_page=50',
      {next: {revalidate: 3600}},
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const contributors = await fetchContributors();

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8}>
        {/* Welcome */}
        <XDSVStack gap={3}>
          <XDSHeading level={1}>Contributing</XDSHeading>
          <XDSText type="large" color="secondary">
            XDS has a high bar for what goes in and a clear process for getting
            there. We accept bug fixes, templates, themes, and new components
            via RFC.
          </XDSText>
        </XDSVStack>

        {/* Process overview */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>How It Works</XDSHeading>
          <XDSText type="body">
            Contributing to XDS means contributing to the system — not to a
            single component. Once something is in, it belongs to the
            system&apos;s coherence. API decisions are resolved through vibe
            testing and documented conventions, making them objective and
            reproducible.
          </XDSText>
          <XDSGrid columns={{minWidth: 250, repeat: 'fill'}} gap={3}>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  1. Propose via RFC
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Describe the problem and evidence of demand. We respond within
                  1 week with acceptance or decline.
                </XDSText>
                <XDSLink
                  label="Submit an RFC"
                  href={`${GITHUB_REPO}/issues/new?template=rfc.yml`}
                  isExternalLink>
                  Submit an RFC
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  2. Drive the Spec Protocol
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Either of us drives research, use case enumeration, and API
                  exploration. Contributors can front-load this work.
                </XDSText>
                <XDSLink
                  label="Spec protocol"
                  href={`${WIKI_BASE}/Component-Specification-Protocol`}
                  isExternalLink>
                  Spec protocol
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  3. Implement &amp; Land in Lab
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Build to the design brief. Contributions land in lab for
                  testing. Graduation to core when battle-tested and hardened.
                </XDSText>
              </XDSVStack>
            </XDSCard>
          </XDSGrid>
        </XDSVStack>

        {/* Safe zones */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Start Here (No RFC Needed)</XDSHeading>
          <XDSText type="body" color="secondary">
            These areas are open for direct contributions and don&apos;t require
            the full RFC process:
          </XDSText>
          <XDSGrid columns={{minWidth: 250, repeat: 'fill'}} gap={3}>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Bug Fixes
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Open an issue to confirm the behaviour is a bug, then submit a
                  PR with a test or reproduction case.
                </XDSText>
                <XDSLink
                  label="Report a bug"
                  href={`${GITHUB_REPO}/issues/new?template=bug.yml`}
                  isExternalLink>
                  Report a bug
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Templates &amp; Stories
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Show components in realistic context. Templates are training
                  signal for both humans and LLMs.
                </XDSText>
                <XDSLink
                  label="Template guide"
                  href={`${WIKI_BASE}/Contributing-Templates`}
                  isExternalLink>
                  Template guide
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Themes
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Full visual control through defineTheme(). Token values,
                  component overrides, and mode switching.
                </XDSText>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Documentation
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Fix typos, improve examples, fill gaps. Reviewed for
                  correctness — precision over comprehensiveness.
                </XDSText>
              </XDSVStack>
            </XDSCard>
          </XDSGrid>
        </XDSVStack>

        <XDSDivider />

        {/* Resources */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Resources</XDSHeading>
          <XDSGrid columns={{minWidth: 250, repeat: 'fill'}} gap={3}>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Contributing Guide
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  The full process — what we accept, how API review works, and
                  what to expect.
                </XDSText>
                <XDSLink
                  label="Read the guide"
                  href={`${WIKI_BASE}/Contributing`}
                  isExternalLink>
                  Read the guide
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Contributing with AI
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Using AI assistants effectively within XDS conventions. Safe
                  zones, spec protocol, and common pitfalls.
                </XDSText>
                <XDSLink
                  label="AI guide"
                  href={`${WIKI_BASE}/Contributing-with-AI-Assistants`}
                  isExternalLink>
                  AI guide
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  API Conventions
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Naming rules, prop patterns, composition model. Read before
                  submitting an RFC.
                </XDSText>
                <XDSLink
                  label="Conventions"
                  href={`${WIKI_BASE}/API-Conventions`}
                  isExternalLink>
                  Conventions
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  API Arbitration
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  How we resolve API design disputes with vibe testing. Includes
                  a sample prompt for running your own.
                </XDSText>
                <XDSLink
                  label="Arbitration process"
                  href={`${WIKI_BASE}/API-Arbitration`}
                  isExternalLink>
                  Arbitration process
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Dev Setup
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Clone, install, build, and run Storybook. Everything you need
                  to start developing.
                </XDSText>
                <XDSLink
                  label="Setup guide"
                  href={`${GITHUB_REPO}/blob/main/CONTRIBUTING.md`}
                  isExternalLink>
                  Setup guide
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Code of Conduct
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Community standards for respectful collaboration.
                </XDSText>
                <XDSLink
                  label="View code of conduct"
                  href={`${GITHUB_REPO}/blob/main/CODE_OF_CONDUCT.md`}
                  isExternalLink>
                  View code of conduct
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  License
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  XDS is released under the MIT License.
                </XDSText>
                <XDSLink
                  label="View license"
                  href={`${GITHUB_REPO}/blob/main/LICENSE`}
                  isExternalLink>
                  View license
                </XDSLink>
              </XDSVStack>
            </XDSCard>
          </XDSGrid>
        </XDSVStack>

        <XDSDivider />

        {/* Contributors */}
        <XDSVStack gap={3}>
          <XDSVStack gap={1}>
            <XDSHeading level={2}>Contributors</XDSHeading>
            <XDSText type="body" color="secondary">
              Thank you to everyone who has contributed to XDS. Sorted by number
              of contributions.
            </XDSText>
          </XDSVStack>

          {contributors.length > 0 ? (
            <XDSGrid columns={{minWidth: 280, repeat: 'fill'}} gap={3}>
              {contributors.map(c => (
                <XDSLink
                  key={c.login}
                  href={c.html_url}
                  isExternalLink
                  label={c.login}>
                  <div {...stylex.props(styles.contributorCard)}>
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      {...stylex.props(styles.avatar)}
                    />
                    <XDSVStack gap={0}>
                      <XDSText type="body" weight="semibold">
                        {c.login}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {c.contributions} contribution
                        {c.contributions !== 1 ? 's' : ''}
                      </XDSText>
                    </XDSVStack>
                  </div>
                </XDSLink>
              ))}
            </XDSGrid>
          ) : (
            <XDSText type="body" color="secondary">
              Unable to load contributors. Check back later or view them on{' '}
              <XDSLink
                label="GitHub"
                href={`${GITHUB_REPO}/graphs/contributors`}
                isExternalLink>
                GitHub
              </XDSLink>
              .
            </XDSText>
          )}
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}
