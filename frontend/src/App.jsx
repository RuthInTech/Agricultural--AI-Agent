import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntroPage from './assets/Intro-page/IntroPage.jsx';
import Register from './assets/Login-Registration/Register.jsx';
import Login from './assets/Login-Registration/Login.jsx';
import AppShell from './layout/AppShell.jsx';
import HomePage from './assets/Home-page/HomePage.jsx';
import Weather from './assets/Weather/Weather.jsx';
import FarmerReportForm from './ExtensionAgent/FarmerReportForm.jsx';
import CasesPage from './pages/CasesPage.jsx';
import GuidancePage from './pages/GuidancePage.jsx';
import SavedAdvisoriesPage from './pages/SavedAdvisoriesPage.jsx';
import MyFarm from './assets/My-Farm/MyFarm.jsx';
import Profile from './assets/Profile/Profile.jsx';

function RequireAuth({ children }) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Marketing & Auth Routes */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />

      {/* Main Application Shell Navigation */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Weather" element={<Weather />} />
        <Route path="/Recommendations" element={<FarmerReportForm />} />
        <Route path="/CaseHistory" element={<CasesPage />} />
        <Route path="/Guidance" element={<GuidancePage />} />
        <Route path="/SavedRecords" element={<SavedAdvisoriesPage />} />
        <Route path="/MyFarm" element={<MyFarm />} />
        <Route path="/Profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
