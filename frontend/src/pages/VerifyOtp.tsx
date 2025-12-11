import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp } from '../utils/api';

const VerifyOtp: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const emailFromState = (location.state as any)?.email || '';

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            setLoading(true);
            const res = await verifyOtp({ email, otp });
            localStorage.setItem('token', res.token);
            setMessage('Email verified! Redirecting...');
            setTimeout(() => navigate('/'), 500);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 420, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Verify Email</h1>
                <p className="page-description">Enter the OTP sent to your email.</p>
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

                        <label className="label">OTP Code</label>
                        <input
                            className="input"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />

                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/signup')}
                        >
                            Back to Signup
                        </button>
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

export default VerifyOtp;

