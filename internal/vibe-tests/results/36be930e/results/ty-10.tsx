import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Avatar} from '@astryxdesign/core/Avatar';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  article: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 24,
  },
  heroImage: {
    width: '100%',
    height: 400,
    objectFit: 'cover',
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  pullQuote: {
    borderLeft: '4px solid #333',
    paddingLeft: 24,
    margin: '32px 0',
    fontStyle: 'italic',
  },
});

export default function ArticlePage() {
  return (
    <div {...stylex.props(styles.article)}>
      <VStack gap={4}>
        <Heading level={1} type="display-1">
          The Future of Design Systems in Modern Web Development
        </Heading>
        <Text type="large" color="secondary">
          How component libraries are reshaping the way teams build consistent, accessible user interfaces at scale.
        </Text>
        <HStack gap={2} vAlign="center">
          <Avatar name="Sarah Chen" size="md" />
          <VStack gap={0.5}>
            <Text type="label">Sarah Chen</Text>
            <Text type="supporting" color="secondary">
              Published Jan 15, 2024 · 8 min read
            </Text>
          </VStack>
        </HStack>
        <div {...stylex.props(styles.divider)} />
        <img
          {...stylex.props(styles.heroImage)}
          src="https://picsum.photos/1200/600?random=10"
          alt="Design system components arranged on a canvas"
        />
        <Text as="p">
          Design systems have become the foundation of modern web development. They provide a shared language between designers and developers, ensuring consistency across products and reducing duplication of effort.
        </Text>
        <Text as="p">
          At their core, design systems are collections of reusable components, guided by clear standards, that can be assembled to build any number of applications. But they are more than just component libraries.
        </Text>
        <Heading level={2}>The Evolution of Component Architecture</Heading>
        <Text as="p">
          The shift from monolithic CSS frameworks to modular component systems reflects a broader trend in software engineering toward composability and reuse. Modern design systems embrace this philosophy fully.
        </Text>
        <div {...stylex.props(styles.pullQuote)}>
          <Text type="large">
            A good design system is invisible. It disappears into the product, letting content and functionality take center stage.
          </Text>
        </div>
        <Text as="p">
          Component-driven development encourages teams to think in terms of building blocks rather than pages. Each component encapsulates its own styles, behavior, and accessibility requirements.
        </Text>
        <Heading level={2}>Accessibility as a Foundation</Heading>
        <Text as="p">
          When accessibility is built into the design system layer, every product built on top inherits those guarantees. Focus management, ARIA attributes, keyboard navigation, and screen reader support all come for free.
        </Text>
        <Heading level={2}>Looking Ahead</Heading>
        <Text as="p">
          The next wave of design systems will incorporate AI-assisted development, dynamic theming that responds to user preferences, and cross-platform consistency that spans web, mobile, and spatial computing.
        </Text>
      </VStack>
    </div>
  );
}
