import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import { getSimulations, getSimulationData } from '../utils/api';
import {
    calculateReturns,
    calculateLogReturns,
    rollingMean,
    rollingStdDev,
    cumulativeReturns,
} from '../utils/statistics';

const Visualizations: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [selectedSimId, setSelectedSimId] = useState<string>('');
    const [simulations, setSimulations] = useState<any[]>([]);
    const [priceData, setPriceData] = useState<any[]>([]);
    const [returnsData, setReturnsData] = useState<any[]>([]);
    const [rollingVolData, setRollingVolData] = useState<any[]>([]);
    const [returnDistribution, setReturnDistribution] = useState<any[]>([]);

    useEffect(() => {
        loadSimulations();
    }, []);

    useEffect(() => {
        if (selectedSimId) {
            loadVisualizationData();
        }
    }, [selectedSimId]);

    const loadSimulations = async () => {
        try {
            const sims = await getSimulations();
            setSimulations(sims);
            if (sims.length > 0) {
                setSelectedSimId(sims[0].id);
            }
        } catch (err) {
            console.error('Failed to load simulations:', err);
        }
    };

    const loadVisualizationData = async () => {
        try {
            setLoading(true);

            // Get price data
            const data = await getSimulationData(selectedSimId, 'price');
            if ('data' in data && data.data && data.data.run_0_full) {
                const prices = data.data.run_0_full.data.map((row: any) => row.Series_0);

                // Price chart data
                const priceChart = prices.map((price: number, index: number) => ({
                    step: index,
                    price,
                }));
                setPriceData(priceChart);

                // Calculate returns
                const returns = calculateReturns(prices);
                const returnsChart = returns.map((ret: number, index: number) => ({
                    step: index + 1,
                    return: ret,
                }));
                setReturnsData(returnsChart);

                // Calculate rolling volatility (20-period window)
                const rollingVol = rollingStdDev(returns, 20);
                const volChart = rollingVol.map((vol: number, index: number) => ({
                    step: index + 1,
                    volatility: vol,
                }));
                setRollingVolData(volChart);

                // Return distribution (histogram data)
                const bins = 50;
                const minRet = Math.min(...returns);
                const maxRet = Math.max(...returns);
                const binSize = (maxRet - minRet) / bins;

                const histogram = new Array(bins).fill(0);
                returns.forEach((ret: number) => {
                    const binIndex = Math.min(Math.floor((ret - minRet) / binSize), bins - 1);
                    histogram[binIndex]++;
                });

                const distData = histogram.map((count, index) => ({
                    return: minRet + (index + 0.5) * binSize,
                    frequency: count,
                }));
                setReturnDistribution(distData);
            }

            setLoading(false);
        } catch (err) {
            console.error('Failed to load visualization data:', err);
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
                <p style={{ color: 'var(--text-secondary)' }}>Loading visualizations...</p>
            </div>
        );
    }

    return (
        <div className="visualizations fade-in">
            <div className="page-header">
                <h1 className="page-title">Advanced Visualizations</h1>
                <p className="page-description">
                    Deep statistical analysis and comprehensive data visualization
                </p>
            </div>

            {/* Simulation Selector */}
            <div className="card" style={{ marginBottom: 'var(--space-7)' }}>
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

            {/* Price Chart */}
            {priceData.length > 0 && (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Price Series</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={priceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Time Steps', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Price', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-card)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="var(--primary-blue)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Returns Chart */}
            {returnsData.length > 0 && (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Returns Over Time</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={returnsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Time Steps', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Return', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-card)',
                                }}
                                formatter={(value: any) => [(value * 100).toFixed(4) + '%', 'Return']}
                            />
                            <ReferenceLine y={0} stroke="var(--text-light)" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="return"
                                stroke="var(--primary-blue)"
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Rolling Volatility */}
            {rollingVolData.length > 0 && (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Rolling Volatility (20-period)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={rollingVolData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Time Steps', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Volatility', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-card)',
                                }}
                                formatter={(value: any) => [(value * 100).toFixed(4) + '%', 'Volatility']}
                            />
                            <Line
                                type="monotone"
                                dataKey="volatility"
                                stroke="var(--warning)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Return Distribution */}
            {returnDistribution.length > 0 && (
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Return Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={returnDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis
                                dataKey="return"
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Return', position: 'insideBottom', offset: -5 }}
                                tickFormatter={(value) => (value * 100).toFixed(2) + '%'}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                style={{ fontSize: '12px' }}
                                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-card)',
                                }}
                                formatter={(value: any) => [
                                    value,
                                    'Frequency',
                                ]}
                                labelFormatter={(value: any) => `Return: ${(value * 100).toFixed(4)}%`}
                            />
                            <Bar dataKey="frequency" fill="var(--success)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Visualizations;
