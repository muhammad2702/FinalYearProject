import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/Dashboard';
import Simulations from './pages/Simulations';
import Visualizations from './pages/Visualizations';
import Parameters from './pages/Parameters';
import DataExplorer from './pages/DataExplorer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import './components/Layout.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/simulations" element={<PrivateRoute><Simulations /></PrivateRoute>} />
            <Route path="/visualizations" element={<PrivateRoute><Visualizations /></PrivateRoute>} />
            <Route path="/data-explorer" element={<PrivateRoute><DataExplorer /></PrivateRoute>} />
            <Route path="/parameters" element={<PrivateRoute><Parameters /></PrivateRoute>} />
            <Route path="/run" element={<PrivateRoute><Parameters /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute>
              <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-description">
                  Generate comprehensive PDF reports (Coming Soon)
                </p>
              </div>
            </PrivateRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
