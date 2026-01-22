import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import MyRequestsPage from './pages/Dashboard/MyRequestsPage';
import AdvisorDashboardPage from './pages/Dashboard/AdvisorDashboardPage';
import CompanyDashboardPage from './pages/Dashboard/CompanyDashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import AdminDashboardPage from './pages/Dashboard/AdminDashboardPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/new-request" element={<NewRequestPage />} />
        <Route path="/dashboard/my-requests" element={<MyRequestsPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/advisor-dashboard" element={<AdvisorDashboardPage />} />
        <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
