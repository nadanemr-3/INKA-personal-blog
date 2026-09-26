import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />

          <main className="main-content">
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
                <span>INKA</span>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
