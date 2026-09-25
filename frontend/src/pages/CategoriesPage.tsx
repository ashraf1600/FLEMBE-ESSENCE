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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {subCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group bg-white shadow-sm hover:shadow-md p-8 text-center card-hover block transition-all duration-300"
              >
                <div className="w-20 h-20 bg-nude rounded-full mx-auto mb-5 flex items-center justify-center group-hover:bg-burgundy transition-colors duration-300">
                  <span className="font-display text-3xl text-burgundy group-hover:text-nude transition-colors duration-300">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <h2 className="font-display text-xl text-off-black group-hover:text-burgundy transition-colors mb-1">
                  {cat.name}
                </h2>
                <span className="font-body text-xs text-rose-smoke tracking-widest uppercase flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  Browse <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesPage;
