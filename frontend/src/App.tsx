import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulations from './pages/Simulations';
import Visualizations from './pages/Visualizations';
import Parameters from './pages/Parameters';
import DataExplorer from './pages/DataExplorer';
import './components/Layout.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/data-explorer" element={<DataExplorer />} />
          <Route path="/parameters" element={<Parameters />} />
          <Route path="/run" element={<Parameters />} />
          <Route path="/reports" element={
            <div className="page-header">
              <h1 className="page-title">Reports</h1>
              <p className="page-description">
                Generate comprehensive PDF reports (Coming Soon)
              </p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
