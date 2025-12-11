import React, { useState } from 'react';
import { signup } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            await signup({ fullName, email, password });
            setMessage('Signup successful. Check your email for the OTP.');
            setTimeout(() => navigate('/verify-otp', { state: { email } }), 800);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Create Account</h1>
                <p className="page-description">Sign up to run and explore simulations</p>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="form-grid">
                        <label className="label">Full Name</label>
                        <input
                            className="input"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

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

                        <label className="label">Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button className="btn btn-primary mt-4" type="submit" disabled={loading}>
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-gray-500">Already have an account? Log in</Link>
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

export default Signup;

