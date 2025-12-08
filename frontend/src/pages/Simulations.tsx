import React, { useEffect, useState } from 'react';
import { Database, Calendar, RefreshCw, Download, Eye } from 'lucide-react';
import { getSimulations } from '../utils/api';
import type { Simulation } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Simulations: React.FC = () => {
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadSimulations();
    }, []);

    const loadSimulations = async () => {
        try {
            setLoading(true);
            const sims = await getSimulations();
            setSimulations(sims);
            if (sims.length > 0 && !selectedSim) {
                setSelectedSim(sims[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to load simulations:', err);
            setLoading(false);
        }
    };

    const handleViewAnalytics = () => {
        if (selectedSim) {
            navigate(`/data-explorer?sim=${selectedSim.id}`);
        }
    };

    const handleExportData = async () => {
        if (!selectedSim) return;

        try {
            const response = await axios.get(`http://localhost:3001/api/simulations/${selectedSim.id}/export`);
            if (response.data.success) {
                alert(`✅ Export Successful!\n\n${response.data.message}\n\nYou can find all CSV files at:\n${response.data.path}`);
            }
        } catch (err: any) {
            alert('❌ Export failed: ' + (err.response?.data?.error || err.message));
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
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading simulations...</p>
            </div>
        );
    }

    return (
        <div className="simulations fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Simulations</h1>
                    <p className="page-description">
                        Browse and manage your simulation runs
                    </p>
                </div>
                <button className="btn btn-primary" onClick={loadSimulations}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {simulations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <Database size={64} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--spacing-lg)' }} />
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Simulations Found</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Run your first simulation to see results here
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2">
                    {/* Simulation List */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Available Simulations</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {simulations.map((sim) => (
                                    <div
                                        key={sim.id}
                                        onClick={() => setSelectedSim(sim)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            background: selectedSim?.id === sim.id ? 'var(--color-bg-tertiary)' : 'transparent',
                                            border: `1px solid ${selectedSim?.id === sim.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                            <Database size={16} style={{ color: 'var(--color-primary)' }} />
                                            <span style={{ fontWeight: '600', flex: 1 }}>{sim.name}</span>
                                            <span className="badge badge-primary">Active</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                                            <Calendar size={14} />
                                            <span>{new Date(sim.created).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Simulation Details */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Simulation Details</h3>
                        </div>
                        {selectedSim ? (
                            <div className="card-body">
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                        Simulation ID
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                                        {selectedSim.id}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                        Created
                                    </div>
                                    <div style={{ color: 'var(--color-text-primary)' }}>
                                        {new Date(selectedSim.created).toLocaleString()}
                                    </div>
                                </div>

                                {selectedSim.metadata && Object.keys(selectedSim.metadata).length > 0 && (
                                    <div>
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                                            Metadata
                                        </div>
                                        <div style={{
                                            background: 'var(--color-bg-tertiary)',
                                            padding: 'var(--spacing-md)',
                                            borderRadius: 'var(--radius-md)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.8125rem',
                                        }}>
                                            {Object.entries(selectedSim.metadata).map(([key, value]) => (
                                                <div key={key} style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                    <span style={{ color: 'var(--color-primary)' }}>{key}:</span>{' '}
                                                    <span style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <button className="btn btn-primary" onClick={handleViewAnalytics}>
                                        <Eye size={18} />
                                        View Analytics
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleExportData}>
                                        <Download size={18} />
                                        Export Data
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                <p style={{ color: 'var(--color-text-tertiary)' }}>
                                    Select a simulation to view details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulations;
