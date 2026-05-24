import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './ActivityLogPage.css';

const API_BASE_URL = '/api';

export default function ActivityLogPage() {
    const { isAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            fetchLogs();
        }
    }, [isAdmin]);

    // Protect route: Only admins can access this page
    if (!isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    const fetchLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/activity`, {
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                setLogs(data.logs);
            } else {
                setError(data.error || 'Failed to fetch activity logs');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format action names (e.g., 'created_job' -> 'Created Job')
    const formatAction = (action) => {
        return action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Helper to pick an icon based on entity type
    const getEntityIcon = (type) => {
        switch (type) {
            case 'job':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                );
            case 'application':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                    </svg>
                );
            case 'staff':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                );
            default:
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="admin-page">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Activity Log</h1>
                        <p className="admin-page__subtitle">Loading recent activity...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Activity Log</h1>
                    <p className="admin-page__subtitle">Audit trail of administrative actions.</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchLogs}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <div className="admin-card activity-card">
                {logs.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                        </svg>
                        <p>No activity recorded yet.</p>
                    </div>
                ) : (
                    <div className="activity-timeline">
                        {logs.map((log) => (
                            <div key={log.id} className="activity-item">
                                <div className="activity-item__icon-wrapper">
                                    <div className={`activity-item__icon activity-item__icon--${log.entity_type}`}>
                                        {getEntityIcon(log.entity_type)}
                                    </div>
                                </div>
                                <div className="activity-item__content">
                                    <div className="activity-item__header">
                                        <span className="activity-item__user">{log.admin_name}</span>
                                        <span className="activity-item__action">{formatAction(log.action)}</span>
                                        <span className="activity-item__entity">{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</span>
                                    </div>
                                    <div className="activity-item__time">
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
