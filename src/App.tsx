import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Beranda';
import { SplashScreen } from './components/SplashScreen';
import { ProkerList } from './pages/Proker';
import { AgendaTimeline } from './pages/Agenda';
import { Kehadiran } from './pages/Kehadiran';
import { Keuangan } from './pages/Keuangan';
import { Administrasi } from './pages/Administrasi';
import { Pengaturan } from './pages/Pengaturan';
import { SeputarKami } from './pages/SeputarKami';
import { Login } from './pages/Login';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] || 'beranda';
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (activeTab === 'login') {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="pb-24 md:pb-8"
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/beranda" replace />} />
            <Route path="/beranda" element={<Dashboard />} />
            <Route path="/proker" element={<ProkerList />} />
            <Route path="/agenda" element={<AgendaTimeline />} />
            <Route path="/kehadiran" element={<Kehadiran />} />
            <Route path="/keuangan" element={<Keuangan />} />
            <Route path="/administrasi" element={<Administrasi />} />
            <Route path="/seputarkami" element={<SeputarKami />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
