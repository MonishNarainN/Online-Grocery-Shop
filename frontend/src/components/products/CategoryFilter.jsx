import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'secondary'}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        All Products
      </Button>
      {PRODUCT_CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onCategoryChange(category)}
        >
          {CATEGORY_LABELS[category]}
        </Button>
      ))}
    </div>
  );
}
