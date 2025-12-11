import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    BarChart3,
    AlertCircle,
} from 'lucide-react';
import { getSimulations, getSimulationData, getSimulationStats } from '../utils/api';
import type { Statistics } from '../utils/api';
import { formatPercentage, formatNumber } from '../utils/statistics';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Statistics | null>(null);
    const [priceData, setPriceData] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Get latest simulation
            const simulations = await getSimulations();
            if (simulations.length === 0) {
                setError('No simulations found. Please run a simulation first.');
                setLoading(false);
                return;
            }

            const latestSim = simulations[0];

            // Get statistics
            const statistics = await getSimulationStats(latestSim.id);
            setStats(statistics);

            // Get price data for chart
            const data = await getSimulationData(latestSim.id, 'price');
            if ('data' in data && data.data && data.data.run_0_full) {
                const chartData = data.data.run_0_full.data.map((row: any, index: number) => ({
                    step: index,
                    price: row.Series_0,
                }));
                setPriceData(chartData);
            }

            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                flexDirection: 'column',
                gap: 'var(--space-4)'
            }}>
                <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-7)',
                textAlign: 'center'
            }}>
                <AlertCircle style={{ width: '48px', height: '48px', color: 'var(--error)', margin: '0 auto var(--space-4)' }} />
                <h3 style={{ color: 'var(--error)', marginBottom: 'var(--space-2)' }}>Error</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
        );
    }

    const priceStats = stats?.price;

    return (
        <div className="dashboard fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">
                    Overview of your latest simulation results and key performance metrics
                </p>
            </div>

            {/* Key Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon">
                            <DollarSign />
                        </div>
                    </div>
                    <div className="stat-value">
                        {priceStats ? formatPercentage(priceStats.totalReturn) : '--'}
                    </div>
                    <div className="stat-label">Total Return</div>
                    {priceStats && priceStats.totalReturn !== 0 && (
                        <div className={`stat-change ${priceStats.totalReturn > 0 ? 'positive' : 'negative'}`}>
                            {priceStats.totalReturn > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{formatPercentage(Math.abs(priceStats.totalReturn))}</span>
                        </div>
                    )}
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon warning">
                            <Activity />
                        </div>
                    </div>
                    <div className="stat-value">
                        {priceStats ? formatPercentage(priceStats.volatility) : '--'}
                    </div>
                    <div className="stat-label">Volatility</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon success">
                            <TrendingUp />
                        </div>
                    </div>
                    <div className="stat-value">
                        {priceStats ? formatNumber(priceStats.sharpeRatio, 3) : '--'}
                    </div>
                    <div className="stat-label">Sharpe Ratio</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon error">
                            <TrendingDown />
                        </div>
                    </div>
                    <div className="stat-value">
                        {priceStats ? formatPercentage(priceStats.maxDrawdown) : '--'}
                    </div>
                    <div className="stat-label">Max Drawdown</div>
                </div>
            </div>

            {/* Advanced Statistics */}
            <div className="grid grid-cols-2" style={{ marginBottom: 'var(--space-7)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Distribution Statistics</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                    Skewness
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {priceStats ? formatNumber(priceStats.skewness, 4) : '--'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: 'var(--space-1)' }}>
                                    {priceStats && priceStats.skewness > 0 ? 'Positive tail' : priceStats && priceStats.skewness < 0 ? 'Negative tail' : 'Symmetric'}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                    Excess Kurtosis
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {priceStats ? formatNumber(priceStats.kurtosis, 4) : '--'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: 'var(--space-1)' }}>
                                    {priceStats && priceStats.kurtosis > 0 ? 'Fat tails' : priceStats && priceStats.kurtosis < 0 ? 'Thin tails' : 'Normal'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Price Range</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                    Minimum Price
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--error)' }}>
                                    {priceStats ? formatNumber(priceStats.minPrice, 4) : '--'}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                    Maximum Price
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--success)' }}>
                                    {priceStats ? formatNumber(priceStats.maxPrice, 4) : '--'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Chart */}
            {priceData.length > 0 && (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Price Evolution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={priceData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary-blue)" stopOpacity={0.26} />
                                    <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-card)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="var(--primary-blue)"
                                strokeWidth={2}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
