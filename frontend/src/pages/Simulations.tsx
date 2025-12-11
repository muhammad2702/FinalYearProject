import React, { useEffect, useState } from 'react';
import { Database, Calendar, RefreshCw, Download, Eye } from 'lucide-react';
import { exportSimulation, getSimulations } from '../utils/api';
import type { Simulation } from '../utils/api';
import { useNavigate } from 'react-router-dom';

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
            const response = await exportSimulation(selectedSim.id);
            if (response.success) {
                alert(`✅ Export Successful!\n\n${response.message}\n\nYou can find all CSV files at:\n${response.path}`);
            }
        } catch (err: any) {
            alert('❌ Export failed: ' + (err.response?.data?.error || err.message || err.toString()));
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
                <p style={{ color: 'var(--text-secondary)' }}>Loading simulations...</p>
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
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-7)' }}>
                    <Database size={64} style={{ color: 'var(--text-light)', margin: '0 auto var(--space-5)' }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No Simulations Found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {simulations.map((sim) => (
                                    <div
                                        key={sim.id}
                                        onClick={() => setSelectedSim(sim)}
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: selectedSim?.id === sim.id ? 'var(--primary-light-blue)' : 'var(--background-main)',
                                            border: `1px solid ${selectedSim?.id === sim.id ? 'var(--primary-blue)' : 'var(--border-light)'}`,
                                            borderRadius: 'var(--radius-card)',
                                            cursor: 'pointer',
                                            transition: 'all 160ms ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                            <Database size={16} style={{ color: 'var(--primary-blue)' }} />
                                            <span style={{ fontWeight: '600', flex: 1 }}>{sim.name}</span>
                                            <span className="badge badge-primary">Active</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--text-light)' }}>
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
                                <div style={{ marginBottom: 'var(--space-5)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                        Simulation ID
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-primary)', color: 'var(--text-primary)', fontSize: '14px' }}>
                                        {selectedSim.id}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--space-5)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-1)' }}>
                                        Created
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                                        {new Date(selectedSim.created).toLocaleString()}
                                    </div>
                                </div>

                                {selectedSim.metadata && Object.keys(selectedSim.metadata).length > 0 && (
                                    <div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-2)' }}>
                                            Metadata
                                        </div>
                                        <div style={{
                                            background: 'var(--background-soft)',
                                            padding: 'var(--space-4)',
                                            borderRadius: 'var(--radius-card)',
                                            fontFamily: 'var(--font-primary)',
                                            fontSize: '13px',
                                        }}>
                                            {Object.entries(selectedSim.metadata).map(([key, value]) => (
                                                <div key={key} style={{ marginBottom: 'var(--space-1)' }}>
                                                    <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>{key}:</span>{' '}
                                                    <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 'var(--space-7)', display: 'flex', gap: 'var(--space-3)' }}>
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
                            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-7)' }}>
                                <p style={{ color: 'var(--text-light)' }}>
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
