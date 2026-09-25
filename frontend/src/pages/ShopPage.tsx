import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/UI';

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const ordering = searchParams.get('ordering') || '-created_at';
  const page = Number(searchParams.get('page') || 1);
  const inStock = searchParams.get('in_stock') === 'true' ? true : undefined;

  const [localMin, setLocalMin] = useState(minPrice?.toString() || '');
  const [localMax, setLocalMax] = useState(maxPrice?.toString() || '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { search, category, minPrice, maxPrice, ordering, page, inStock }],
    queryFn: () => fetchProducts({ search, category, min_price: minPrice, max_price: maxPrice, ordering, page, in_stock: inStock }),
    placeholderData: prev => prev,
  });

  const setParam = (key: string, val: string | undefined) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set(key, val); else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const applyPriceFilter = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (localMin) next.set('min_price', localMin); else next.delete('min_price');
      if (localMax) next.set('max_price', localMax); else next.delete('max_price');
      next.delete('page');
      return next;
    });
  };

  const clearAll = () => {
    setSearchParams({});
    setLocalMin('');
    setLocalMax('');
  };

  const subCategories = categories?.flatMap(c => c.children || []).filter(c => c.is_active) || [];
  const totalPages = data ? Math.ceil(data.count / 12) : 1;
  const hasActiveFilters = search || category || minPrice || maxPrice || inStock;

  return (
    <>
      <title>Shop — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl text-burgundy">Shop</h1>
            {data && (
              <p className="font-body text-sm text-off-black/50 mt-1">{data.count} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs font-body text-red-500 hover:text-red-700">
                <X size={12} /> Clear filters
              </button>
            )}
            <select
              value={ordering}
              onChange={e => setParam('ordering', e.target.value)}
              className="input-field w-auto text-xs"
            >
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 btn-outline py-2 px-3 text-xs"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-5 shadow-sm space-y-6">
              {/* Search */}
              <div>
                <p className="label">Search</p>
                <input
                  type="search"
                  placeholder="Search products..."
                  defaultValue={search}
                  className="input-field text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value);
                  }}
                  onChange={e => !e.target.value && setParam('search', '')}
                />
              </div>

              {/* Category */}
              <div>
                <p className="label">Category</p>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setParam('category', '')}
                      className={`font-body text-sm w-full text-left py-1 transition-colors ${!category ? 'text-burgundy font-semibold' : 'text-off-black/60 hover:text-burgundy'}`}
                    >
                      All
                    </button>
                  </li>
                  {subCategories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setParam('category', cat.slug)}
                        className={`font-body text-sm w-full text-left py-1 transition-colors ${category === cat.slug ? 'text-burgundy font-semibold' : 'text-off-black/60 hover:text-burgundy'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div>
                <p className="label">Price Range (৳)</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>
                <button onClick={applyPriceFilter} className="btn-primary w-full py-2 text-xs">
                  Apply
                </button>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock === true}
                    onChange={e => setParam('in_stock', e.target.checked ? 'true' : '')}
                    className="accent-burgundy"
                  />
                  <span className="font-body text-sm text-off-black">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <LoadingSpinner />
            ) : isError ? (
              <ErrorState onRetry={refetch} />
            ) : data?.results.length === 0 ? (
              <EmptyState message="No products found. Try a different search or filter." />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                  {data?.results.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })}
                        className={`w-9 h-9 font-body text-sm transition-colors ${p === page ? 'bg-burgundy text-nude' : 'bg-nude-dark text-off-black hover:bg-burgundy hover:text-nude'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
