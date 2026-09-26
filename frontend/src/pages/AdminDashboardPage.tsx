import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart2, ShoppingBag, Package, TrendingUp, AlertTriangle,
  Users, Truck, LogOut, ChevronRight, RefreshCw, Search, Filter
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ErrorState } from '../components/UI';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Stats {
  total_orders: number; today_orders: number; week_orders: number;
  pending_orders: number; delivered_orders: number; cancelled_orders: number;
  total_revenue: string; today_revenue: string; avg_order_value: string;
  active_products: number; out_of_stock: number; low_stock: number;
  category_sales: { name: string; units_sold: number; revenue: string; order_count: number }[];
  top_products: { product_id: number; name: string; slug: string; units_sold: number; revenue: string }[];
  monthly_revenue: { month: string; revenue: string; orders: number }[];
  daily_orders: { date: string; count: number; revenue: string }[];
  recent_orders: any[];
  low_stock_products: { id: number; name: string; stock_quantity: number; cat_name: string }[];
}

// ── Data fetchers ──────────────────────────────────────────────────────────────
const fetchStats   = async (): Promise<Stats>  => (await api.get('/admin/stats/')).data;
const fetchOrders  = async (params?: object)   => (await api.get('/admin/orders/', { params })).data;
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
  PENDING: '🕐 Pending', CONFIRMED: '✅ Confirmed', PROCESSING: '⚙️ Processing',
  SHIPPED: '🚚 Shipped', DELIVERED: '📦 Delivered', CANCELLED: '❌ Cancelled',
  FAILED_DELIVERY: '⚠️ Failed',
};
const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','FAILED_DELIVERY'];
const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED',
};

// ── Sidebar nav items ──────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'delivery';
const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',      icon: <BarChart2 size={16} /> },
  { id: 'orders',    label: 'Orders',          icon: <ShoppingBag size={16} /> },
  { id: 'products',  label: 'Products',        icon: <Package size={16} /> },
  { id: 'categories',label: 'Categories',      icon: <Filter size={16} /> },
  { id: 'delivery',  label: 'Delivery Areas',  icon: <Truck size={16} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');

  // Orders tab state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

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

  const statusMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Order status updated!');
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleLogout = () => { logout(); navigate('/'); toast('Logged out.'); };

  // ── Layout wrapper ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-nude flex">
      {/* Sidebar */}
      <aside className="w-56 bg-off-black flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link to="/">
            <span className="font-display text-lg text-nude tracking-widest">FLEMBE</span>
            <span className="font-display text-lg text-rose-smoke tracking-widest ml-1">ESSENCE</span>
          </Link>
          <p className="font-body text-[10px] tracking-widest uppercase text-nude/30 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left font-body text-xs tracking-wide uppercase transition-all ${
                tab === n.id
                  ? 'bg-burgundy text-nude'
                  : 'text-nude/50 hover:text-nude hover:bg-white/5'
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}

          {/* Django admin link */}
          <a
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-5 py-3 text-left font-body text-xs tracking-wide uppercase text-nude/30 hover:text-nude/60 transition-colors mt-4 border-t border-white/5 pt-4"
          >
            <BarChart2 size={16} /> Full Admin →
          </a>
        </nav>

        <div className="p-5 border-t border-white/10">
          <p className="font-body text-xs text-nude/50 mb-1">Logged in as</p>
          <p className="font-body text-sm text-nude font-semibold">{admin?.username}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 font-body text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wide"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-nude-dark px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl text-burgundy">
            {NAV.find(n => n.id === tab)?.label ?? 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { refetchStats(); refetchOrders(); }}
              className="text-off-black/40 hover:text-burgundy transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <span className="font-body text-xs text-off-black/40 tracking-wide">
              {new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* ── DASHBOARD TAB ─────────────────────────────────────────────── */}
          {tab === 'dashboard' && (
            statsLoading ? <LoadingSpinner /> :
            statsError   ? <ErrorState onRetry={refetchStats} /> :
            stats        ? <DashboardTab stats={stats} onTabChange={setTab} /> : null
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

          {/* ── OTHER TABS — redirect to Django admin ─────────────────────── */}
          {(tab === 'products' || tab === 'categories' || tab === 'delivery') && (
            <div className="bg-white border border-nude-dark p-12 text-center">
              <Package size={40} className="text-burgundy mx-auto mb-4" />
              <h2 className="font-display text-2xl text-burgundy mb-2">
                {tab === 'products' ? 'Product Management' : tab === 'categories' ? 'Category Management' : 'Delivery Zones'}
              </h2>
              <p className="font-body text-sm text-off-black/50 mb-6">
                Manage {tab} from the full-featured admin panel.
              </p>
              <a
                href={`/admin/catalog_${tab === 'delivery' ? '' : tab}/` + (tab === 'delivery' ? '/delivery/deliveryzone/' : '')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                Open {tab === 'products' ? 'Products' : tab === 'categories' ? 'Categories' : 'Delivery'} in Admin
                <ChevronRight size={14} />
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────────────────────────────────────
const DashboardTab: React.FC<{ stats: Stats; onTabChange: (t: Tab) => void }> = ({ stats, onTabChange }) => {
  const fmt = (n: string | number) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const maxRevenue = Math.max(...stats.category_sales.map(c => Number(c.revenue)), 1);
  const maxMonthly = Math.max(...stats.monthly_revenue.map(m => Number(m.revenue)), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={fmt(stats.total_revenue)} sub="Confirmed + delivered" color="burgundy" />
        <KPICard label="Today's Revenue" value={fmt(stats.today_revenue)} sub={`${stats.today_orders} order(s) today`} />
        <KPICard label="Avg. Order Value" value={fmt(stats.avg_order_value)} sub="All confirmed orders" />
        <KPICard label="Active Products" value={stats.active_products} sub={`${stats.out_of_stock} out of stock`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Pending" value={stats.pending_orders} sub="Need confirmation" urgent={stats.pending_orders > 0} onClick={() => onTabChange('orders')} />
        <KPICard label="This Week" value={stats.week_orders} sub="Orders placed" />
        <KPICard label="This Month" value={stats.month_orders} sub="Orders placed" />
        <KPICard label="Delivered" value={stats.delivered_orders} sub="Successfully completed" color="green" />
      </div>

      {/* Order Status Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-nude-dark p-5">
          <h2 className="font-display text-lg text-burgundy mb-4">Order Status Breakdown</h2>
          <div className="space-y-2">
            {ALL_STATUSES.map(s => {
              const count = (stats.status_breakdown as Record<string, number>)[s] || 0;
              const total = stats.total_orders || 1;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold w-32 text-center ${STATUS_COLORS[s]}`}>
                    {STATUS_LABELS[s]}
                  </span>
                  <div className="flex-1 bg-nude h-2">
                    <div className="bg-burgundy h-2 transition-all" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="font-body text-xs font-bold text-burgundy w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white border border-nude-dark p-5">
          <h2 className="font-display text-lg text-burgundy mb-4">Monthly Revenue</h2>
          {stats.monthly_revenue.length === 0 ? (
            <p className="font-body text-sm text-off-black/40 text-center py-8">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {stats.monthly_revenue.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-burgundy/80 hover:bg-burgundy transition-colors rounded-t-sm"
                    style={{ height: `${(Number(m.revenue) / maxMonthly) * 100}%`, minHeight: 4 }}
                    title={`${m.month}: ৳${Number(m.revenue).toLocaleString()}`}
                  />
                  <span className="font-body text-[9px] text-off-black/50 text-center leading-tight">{m.month.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category-wise Sales */}
      <div className="bg-white border border-nude-dark p-5">
        <h2 className="font-display text-lg text-burgundy mb-4">Sales by Category</h2>
        {stats.category_sales.length === 0 ? (
          <p className="font-body text-sm text-off-black/40 text-center py-8">No sales recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.category_sales.map(cat => (
              <div key={cat.name} className="flex items-center gap-4">
                <span className="font-body text-sm font-semibold w-36 text-off-black truncate">{cat.name}</span>
                <div className="flex-1 bg-nude h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-smoke h-3 rounded-full transition-all"
                    style={{ width: `${(Number(cat.revenue) / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-body text-xs text-burgundy font-bold w-24 text-right">
                  ৳{Number(cat.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="font-body text-xs text-off-black/40 w-16 text-right">{cat.units_sold} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products + Low Stock */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-nude-dark p-5">
          <h2 className="font-display text-lg text-burgundy mb-4">🏆 Top Selling Products</h2>
          {stats.top_products.length === 0 ? (
            <p className="font-body text-sm text-off-black/40">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.top_products.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3 py-2 border-b border-nude last:border-0">
                  <span className="font-display text-xl text-rose-smoke w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-off-black truncate">{p.name}</p>
                    <p className="font-body text-xs text-off-black/40">{p.units_sold} units sold</p>
                  </div>
                  <span className="font-body text-sm font-bold text-burgundy">
                    ৳{Number(p.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-nude-dark p-5">
          <h2 className="font-display text-lg text-burgundy mb-4">⚠️ Low Stock Alert</h2>
          {stats.low_stock_products.length === 0 ? (
            <p className="font-body text-sm text-green-600">All products are well stocked! ✓</p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock_products.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-nude last:border-0">
                  <div>
                    <p className="font-body text-sm font-semibold text-off-black">{p.name}</p>
                    <p className="font-body text-xs text-off-black/40">{p.cat_name}</p>
                  </div>
                  <span className={`font-body text-xs font-bold px-2 py-1 ${
                    p.stock_quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock_quantity === 0 ? '❌ OUT' : `⚠️ ${p.stock_quantity} left`}
                  </span>
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
  ordersData: any; isLoading: boolean;
  statusFilter: string; setStatusFilter: (s: string) => void;
  orderSearch: string; setOrderSearch: (s: string) => void;
  search: string; setSearch: (s: string) => void;
  onUpdateStatus: (orderNumber: string, status: string) => void;
}> = ({ ordersData, isLoading, statusFilter, setStatusFilter, orderSearch, setOrderSearch, search, setSearch, onUpdateStatus }) => (
  <div className="space-y-4">
    {/* Filters */}
    <div className="flex flex-wrap gap-3 bg-white border border-nude-dark p-4">
      <form onSubmit={e => { e.preventDefault(); setOrderSearch(search); }} className="flex gap-2 flex-1 min-w-48">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order #, name, or phone…"
          className="input-field text-sm flex-1"
        />
        <button type="submit" className="btn-primary px-4">
          <Search size={14} />
        </button>
      </form>
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="input-field text-sm w-auto"
      >
        <option value="">All Statuses</option>
        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
    </div>

    {/* Orders list */}
    {isLoading ? <LoadingSpinner /> : (
      <div className="space-y-3">
        {(ordersData?.results || []).length === 0 ? (
          <div className="bg-white border border-nude-dark p-12 text-center">
            <p className="font-body text-sm text-off-black/40">No orders found.</p>
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
    <div className="bg-white border border-nude-dark">
      {/* Header row */}
      <div className="p-4 flex flex-wrap items-center gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="font-body text-xs font-bold text-burgundy tracking-wide">{order.order_number}</p>
          <p className="font-body text-xs text-off-black/40">
            {new Date(order.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex-1">
          <p className="font-body text-sm font-bold text-off-black">{order.customer_name}</p>
          <a href={`tel:${order.customer_phone}`} className="font-body text-xs text-burgundy" onClick={e => e.stopPropagation()}>
            {order.customer_phone}
          </a>
        </div>

        <span className={`font-body text-xs font-bold px-3 py-1.5 ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-500'}`}>
          {STATUS_LABELS[order.order_status] || order.order_status}
        </span>

        <div className="text-right">
          <p className="font-body text-sm font-bold text-burgundy">৳{Number(order.total_amount).toLocaleString()}</p>
          <p className="font-body text-xs text-off-black/40">COD</p>
        </div>

        <ChevronRight size={16} className={`text-off-black/30 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-nude px-4 pb-4 pt-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3 text-xs font-body">
            <div>
              <p className="text-off-black/40 uppercase tracking-widest text-[10px] mb-0.5">Delivery Address</p>
              <p className="text-off-black">{order.address}</p>
              <p className="text-off-black/60">{order.delivery_zone_name}</p>
            </div>
            <div>
              <p className="text-off-black/40 uppercase tracking-widest text-[10px] mb-0.5">Order Summary</p>
              <p>Subtotal: <strong>৳{Number(order.subtotal).toLocaleString()}</strong></p>
              <p>Delivery: <strong>৳{Number(order.delivery_charge).toLocaleString()}</strong></p>
              <p>Total: <strong className="text-burgundy">৳{Number(order.total_amount).toLocaleString()}</strong></p>
            </div>
          </div>

          {order.customer_note && (
            <div className="bg-nude p-3 text-xs font-body">
              <span className="text-off-black/40 uppercase tracking-widest text-[10px]">Customer Note: </span>
              {order.customer_note}
            </div>
          )}

          {/* Items */}
          <div>
            <p className="font-body text-[10px] uppercase tracking-widest text-off-black/40 mb-1">Items Ordered</p>
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs font-body py-1 border-b border-nude last:border-0">
                <span>{item.product_name} × {item.quantity}</span>
                <span className="font-bold text-burgundy">৳{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Status update */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="font-body text-[10px] uppercase tracking-widest text-off-black/40 self-center">Update Status:</span>
            {ALL_STATUSES.filter(s => s !== order.order_status).map(s => (
              <button
                key={s}
                onClick={() => onUpdateStatus(order.order_number, s)}
                className={`font-body text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  s === next
                    ? 'bg-burgundy text-nude border-burgundy'
                    : 'bg-white text-off-black/60 border-nude-dark hover:border-burgundy hover:text-burgundy'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────
const KPICard: React.FC<{
  label: string; value: string | number; sub?: string;
  color?: 'burgundy' | 'green'; urgent?: boolean; onClick?: () => void;
}> = ({ label, value, sub, color, urgent, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border p-5 flex flex-col gap-1 transition-all ${
      urgent ? 'border-amber-300 border-t-4' :
      color === 'green' ? 'border-green-200 border-t-4' :
      color === 'burgundy' ? 'border-burgundy border-t-4' : 'border-nude-dark'
    } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
  >
    <span className={`font-display text-3xl font-bold ${urgent ? 'text-amber-600' : color === 'green' ? 'text-green-600' : 'text-burgundy'}`}>
      {value}
    </span>
    <span className="font-body text-[10px] uppercase tracking-widest text-off-black font-semibold">{label}</span>
    {sub && <span className="font-body text-[10px] text-off-black/40">{sub}</span>}
  </div>
);

export default AdminDashboardPage;
