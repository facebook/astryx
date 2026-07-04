import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';

export default function ArticlePage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-6 space-y-6">
      <Heading level={1} type="display-1">
        The Future of Design Systems in Modern Web Development
      </Heading>
      <Text type="large" color="secondary">
        How component libraries are reshaping the way teams build consistent, accessible user interfaces at scale.
      </Text>
      <div className="flex items-center gap-3">
        <Avatar name="Sarah Chen" size="md" />
        <div>
          <Text type="label">Sarah Chen</Text>
          <Text type="supporting" color="secondary" display="block">Published Jan 15, 2024 · 8 min read</Text>
        </div>
      </div>
      <hr className="border-gray-200" />
      <img className="w-full h-96 object-cover rounded-xl" src="https://picsum.photos/1200/600?random=10" alt="Design system components" />
      <Text as="p">Design systems have become the foundation of modern web development. They provide a shared language between designers and developers, ensuring consistency across products.</Text>
      <Text as="p">At their core, design systems are collections of reusable components, guided by clear standards, that can be assembled to build applications.</Text>
      <Heading level={2}>The Evolution of Component Architecture</Heading>
      <Text as="p">The shift from monolithic CSS frameworks to modular component systems reflects a broader trend toward composability and reuse.</Text>
      <blockquote className="border-l-4 border-gray-800 pl-6 my-8 italic">
        <Text type="large">A good design system is invisible. It disappears into the product, letting content take center stage.</Text>
      </blockquote>
      <Text as="p">Component-driven development encourages teams to think in terms of building blocks rather than pages.</Text>
      <Heading level={2}>Accessibility as a Foundation</Heading>
      <Text as="p">When accessibility is built into the design system, every product inherits those guarantees. Focus management, ARIA attributes, and keyboard navigation come for free.</Text>
      <Heading level={2}>Looking Ahead</Heading>
      <Text as="p">The next wave of design systems will incorporate AI-assisted development, dynamic theming, and cross-platform consistency.</Text>
    </article>
  );
}
