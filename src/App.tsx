import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { MyListPage } from './pages/MyListPage';
import { HistoryPage } from './pages/HistoryPage';
import { PlansPage } from './pages/PlansPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminContentsPage } from './pages/admin/AdminContentsPage';
import { AdminImportPage } from './pages/admin/AdminImportPage';

const AppLayout: React.FC = () => {
  const location = useLocation();

  // Determine if current route is fullscreen or admin
  const isWatchPage = location.pathname.startsWith('/watch/');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans selection:bg-crimson selection:text-white">
      {/* Show Client Navbar on standard pages */}
      {!isWatchPage && !isAdminPage && <Navbar />}

      {/* Main Page Router View */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/content/:slug" element={<ContentDetailPage />} />
          <Route path="/watch/:slug" element={<WatchPage />} />
          <Route path="/buscar" element={<SearchPage />} />

          {/* Category Routes */}
          <Route path="/doramas" element={<CategoryPage />} />
          <Route path="/filmes" element={<CategoryPage />} />
          <Route path="/series" element={<CategoryPage />} />
          <Route path="/novelas" element={<CategoryPage />} />
          <Route path="/novelinhas" element={<CategoryPage />} />
          <Route path="/mais-18" element={<CategoryPage />} />

          {/* User & Subscription Routes */}
          <Route path="/minha-lista" element={<MyListPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/perfil" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/contents" element={<AdminContentsPage />} />
          <Route path="/admin/categories" element={<AdminContentsPage />} />
          <Route path="/admin/episodes" element={<AdminContentsPage />} />
          <Route path="/admin/banners" element={<AdminContentsPage />} />
          <Route path="/admin/import" element={<AdminImportPage />} />
          <Route path="/admin/plans" element={<PlansPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* Show Client Footer and MobileNav on standard pages */}
      {!isWatchPage && !isAdminPage && <Footer />}
      {!isWatchPage && !isAdminPage && <MobileNav />}

      {/* Global Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
