import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BarChart3,
    Settings,
    Database,
    Play,
    FileText,
    TrendingUp
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: BarChart3, label: 'Dashboard' },
        { path: '/simulations', icon: Database, label: 'Simulations' },
        { path: '/data-explorer', icon: TrendingUp, label: 'Data Explorer' },
        { path: '/visualizations', icon: TrendingUp, label: 'Visualizations' },
        { path: '/run', icon: Play, label: 'Run Simulation' },
        { path: '/parameters', icon: Settings, label: 'Parameters' },
        { path: '/reports', icon: FileText, label: 'Reports' },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <BarChart3 className="logo-icon" />
                        <span className="logo-text">SABCEMM</span>
                    </div>
                    <div className="logo-subtitle">Agent-Based Economics</div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon className="nav-icon" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="version-info">
                        <span>Version 1.0.0</span>
                        <span className="badge badge-primary">PhD</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
