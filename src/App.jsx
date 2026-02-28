import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import CommunityPostDetail from './pages/CommunityPostDetail';

const PUBLIC_PAGES = ['Login', 'Register'];

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SplashScreen onFinish={() => setSplashDone(true)} />
        {splashDone && (
          <Router>
            <NavigationTracker />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <LayoutWrapper currentPageName={mainPageKey}>
                    <MainPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              } />
              {Object.entries(Pages).map(([path, Page]) => (
                <Route
                  key={path}
                  path={`/${path}`}
                  element={
                    PUBLIC_PAGES.includes(path) ? (
                      <LayoutWrapper currentPageName={path}>
                        <Page />
                      </LayoutWrapper>
                    ) : (
                      <ProtectedRoute>
                        <LayoutWrapper currentPageName={path}>
                          <Page />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    )
                  }
                />
              ))}
              <Route path="/CommunityPostDetail/:id" element={
                <ProtectedRoute>
                  <LayoutWrapper currentPageName="CommunityPostDetail">
                    <CommunityPostDetail />
                  </LayoutWrapper>
                </ProtectedRoute>
              } />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
        )}
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
