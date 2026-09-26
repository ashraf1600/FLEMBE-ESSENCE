import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart2, ShoppingBag, Package, TrendingUp,
  Truck, LogOut, ChevronRight, RefreshCw, Search, Filter,
  ExternalLink, Plus, CheckCircle, ArrowUpRight, X, Edit2, AlertTriangle
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

// ── Backend Admin URL helper ──────────────────────────────────────────────────
const DJANGO_ADMIN_URL = '/admin';

// ── Data fetchers ──────────────────────────────────────────────────────────────
const fetchStats = async (): Promise<Stats> => (await api.get('/admin/stats/')).data;
const fetchOrders = async (params?: object) => (await api.get('/admin/orders/', { params })).data;
const fetchProducts = async (params?: object) => (await api.get('/products/', { params })).data;
const fetchCategories = async () => (await api.get('/categories/?all=true')).data;
const fetchDeliveryZones = async () => (await api.get('/delivery-zones/')).data;

const updateStatus = async ({ orderNumber, order_status }: { orderNumber: string; order_status: string }) =>
  (await api.patch(`/admin/orders/${orderNumber}/status/`, { order_status })).data;

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-sky-100 text-sky-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  FAILED_DELIVERY: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '🕐 Pending',
  CONFIRMED: '✅ Confirmed',
  PROCESSING: '⚙️ Processing',
  SHIPPED: '🚚 Shipped',
  DELIVERED: '📦 Delivered',
  CANCELLED: '❌ Cancelled',
  FAILED_DELIVERY: '⚠️ Failed',
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED_DELIVERY'];
const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

// ── Sidebar nav items ──────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'delivery';
const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',  label: 'Dashboard',      icon: <BarChart2 size={16} /> },
  { id: 'orders',     label: 'Orders',         icon: <ShoppingBag size={16} /> },
  { id: 'products',   label: 'Products',       icon: <Package size={16} /> },
  { id: 'categories', label: 'Categories',     icon: <Filter size={16} /> },
  { id: 'delivery',   label: 'Delivery Areas', icon: <Truck size={16} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');

  // In-dashboard modal states
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateDeliveryOpen, setIsCreateDeliveryOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<{ id: number; slug: string; name: string; stock_quantity: number } | null>(null);

  // Orders tab state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Products tab state
  const [prodSearch, setProdSearch] = useState('');
  const [prodSearchQuery, setProdSearchQuery] = useState('');

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    staleTime: 30_000,
  });

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders', statusFilter, orderSearch],
    queryFn: () => fetchOrders({ status: statusFilter || undefined, search: orderSearch || undefined }),
    enabled: tab === 'orders',
    staleTime: 10_000,
  });

  const { data: productsData, isLoading: prodsLoading, refetch: refetchProds } = useQuery({
    queryKey: ['admin-products-list', prodSearchQuery],
    queryFn: () => fetchProducts({ search: prodSearchQuery || undefined, page_size: 50 }),
    enabled: tab === 'products',
    staleTime: 20_000,
  });

  const { data: categoriesData, isLoading: catsLoading, refetch: refetchCats } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: fetchCategories,
    enabled: tab === 'categories',
    staleTime: 30_000,
  });

  const { data: deliveryData, isLoading: deliveryLoading, refetch: refetchDelivery } = useQuery({
    queryKey: ['admin-delivery-list'],
    queryFn: fetchDeliveryZones,
    enabled: tab === 'delivery',
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Order status updated!');
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast('Logged out from admin.');
  };

  const handleRefresh = () => {
    if (tab === 'dashboard') refetchStats();
    if (tab === 'orders') refetchOrders();
    if (tab === 'products') refetchProds();
    if (tab === 'categories') refetchCats();
    if (tab === 'delivery') refetchDelivery();
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#17151a] flex-shrink-0 flex flex-col shadow-2xl shadow-black/10">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="block">
            <span className="font-display text-lg text-nude tracking-widest">FLEMBE</span>
            <span className="font-display text-lg text-rose-smoke tracking-widest ml-1">ESSENCE</span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="font-body text-[11px] tracking-widest uppercase text-nude/60">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 text-left font-body text-xs tracking-wide uppercase transition-all ${
                tab === n.id
                  ? 'bg-burgundy text-nude font-bold shadow-[inset_3px_0_0_#e8c4cb]'
                  : 'text-nude/60 hover:text-nude hover:bg-white/5'
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}

          {/* Direct Django Admin Link */}
          <div className="px-5 mt-6 pt-5 border-t border-white/10">
            <p className="font-body text-[10px] uppercase tracking-widest text-nude/40 mb-2">Advanced</p>
            <a
              href={`${DJANGO_ADMIN_URL}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-nude/60 hover:text-nude text-xs font-body py-1.5 transition-colors"
            >
              <span>Django Built-in Admin</span>
              <ExternalLink size={12} />
            </a>
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-between text-nude/60 hover:text-nude text-xs font-body py-1.5 transition-colors"
            >
              <span>Visit Public Storefront</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </nav>

        <div className="p-5 border-t border-white/10 bg-black/20">
          <p className="font-body text-xs text-nude/40 mb-0.5">Signed in as</p>
          <p className="font-body text-sm text-nude font-bold truncate">{admin?.username}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 font-body text-xs text-rose-smoke/80 hover:text-rose-smoke transition-colors uppercase tracking-wider"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white/95 backdrop-blur border-b border-slate-200 px-6 lg:px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-display text-2xl text-burgundy">
              {NAV.find(n => n.id === tab)?.label ?? 'Dashboard'}
            </h1>
            <p className="font-body text-xs text-off-black/50">
              Flembe Essence Store Management & Real-time Insights
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-body transition-colors rounded-lg"
              title="Refresh Data"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
            <div className="text-right border-l border-nude-dark pl-4">
              <span className="font-body text-xs text-off-black/60 font-medium block">
                {new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 flex-1">
          {/* ── DASHBOARD TAB ─────────────────────────────────────────────── */}
          {tab === 'dashboard' && (
            statsLoading ? <LoadingSpinner /> :
            statsError   ? <ErrorState onRetry={refetchStats} /> :
            stats        ? (
              <DashboardTab
                stats={stats}
                onTabChange={setTab}
                onOpenCreateProduct={() => setIsCreateProductOpen(true)}
                onRestock={(p) => setRestockProduct(p)}
              />
            ) : null
          )}

          {/* ── ORDERS TAB ────────────────────────────────────────────────── */}
          {tab === 'orders' && (
            <OrdersTab
              ordersData={ordersData}
              isLoading={ordersLoading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              search={search}
              setSearch={setSearch}
              onUpdateStatus={(orderNumber, st) => statusMutation.mutate({ orderNumber, order_status: st })}
            />
          )}

          {/* ── PRODUCTS TAB ──────────────────────────────────────────────── */}
          {tab === 'products' && (
            <ProductsTab
              products={productsData?.results || []}
              totalCount={productsData?.count || 0}
              isLoading={prodsLoading}
              search={prodSearch}
              setSearch={setProdSearch}
              onSearchSubmit={(q) => setProdSearchQuery(q)}
              onOpenCreateProduct={() => setIsCreateProductOpen(true)}
              onRestock={(p) => setRestockProduct(p)}
            />
          )}

          {/* ── CATEGORIES TAB ────────────────────────────────────────────── */}
          {tab === 'categories' && (
            <CategoriesTab
              categories={categoriesData?.results || categoriesData || []}
              isLoading={catsLoading}
              onOpenCreateCategory={() => setIsCreateCategoryOpen(true)}
            />
          )}

          {/* ── DELIVERY TAB ──────────────────────────────────────────────── */}
          {tab === 'delivery' && (
            <DeliveryTab
              zones={deliveryData?.results || deliveryData || []}
              isLoading={deliveryLoading}
              onOpenCreateDelivery={() => setIsCreateDeliveryOpen(true)}
            />
          )}
        </div>

        {/* ── In-Dashboard Modals (No extra logins required) ── */}
        <CreateProductModal
          isOpen={isCreateProductOpen}
          onClose={() => setIsCreateProductOpen(false)}
          categories={categoriesData?.results || categoriesData || []}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-products-list'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
            qc.invalidateQueries({ queryKey: ['products'] });
          }}
        />

        <CreateCategoryModal
          isOpen={isCreateCategoryOpen}
          onClose={() => setIsCreateCategoryOpen(false)}
          categories={categoriesData?.results || categoriesData || []}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-categories-list'] });
            qc.invalidateQueries({ queryKey: ['categories'] });
          }}
        />

        <CreateDeliveryZoneModal
          isOpen={isCreateDeliveryOpen}
          onClose={() => setIsCreateDeliveryOpen(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-delivery-list'] });
            qc.invalidateQueries({ queryKey: ['delivery-zones'] });
          }}
        />

        <QuickRestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-products-list'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
          }}
        />
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────────────────────────────────────
const DashboardTab: React.FC<{ stats: Stats; onTabChange: (t: Tab) => void }> = ({ stats, onTabChange }) => {
  const fmt = (n: string | number) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const maxRevenue = Math.max(...(stats.category_sales || []).map(c => Number(c.revenue)), 1);
  const maxMonthly = Math.max(...(stats.monthly_revenue || []).map(m => Number(m.revenue)), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards — Financials */}
      <div>
        <p className="font-body text-xs uppercase tracking-widest text-off-black/50 mb-3 font-semibold">Financial & Inventory Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Revenue" value={fmt(stats.total_revenue)} sub="Confirmed + Delivered" color="burgundy" />
          <KPICard label="Today's Revenue" value={fmt(stats.today_revenue)} sub={`${stats.today_orders} order(s) today`} />
          <KPICard label="Avg. Order Value" value={fmt(stats.avg_order_value)} sub="From confirmed orders" />
          <KPICard label="Active Products" value={stats.active_products} sub={`${stats.out_of_stock} out of stock`} onClick={() => onTabChange('products')} />
        </div>
      </div>

      {/* KPI Cards — Orders Pipeline */}
      <div>
        <p className="font-body text-xs uppercase tracking-widest text-off-black/50 mb-3 font-semibold">Order Pipeline Status</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Pending Action"
            value={stats.pending_orders}
            sub="Awaiting review/confirmation"
            urgent={stats.pending_orders > 0}
            onClick={() => onTabChange('orders')}
          />
          <KPICard label="Orders This Week" value={stats.week_orders} sub="Last 7 calendar days" />
          <KPICard label="Orders This Month" value={stats.month_orders} sub="Last 30 calendar days" />
          <KPICard label="Successfully Delivered" value={stats.delivered_orders} sub="Delivered COD orders" color="green" />
        </div>
      </div>

      {/* Order Status Breakdown & Monthly Trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-burgundy">Order Pipeline Breakdown</h2>
            <span className="font-body text-xs text-off-black/40">Total {stats.total_orders} orders</span>
          </div>
          <div className="space-y-2.5">
            {ALL_STATUSES.map(s => {
              const count = (stats.status_breakdown as Record<string, number>)?.[s] || 0;
              const total = stats.total_orders || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold w-36 text-center rounded-sm ${STATUS_COLORS[s]}`}>
                    {STATUS_LABELS[s]}
                  </span>
                  <div className="flex-1 bg-nude/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-burgundy h-2.5 transition-all duration-500 rounded-full"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="font-body text-xs font-bold text-burgundy w-8 text-right">{count}</span>
                  <span className="font-body text-[10px] text-off-black/40 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm shadow-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg text-burgundy">Revenue Trends (Recent Months)</h2>
              <TrendingUp size={16} className="text-burgundy/60" />
            </div>
            <p className="font-body text-xs text-off-black/50 mb-6">Confirmed order revenue aggregated monthly</p>
          </div>

          {(stats.monthly_revenue || []).length === 0 ? (
            <p className="font-body text-sm text-off-black/40 text-center py-12">No monthly revenue recorded yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-44 pt-4 border-b border-nude-dark pb-2">
              {stats.monthly_revenue.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="font-body text-[10px] text-off-black/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {fmt(m.revenue)}
                  </span>
                  <div
                    className="w-full bg-burgundy/80 hover:bg-burgundy transition-all duration-300 rounded-t"
                    style={{ height: `${(Number(m.revenue) / maxMonthly) * 100}%`, minHeight: 6 }}
                    title={`${m.month}: ${fmt(m.revenue)} (${m.orders} orders)`}
                  />
                  <span className="font-body text-[10px] text-off-black/60 text-center leading-tight mt-1">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category-wise Sales Distribution */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-burgundy">Category-Wise Sales Performance</h2>
            <p className="font-body text-xs text-off-black/50">Units sold & revenue contribution by product category</p>
          </div>
          <button onClick={() => onTabChange('categories')} className="font-body text-xs text-burgundy hover:underline flex items-center gap-1">
            Manage Categories <ChevronRight size={13} />
          </button>
        </div>

        {(stats.category_sales || []).length === 0 ? (
          <p className="font-body text-sm text-off-black/40 text-center py-8">No category sales recorded yet.</p>
        ) : (
          <div className="space-y-3.5">
            {stats.category_sales.map(cat => (
              <div key={cat.name} className="flex items-center gap-4">
                <span className="font-body text-sm font-semibold w-40 text-off-black truncate">{cat.name}</span>
                <div className="flex-1 bg-nude/70 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-smoke h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(Number(cat.revenue) / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-body text-xs text-burgundy font-bold w-28 text-right">
                  {fmt(cat.revenue)}
                </span>
                <span className="font-body text-xs text-off-black/50 w-24 text-right">
                  {cat.units_sold} sold ({cat.order_count} orders)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products + Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-nude-dark p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-burgundy">🏆 Best Sellers</h2>
            <span className="font-body text-xs text-off-black/40">By units sold</span>
          </div>
          {(stats.top_products || []).length === 0 ? (
            <p className="font-body text-sm text-off-black/40 py-4">No sales data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.top_products.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3 py-2 border-b border-nude-dark/40 last:border-0">
                  <span className="font-display text-lg font-bold text-rose-smoke w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-off-black truncate">{p.name}</p>
                    <p className="font-body text-xs text-off-black/40">{p.units_sold} units sold</p>
                  </div>
                  <span className="font-body text-sm font-bold text-burgundy">
                    {fmt(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-nude-dark p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-burgundy">⚠️ Low Stock Alerts</h2>
            <button onClick={() => onTabChange('products')} className="font-body text-xs text-burgundy hover:underline flex items-center gap-1">
              View All Products <ChevronRight size={13} />
            </button>
          </div>
          {(stats.low_stock_products || []).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-body text-sm text-emerald-700 font-medium">Inventory is healthy!</p>
              <p className="font-body text-xs text-off-black/40">No products are currently under critical threshold.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.low_stock_products.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-nude-dark/40 last:border-0">
                  <div>
                    <p className="font-body text-sm font-semibold text-off-black">{p.name}</p>
                    <p className="font-body text-xs text-off-black/50">{p.cat_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-bold px-2.5 py-1 rounded-sm ${
                      p.stock_quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.stock_quantity === 0 ? '❌ OUT OF STOCK' : `⚠️ Only ${p.stock_quantity} left`}
                    </span>
                    <a
                      href={`${DJANGO_ADMIN_URL}/admin/catalog/product/${p.id}/change/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-body text-burgundy hover:underline"
                    >
                      Restock →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS TAB
// ─────────────────────────────────────────────────────────────────────────────
const OrdersTab: React.FC<{
  ordersData: any;
  isLoading: boolean;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  search: string;
  setSearch: (s: string) => void;
  onUpdateStatus: (orderNumber: string, status: string) => void;
}> = ({ ordersData, isLoading, statusFilter, setStatusFilter, orderSearch, setOrderSearch, search, setSearch, onUpdateStatus }) => (
  <div className="space-y-4">
    {/* Filters bar */}
    <div className="flex flex-wrap gap-4 bg-white border border-nude-dark p-5 shadow-sm items-center justify-between">
      <form onSubmit={e => { e.preventDefault(); setOrderSearch(search); }} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order #, customer name, or phone…"
          className="input-field text-sm flex-1"
        />
        <button type="submit" className="btn-primary px-4 py-2">
          <Search size={14} />
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="font-body text-xs text-off-black/60 uppercase tracking-wider font-semibold">Filter:</span>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field text-sm w-auto"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        {(statusFilter || orderSearch) && (
          <button
            onClick={() => { setStatusFilter(''); setOrderSearch(''); setSearch(''); }}
            className="text-xs text-rose-smoke font-body hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>

    {/* Orders list */}
    {isLoading ? <LoadingSpinner /> : (
      <div className="space-y-3">
        {(ordersData?.results || []).length === 0 ? (
          <div className="bg-white border border-nude-dark p-12 text-center shadow-sm">
            <ShoppingBag size={40} className="text-burgundy/30 mx-auto mb-3" />
            <p className="font-body text-base text-off-black font-semibold">No orders found</p>
            <p className="font-body text-xs text-off-black/50 mt-1">Try adjusting your search criteria or status filter.</p>
          </div>
        ) : (ordersData?.results || []).map((order: any) => (
          <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
        ))}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────────────────────
const OrderCard: React.FC<{ order: any; onUpdateStatus: (n: string, s: string) => void }> = ({ order, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const next = NEXT_STATUS[order.order_status];

  return (
    <div className="bg-white border border-nude-dark shadow-sm transition-all hover:border-burgundy/40">
      {/* Header row */}
      <div className="p-5 flex flex-wrap items-center gap-4 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="w-40">
          <p className="font-body text-xs font-bold text-burgundy tracking-wide">{order.order_number}</p>
          <p className="font-body text-[11px] text-off-black/50">
            {new Date(order.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex-1 min-w-[180px]">
          <p className="font-body text-sm font-bold text-off-black">{order.customer_name}</p>
          <a
            href={`tel:${order.customer_phone}`}
            className="font-body text-xs text-burgundy hover:underline inline-block"
            onClick={e => e.stopPropagation()}
          >
            📞 {order.customer_phone}
          </a>
        </div>

        <div>
          <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-sm ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABELS[order.order_status] || order.order_status}
          </span>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="font-body text-base font-bold text-burgundy">৳{Number(order.total_amount).toLocaleString()}</p>
          <p className="font-body text-[11px] text-off-black/50 uppercase tracking-wider">Cash on Delivery</p>
        </div>

        <ChevronRight size={18} className={`text-off-black/30 transition-transform ${expanded ? 'rotate-90 text-burgundy' : ''}`} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-nude-dark/50 bg-nude/15 px-6 pb-6 pt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-xs font-body">
            <div className="bg-white p-4 border border-nude-dark">
              <p className="text-off-black/50 uppercase tracking-widest text-[10px] font-bold mb-1">Delivery Destination</p>
              <p className="text-off-black font-medium">{order.address}</p>
              <p className="text-off-black/70 mt-1">Zone: <strong className="text-burgundy">{order.delivery_zone_name}</strong></p>
            </div>
            <div className="bg-white p-4 border border-nude-dark">
              <p className="text-off-black/50 uppercase tracking-widest text-[10px] font-bold mb-1">Pricing Breakdown</p>
              <p className="flex justify-between py-0.5"><span>Subtotal:</span><strong>৳{Number(order.subtotal).toLocaleString()}</strong></p>
              <p className="flex justify-between py-0.5"><span>Delivery Charge:</span><strong>৳{Number(order.delivery_charge).toLocaleString()}</strong></p>
              <p className="flex justify-between py-0.5 border-t border-nude-dark/40 mt-1 pt-1 text-burgundy font-bold text-sm">
                <span>Total Amount:</span><span>৳{Number(order.total_amount).toLocaleString()}</span>
              </p>
            </div>
          </div>

          {order.customer_note && (
            <div className="bg-white border-l-4 border-burgundy p-3.5 text-xs font-body shadow-sm">
              <span className="text-off-black/50 uppercase tracking-widest text-[10px] font-bold block mb-0.5">Customer Delivery Instructions:</span>
              <p className="text-off-black italic">"{order.customer_note}"</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-nude-dark p-4">
            <p className="font-body text-[10px] uppercase tracking-widest text-off-black/50 font-bold mb-2">Order Items Snapshot</p>
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs font-body py-2 border-b border-nude-dark/30 last:border-0">
                <span className="font-medium text-off-black">{item.product_name} <span className="text-off-black/50">× {item.quantity}</span></span>
                <span className="font-bold text-burgundy">৳{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Status update buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="font-body text-[11px] uppercase tracking-wider text-off-black/60 font-bold mr-2">Quick Action:</span>
            {ALL_STATUSES.filter(s => s !== order.order_status).map(s => (
              <button
                key={s}
                onClick={() => onUpdateStatus(order.order_number, s)}
                className={`font-body text-[11px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  s === next
                    ? 'bg-burgundy text-nude border-burgundy font-bold shadow-sm'
                    : 'bg-white text-off-black/70 border-nude-dark hover:border-burgundy hover:text-burgundy'
                }`}
              >
                Move to {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ProductsTab: React.FC<{
  products: any[];
  totalCount: number;
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  onSearchSubmit: (q: string) => void;
}> = ({ products, totalCount, isLoading, search, setSearch, onSearchSubmit }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-4 bg-white border border-nude-dark p-5 shadow-sm items-center justify-between">
      <form onSubmit={e => { e.preventDefault(); onSearchSubmit(search); }} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products by title, sku, material…"
          className="input-field text-sm flex-1"
        />
        <button type="submit" className="btn-primary px-4 py-2">
          <Search size={14} />
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="font-body text-xs text-off-black/60">{totalCount} product(s) registered</span>
        <a
          href={`${DJANGO_ADMIN_URL}/admin/catalog/product/add/`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3"
        >
          <Plus size={14} /> Add New Product
        </a>
      </div>
    </div>

    {isLoading ? <LoadingSpinner /> : (
      <div className="bg-white border border-nude-dark shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nude/40 border-b border-nude-dark text-[11px] font-body uppercase tracking-wider text-off-black/60">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nude-dark/40 font-body text-xs">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-nude/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {p.primary_image?.image_url ? (
                      <img src={p.primary_image.image_url} alt={p.name} className="w-10 h-10 object-cover border border-nude-dark" />
                    ) : (
                      <div className="w-10 h-10 bg-nude flex items-center justify-center text-burgundy font-bold">F</div>
                    )}
                    <div>
                      <p className="font-semibold text-off-black">{p.name}</p>
                      <p className="text-[10px] text-off-black/40">{p.material || 'Standard'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-off-black/60 font-mono text-[11px]">{p.sku}</td>
                <td className="py-3 px-4 text-off-black/80">{p.category?.name || 'Unassigned'}</td>
                <td className="py-3 px-4 font-bold text-burgundy">৳{Number(p.price).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                    p.stock_quantity === 0 ? 'bg-red-100 text-red-600' :
                    p.stock_quantity <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {p.stock_quantity === 0 ? '0 (Out)' : `${p.stock_quantity} in stock`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-semibold ${p.is_active ? 'text-emerald-600' : 'text-off-black/40'}`}>
                    {p.is_active ? '✓ Live' : '○ Hidden'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/products/${p.slug}`}
                      target="_blank"
                      className="text-off-black/50 hover:text-burgundy text-[11px] flex items-center gap-0.5"
                    >
                      View Live <ExternalLink size={10} />
                    </Link>
                    <a
                      href={`${DJANGO_ADMIN_URL}/admin/catalog/product/${p.id}/change/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-burgundy font-bold hover:underline text-[11px]"
                    >
                      Edit
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES TAB
// ─────────────────────────────────────────────────────────────────────────────
const CategoriesTab: React.FC<{ categories: any[]; isLoading: boolean }> = ({ categories, isLoading }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between bg-white border border-nude-dark p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg text-burgundy">Product Categories</h2>
        <p className="font-body text-xs text-off-black/50">Manage the hierarchical taxonomy for your catalogue</p>
      </div>
      <a
        href={`${DJANGO_ADMIN_URL}/admin/catalog/category/add/`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3"
      >
        <Plus size={14} /> Add Category
      </a>
    </div>

    {isLoading ? <LoadingSpinner /> : (
      <div className="bg-white border border-nude-dark shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nude/40 border-b border-nude-dark text-[11px] font-body uppercase tracking-wider text-off-black/60">
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Subcategories</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nude-dark/40 font-body text-xs">
            {categories.map((c: any) => (
              <tr key={c.id} className="hover:bg-nude/20 transition-colors">
                <td className="py-3 px-4 font-bold text-burgundy">{c.name}</td>
                <td className="py-3 px-4 text-off-black/60 font-mono text-[11px]">{c.slug}</td>
                <td className="py-3 px-4 text-off-black/70 max-w-xs truncate">{c.description || '—'}</td>
                <td className="py-3 px-4 text-off-black/60">
                  {(c.children || []).length > 0 ? (
                    <span className="bg-nude px-2 py-0.5 rounded text-[10px] text-burgundy font-semibold">
                      {c.children.length} sub-items
                    </span>
                  ) : 'None'}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-semibold ${c.is_active ? 'text-emerald-600' : 'text-off-black/40'}`}>
                    {c.is_active ? '✓ Active' : '○ Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/categories/${c.slug}`}
                      target="_blank"
                      className="text-off-black/50 hover:text-burgundy text-[11px] flex items-center gap-0.5"
                    >
                      View <ExternalLink size={10} />
                    </Link>
                    <a
                      href={`${DJANGO_ADMIN_URL}/admin/catalog/category/${c.id}/change/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-burgundy font-bold hover:underline text-[11px]"
                    >
                      Edit
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY TAB
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryTab: React.FC<{ zones: any[]; isLoading: boolean }> = ({ zones, isLoading }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between bg-white border border-nude-dark p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg text-burgundy">Eligible Delivery Zones & Rates</h2>
        <p className="font-body text-xs text-off-black/50">Manage free delivery eligibility and regional delivery charges</p>
      </div>
      <a
        href={`${DJANGO_ADMIN_URL}/admin/delivery/deliveryzone/add/`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3"
      >
        <Plus size={14} /> Add Delivery Zone
      </a>
    </div>

    {isLoading ? <LoadingSpinner /> : (
      <div className="bg-white border border-nude-dark shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nude/40 border-b border-nude-dark text-[11px] font-body uppercase tracking-wider text-off-black/60">
              <th className="py-3 px-4">Zone / Area</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Delivery Fee</th>
              <th className="py-3 px-4">Service Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nude-dark/40 font-body text-xs">
            {zones.map((z: any) => (
              <tr key={z.id} className="hover:bg-nude/20 transition-colors">
                <td className="py-3 px-4 font-bold text-off-black">{z.name}</td>
                <td className="py-3 px-4 text-off-black/60">{z.city}</td>
                <td className="py-3 px-4">
                  {z.is_free ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm font-bold text-[10px]">
                      🎁 FREE DELIVERY
                    </span>
                  ) : (
                    <strong className="text-burgundy">৳{Number(z.delivery_charge).toLocaleString()}</strong>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-semibold ${z.is_active ? 'text-emerald-600' : 'text-off-black/40'}`}>
                    {z.is_active ? '✓ Accepting Orders' : '○ Paused'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <a
                    href={`${DJANGO_ADMIN_URL}/admin/delivery/deliveryzone/${z.id}/change/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-burgundy font-bold hover:underline text-[11px]"
                  >
                    Edit Zone
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────
const KPICard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color?: 'burgundy' | 'green';
  urgent?: boolean;
  onClick?: () => void;
}> = ({ label, value, sub, color, urgent, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border p-5 flex flex-col gap-1 rounded-2xl transition-all shadow-sm shadow-slate-200/60 ${
      urgent ? 'border-amber-400 border-t-4' :
      color === 'green' ? 'border-emerald-500 border-t-4' :
      color === 'burgundy' ? 'border-burgundy border-t-4' : 'border-nude-dark'
    } ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-burgundy/60' : ''}`}
  >
    <span className={`font-display text-3xl font-bold ${
      urgent ? 'text-amber-600' :
      color === 'green' ? 'text-emerald-600' :
      'text-burgundy'
    }`}>
      {value}
    </span>
    <span className="font-body text-[11px] uppercase tracking-wider text-off-black font-semibold mt-1">{label}</span>
    {sub && <span className="font-body text-[11px] text-off-black/50">{sub}</span>}
  </div>
);

export default AdminDashboardPage;
