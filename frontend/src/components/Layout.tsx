import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Settings,
    Database,
    Play,
    FileText,
    TrendingUp,
    LogIn,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatAgent from './ChatAgent';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, token } = useAuth();

    const navItems = [
        { path: '/', icon: BarChart3, label: 'Dashboard' },
        { path: '/simulations', icon: Database, label: 'Simulations' },
        { path: '/data-explorer', icon: TrendingUp, label: 'Data Explorer' },
        { path: '/visualizations', icon: TrendingUp, label: 'Visualizations' },
        { path: '/run', icon: Play, label: 'Run Simulation' },
        { path: '/parameters', icon: Settings, label: 'Parameters' },
        { path: '/reports', icon: FileText, label: 'Reports' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

                    {token && (
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
                    )}
                </div>

                <div className="topbar-right">
                    {token && user ? (
                        <>
                            <div className="topnav-item" style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User className="nav-icon" size={16} />
                                <span>{user.fullName}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="topnav-item"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <LogOut className="nav-icon" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className={`topnav-item ${
                                location.pathname === '/login' ? 'active' : ''
                            }`}
                        >
                            <LogIn className="nav-icon" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </header>

            <main className="main-content">
                <div className="content-wrapper">{children}</div>
            </main>

            {token && <ChatAgent />}
        </div>
    );
};

export default Layout;
