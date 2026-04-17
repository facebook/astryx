import {CategoryContent} from './CategoryContent';

export default function CategoryPage({slug}: {slug: string}) {
  return <CategoryContent slug={slug} />;
}
