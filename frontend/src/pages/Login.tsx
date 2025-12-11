import React, { useState } from 'react';
import { login } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            setLoading(true);
            const res = await login({ email, password });
            localStorage.setItem('token', res.token);
            setMessage('Logged in successfully.');
            setTimeout(() => navigate('/'), 500);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 420, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Log In</h1>
                <p className="page-description">Access your simulations</p>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="form-grid">
                        <label className="label">Email</label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button className="btn btn-primary mt-4" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Log In'}
                        </button>
                        <div className="text-center">
                            <Link to="/signup" className="text-sm text-gray-500">Create an account</Link>
                        </div>
                    </form>

                    {message && (
                        <div className="card" style={{ marginTop: 16, borderColor: 'var(--success)' }}>
                            <div className="card-body" style={{ color: 'var(--success)' }}>{message}</div>
                        </div>
                    )}
                    {error && (
                        <div className="card" style={{ marginTop: 16, borderColor: 'var(--error)' }}>
                            <div className="card-body" style={{ color: 'var(--error)' }}>{error}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

