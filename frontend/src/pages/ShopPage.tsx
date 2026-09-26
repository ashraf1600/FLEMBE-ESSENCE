// src/pages/ShopPage.tsx
import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Search, Sparkles, ArrowDownUp, Check, ChevronDown } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/UI';

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const ordering = searchParams.get('ordering') || '-created_at';
  const page = Number(searchParams.get('page') || 1);
  const inStock = searchParams.get('in_stock') === 'true' ? true : undefined;

  // Controlled input state
  const [localSearch, setLocalSearch] = useState(search);
  const [localMin, setLocalMin] = useState(minPrice?.toString() || '');
  const [localMax, setLocalMax] = useState(maxPrice?.toString() || '');

  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  React.useEffect(() => {
    setLocalMin(minPrice?.toString() || '');
    setLocalMax(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  // Close sort dropdown when clicking outside of it
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A–Z' },
  ];
  const currentSortLabel = sortOptions.find(o => o.value === ordering)?.label || 'Newest First';

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

  const applyPricePreset = (min?: number, max?: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (min !== undefined) next.set('min_price', String(min)); else next.delete('min_price');
      if (max !== undefined) next.set('max_price', String(max)); else next.delete('max_price');
      next.delete('page');
      return next;
    });
    setLocalMin(min !== undefined ? String(min) : '');
    setLocalMax(max !== undefined ? String(max) : '');
  };

  const clearAll = () => {
    setSearchParams({});
    setLocalMin('');
    setLocalMax('');
    setLocalSearch('');
  };

  const subCategories = categories?.flatMap(c => c.children || []).filter(c => c.is_active) || [];
  const totalPages = data ? Math.ceil(data.count / 12) : 1;
  const hasActiveFilters = Boolean(search || category || minPrice || maxPrice || inStock);

  return (
    <>
      <title>Shop Jewellery & Accessories — Flembe Essence</title>

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-5 sm:py-7">
        {/* Page Title & Breadcrumb header */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-nude-dark/40">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.22em] text-rose-smoke font-bold mb-1">
                Handpicked Boutique
              </p>
              <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-none text-burgundy">
                {category ? subCategories.find(c => c.slug === category)?.name || 'Collection' : 'All Jewellery'}
              </h1>
              {data && (
                <p className="font-body text-sm text-off-black/60 mt-2">
                  Showing <strong className="text-off-black font-semibold">{data.count}</strong> handcrafted pieces
                </p>
              )}
            </div>

            {/* Quick Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-3">
              {/* Custom Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 rounded-full border border-nude-dark/60 bg-white/80 hover:border-burgundy/50 px-4 py-2 shadow-sm transition-colors"
                >
                  <ArrowDownUp size={13} className="text-burgundy" />
                  <span className="font-body text-[10px] text-off-black/55 hidden sm:inline uppercase tracking-[0.16em] font-semibold">
                    Sort by
                  </span>
                  <span className="font-body text-xs font-bold text-burgundy">
                    {currentSortLabel}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-burgundy transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-nude-dark/20 py-2 z-50 animate-fade-in overflow-hidden">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setParam('ordering', opt.value);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left font-body text-xs transition-colors ${
                          ordering === opt.value
                            ? 'bg-burgundy/10 text-burgundy font-bold'
                            : 'text-off-black/80 hover:bg-nude/40'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {ordering === opt.value && <Check size={14} className="text-burgundy" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden flex items-center gap-1.5 py-2 px-3 text-xs font-body uppercase tracking-wider border rounded-xs transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-burgundy text-nude border-burgundy'
                    : 'bg-white text-off-black border-nude-dark/60'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>
            </div>
          </div>

          {/* ─── Horizontal Category Pill Bar ─── */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setParam('category', '')}
              className={`flex-shrink-0 font-body text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 border ${
                !category
                  ? 'bg-burgundy text-nude border-burgundy shadow-xs font-medium'
                  : 'bg-white/80 text-off-black/70 border-nude-dark/50 hover:border-burgundy hover:text-burgundy'
              }`}
            >
              All Items
            </button>
            {subCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setParam('category', cat.slug)}
                className={`flex-shrink-0 font-body text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 border ${
                  category === cat.slug
                    ? 'bg-burgundy text-nude border-burgundy shadow-xs font-medium'
                    : 'bg-white/80 text-off-black/70 border-nude-dark/50 hover:border-burgundy hover:text-burgundy'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* ─── Active Filter Tags ─── */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="font-body text-[11px] text-off-black/50 uppercase tracking-wider font-semibold">Active:</span>
              {search && (
                <span className="inline-flex items-center gap-1 bg-burgundy/10 text-burgundy text-xs px-2.5 py-1 rounded-full font-body">
                  <span>Search: "{search}"</span>
                  <button onClick={() => setParam('search', '')}><X size={12} /></button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 bg-burgundy/10 text-burgundy text-xs px-2.5 py-1 rounded-full font-body">
                  <span>Category: {subCategories.find(c => c.slug === category)?.name || category}</span>
                  <button onClick={() => setParam('category', '')}><X size={12} /></button>
                </span>
              )}
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 bg-burgundy/10 text-burgundy text-xs px-2.5 py-1 rounded-full font-body">
                  <span>Price: ৳{minPrice || 0} - {maxPrice ? `৳${maxPrice}` : 'Above'}</span>
                  <button onClick={() => { applyPricePreset(undefined, undefined); }}><X size={12} /></button>
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-body">
                  <span>In Stock Only</span>
                  <button onClick={() => setParam('in_stock', '')}><X size={12} /></button>
                </span>
              )}
              <button
                onClick={clearAll}
                className="font-body text-xs text-red-600 hover:text-red-800 ml-2 underline underline-offset-2"
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {/* ─── Main Shop Content ─── */}
        <div className="flex flex-col md:flex-row gap-5 lg:gap-7">
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-56 lg:w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-5 lg:p-6 rounded-xl border border-nude-dark/50 shadow-sm space-y-5 sticky top-28 h-auto md:h-[calc(100svh-8rem)] md:min-h-[560px] overflow-y-auto">
              {/* Search input */}
              <div>
                <p className="label flex items-center gap-1 text-[11px]">
                  <Search size={12} />
                  <span>Search Keyword</span>
                </p>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="E.g. pearl, gold ring..."
                    value={localSearch}
                    className="input-field text-sm pl-3 pr-8 py-3"
                    onChange={e => setLocalSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setParam('search', localSearch.trim() || undefined);
                    }}
                  />
                  {localSearch && (
                    <button
                      onClick={() => { setLocalSearch(''); setParam('search', undefined); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-off-black/40 hover:text-off-black"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Presets & Range */}
              <div>
                <p className="label text-[11px]">Price Range (৳)</p>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <button
                    onClick={() => applyPricePreset(undefined, 300)}
                    className="font-body text-[11px] uppercase tracking-wider py-2 px-2 bg-nude/30 hover:bg-burgundy hover:text-nude rounded-xs transition-colors border border-nude-dark/40 text-center"
                  >
                    &lt; ৳300
                  </button>
                  <button
                    onClick={() => applyPricePreset(300, 600)}
                    className="font-body text-[11px] uppercase tracking-wider py-2 px-2 bg-nude/30 hover:bg-burgundy hover:text-nude rounded-xs transition-colors border border-nude-dark/40 text-center"
                  >
                    ৳300-600
                  </button>
                  <button
                    onClick={() => applyPricePreset(600, undefined)}
                    className="font-body text-[11px] uppercase tracking-wider py-2 px-2 bg-nude/30 hover:bg-burgundy hover:text-nude rounded-xs transition-colors border border-nude-dark/40 text-center"
                  >
                    &gt; ৳600
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    className="input-field text-sm text-center py-3"
                  />
                  <span className="text-off-black/40 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    className="input-field text-sm text-center py-3"
                  />
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="w-full btn-primary py-2.5 text-xs rounded-xs"
                >
                  Apply Price
                </button>
              </div>

              {/* Stock Filter Switch */}
              <div className="pt-2 border-t border-nude-dark/30">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="font-body text-sm text-off-black font-medium">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStock === true}
                    onChange={e => setParam('in_stock', e.target.checked ? 'true' : '')}
                    className="w-4 h-4 accent-burgundy cursor-pointer"
                  />
                </label>
              </div>

              {/* Campus Delivery Reminder Box */}
              <div className="bg-nude/30 p-4 rounded border border-rose-smoke/30 text-center space-y-2">
                <Sparkles size={18} className="mx-auto text-burgundy" />
                <p className="font-body text-sm font-semibold text-burgundy">Free Campus Delivery</p>
                <p className="font-body text-xs text-off-black/60 leading-relaxed">
                  DIU Main Campus, Prime University & Mirpur 1 get 100% free delivery on Cash on Delivery.
                </p>
              </div>
            </div>
          </aside>

          {/* Products Grid Area */}
          <div className="flex-1">
            {isLoading ? (
              <LoadingSpinner message="Searching our collection..." />
            ) : isError ? (
              <ErrorState onRetry={refetch} />
            ) : data?.results.length === 0 ? (
              <EmptyState message="No jewellery found matching your filter criteria. Try clearing some filters." />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {data?.results.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })}
                        className={`w-10 h-10 font-body text-xs font-semibold rounded-xs transition-colors shadow-xs ${
                          p === page
                            ? 'bg-burgundy text-nude'
                            : 'bg-white text-off-black hover:bg-burgundy hover:text-nude border border-nude-dark/40'
                        }`}
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