import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { fetchCategoryBySlug, fetchProducts } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, Breadcrumbs, ProductGridSkeleton } from '../components/UI';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);

  const { data: category, isLoading: catLoading, isError: catError, refetch: refetchCat } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category: slug, page }],
    queryFn: () => fetchProducts({ category: slug, page }),
    enabled: !!slug,
    placeholderData: prev => prev,
  });

  const totalPages = products ? Math.ceil(products.count / 12) : 1;
  const childCategories = category?.children?.filter(c => c.is_active) || [];

  const goToPage = (p: number) => {
    setSearchParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <title>{category ? `${category.name} — Flembe Essence` : 'Category — Flembe Essence'}</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs
          className="mb-4"
          items={[{ label: 'Categories', to: '/categories' }, { label: category?.name || 'Category' }]}
        />
        <Link to="/categories" className="inline-flex items-center gap-2 font-body text-sm text-off-black/50 hover:text-burgundy mb-8 transition-colors">
          <ArrowLeft size={14} /> All Categories
        </Link>

        {catLoading ? (
          <div className="mb-10 space-y-3">
            <div className="skeleton h-9 w-56 rounded-full" />
            <div className="skeleton h-4 w-96 max-w-full rounded-full" />
          </div>
        ) : catError ? (
          <div className="mb-10"><ErrorState message="Could not load this category." onRetry={refetchCat} /></div>
        ) : (
          <div className="mb-8">
            <p className="font-body text-[11px] uppercase tracking-[0.22em] text-rose-smoke font-bold mb-1">
              Collection
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-burgundy mb-2">{category?.name}</h1>
            {category?.description && (
              <p className="font-body text-sm text-off-black/60 max-w-2xl">{category.description}</p>
            )}
            {products && products.count > 0 && (
              <p className="font-body text-sm text-off-black/60 mt-2">
                Showing <strong className="text-off-black font-semibold">{products.count}</strong> pieces
              </p>
            )}
            {childCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {childCategories.map(child => (
                  <Link
                    key={child.id}
                    to={`/categories/${child.slug}`}
                    className="font-body text-xs uppercase tracking-wider px-4 py-2 rounded-full border bg-white/80 text-off-black/70 border-nude-dark/50 hover:border-burgundy hover:text-burgundy transition-all duration-200"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <ProductGridSkeleton count={8} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : products?.results.length === 0 ? (
          <EmptyState message={`No products in ${category?.name || 'this category'} yet.`}>
            <Link to="/shop" className="btn-outline mt-4">Browse All Products</Link>
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products?.results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Category pages" className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className="h-10 px-3.5 font-body text-xs font-semibold rounded-xs transition-colors shadow-xs bg-white text-off-black hover:bg-burgundy hover:text-nude border border-nude-dark/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    className={`w-10 h-10 font-body text-xs font-semibold rounded-xs transition-colors shadow-xs ${
                      p === page
                        ? 'bg-burgundy text-nude'
                        : 'bg-white text-off-black hover:bg-burgundy hover:text-nude border border-nude-dark/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="h-10 px-3.5 font-body text-xs font-semibold rounded-xs transition-colors shadow-xs bg-white text-off-black hover:bg-burgundy hover:text-nude border border-nude-dark/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
