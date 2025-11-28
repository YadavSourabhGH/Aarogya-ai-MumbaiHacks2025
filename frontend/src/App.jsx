import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HealthProfile from './pages/HealthProfile';
import Landing from './pages/Landing';
// CureSight AI Workflow
import DoctorSearch from './pages/DoctorSearch';
import ConsentFlow from './pages/ConsentFlow';
import DataAggregation from './pages/DataAggregation';
import AnalysisProcessing from './pages/AnalysisProcessing';
import MedicalReport from './pages/MedicalReport';
import PatientHandout from './pages/PatientHandout';
import PatientConsent from './pages/PatientConsent';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient Routes - Protected for patients */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-profile" element={<HealthProfile />} />
            <Route path="/consent" element={<PatientConsent />} />
          </Route>

          {/* Doctor Routes - Protected for doctors */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/curesight" element={<Navigate to="/curesight/search" />} />
            <Route path="/curesight/search" element={<DoctorSearch />} />
            <Route path="/curesight/consent" element={<ConsentFlow />} />
            <Route path="/curesight/aggregate" element={<DataAggregation />} />
            <Route path="/curesight/processing" element={<AnalysisProcessing />} />
            <Route path="/curesight/report/:analysisId" element={<MedicalReport />} />
            <Route path="/curesight/handout" element={<PatientHandout />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
