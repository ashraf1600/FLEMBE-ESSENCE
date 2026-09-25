import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { fetchCategoryBySlug, fetchProducts } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/UI';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category: slug }],
    queryFn: () => fetchProducts({ category: slug }),
    enabled: !!slug,
  });

  return (
    <>
      <title>{category ? `${category.name} — Flembe Essence` : 'Category — Flembe Essence'}</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/categories" className="inline-flex items-center gap-2 font-body text-sm text-off-black/50 hover:text-burgundy mb-8 transition-colors">
          <ArrowLeft size={14} /> All Categories
        </Link>

        {catLoading ? <LoadingSpinner /> : (
          <div className="mb-10">
            <h1 className="font-display text-4xl text-burgundy mb-2">{category?.name}</h1>
            {category?.description && (
              <p className="font-body text-sm text-off-black/60">{category.description}</p>
            )}
          </div>
        )}

        {isLoading ? <LoadingSpinner /> : isError ? (
          <ErrorState onRetry={refetch} />
        ) : products?.results.length === 0 ? (
          <EmptyState message={`No products in ${category?.name || 'this category'} yet.`}>
            <Link to="/shop" className="btn-outline mt-4">Browse All Products</Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products?.results.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
