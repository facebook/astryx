/**
 * @file max-non-xds-elements.test.mjs
 */
import { RuleTester } from 'eslint';
import rule from './max-non-xds-elements.js';

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('max-non-xds-elements', rule, {
  valid: [
    // Under limit: 3 divs is OK with max=3
    {
      code: `
        export default function Template() {
          return (
            <XDSAppShell>
              <div><div><div>content</div></div></div>
            </XDSAppShell>
          );
        }
      `,
      options: [{ max: 3 }],
    },
    // Zero HTML — pure XDS
    {
      code: `
        export default function Template() {
          return (
            <XDSAppShell>
              <XDSVStack gap={4}>
                <XDSCard><XDSText>Hello</XDSText></XDSCard>
              </XDSVStack>
            </XDSAppShell>
          );
        }
      `,
      options: [{ max: 3 }],
    },
    // Allowed tags don't count
    {
      code: `
        export default function Template() {
          return (
            <XDSCard>
              <img src="photo.jpg" />
              <img src="photo2.jpg" />
              <img src="photo3.jpg" />
              <img src="photo4.jpg" />
            </XDSCard>
          );
        }
      `,
      options: [{ max: 3, allowedTags: ['img'] }],
    },
  ],
  invalid: [
    // Over limit: 4 divs with max=3
    {
      code: `
        export default function Template() {
          return (
            <div><div><div><div>content</div></div></div></div>
          );
        }
      `,
      options: [{ max: 3 }],
      errors: [{ messageId: 'tooManyHtmlElements' }],
    },
    // Mixed tags over limit
    {
      code: `
        export default function Template() {
          return (
            <div>
              <span>text</span>
              <button>click</button>
              <nav>sidebar</nav>
            </div>
          );
        }
      `,
      options: [{ max: 3 }],
      errors: [{ messageId: 'tooManyHtmlElements' }],
    },
  ],
});

console.log('max-non-xds-elements: all tests passed');
