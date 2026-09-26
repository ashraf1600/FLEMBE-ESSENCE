import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchCategories } from '../lib/queries';
import { LoadingSpinner, ErrorState } from '../components/UI';

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const subCategories = categories?.flatMap(c => c.children || []).filter(c => c.is_active) || [];

  return (
    <>
      <title>Categories — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="section-subtitle">Browse</p>
          <h1 className="section-title">All Categories</h1>
        </div>

        {isLoading ? <LoadingSpinner /> : isError ? <ErrorState onRetry={refetch} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {subCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-burgundy shadow-sm hover:shadow-2xl hover:shadow-burgundy/20 block transition-all duration-500 hover:-translate-y-1"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-burgundy-light to-rose-smoke/50 flex items-center justify-center">
                    <span className="font-display text-nude/25 text-7xl select-none">{cat.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-off-black/90 via-off-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h2 className="font-display text-lg sm:text-xl text-nude leading-tight mb-1">{cat.name}</h2>
                  <span className="font-body text-[10px] text-rose-smoke tracking-widest uppercase inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Browse <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesPage;
