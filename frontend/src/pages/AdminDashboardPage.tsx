import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart2, ShoppingBag, Package, TrendingUp,
  Truck, LogOut, RefreshCw, Search, Filter,
  ExternalLink, Plus, CheckCircle, ArrowUpRight, X,
  Upload, Trash2, Star, MessageSquare, ChevronDown,
  Eye, EyeOff, Award, AlertTriangle, Activity,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ErrorState } from '../components/UI';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Stats {
  total_orders: number;
  today_orders: number;
  week_orders: number;
  month_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  failed_orders: number;
  status_breakdown: Record<string, number>;
  total_revenue: string;
  today_revenue: string;
  avg_order_value: string;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  category_sales: { name: string; slug: string; units_sold: number; revenue: string; order_count: number }[];
  top_products: { product_id: number; name: string; slug: string; units_sold: number; revenue: string }[];
  monthly_revenue: { month: string; revenue: string; orders: number }[];
  daily_orders: { date: string; count: number; revenue: string }[];
  recent_orders: any[];
  low_stock_products: { id: number; name: string; slug: string; stock_quantity: number; cat_name: string }[];
}

interface Review {
  id: number;
  product: number;
  product_name: string;
  reviewer_name: string;
  reviewer_email: string;
  user: number | null;
  rating: number;
  title: string;
  body: string;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
}

const DJANGO_ADMIN_URL = '/admin';

// ── Data fetchers ──────────────────────────────────────────────────────────────
const fetchStats         = async (): Promise<Stats> => (await api.get('/admin/stats/')).data;
const fetchOrders        = async (params?: object) => (await api.get('/admin/orders/', { params })).data;
const fetchProducts      = async (params?: object) => (await api.get('/products/', { params })).data;
const fetchCategories    = async () => (await api.get('/categories/?all=true')).data;
const fetchDeliveryZones = async () => (await api.get('/delivery-zones/')).data;
const fetchReviews       = async (params?: object) => (await api.get('/admin/reviews/', { params })).data;

const updateStatus = async ({ orderNumber, order_status }: { orderNumber: string; order_status: string }) =>
  (await api.patch(`/admin/orders/${orderNumber}/status/`, { order_status })).data;
const toggleApprove = async (id: number) => (await api.post(`/admin/reviews/${id}/approve/`)).data;
const toggleFeature = async (id: number) => (await api.post(`/admin/reviews/${id}/feature/`)).data;
const deleteReview  = async (id: number) => (await api.delete(`/admin/reviews/${id}/`));

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING:         'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED:       'bg-blue-50 text-blue-700 border border-blue-200',
  PROCESSING:      'bg-violet-50 text-violet-700 border border-violet-200',
  SHIPPED:         'bg-sky-50 text-sky-700 border border-sky-200',
  DELIVERED:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED:       'bg-slate-100 text-slate-500 border border-slate-200',
  FAILED_DELIVERY: 'bg-red-50 text-red-600 border border-red-200',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Pending', CONFIRMED: '✅ Confirmed', PROCESSING: '⚙️ Processing',
  SHIPPED: '🚚 Shipped', DELIVERED: '📦 Delivered', CANCELLED: '✕ Cancelled', FAILED_DELIVERY: '⚠️ Failed',
};
const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED_DELIVERY'];
const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED',
};

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'delivery' | 'reviews';
const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',  label: 'Dashboard',      icon: <BarChart2 size={15} /> },
  { id: 'orders',     label: 'Orders',         icon: <ShoppingBag size={15} /> },
  { id: 'products',   label: 'Products',       icon: <Package size={15} /> },
  { id: 'categories', label: 'Categories',     icon: <Filter size={15} /> },
  { id: 'delivery',   label: 'Delivery Zones', icon: <Truck size={15} /> },
  { id: 'reviews',    label: 'Reviews',        icon: <Star size={15} /> },
];

// ── Stars component ────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
      />
    ))}
  </span>
);

// ── Shared components ──────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }> = ({ children, className = '', style, onClick }) => (
  <div className={`rounded-2xl ${className}`} onClick={onClick} style={{ background: 'white', border: '1px solid rgba(75,29,63,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', ...style }}>
    {children}
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-body text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'rgba(27,27,27,0.4)' }}>{children}</p>
);

const KPICard: React.FC<{ label: string; value: string | number; sub?: string; accent?: string; urgent?: boolean; onClick?: () => void; icon?: React.ReactNode }> = ({ label, value, sub, accent = '#4B1D3F', urgent, onClick, icon }) => (
  <Card className={`p-5 flex flex-col gap-1 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`} style={{ borderTop: `3px solid ${urgent ? '#f59e0b' : accent}` }} onClick={onClick}>
    <div className="flex items-start justify-between">
      <span className="font-display text-3xl font-bold" style={{ color: urgent ? '#d97706' : accent }}>{value}</span>
      {icon && <span style={{ color: accent, opacity: 0.35 }}>{icon}</span>}
    </div>
    <span className="font-body text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#1B1B1B' }}>{label}</span>
    {sub && <span className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.45)' }}>{sub}</span>}
  </Card>
);

const TableWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="overflow-x-auto"><table className="w-full text-left border-collapse">{children}</table></Card>
);
const Th: React.FC<{ children: React.ReactNode; right?: boolean }> = ({ children, right }) => (
  <th className={`py-3 px-4 font-body text-[10px] uppercase tracking-widest font-semibold ${right ? 'text-right' : ''}`} style={{ color: 'rgba(27,27,27,0.4)', borderBottom: '1px solid rgba(75,29,63,0.08)', background: 'rgba(232,217,193,0.2)' }}>{children}</th>
);
const Td: React.FC<{ children: React.ReactNode; right?: boolean; className?: string; style?: React.CSSProperties }> = ({ children, right, className = '', style }) => (
  <td className={`py-3 px-4 font-body text-xs ${right ? 'text-right' : ''} ${className}`} style={{ borderBottom: '1px solid rgba(75,29,63,0.05)', ...style }}>{children}</td>
);

const ModalBase: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, subtitle, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(27,27,27,0.65)', backdropFilter: 'blur(4px)' }}>
    <div className={`bg-white rounded-2xl shadow-2xl relative max-h-[92vh] overflow-y-auto ${wide ? 'max-w-lg' : 'max-w-md'} w-full`} style={{ border: '1px solid rgba(75,29,63,0.12)' }}>
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(75,29,63,0.08)' }}>
        <h3 className="font-display text-xl" style={{ color: '#4B1D3F' }}>{title}</h3>
        {subtitle && <p className="font-body text-[11px] mt-0.5" style={{ color: 'rgba(27,27,27,0.45)' }}>{subtitle}</p>}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(27,27,27,0.4)' }}><X size={18} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="block font-body text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'rgba(27,27,27,0.6)' }}>
      {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
    </label>
    {children}
  </div>
);
const FormError: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="p-3 rounded-xl font-body text-xs" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{msg}</div>
);
const FormActions: React.FC<{ onClose: () => void; loading: boolean; submitLabel: string }> = ({ onClose, loading, submitLabel }) => (
  <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(75,29,63,0.08)' }}>
    <button type="button" onClick={onClose} disabled={loading} className="btn-outline text-[11px] py-2 px-4">Cancel</button>
    <button type="submit" disabled={loading} className="btn-primary text-[11px] py-2 px-5 inline-flex items-center gap-2">
      {loading && <RefreshCw size={13} className="animate-spin" />}{submitLabel}
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');

  const [isCreateProductOpen,  setIsCreateProductOpen]  = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateDeliveryOpen, setIsCreateDeliveryOpen] = useState(false);
  const [restockProduct,       setRestockProduct]       = useState<any>(null);

  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderSearch,      setOrderSearch]      = useState('');
  const [statusFilter,     setStatusFilter]     = useState('');
  const [prodSearch,       setProdSearch]       = useState('');
  const [prodSearchQuery,  setProdSearchQuery]  = useState('');
  const [reviewFilter,     setReviewFilter]     = useState<'all' | 'pending' | 'approved'>('all');

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats, staleTime: 30_000 });
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders', statusFilter, orderSearch],
    queryFn: () => fetchOrders({ status: statusFilter || undefined, search: orderSearch || undefined }),
    enabled: tab === 'orders', staleTime: 10_000,
  });
  const { data: productsData, isLoading: prodsLoading, refetch: refetchProds } = useQuery({
    queryKey: ['admin-products-list', prodSearchQuery],
    queryFn: () => fetchProducts({ search: prodSearchQuery || undefined, page_size: 50 }),
    enabled: tab === 'products', staleTime: 20_000,
  });
  const { data: categoriesData, isLoading: catsLoading, refetch: refetchCats } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: fetchCategories,
    enabled: tab === 'categories' || isCreateProductOpen,
    staleTime: 30_000,
  });
  const { data: deliveryData, isLoading: deliveryLoading, refetch: refetchDelivery } = useQuery({
    queryKey: ['admin-delivery-list'], queryFn: fetchDeliveryZones, enabled: tab === 'delivery', staleTime: 30_000,
  });
  const reviewParams = reviewFilter === 'pending' ? { is_approved: false }
    : reviewFilter === 'approved' ? { is_approved: true } : undefined;
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['admin-reviews', reviewFilter], queryFn: () => fetchReviews(reviewParams), enabled: tab === 'reviews', staleTime: 15_000,
  });

  const statusMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Order status updated!'); },
    onError: () => toast.error('Failed to update status.'),
  });
  const approveMutation = useMutation({
    mutationFn: toggleApprove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review status toggled!'); },
    onError: () => toast.error('Failed.'),
  });
  const featureMutation = useMutation({
    mutationFn: toggleFeature,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Featured status toggled!'); },
    onError: () => toast.error('Failed.'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review deleted.'); },
    onError: () => toast.error('Could not delete review.'),
  });

  const handleLogout = () => { logout(); navigate('/'); toast('Signed out.'); };
  const handleRefresh = () => {
    if (tab === 'dashboard') refetchStats();
    else if (tab === 'orders') refetchOrders();
    else if (tab === 'products') refetchProds();
    else if (tab === 'categories') refetchCats();
    else if (tab === 'delivery') refetchDelivery();
    else if (tab === 'reviews') refetchReviews();
  };

  const cats = categoriesData?.results || categoriesData || [];

  return (
    <div className="min-h-screen flex" style={{ background: '#f0ede8', fontFamily: "'Jost', system-ui, sans-serif" }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: 'linear-gradient(180deg,#17121c 0%,#1f1529 100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.25)' }}>
        <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" className="block">
            <span className="font-display text-xl tracking-widest" style={{ color: '#E8D9C1' }}>FLEMBE</span>
            <span className="font-display text-xl tracking-widest" style={{ color: '#D8A7B1' }}> ESSENCE</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-body text-[10px] tracking-widest uppercase" style={{ color: 'rgba(232,217,193,0.4)' }}>Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="px-6 pt-2 pb-1 font-body text-[9px] uppercase tracking-widest" style={{ color: 'rgba(232,217,193,0.3)' }}>Menu</p>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-150"
              style={{ background: tab === n.id ? 'rgba(216,167,177,0.12)' : 'transparent', color: tab === n.id ? '#D8A7B1' : 'rgba(232,217,193,0.5)', borderLeft: tab === n.id ? '3px solid #D8A7B1' : '3px solid transparent' }}>
              <span style={{ opacity: tab === n.id ? 1 : 0.65 }}>{n.icon}</span>
              <span className="font-body text-[11px] tracking-wide uppercase font-medium">{n.label}</span>
            </button>
          ))}
          <div className="mx-5 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-body text-[9px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(232,217,193,0.3)' }}>External</p>
            <a href={`${DJANGO_ADMIN_URL}/`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-2 font-body text-[11px] transition-colors" style={{ color: 'rgba(232,217,193,0.4)' }} onMouseEnter={e => (e.currentTarget.style.color = '#E8D9C1')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,217,193,0.4)')}>
              <span>Django Admin</span><ExternalLink size={11} />
            </a>
            <Link to="/" target="_blank" className="flex items-center justify-between py-2 font-body text-[11px] transition-colors" style={{ color: 'rgba(232,217,193,0.4)' }} onMouseEnter={e => (e.currentTarget.style.color = '#E8D9C1')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,217,193,0.4)')}>
              <span>Visit Storefront</span><ArrowUpRight size={11} />
            </Link>
          </div>
        </nav>

        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm" style={{ background: '#4B1D3F', color: '#D8A7B1' }}>
              {admin?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs font-bold truncate" style={{ color: '#E8D9C1' }}>{admin?.username}</p>
              <p className="font-body text-[10px]" style={{ color: 'rgba(232,217,193,0.4)' }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider transition-colors" style={{ color: 'rgba(216,167,177,0.55)' }} onMouseEnter={e => (e.currentTarget.style.color = '#D8A7B1')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(216,167,177,0.55)')}>
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(240,237,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(75,29,63,0.1)', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
          <div>
            <h1 className="font-display text-2xl" style={{ color: '#4B1D3F' }}>{NAV.find(n => n.id === tab)?.label ?? 'Dashboard'}</h1>
            <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>
              {new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 font-body text-[11px] rounded-lg transition-colors border border-burgundy/20 bg-burgundy/5 text-burgundy hover:bg-burgundy hover:text-nude"
            >
              <ExternalLink size={12} /> View Store
            </Link>
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-[11px] rounded-lg transition-colors" style={{ background: 'white', color: '#4B1D3F', border: '1px solid rgba(75,29,63,0.15)' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#4B1D3F'; (e.currentTarget as HTMLButtonElement).style.color = '#E8D9C1'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.color = '#4B1D3F'; }}>
              <RefreshCw size={12} /> Refresh
            </button>
            {tab === 'products'   && <button onClick={() => setIsCreateProductOpen(true)}  className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={12} /> Add Product</button>}
            {tab === 'categories' && <button onClick={() => setIsCreateCategoryOpen(true)} className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={12} /> Add Category</button>}
            {tab === 'delivery'   && <button onClick={() => setIsCreateDeliveryOpen(true)} className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={12} /> Add Zone</button>}
          </div>
        </header>

        <div className="p-6 flex-1 space-y-6">
          {tab === 'dashboard' && (
            statsLoading ? <LoadingSpinner /> : statsError ? <ErrorState onRetry={refetchStats} /> :
            stats ? <DashboardTab stats={stats} onTabChange={setTab} onRestock={setRestockProduct} /> : null
          )}
          {tab === 'orders' && <OrdersTab ordersData={ordersData} isLoading={ordersLoading} statusFilter={statusFilter} setStatusFilter={setStatusFilter} orderSearchInput={orderSearchInput} setOrderSearchInput={setOrderSearchInput} onSearch={(q) => setOrderSearch(q)} orderSearch={orderSearch} onUpdateStatus={(n, s) => statusMutation.mutate({ orderNumber: n, order_status: s })} />}
          {tab === 'products' && <ProductsTab products={productsData?.results || []} totalCount={productsData?.count || 0} isLoading={prodsLoading} search={prodSearch} setSearch={setProdSearch} onSearchSubmit={(q) => setProdSearchQuery(q)} onOpenCreateProduct={() => setIsCreateProductOpen(true)} onRestock={(p) => setRestockProduct(p)} />}
          {tab === 'categories' && <CategoriesTab categories={cats} isLoading={catsLoading} onOpenCreateCategory={() => setIsCreateCategoryOpen(true)} />}
          {tab === 'delivery' && <DeliveryTab zones={deliveryData?.results || deliveryData || []} isLoading={deliveryLoading} onOpenCreateDelivery={() => setIsCreateDeliveryOpen(true)} />}
          {tab === 'reviews' && <ReviewsTab reviewsData={reviewsData} isLoading={reviewsLoading} filter={reviewFilter} setFilter={setReviewFilter} onApprove={(id) => approveMutation.mutate(id)} onFeature={(id) => featureMutation.mutate(id)} onDelete={(id) => { if (confirm('Delete this review permanently?')) deleteMutation.mutate(id); }} />}
        </div>
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CreateProductModal isOpen={isCreateProductOpen} onClose={() => setIsCreateProductOpen(false)} categories={cats} onSuccess={() => { qc.invalidateQueries({ queryKey: ['admin-products-list'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); qc.invalidateQueries({ queryKey: ['products'] }); }} />
      <CreateCategoryModal isOpen={isCreateCategoryOpen} onClose={() => setIsCreateCategoryOpen(false)} categories={cats} onSuccess={() => { qc.invalidateQueries({ queryKey: ['admin-categories-list'] }); qc.invalidateQueries({ queryKey: ['categories'] }); }} />
      <CreateDeliveryZoneModal isOpen={isCreateDeliveryOpen} onClose={() => setIsCreateDeliveryOpen(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['admin-delivery-list'] }); qc.invalidateQueries({ queryKey: ['delivery-zones'] }); }} />
      <QuickRestockModal product={restockProduct} onClose={() => setRestockProduct(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['admin-products-list'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────────────────────────────────────
const DashboardTab: React.FC<{ stats: Stats; onTabChange: (t: Tab) => void; onRestock?: (p: any) => void }> = ({ stats, onTabChange, onRestock }) => {
  const fmt = (n: string | number) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const maxMonthly = Math.max(...(stats.monthly_revenue || []).map(m => Number(m.revenue)), 1);
  const maxRevenue = Math.max(...(stats.category_sales || []).map(c => Number(c.revenue)), 1);

  return (
    <div className="space-y-6">
      <section>
        <SectionLabel>Financial Overview</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Revenue" value={fmt(stats.total_revenue)} sub="Confirmed + Delivered" accent="#4B1D3F" icon={<TrendingUp size={20} />} />
          <KPICard label="Today's Revenue" value={fmt(stats.today_revenue)} sub={`${stats.today_orders} order(s) today`} accent="#7c3aed" icon={<Activity size={20} />} />
          <KPICard label="Avg. Order Value" value={fmt(stats.avg_order_value)} sub="From confirmed orders" accent="#0369a1" icon={<BarChart2 size={20} />} />
          <KPICard label="Active Products" value={stats.active_products} sub={`${stats.out_of_stock} out of stock`} accent="#059669" onClick={() => onTabChange('products')} icon={<Package size={20} />} />
        </div>
      </section>

      <section>
        <SectionLabel>Order Pipeline</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Needs Attention" value={stats.pending_orders} sub="Pending orders" urgent={stats.pending_orders > 0} onClick={() => onTabChange('orders')} icon={<AlertTriangle size={20} />} />
          <KPICard label="This Week" value={stats.week_orders} sub="Last 7 days" accent="#0369a1" icon={<ShoppingBag size={20} />} />
          <KPICard label="This Month" value={stats.month_orders} sub="Last 30 days" accent="#7c3aed" icon={<ShoppingBag size={20} />} />
          <KPICard label="Delivered" value={stats.delivered_orders} sub="Completed" accent="#059669" icon={<CheckCircle size={20} />} />
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Order Status Breakdown</h2>
            <span className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.35)' }}>{stats.total_orders} total</span>
          </div>
          <div className="space-y-3">
            {ALL_STATUSES.map(s => {
              const count = (stats.status_breakdown as Record<string, number>)?.[s] || 0;
              const pct = stats.total_orders ? Math.round((count / stats.total_orders) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md w-32 text-center ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(232,217,193,0.6)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#4B1D3F' }} />
                  </div>
                  <span className="font-body text-xs font-bold w-7 text-right" style={{ color: '#4B1D3F' }}>{count}</span>
                  <span className="font-body text-[10px] w-7 text-right" style={{ color: 'rgba(27,27,27,0.35)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Monthly Revenue</h2>
            <TrendingUp size={15} style={{ color: 'rgba(75,29,63,0.4)' }} />
          </div>
          <p className="font-body text-[11px] mb-5" style={{ color: 'rgba(27,27,27,0.4)' }}>Confirmed orders aggregated by month</p>
          {(stats.monthly_revenue || []).length === 0 ? (
            <p className="font-body text-sm text-center py-10" style={{ color: 'rgba(27,27,27,0.35)' }}>No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-40" style={{ borderBottom: '1px solid rgba(75,29,63,0.08)' }}>
              {stats.monthly_revenue.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="font-body text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: '#4B1D3F' }}>{fmt(m.revenue)}</span>
                  <div className="w-full rounded-t" style={{ height: `${(Number(m.revenue) / maxMonthly) * 100}%`, minHeight: 4, background: 'linear-gradient(to top, #4B1D3F, #7c3460)' }} />
                  <span className="font-body text-[9px] text-center" style={{ color: 'rgba(27,27,27,0.45)' }}>{m.month.slice(2)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {(stats.category_sales || []).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Category Performance</h2>
              <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>Revenue by product category</p>
            </div>
            <button onClick={() => onTabChange('categories')} className="font-body text-[11px] flex items-center gap-1" style={{ color: '#4B1D3F' }}>Manage <ArrowUpRight size={12} /></button>
          </div>
          <div className="space-y-3">
            {stats.category_sales.map(cat => (
              <div key={cat.name} className="flex items-center gap-4">
                <span className="font-body text-sm font-semibold w-36 truncate" style={{ color: '#1B1B1B' }}>{cat.name}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(216,167,177,0.2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(Number(cat.revenue) / maxRevenue) * 100}%`, background: '#D8A7B1' }} />
                </div>
                <span className="font-body text-xs font-bold w-28 text-right" style={{ color: '#4B1D3F' }}>{fmt(cat.revenue)}</span>
                <span className="font-body text-[11px] w-20 text-right" style={{ color: 'rgba(27,27,27,0.4)' }}>{cat.units_sold} sold</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-display text-lg mb-4" style={{ color: '#4B1D3F' }}>🏆 Best Sellers</h2>
          {(stats.top_products || []).length === 0 ? (
            <p className="font-body text-sm py-4" style={{ color: 'rgba(27,27,27,0.4)' }}>No sales data yet.</p>
          ) : stats.top_products.map((p, i) => (
            <div key={p.product_id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(75,29,63,0.06)' }}>
              <span className="font-display text-lg font-bold w-6" style={{ color: '#D8A7B1' }}>#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold truncate" style={{ color: '#1B1B1B' }}>{p.name}</p>
                <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{p.units_sold} units sold</p>
              </div>
              <span className="font-body text-sm font-bold" style={{ color: '#4B1D3F' }}>{fmt(p.revenue)}</span>
            </div>
          ))}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>⚠️ Low Stock</h2>
            <button onClick={() => onTabChange('products')} className="font-body text-[11px] flex items-center gap-1" style={{ color: '#4B1D3F' }}>All Products <ArrowUpRight size={12} /></button>
          </div>
          {(stats.low_stock_products || []).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#059669' }} />
              <p className="font-body text-sm font-medium" style={{ color: '#059669' }}>Inventory is healthy!</p>
            </div>
          ) : stats.low_stock_products.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(75,29,63,0.06)' }}>
              <div>
                <p className="font-body text-sm font-semibold" style={{ color: '#1B1B1B' }}>{p.name}</p>
                <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{p.cat_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-body text-[11px] font-bold px-2 py-0.5 rounded-md ${p.stock_quantity === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                  {p.stock_quantity === 0 ? '❌ OUT' : `⚠️ ${p.stock_quantity}`}
                </span>
                <button type="button" onClick={() => onRestock?.(p)} className="font-body text-[11px] font-bold" style={{ color: '#4B1D3F' }}>Restock →</button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS TAB
// ─────────────────────────────────────────────────────────────────────────────
const OrdersTab: React.FC<{
  ordersData: any; isLoading: boolean; statusFilter: string; setStatusFilter: (s: string) => void;
  orderSearchInput: string; setOrderSearchInput: (s: string) => void; onSearch: (q: string) => void;
  orderSearch: string; onUpdateStatus: (n: string, s: string) => void;
}> = ({ ordersData, isLoading, statusFilter, setStatusFilter, orderSearchInput, setOrderSearchInput, onSearch, orderSearch, onUpdateStatus }) => (
  <div className="space-y-4">
    <Card className="p-4 flex flex-wrap items-center gap-4">
      <form onSubmit={e => { e.preventDefault(); onSearch(orderSearchInput); }} className="flex gap-2 flex-1 min-w-[260px] max-w-sm">
        <input value={orderSearchInput} onChange={e => setOrderSearchInput(e.target.value)} placeholder="Search order #, customer, phone…" className="input-field text-sm flex-1" />
        <button type="submit" className="btn-primary px-4 py-2"><Search size={13} /></button>
      </form>
      <div className="flex items-center gap-2">
        <span className="font-body text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(27,27,27,0.45)' }}>Status:</span>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-xs" style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        {(statusFilter || orderSearch) && (
          <button onClick={() => { setStatusFilter(''); onSearch(''); setOrderSearchInput(''); }} className="font-body text-[11px]" style={{ color: '#D8A7B1' }}>✕ Clear</button>
        )}
      </div>
    </Card>
    {isLoading ? <LoadingSpinner /> : (
      <div className="space-y-3">
        {(ordersData?.results || []).length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: 'rgba(75,29,63,0.2)' }} />
            <p className="font-body text-sm font-semibold" style={{ color: '#1B1B1B' }}>No orders found</p>
          </Card>
        ) : (ordersData?.results || []).map((order: any) => (
          <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
        ))}
      </div>
    )}
  </div>
);

const OrderCard: React.FC<{ order: any; onUpdateStatus: (n: string, s: string) => void }> = ({ order, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const next = NEXT_STATUS[order.order_status];
  return (
    <Card className="transition-all duration-150 hover:shadow-md">
      <div className="p-4 flex flex-wrap items-center gap-4 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="w-40">
          <p className="font-body text-xs font-bold" style={{ color: '#4B1D3F' }}>{order.order_number}</p>
          <p className="font-body text-[10px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{new Date(order.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="font-body text-sm font-bold" style={{ color: '#1B1B1B' }}>{order.customer_name}</p>
          <a href={`tel:${order.customer_phone}`} className="font-body text-[11px]" style={{ color: '#4B1D3F' }} onClick={e => e.stopPropagation()}>📞 {order.customer_phone}</a>
        </div>
        <span className={`font-body text-[10px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[order.order_status] || 'bg-slate-100 text-slate-500'}`}>{STATUS_LABELS[order.order_status] || order.order_status}</span>
        <div className="text-right min-w-[90px]">
          <p className="font-body text-sm font-bold" style={{ color: '#4B1D3F' }}>৳{Number(order.total_amount).toLocaleString()}</p>
          <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'rgba(27,27,27,0.4)' }}>COD</p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: 'rgba(27,27,27,0.3)' }} />
      </div>
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'rgba(75,29,63,0.08)', background: 'rgba(232,217,193,0.08)' }}>
          <div className="grid sm:grid-cols-2 gap-3 text-xs font-body">
            <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid rgba(75,29,63,0.08)' }}>
              <p className="uppercase tracking-widest text-[10px] font-bold mb-1" style={{ color: 'rgba(27,27,27,0.4)' }}>Address</p>
              <p style={{ color: '#1B1B1B' }}>{order.address}</p>
              <p className="mt-0.5" style={{ color: 'rgba(27,27,27,0.6)' }}>Zone: <strong style={{ color: '#4B1D3F' }}>{order.delivery_zone_name}</strong></p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid rgba(75,29,63,0.08)' }}>
              <p className="uppercase tracking-widest text-[10px] font-bold mb-2" style={{ color: 'rgba(27,27,27,0.4)' }}>Pricing</p>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><strong>৳{Number(order.subtotal).toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Delivery</span><strong>৳{Number(order.delivery_charge).toLocaleString()}</strong></div>
                <div className="flex justify-between pt-1 font-bold text-sm" style={{ color: '#4B1D3F', borderTop: '1px solid rgba(75,29,63,0.1)' }}>
                  <span>Total</span><span>৳{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          {order.customer_note && (
            <div className="p-3 rounded-xl text-xs font-body" style={{ background: 'white', borderLeft: '3px solid #4B1D3F', border: '1px solid rgba(75,29,63,0.1)' }}>
              <span className="uppercase tracking-widest text-[10px] font-bold block mb-1" style={{ color: 'rgba(27,27,27,0.4)' }}>Note</span>
              <p className="italic" style={{ color: '#1B1B1B' }}>"{order.customer_note}"</p>
            </div>
          )}
          <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid rgba(75,29,63,0.08)' }}>
            <p className="uppercase tracking-widest text-[10px] font-bold font-body mb-2" style={{ color: 'rgba(27,27,27,0.4)' }}>Items</p>
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs font-body py-1.5" style={{ borderBottom: '1px solid rgba(75,29,63,0.06)' }}>
                <span>{item.product_name} <span style={{ color: 'rgba(27,27,27,0.4)' }}>× {item.quantity}</span></span>
                <span className="font-bold" style={{ color: '#4B1D3F' }}>৳{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-[10px] uppercase tracking-wider font-bold" style={{ color: 'rgba(27,27,27,0.4)' }}>Update Status:</span>
            {next && (
              <button onClick={() => onUpdateStatus(order.order_number, next)} className="font-body text-[11px] px-3 py-1.5 rounded-lg font-bold" style={{ background: '#4B1D3F', color: '#E8D9C1' }}>
                → {STATUS_LABELS[next]}
              </button>
            )}
            {ALL_STATUSES.filter(s => s !== order.order_status && s !== next).map(s => (
              <button key={s} onClick={() => onUpdateStatus(order.order_number, s)} className="font-body text-[11px] px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'white', color: 'rgba(27,27,27,0.6)', border: '1px solid rgba(75,29,63,0.15)' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4B1D3F'; (e.currentTarget as HTMLButtonElement).style.color = '#4B1D3F'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(75,29,63,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(27,27,27,0.6)'; }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ProductsTab: React.FC<{
  products: any[]; totalCount: number; isLoading: boolean; search: string; setSearch: (s: string) => void;
  onSearchSubmit: (q: string) => void; onOpenCreateProduct: () => void; onRestock: (p: any) => void;
}> = ({ products, totalCount, isLoading, search, setSearch, onSearchSubmit, onOpenCreateProduct, onRestock }) => (
  <div className="space-y-4">
    <Card className="p-4 flex flex-wrap items-center gap-4 justify-between">
      <form onSubmit={e => { e.preventDefault(); onSearchSubmit(search); }} className="flex gap-2 flex-1 min-w-[260px] max-w-sm">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input-field text-sm flex-1" />
        <button type="submit" className="btn-primary px-4 py-2"><Search size={13} /></button>
      </form>
      <div className="flex items-center gap-3">
        <span className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.45)' }}>{totalCount} product(s)</span>
        <button onClick={onOpenCreateProduct} className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={12} /> Add Product</button>
      </div>
    </Card>
    {isLoading ? <LoadingSpinner /> : (
      <TableWrap>
        <thead><tr><Th>Product</Th><Th>SKU</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th right>Actions</Th></tr></thead>
        <tbody>
          {products.map(p => {
            const img = p.primary_image?.url || p.primary_image?.image_url || p.images?.[0]?.url;
            return (
              <tr key={p.id} style={{ background: 'white', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,217,193,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <Td>
                  <div className="flex items-center gap-3">
                    {img ? <img src={img} alt={p.name} className="w-10 h-10 object-cover rounded-lg" style={{ border: '1px solid rgba(75,29,63,0.1)' }} />
                      : <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm" style={{ background: '#E8D9C1', color: '#4B1D3F' }}>F</div>}
                    <div>
                      <p className="font-semibold" style={{ color: '#1B1B1B' }}>{p.name}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{p.material || '—'}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="font-mono text-[10px]" style={{ color: 'rgba(27,27,27,0.5)' }}>{p.sku}</span></Td>
                <Td>{p.category?.name || <span style={{ color: 'rgba(27,27,27,0.3)' }}>—</span>}</Td>
                <Td><strong style={{ color: '#4B1D3F' }}>৳{Number(p.price).toLocaleString()}</strong></Td>
                <Td>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${p.stock_quantity === 0 ? 'bg-red-50 text-red-600' : p.stock_quantity <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {p.stock_quantity === 0 ? '0 — Out' : p.stock_quantity}
                  </span>
                </Td>
                <Td><span className={`text-[11px] font-semibold ${p.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>{p.is_active ? '✓ Live' : '○ Hidden'}</span></Td>
                <Td right>
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/products/${p.slug}`} target="_blank" className="text-[11px] flex items-center gap-0.5" style={{ color: 'rgba(27,27,27,0.4)' }}>View <ExternalLink size={10} /></Link>
                    <button type="button" onClick={() => onRestock(p)} className="text-[11px] font-bold" style={{ color: '#4B1D3F' }}>Quick Edit</button>
                    <span style={{ color: 'rgba(27,27,27,0.2)' }}>|</span>
                    <a href={`${DJANGO_ADMIN_URL}/catalog/product/${p.id}/change/`} target="_blank" rel="noopener noreferrer" className="text-[11px]" style={{ color: 'rgba(27,27,27,0.45)' }}>Full Edit ↗</a>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES TAB
// ─────────────────────────────────────────────────────────────────────────────
const CategoriesTab: React.FC<{ categories: any[]; isLoading: boolean; onOpenCreateCategory: () => void }> = ({ categories, isLoading, onOpenCreateCategory }) => (
  <div className="space-y-4">
    <Card className="p-4 flex items-center justify-between">
      <div>
        <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Product Categories</h2>
        <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>Hierarchical taxonomy for your catalogue</p>
      </div>
      <button type="button" onClick={onOpenCreateCategory} className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={13} /> Add Category</button>
    </Card>
    {isLoading ? <LoadingSpinner /> : (
      <TableWrap>
        <thead><tr><Th>Category</Th><Th>Slug</Th><Th>Description</Th><Th>Sub-categories</Th><Th>Status</Th><Th right>Actions</Th></tr></thead>
        <tbody>
          {categories.map((c: any) => (
            <tr key={c.id} style={{ background: 'white', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,217,193,0.15)')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <Td><span className="font-bold" style={{ color: '#4B1D3F' }}>{c.name}</span></Td>
              <Td><span className="font-mono text-[10px]" style={{ color: 'rgba(27,27,27,0.5)' }}>{c.slug}</span></Td>
              <Td className="truncate" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || <span style={{ color: 'rgba(27,27,27,0.25)' }}>—</span>}</Td>
              <Td>{(c.children || []).length > 0 ? <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: '#E8D9C1', color: '#4B1D3F' }}>{c.children.length} sub</span> : <span style={{ color: 'rgba(27,27,27,0.3)' }}>—</span>}</Td>
              <Td><span className={`text-[11px] font-semibold ${c.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>{c.is_active ? '✓ Active' : '○ Disabled'}</span></Td>
              <Td right>
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/categories/${c.slug}`} target="_blank" className="text-[11px] flex items-center gap-0.5" style={{ color: 'rgba(27,27,27,0.4)' }}>View <ExternalLink size={10} /></Link>
                  <a href={`${DJANGO_ADMIN_URL}/catalog/category/${c.id}/change/`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold" style={{ color: '#4B1D3F' }}>Edit ↗</a>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY TAB
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryTab: React.FC<{ zones: any[]; isLoading: boolean; onOpenCreateDelivery: () => void }> = ({ zones, isLoading, onOpenCreateDelivery }) => (
  <div className="space-y-4">
    <Card className="p-4 flex items-center justify-between">
      <div>
        <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Delivery Zones & Rates</h2>
        <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>Manage delivery charges and eligible areas</p>
      </div>
      <button type="button" onClick={onOpenCreateDelivery} className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1.5"><Plus size={13} /> Add Zone</button>
    </Card>
    {isLoading ? <LoadingSpinner /> : (
      <TableWrap>
        <thead><tr><Th>Zone / Area</Th><Th>City</Th><Th>Area Detail</Th><Th>Delivery Fee</Th><Th>Status</Th><Th right>Actions</Th></tr></thead>
        <tbody>
          {zones.map((z: any) => (
            <tr key={z.id} style={{ background: 'white', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,217,193,0.15)')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <Td><span className="font-bold" style={{ color: '#1B1B1B' }}>{z.name}</span></Td>
              <Td>{z.city}</Td>
              <Td>{z.area || <span style={{ color: 'rgba(27,27,27,0.3)' }}>—</span>}</Td>
              <Td>{z.is_free ? <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: '#ecfdf5', color: '#059669' }}>🎁 FREE</span> : <strong style={{ color: '#4B1D3F' }}>৳{Number(z.delivery_charge).toLocaleString()}</strong>}</Td>
              <Td><span className={`text-[11px] font-semibold ${z.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>{z.is_active ? '✓ Active' : '○ Paused'}</span></Td>
              <Td right><a href={`${DJANGO_ADMIN_URL}/delivery/deliveryzone/${z.id}/change/`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold" style={{ color: '#4B1D3F' }}>Edit ↗</a></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ReviewsTab: React.FC<{
  reviewsData: any; isLoading: boolean; filter: 'all' | 'pending' | 'approved'; setFilter: (f: 'all' | 'pending' | 'approved') => void;
  onApprove: (id: number) => void; onFeature: (id: number) => void; onDelete: (id: number) => void;
}> = ({ reviewsData, isLoading, filter, setFilter, onApprove, onFeature, onDelete }) => {
  const reviews: Review[] = reviewsData?.results || reviewsData || [];
  const pendingCount = reviews.filter(r => !r.is_approved).length;
  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-lg" style={{ color: '#4B1D3F' }}>Customer Reviews</h2>
          <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>Moderate and manage product reviews</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="font-body text-[11px] px-3 py-1.5 rounded-lg uppercase tracking-wider font-medium transition-all"
              style={{ background: filter === f ? '#4B1D3F' : 'white', color: filter === f ? '#E8D9C1' : 'rgba(27,27,27,0.5)', border: '1px solid rgba(75,29,63,0.15)' }}>
              {f === 'pending' && pendingCount > 0 ? `Pending (${pendingCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </Card>
      {isLoading ? <LoadingSpinner /> : (
        reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare size={36} className="mx-auto mb-3" style={{ color: 'rgba(75,29,63,0.2)' }} />
            <p className="font-body text-sm font-semibold" style={{ color: '#1B1B1B' }}>No reviews found</p>
            <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{filter === 'pending' ? 'All reviews are moderated!' : 'No reviews yet.'}</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reviews.map(r => <ReviewCard key={r.id} review={r} onApprove={onApprove} onFeature={onFeature} onDelete={onDelete} />)}
          </div>
        )
      )}
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review; onApprove: (id: number) => void; onFeature: (id: number) => void; onDelete: (id: number) => void }> = ({ review, onApprove, onFeature, onDelete }) => (
  <Card className="p-5 flex flex-col gap-3 transition-all duration-150 hover:shadow-md">
    <div className="flex flex-wrap items-start gap-4 justify-between">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0" style={{ background: '#E8D9C1', color: '#4B1D3F' }}>
          {review.reviewer_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-bold" style={{ color: '#1B1B1B' }}>{review.reviewer_name}</p>
            {review.is_featured && <span className="font-body text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded" style={{ background: '#fef9c3', color: '#854d0e' }}>⭐ Featured</span>}
          </div>
          {review.reviewer_email && <p className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>{review.reviewer_email}</p>}
          <Stars rating={review.rating} size={12} />
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <span className={`font-body text-[10px] font-bold px-2 py-0.5 rounded-md ${review.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {review.is_approved ? '✓ Approved' : '⏳ Pending'}
        </span>
        <a href={`${DJANGO_ADMIN_URL}/catalog/product/${review.product}/change/`} target="_blank" rel="noopener noreferrer" className="font-body text-[11px] font-semibold" style={{ color: '#4B1D3F' }}>{review.product_name}</a>
        <p className="font-body text-[10px]" style={{ color: 'rgba(27,27,27,0.35)' }}>{new Date(review.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>
    {review.title && <p className="font-body text-sm font-semibold" style={{ color: '#1B1B1B' }}>{review.title}</p>}
    <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(27,27,27,0.7)' }}>{review.body}</p>
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2" style={{ borderTop: '1px solid rgba(75,29,63,0.07)' }}>
      <span className="font-body text-[11px]" style={{ color: 'rgba(27,27,27,0.4)' }}>👍 {review.helpful_count} found helpful</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onApprove(review.id)} className="font-body text-[11px] px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ background: review.is_approved ? 'rgba(239,68,68,0.08)' : '#ecfdf5', color: review.is_approved ? '#dc2626' : '#059669', border: `1px solid ${review.is_approved ? '#fecaca' : '#a7f3d0'}` }}>
          {review.is_approved ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Approve</>}
        </button>
        <button onClick={() => onFeature(review.id)} className="font-body text-[11px] px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ background: review.is_featured ? '#fef9c3' : 'white', color: review.is_featured ? '#854d0e' : 'rgba(27,27,27,0.5)', border: '1px solid rgba(75,29,63,0.15)' }}>
          <Award size={11} /> {review.is_featured ? 'Unfeature' : 'Feature'}
        </button>
        <button onClick={() => onDelete(review.id)} className="font-body text-[11px] px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PRODUCT MODAL
// ─────────────────────────────────────────────────────────────────────────────
const CreateProductModal: React.FC<{ isOpen: boolean; onClose: () => void; categories: any[]; onSuccess: () => void }> = ({ isOpen, onClose, categories, onSuccess }) => {
  const [name, setName] = useState(''); const [categoryId, setCategoryId] = useState(''); const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10'); const [material, setMaterial] = useState(''); const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]); const [previews, setPreviews] = useState<string[]>([]); const [showUrl, setShowUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const updated = [...files, ...Array.from(e.target.files)];
    setFiles(updated); previews.forEach(u => URL.revokeObjectURL(u)); setPreviews(updated.map(f => URL.createObjectURL(f)));
  };
  const removeFile = (idx: number) => {
    if (previews[idx]) URL.revokeObjectURL(previews[idx]);
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated); setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Product title required.');
    if (!categoryId) return setError('Please select a category.');
    if (!price || Number(price) <= 0) return setError('Please enter a valid price.');
    if (!description.trim()) return setError('Description required.');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim()); fd.append('category_id', String(categoryId)); fd.append('price', String(price));
      fd.append('stock_quantity', String(stock || 0)); if (material.trim()) fd.append('material', material.trim());
      fd.append('description', description.trim()); fd.append('is_active', 'true');
      files.forEach(f => fd.append('images', f)); if (imageUrl.trim()) fd.append('image_url', imageUrl.trim());
      await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`"${name.trim()}" published!`);
      setName(''); setCategoryId(''); setPrice(''); setStock('10'); setMaterial(''); setDescription(''); setFiles([]); setPreviews([]); setImageUrl('');
      onSuccess(); onClose();
    } catch (err: any) { setError(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to create product.'); }
    finally { setLoading(false); }
  };
  return (
    <ModalBase title="Add New Product" subtitle="Publish a new product to your storefront" onClose={onClose} wide>
      {error && <div className="mb-4"><FormError msg={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Product Title" required><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Royal Pearl Necklace" className="input-field" required /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category" required>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field" required>
              <option value="">Select…</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Material"><input type="text" value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. 18K Gold Plated" className="input-field" /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price (৳ BDT)" required><input type="number" min="1" step="any" value={price} onChange={e => setPrice(e.target.value)} placeholder="450" className="input-field" required /></FormField>
          <FormField label="Initial Stock"><input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="input-field" /></FormField>
        </div>
        <FormField label="Product Photos">
          <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl cursor-pointer transition-all" style={{ border: '2px dashed rgba(216,167,177,0.6)', background: 'rgba(232,217,193,0.1)' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4B1D3F'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(216,167,177,0.6)'; }}>
            <input type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />
            <Upload size={22} style={{ color: '#4B1D3F' }} />
            <p className="font-body text-xs font-semibold" style={{ color: '#4B1D3F' }}>Choose Local Images</p>
            <p className="font-body text-[10px]" style={{ color: 'rgba(27,27,27,0.4)' }}>JPG, PNG, WEBP — multiple allowed</p>
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3 p-2 rounded-xl" style={{ background: 'rgba(232,217,193,0.2)' }}>
              {previews.map((src, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden" style={{ border: '1px solid rgba(75,29,63,0.1)' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && <span className="absolute bottom-0 inset-x-0 text-white text-[8px] font-bold py-0.5 text-center" style={{ background: 'rgba(75,29,63,0.85)' }}>★ Main</span>}
                  <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(220,38,38,0.9)' }}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setShowUrl(!showUrl)} className="mt-2 font-body text-[11px] underline" style={{ color: 'rgba(27,27,27,0.4)' }}>{showUrl ? 'Hide URL field' : '+ Add via image URL instead'}</button>
          {showUrl && <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…" className="input-field mt-1.5" />}
        </FormField>
        <FormField label="Description" required><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product…" className="input-field" required /></FormField>
        <FormActions onClose={onClose} loading={loading} submitLabel="Publish Product" />
      </form>
    </ModalBase>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CATEGORY MODAL
// ─────────────────────────────────────────────────────────────────────────────
const CreateCategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; categories: any[]; onSuccess: () => void }> = ({ isOpen, onClose, categories, onSuccess }) => {
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Category name required.');
    setLoading(true); setError('');
    try {
      await api.post('/categories/', { name: name.trim(), description: description.trim(), parent: parentId ? Number(parentId) : null, is_active: true });
      toast.success('Category created!'); setName(''); setDescription(''); setParentId(''); onSuccess(); onClose();
    } catch (err: any) { setError(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to create category.'); }
    finally { setLoading(false); }
  };
  return (
    <ModalBase title="Create Category" subtitle="Organise products into collections" onClose={onClose}>
      {error && <div className="mb-4"><FormError msg={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category Name" required><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bangles & Kadas" className="input-field" required /></FormField>
        <FormField label="Parent Category (optional)">
          <select value={parentId} onChange={e => setParentId(e.target.value)} className="input-field">
            <option value="">None (Top-Level)</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Description"><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" className="input-field" /></FormField>
        <FormActions onClose={onClose} loading={loading} submitLabel="Save Category" />
      </form>
    </ModalBase>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE DELIVERY ZONE MODAL
// ─────────────────────────────────────────────────────────────────────────────
const CreateDeliveryZoneModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState(''); const [city, setCity] = useState('Dhaka'); const [area, setArea] = useState('');
  const [charge, setCharge] = useState('60'); const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Zone name required.');
    if (!city.trim()) return setError('City required.');
    setLoading(true); setError('');
    try {
      await api.post('/delivery-zones/', { name: name.trim(), city: city.trim(), area: area.trim() || name.trim(), delivery_charge: isFree ? 0 : Number(charge) || 0, is_free: isFree, is_active: true });
      toast.success('Delivery zone added!'); setName(''); setCity('Dhaka'); setArea(''); setCharge('60'); setIsFree(false); onSuccess(); onClose();
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to create delivery zone.'); }
    finally { setLoading(false); }
  };
  return (
    <ModalBase title="Add Delivery Zone" subtitle="Define delivery charges or free delivery areas" onClose={onClose}>
      {error && <div className="mb-4"><FormError msg={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Zone / Campus Name" required><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daffodil Main Campus" className="input-field" required /></FormField>
        <FormField label="City / Region" required><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Dhaka or Cox's Bazar" className="input-field" required /></FormField>
        <FormField label="Area / Address Detail"><input type="text" value={area} onChange={e => setArea(e.target.value)} placeholder="Optional — e.g. Mirpur 1" className="input-field" /></FormField>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(232,217,193,0.3)', border: '1px solid rgba(75,29,63,0.1)' }}>
          <input type="checkbox" id="is_free_zone" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-4 h-4 cursor-pointer" />
          <label htmlFor="is_free_zone" className="font-body text-xs font-semibold cursor-pointer select-none" style={{ color: '#1B1B1B' }}>🎁 Mark as Free Delivery Zone</label>
        </div>
        {!isFree && <FormField label="Delivery Fee (৳ BDT)" required><input type="number" min="0" value={charge} onChange={e => setCharge(e.target.value)} placeholder="60" className="input-field" required /></FormField>}
        <FormActions onClose={onClose} loading={loading} submitLabel="Save Zone" />
      </form>
    </ModalBase>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK RESTOCK MODAL
// ─────────────────────────────────────────────────────────────────────────────
const QuickRestockModal: React.FC<{ product: any | null; onClose: () => void; onSuccess: () => void }> = ({ product, onClose, onSuccess }) => {
  const [stock,    setStock]    = useState('0');
  const [price,    setPrice]    = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  React.useEffect(() => {
    if (product) { setStock(String(product.stock_quantity)); setPrice(String(product.price)); setIsActive(Boolean(product.is_active)); setNewFiles([]); setNewPreviews([]); setError(''); }
  }, [product]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const updated = [...newFiles, ...Array.from(e.target.files)];
    setNewFiles(updated); newPreviews.forEach(u => URL.revokeObjectURL(u)); setNewPreviews(updated.map(f => URL.createObjectURL(f)));
  };
  const removeNewFile = (idx: number) => {
    if (newPreviews[idx]) URL.revokeObjectURL(newPreviews[idx]);
    const updated = newFiles.filter((_, i) => i !== idx); setNewFiles(updated); setNewPreviews(updated.map(f => URL.createObjectURL(f)));
  };
  const handleDeleteExistingImage = async (imageId: number) => {
    if (!confirm('Delete this photo?')) return;
    try { await api.delete(`/products/${product.slug}/images/${imageId}/`); toast.success('Photo removed.'); onSuccess(); }
    catch { toast.error('Could not remove photo.'); }
  };

  if (!product) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.patch(`/products/${product.slug}/`, { stock_quantity: Number(stock), price: Number(price), is_active: isActive });
      if (newFiles.length > 0) {
        const fd = new FormData(); newFiles.forEach(f => fd.append('images', f));
        await api.post(`/products/${product.slug}/upload_image/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(`"${product.name}" updated!`); onSuccess(); onClose();
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update product.'); }
    finally { setLoading(false); }
  };

  const existingImages = product.images || [];
  return (
    <ModalBase title="Quick Edit / Restock" subtitle={`${product.name} · SKU: ${product.sku}`} onClose={onClose} wide>
      {error && <div className="mb-4"><FormError msg={error} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Stock Quantity"><input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="input-field" /><p className="font-body text-[10px] mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>0 = Out of Stock</p></FormField>
          <FormField label="Price (৳ BDT)"><input type="number" min="1" step="any" value={price} onChange={e => setPrice(e.target.value)} className="input-field" /></FormField>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(232,217,193,0.3)', border: '1px solid rgba(75,29,63,0.1)' }}>
          <input type="checkbox" id="product_is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 cursor-pointer" />
          <label htmlFor="product_is_active" className="font-body text-xs font-semibold cursor-pointer select-none" style={{ color: '#1B1B1B' }}>Visible & purchasable in store</label>
        </div>
        {existingImages.length > 0 && (
          <FormField label={`Current Photos (${existingImages.length})`}>
            <div className="grid grid-cols-4 gap-2">
              {existingImages.map((img: any) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden" style={{ border: '1px solid rgba(75,29,63,0.1)' }}>
                  <img src={img.url || img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                  {img.is_primary && <span className="absolute bottom-0 inset-x-0 text-white text-[8px] font-bold py-0.5 text-center" style={{ background: 'rgba(75,29,63,0.85)' }}>★ Main</span>}
                  <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#dc2626' }}><Trash2 size={10} /></button>
                </div>
              ))}
            </div>
          </FormField>
        )}
        <FormField label="Upload More Photos">
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all" style={{ border: '1px dashed rgba(216,167,177,0.6)', background: 'rgba(232,217,193,0.1)' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4B1D3F'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(216,167,177,0.6)'; }}>
            <input type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />
            <Upload size={16} style={{ color: '#4B1D3F' }} /><span className="font-body text-xs font-semibold" style={{ color: '#4B1D3F' }}>Upload from Computer</span>
          </label>
          {newPreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {newPreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden" style={{ border: '1px solid #a7f3d0' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 rounded-full p-0.5 text-white" style={{ background: 'rgba(27,27,27,0.7)' }}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
        </FormField>
        <FormActions onClose={onClose} loading={loading} submitLabel="Save Changes" />
      </form>
    </ModalBase>
  );
};

export default AdminDashboardPage;
