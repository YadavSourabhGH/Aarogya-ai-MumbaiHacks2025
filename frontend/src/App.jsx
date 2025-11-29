import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HealthProfile from './pages/HealthProfile';
import Landing from './pages/Landing';
// Aarogya AI Workflow
import DoctorSearch from './pages/DoctorSearch';
import ConsentFlow from './pages/ConsentFlow';
import DataAggregation from './pages/DataAggregation';
import AnalysisProcessing from './pages/AnalysisProcessing';
import MedicalReport from './pages/MedicalReport';
import PatientHandout from './pages/PatientHandout';
import PatientConsent from './pages/PatientConsent';
import AbhaVerification from './pages/AbhaVerification';
import FederatedDashboard from './pages/FederatedDashboard';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/federated-learning', '/simulation/abha-verification'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/simulation/abha-verification" element={<AbhaVerification />} />
        <Route path="/federated-learning" element={<FederatedDashboard />} />

        {/* Patient Routes - Protected for patients */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route path="/consent" element={<PatientConsent />} />
        </Route>

        {/* Doctor Routes - Protected for doctors */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/aarogya-ai" element={<Navigate to="/aarogya-ai/search" />} />
          <Route path="/aarogya-ai/search" element={<DoctorSearch />} />
          <Route path="/aarogya-ai/consent" element={<ConsentFlow />} />
          <Route path="/aarogya-ai/aggregate" element={<DataAggregation />} />
          <Route path="/aarogya-ai/processing" element={<AnalysisProcessing />} />
          <Route path="/aarogya-ai/report/:analysisId" element={<MedicalReport />} />
          <Route path="/aarogya-ai/handout" element={<PatientHandout />} />

        </Route>
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
