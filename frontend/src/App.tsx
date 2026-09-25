import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingSpinner } from './components/UI';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const ReturnExchangePage = lazy(() => import('./pages/ReturnExchangePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:slug" element={<CategoryPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/delivery" element={<DeliveryPage />} />
                  <Route path="/return-exchange" element={<ReturnExchangePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
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
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
