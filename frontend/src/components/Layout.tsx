import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BarChart3,
    Settings,
    Database,
    Play,
    FileText,
    TrendingUp,
    LogIn
} from 'lucide-react';
import ChatAgent from './ChatAgent';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    // Remove login from main nav
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
            <header className="topbar">
                <div className="topbar-left">
                    <div className="logo">
                        <BarChart3 className="logo-icon" />
                        <div>
                            <div className="logo-text">PRISM</div>
                            <div className="logo-subtitle">Agent-Based Economics</div>
                        </div>
                    </div>

                    <nav className="topnav">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`topnav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className="nav-icon" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="topbar-right">
                    {/* LOGIN BUTTON MOVED HERE */}
                    <Link
                        to="/login"
                        className={`topnav-item ${
                            location.pathname === '/login' ? 'active' : ''
                        }`}
                    >
                        <LogIn className="nav-icon" />
                        <span>Login</span>
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <div className="content-wrapper">{children}</div>
            </main>

            <ChatAgent />
        </div>
    );
};

export default Layout;
