import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import AIDoubtSolver from './pages/AIDoubtSolver';
import UpdateBlog from './pages/UpdateBlog';
import AllUpdates from './pages/AllUpdates';
import ExamList from './pages/ExamList';
import Instructions from './pages/Instructions';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { cn } from './utils';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isExamPage = location.pathname.includes('/test') && location.pathname.includes('/exams/');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {!isExamPage && <Navbar />}
      <main className={cn("container mx-auto px-4 py-8 flex-1", isExamPage && "max-w-none p-0 m-0")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/ai-doubt-solver" element={<AIDoubtSolver />} />
          <Route path="/update/:id" element={<UpdateBlog />} />
          <Route path="/updates/:type" element={<AllUpdates />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exams/:id/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
          <Route path="/exams/:id/test" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isExamPage && <Footer />}
      
      {/* AdSense Placeholder */}
      {!isExamPage && (
        <div className="container mx-auto px-4 mb-8">
          <div className="p-4 bg-white border border-slate-200 rounded-lg text-center text-slate-400 text-sm">
            <p>Advertisement</p>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 mt-2">
              Google AdSense Banner
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
