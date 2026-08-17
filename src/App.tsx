import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareCapsule from '@/components/layout/CompareCapsule';
import CompareDrawer from '@/components/layout/CompareDrawer';
import AIAssistant from '@/components/layout/AIAssistant';
import Toast from '@/components/ui/Toast';
import { useUIStore } from '@/store/useUIStore';

import Home from '@/pages/Home';
import SmartMatch from '@/pages/SmartMatch';
import CityList from '@/pages/CityList';
import CityCompare from '@/pages/CityCompare';
import CityDetail from '@/pages/CityDetail';
import MatchResult from '@/pages/MatchResult';
import MapView from '@/pages/MapView';
import Community from '@/pages/Community';
import NoteDetail from '@/pages/NoteDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import ProfileInfo from '@/pages/ProfileInfo';
import ProfileFavorites from '@/pages/ProfileFavorites';
import ProfileHistory from '@/pages/ProfileHistory';
import ProfileReviews from '@/pages/ProfileReviews';

import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCities from '@/pages/admin/AdminCities';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminNotes from '@/pages/admin/AdminNotes';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';

function MainLayout({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CompareCapsule />
      <CompareDrawer />
      <AIAssistant />
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/match" element={<MainLayout><SmartMatch /></MainLayout>} />
        <Route path="/cities" element={<MainLayout><CityList /></MainLayout>} />
        <Route path="/compare" element={<MainLayout><CityCompare /></MainLayout>} />
        <Route path="/community" element={<MainLayout><Community /></MainLayout>} />
        <Route path="/note/:id" element={<MainLayout><NoteDetail /></MainLayout>} />
        <Route path="/city/:id" element={<MainLayout><CityDetail /></MainLayout>} />
        <Route path="/match-result" element={<MainLayout><MatchResult /></MainLayout>} />
        <Route path="/map" element={<MainLayout><MapView /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>}>
          <Route index element={<Navigate to="/profile/info" replace />} />
          <Route path="info" element={<ProfileInfo />} />
          <Route path="favorites" element={<ProfileFavorites />} />
          <Route path="history" element={<ProfileHistory />} />
          <Route path="reviews" element={<ProfileReviews />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="cities" element={<AdminCities />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="notes" element={<AdminNotes />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        <Route path="*" element={<MainLayout><div className="text-center py-20"><h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1><p className="text-slate-500">页面不存在</p></div></MainLayout>} />
      </Routes>
    </Router>
  );
}
