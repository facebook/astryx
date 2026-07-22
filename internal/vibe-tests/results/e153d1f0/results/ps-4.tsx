import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '@/components/ui/breadcrumb';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft} from 'lucide-react';

export default function ProductDetailPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/cat">Category</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/cat/sub">Subcategory</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Wireless Headphones</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">Wireless Headphones Pro</h1>
      <Card><CardContent className="pt-6 space-y-4">
        <p className="text-xl font-semibold">$299.99</p>
        <p className="text-muted-foreground">Premium headphones with 30-hour battery.</p>
        <div className="flex gap-2">
          <Button>Add to Cart</Button>
          <Button variant="outline" onClick={() => history.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
