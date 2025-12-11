import React, { useEffect, useState } from 'react';
import { Save, FileCode, Play } from 'lucide-react';
import { getTemplates, runSimulation } from '../utils/api';

const Parameters: React.FC = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [xmlContent, setXmlContent] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const temps = await getTemplates();
            setTemplates(temps);
            if (temps.length > 0) {
                setSelectedTemplate(temps[0].id);
                setXmlContent(temps[0].content);
            }
        } catch (err) {
            console.error('Failed to load templates:', err);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setXmlContent(template.content);
        }
    };

    const handleRunSimulation = async () => {
        try {
            setIsRunning(true);
            setMessage(null);

            const result = await runSimulation(xmlContent, selectedTemplate || 'custom');

            setMessage({
                type: 'success',
                text: `Simulation completed successfully! ID: ${result.simulationId}`,
            });

            setIsRunning(false);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || err.message || 'Failed to run simulation',
            });
            setIsRunning(false);
        }
    };

    return (
        <div className="parameters fade-in">
            <div className="page-header">
                <h1 className="page-title">Simulation Parameters</h1>
                <p className="page-description">
                    Edit XML configuration files and run custom simulations
                </p>
            </div>

            {/* Template Selector */}
            <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="card-body">
                    <label className="label">
                        <FileCode size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Select Template
                    </label>
                    <select
                        className="input select"
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                    >
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* XML Editor */}
            <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="card-header">
                    <h3 className="card-title">XML Configuration</h3>
                </div>
                <div className="card-body">
                    <textarea
                        value={xmlContent}
                        onChange={(e) => setXmlContent(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '500px',
                            padding: 'var(--space-4)',
                            background: 'var(--background-main)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-input)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-primary)',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            resize: 'vertical',
                        }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleRunSimulation}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>
                            <div className="spinner"></div>
                            Running...
                        </>
                    ) : (
                        <>
                            <Play size={18} />
                            Run Simulation
                        </>
                    )}
                </button>

                <button className="btn btn-secondary btn-lg">
                    <Save size={18} />
                    Save Configuration
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className="card"
                    style={{
                        background: message.type === 'success'
                            ? 'rgba(46, 139, 87, 0.08)'
                            : 'rgba(220, 38, 38, 0.08)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                    }}
                >
                    <div className="card-body">
                        <p style={{
                            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                            margin: 0,
                        }}>
                            {message.text}
                        </p>
                    </div>
                </div>
            )}

            {/* Parameter Guide */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Parameter Guide</h3>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Description</th>
                                <th>Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>numsteps</code></td>
                                <td>Number of simulation time steps</td>
                                <td>10000</td>
                            </tr>
                            <tr>
                                <td><code>repetitions</code></td>
                                <td>Number of simulation runs</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td><code>count</code></td>
                                <td>Number of agents in the simulation</td>
                                <td>100000</td>
                            </tr>
                            <tr>
                                <td><code>deltaT</code></td>
                                <td>Time step size</td>
                                <td>0.00004</td>
                            </tr>
                            <tr>
                                <td><code>theta</code></td>
                                <td>Heteroskedasticity parameter (0=base, 2=heteroskedastic)</td>
                                <td>2</td>
                            </tr>
                            <tr>
                                <td><code>marketDepth</code></td>
                                <td>Market depth parameter (lambda)</td>
                                <td>0.2</td>
                            </tr>
                            <tr>
                                <td><code>startPrice</code></td>
                                <td>Initial price</td>
                                <td>1</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Parameters;
