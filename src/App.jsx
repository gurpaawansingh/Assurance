import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConsentGate from '@/components/ConsentGate';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Landing from '@/pages/Landing';
import PrivacyPublic from '@/pages/PrivacyPublic';
import Consent from '@/pages/Consent';
import LocationVisibility from '@/pages/LocationVisibility';
import AppShell from '@/components/AppShell';
import Dashboard from '@/pages/Dashboard';
import Guardian from '@/pages/Guardian';
import GuardianActive from '@/pages/GuardianActive';
import SOS from '@/pages/SOS';
import CyberShield from '@/pages/CyberShield';
import Evidence from '@/pages/Evidence';
import EvidenceNew from '@/pages/EvidenceNew';
import Contacts from '@/pages/Contacts';
import Tips from '@/pages/Tips';
import QuickAccess from '@/pages/QuickAccess';
import PrivacySettingsPage from '@/pages/PrivacySettingsPage';
import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';
import Help from '@/pages/Help';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F3FF]">
        <div className="w-8 h-8 border-4 border-[#C4B5FD] border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }
  if (authError) {
    if (authError.type === 'user_not_registered') { return <UserNotRegisteredError />; }
    else if (authError.type === 'auth_required' && !['/', '/privacy', '/location-visibility', '/consent', '/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname)) { navigateToLogin(); return null; }
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<PrivacyPublic />} />
      <Route path="/location-visibility" element={<LocationVisibility />} />
      <Route path="/consent" element={<Consent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ConsentGate><Register /></ConsentGate>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guardian" element={<Guardian />} />
          <Route path="/guardian/active" element={<GuardianActive />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/cybershield" element={<CyberShield />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/evidence/new" element={<EvidenceNew />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/quick-access" element={<QuickAccess />} />
          <Route path="/privacy-settings" element={<PrivacySettingsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App