import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingSpinner } from './components/UI';

// Lazy-loaded pages
const HomePage           = lazy(() => import('./pages/HomePage'));
const ShopPage           = lazy(() => import('./pages/ShopPage'));
const CategoriesPage     = lazy(() => import('./pages/CategoriesPage'));
const CategoryPage       = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage  = lazy(() => import('./pages/ProductDetailPage'));
const CartPage           = lazy(() => import('./pages/CartPage'));
const WishlistPage       = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage       = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage   = lazy(() => import('./pages/OrderSuccessPage'));
const AboutPage          = lazy(() => import('./pages/AboutPage'));
const DeliveryPage       = lazy(() => import('./pages/DeliveryPage'));
const ReturnExchangePage = lazy(() => import('./pages/ReturnExchangePage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const MyOrdersPage       = lazy(() => import('./pages/MyOrdersPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
// Admin pages
const AdminLoginPage     = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

const NotFoundPage = () => (
  <div className="max-w-2xl mx-auto px-4 py-20 text-center">
    <h1 className="font-display text-6xl text-burgundy mb-4">404</h1>
    <p className="font-body text-sm text-off-black/60 mb-8">This page doesn't exist.</p>
    <a href="/" className="btn-primary">Back to Home</a>
  </div>
);

/** Storefront wrapper — includes Navbar + Footer */
const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Admin routes (no navbar/footer) ──────────── */}
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* ── Customer Auth routes ──────────────────────── */}
                <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
                <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />
                <Route
                  path="/my-orders"
                  element={
                    <StorefrontLayout>
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    </StorefrontLayout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <StorefrontLayout>
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    </StorefrontLayout>
                  }
                />

                {/* ── Public storefront routes ──────────────────── */}
                <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
                <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
                <Route path="/categories" element={<StorefrontLayout><CategoriesPage /></StorefrontLayout>} />
                <Route path="/categories/:slug" element={<StorefrontLayout><CategoryPage /></StorefrontLayout>} />
                <Route path="/products/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
                <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
                <Route path="/wishlist" element={<StorefrontLayout><WishlistPage /></StorefrontLayout>} />
                <Route
                  path="/checkout"
                  element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>}
                />
                <Route path="/order-success" element={<StorefrontLayout><OrderSuccessPage /></StorefrontLayout>} />
                <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
                <Route path="/delivery" element={<StorefrontLayout><DeliveryPage /></StorefrontLayout>} />
                <Route path="/return-exchange" element={<StorefrontLayout><ReturnExchangePage /></StorefrontLayout>} />
                <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />
                <Route path="*" element={<StorefrontLayout><NotFoundPage /></StorefrontLayout>} />
              </Routes>
            </Suspense>

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'Jost, system-ui, sans-serif',
                  fontSize: '13px',
                  background: '#1B1B1B',
                  color: '#E8D9C1',
                  borderRadius: 0,
                },
                success: { iconTheme: { primary: '#D8A7B1', secondary: '#1B1B1B' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
