import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Cursor from './components/Cursor';
import Home from './pages/Home';
import Journal from './pages/Journal';
import StoryDetails from './pages/StoryDetails';
import CreateStory from './pages/CreateStory';
import EditStory from './pages/EditStory';
import MyStories from './pages/MyStories';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import './index.css';

// On client-side route change: reset scroll and move focus to the main
// region so keyboard and screen-reader users start at the new content.
// The previous-pathname guard keeps full page loads (including React
// StrictMode effect re-runs in development) from stealing focus.
function RouteFocus({ mainRef }) {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) {
      return;
    }
    prevPathname.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);

  return null;
}

function AppShell() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  return (
    <div className="app-container">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Cursor />
      <RouteFocus mainRef={mainRef} />
      <Navbar />

      <main id="main-content" className="main-content page-enter" ref={mainRef} tabIndex={-1} key={pathname}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/stories/:id" element={<StoryDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/write"
                element={
                  <ProtectedRoute>
                    <CreateStory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditStory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-stories"
                element={
                  <ProtectedRoute>
                    <MyStories />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <footer className="footer" role="contentinfo">
            <div className="footer-inner">
              <div className="footer-brand">
                <img src="/inka-logo-reversed.png" alt="INKA" className="footer-logo" />
              </div>
              <p className="footer-text">
                A personal blog & digital publication. Where ideas, experiences, and stories become editorial articles.
              </p>
              <p className="footer-text" style={{ opacity: 0.5 }}>
                © {new Date().getFullYear()} INKA. All stories and rights reserved.
              </p>
            </div>
          </footer>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
