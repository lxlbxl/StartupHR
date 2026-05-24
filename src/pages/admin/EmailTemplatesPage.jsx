import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = '/api';

export default function EmailTemplatesPage() {
    const { isAdmin } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchTemplates();
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/email-templates`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setTemplates(data.templates);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = async (name) => {
        try {
            const response = await fetch(`${API_BASE_URL}/email-templates/${name}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentTemplate(data.template);
                setIsEditing(true);
            }
        } catch (err) {
            alert('Failed to load template');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/email-templates/${currentTemplate.name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    subject: currentTemplate.subject,
                    body: currentTemplate.body
                })
            });

            if (response.ok) {
                setIsEditing(false);
                fetchTemplates();
            } else {
                alert('Failed to save template');
            }
        } catch (err) {
            alert('Network error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="admin-page">Loading...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Email Templates</h1>
                    <p className="admin-page__subtitle">Customize the automated emails sent by the system.</p>
                </div>
            </div>

            {error && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                    {error}
                </div>
            )}

            {!isEditing ? (
                <div className="admin-card" style={{ padding: '0' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Template Name</th>
                                <th>Subject</th>
                                <th>Last Updated</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontWeight: '500' }}>{t.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                                    <td>{t.subject}</td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>{new Date(t.updated_at).toLocaleString()}</td>
                                    <td>
                                        <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                                            <button className="admin-table__action-btn" onClick={() => handleEditClick(t.name)}>
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Editing {currentTemplate.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
                        <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Back</button>
                    </div>

                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Subject</label>
                            <input
                                type="text"
                                value={currentTemplate.subject}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Body (HTML supported)</label>
                            <textarea
                                value={currentTemplate.body}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
                                style={{ width: '100%', minHeight: '300px', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>Available Variables</h4>
                            <p style={{ fontSize: '0.875rem', color: '#475569' }}>You can use these tags in the subject or body to inject dynamic data:</p>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {currentTemplate.variables.split(',').map(v => v.trim()).map(variable => (
                                    <span key={variable} style={{ backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                        {variable}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
