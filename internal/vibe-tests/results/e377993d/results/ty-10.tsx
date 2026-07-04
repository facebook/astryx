export default function ArticlePage() {
  return (
    <article className="max-w-3xl mx-auto py-8 px-6 space-y-6">
      <h1 className="text-5xl font-bold leading-tight">The Future of Design Systems in Modern Web Development</h1>
      <p className="text-xl text-gray-600">How component libraries are reshaping the way teams build consistent, accessible UIs at scale.</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium">SC</div>
        <div>
          <p className="font-medium">Sarah Chen</p>
          <p className="text-sm text-gray-500">Published Jan 15, 2024 · 8 min read</p>
        </div>
      </div>
      <hr />
      <img className="w-full h-96 object-cover rounded-xl" src="https://picsum.photos/1200/600?random=10" alt="Design system components" />
      <p>Design systems have become the foundation of modern web development. They provide a shared language between designers and developers.</p>
      <p>At their core, design systems are collections of reusable components guided by clear standards.</p>
      <h2 className="text-3xl font-bold mt-8">The Evolution of Component Architecture</h2>
      <p>The shift from monolithic CSS to modular component systems reflects a broader trend toward composability.</p>
      <blockquote className="border-l-4 border-gray-800 pl-6 my-8 italic text-lg">A good design system is invisible. It disappears into the product.</blockquote>
      <p>Component-driven development encourages teams to think in building blocks.</p>
      <h2 className="text-3xl font-bold mt-8">Accessibility as a Foundation</h2>
      <p>When accessibility is built into the design system, every product inherits those guarantees.</p>
      <h2 className="text-3xl font-bold mt-8">Looking Ahead</h2>
      <p>The next wave of design systems will incorporate AI-assisted development and dynamic theming.</p>
    </article>
  );
}
