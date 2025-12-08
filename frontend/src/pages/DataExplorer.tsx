import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import { Database, Download, Eye, TrendingUp, DollarSign, Wallet, Activity } from 'lucide-react';
import { getSimulations, getSimulationData } from '../utils/api';
import axios from 'axios';

const DataExplorer: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [simulations, setSimulations] = useState<any[]>([]);
    const [selectedSimId, setSelectedSimId] = useState<string>('');
    const [collectors, setCollectors] = useState<string[]>([]);
    const [selectedCollector, setSelectedCollector] = useState<string>('price');
    const [chartData, setChartData] = useState<any[]>([]);
    const [allData, setAllData] = useState<Record<string, any>>({});

    useEffect(() => {
        loadSimulations();
    }, []);

    useEffect(() => {
        if (selectedSimId) {
            loadCollectors();
        }
    }, [selectedSimId]);

    useEffect(() => {
        if (selectedSimId && selectedCollector) {
            loadCollectorData();
        }
    }, [selectedSimId, selectedCollector]);

    const loadSimulations = async () => {
        try {
            const sims = await getSimulations();
            setSimulations(sims);
            if (sims.length > 0) {
                setSelectedSimId(sims[0].id);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to load simulations:', err);
            setLoading(false);
        }
    };

    const loadCollectors = async () => {
        try {
            const data = await getSimulationData(selectedSimId);
            if (data.collectors) {
                const collectorNames = Object.keys(data.collectors);
                setCollectors(collectorNames);
                if (collectorNames.length > 0 && !collectorNames.includes(selectedCollector)) {
                    setSelectedCollector(collectorNames[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load collectors:', err);
        }
    };

    const loadCollectorData = async () => {
        try {
            setLoading(true);
            const data = await getSimulationData(selectedSimId, selectedCollector);

            if (data.data && data.data.run_0_full) {
                const series = data.data.run_0_full.data.map((row: any, index: number) => {
                    const dataPoint: any = { step: index };

                    // Add all series data
                    Object.keys(row).forEach(key => {
                        if (key !== 'TimeStep') {
                            dataPoint[key] = row[key];
                        }
                    });

                    return dataPoint;
                });

                setChartData(series);
            }

            setAllData(data.data || {});
            setLoading(false);
        } catch (err) {
            console.error('Failed to load collector data:', err);
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/simulations/${selectedSimId}/export`);
            alert(`Data available at: ${response.data.path}\n\n${response.data.message}`);
        } catch (err: any) {
            alert('Export failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleViewAnalytics = () => {
        window.location.href = `/visualizations?sim=${selectedSimId}`;
    };

    const getCollectorIcon = (collector: string) => {
        switch (collector) {
            case 'price':
                return <TrendingUp size={18} />;
            case 'cash':
                return <DollarSign size={18} />;
            case 'stock':
                return <Activity size={18} />;
            case 'wealth':
                return <Wallet size={18} />;
            default:
                return <Database size={18} />;
        }
    };

    const getCollectorColor = (collector: string) => {
        const colors: Record<string, string> = {
            price: 'hsl(220, 85%, 60%)',
            cash: 'hsl(145, 65%, 55%)',
            stock: 'hsl(280, 70%, 65%)',
            wealth: 'hsl(45, 100%, 65%)',
            excessdemand: 'hsl(0, 75%, 58%)',
            logreturn: 'hsl(180, 70%, 55%)',
        };
        return colors[collector] || 'hsl(220, 85%, 60%)';
    };

    if (loading && simulations.length === 0) {
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
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading data explorer...</p>
            </div>
        );
    }

    return (
        <div className="data-explorer fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Data Explorer</h1>
                    <p className="page-description">
                        Comprehensive view of all simulation data: cash, stocks, wealth, prices, and more
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-primary" onClick={handleViewAnalytics}>
                        <Eye size={18} />
                        View Analytics
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={18} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Simulation and Collector Selectors */}
            <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-body">
                        <label className="label">Select Simulation</label>
                        <select
                            className="input select"
                            value={selectedSimId}
                            onChange={(e) => setSelectedSimId(e.target.value)}
                        >
                            {simulations.map((sim) => (
                                <option key={sim.id} value={sim.id}>
                                    {sim.name} - {new Date(sim.created).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <label className="label">Select Data Type</label>
                        <select
                            className="input select"
                            value={selectedCollector}
                            onChange={(e) => setSelectedCollector(e.target.value)}
                        >
                            {collectors.map((collector) => (
                                <option key={collector} value={collector}>
                                    {collector.charAt(0).toUpperCase() + collector.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Type Cards */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
                {collectors.map((collector) => (
                    <div
                        key={collector}
                        className="card"
                        onClick={() => setSelectedCollector(collector)}
                        style={{
                            cursor: 'pointer',
                            border: selectedCollector === collector
                                ? '2px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                            background: selectedCollector === collector
                                ? 'var(--color-bg-elevated)'
                                : 'var(--color-bg-secondary)',
                        }}
                    >
                        <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div style={{ color: getCollectorColor(collector) }}>
                                    {getCollectorIcon(collector)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                        {collector.charAt(0).toUpperCase() + collector.slice(1)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        {Object.keys(allData).length > 0 ? `${Object.keys(allData).length} files` : 'Loading...'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chart */}
            {chartData.length > 0 ? (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">
                            {selectedCollector.charAt(0).toUpperCase() + selectedCollector.slice(1)} Over Time
                        </h3>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                            {chartData.length} data points
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={450}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`color${selectedCollector}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getCollectorColor(selectedCollector)} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={getCollectorColor(selectedCollector)} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--color-text-tertiary)"
                                style={{ fontSize: '0.75rem' }}
                                label={{ value: 'Time Steps', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                stroke="var(--color-text-tertiary)"
                                style={{ fontSize: '0.75rem' }}
                                label={{
                                    value: selectedCollector.charAt(0).toUpperCase() + selectedCollector.slice(1),
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-elevated)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            />
                            <Legend />
                            {Object.keys(chartData[0] || {}).filter(key => key !== 'step').map((key, index) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={getCollectorColor(selectedCollector)}
                                    strokeWidth={2}
                                    fill={`url(#color${selectedCollector})`}
                                    name={key}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <Database size={64} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--spacing-md)' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        No data available for this collector
                    </p>
                </div>
            )}

            {/* Additional Statistics */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Data Summary</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                                        Data Points
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                                        {chartData.length.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                                        Time Range
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                                        0 - {chartData.length - 1}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Available Files</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                {Object.keys(allData).map((file) => (
                                    <div
                                        key={file}
                                        style={{
                                            padding: 'var(--spacing-xs)',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.8125rem',
                                            fontFamily: 'var(--font-mono)',
                                        }}
                                    >
                                        {file}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataExplorer;
