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
            if (data.data && data.data.run_0_full) {
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
                gap: 'var(--spacing-md)'
            }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center'
            }}>
                <AlertCircle style={{ width: '48px', height: '48px', color: 'var(--color-error)', margin: '0 auto var(--spacing-md)' }} />
                <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-sm)' }}>Error</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
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
            <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Distribution Statistics</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                    Skewness
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                    {priceStats ? formatNumber(priceStats.skewness, 4) : '--'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
                                    {priceStats && priceStats.skewness > 0 ? 'Positive tail' : priceStats && priceStats.skewness < 0 ? 'Negative tail' : 'Symmetric'}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                    Excess Kurtosis
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                    {priceStats ? formatNumber(priceStats.kurtosis, 4) : '--'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                    Minimum Price
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-error)' }}>
                                    {priceStats ? formatNumber(priceStats.minPrice, 4) : '--'}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                    Maximum Price
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-success)' }}>
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
                                    <stop offset="5%" stopColor="hsl(220, 85%, 60%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(220, 85%, 60%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--color-text-tertiary)"
                                style={{ fontSize: '0.75rem' }}
                            />
                            <YAxis
                                stroke="var(--color-text-tertiary)"
                                style={{ fontSize: '0.75rem' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-elevated)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="hsl(220, 85%, 60%)"
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
