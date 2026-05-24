import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllApplications, getAdminJobs, updateApplicationStatus, exportCSV, getResumeDownloadUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ApplicationsPage.css';

export default function ApplicationsPage() {
    const { isAdmin } = useAuth();
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState(new URLSearchParams(location.search).get('job_id') || '');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedApp, setSelectedApp] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => { fetchData(); }, [statusFilter, jobFilter, searchTerm]);

    useEffect(() => {
        // Fetch jobs for filter dropdown
        getAdminJobs().then(data => setJobs(data.jobs || [])).catch(() => { });
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (jobFilter) params.job_id = jobFilter;
            if (searchTerm) params.search = searchTerm;
            const data = await getAllApplications(params);
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingStatus(appId);
        try {
            await updateApplicationStatus(appId, newStatus);
            // Update local state
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
            if (selectedApp?.id === appId) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportCSV(jobFilter || null);
        } catch (err) {
            alert('Export failed: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'new': return 'badge-accent';
            case 'reviewed': return 'badge-primary';
            case 'shortlisted': return 'badge-success';
            case 'rejected': return 'badge-warning';
            default: return 'badge-primary';
        }
    };

    return (
        <div className="applications-page">
            {/* Header */}
            <div className="applications-page__header">
                <div className="admin-header-controls">
                    <div className="admin-search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input type="text" placeholder="Search candidates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="admin-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select className="admin-filter" value={jobFilter} onChange={e => setJobFilter(e.target.value)}>
                        <option value="">All Jobs</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                    </select>
                    <button className="btn btn-secondary" onClick={handleExport} disabled={exporting} style={{ marginLeft: 'auto' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'hsl(0, 85%, 97%)', color: 'hsl(0, 70%, 45%)', border: '1px solid hsl(0, 70%, 90%)', borderRadius: '10px', marginBottom: 'var(--space-4)' }}>{error}</div>
            )}

            {/* Results count */}
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                {applications.length} application{applications.length !== 1 ? 's' : ''} found
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
            ) : (
                <div className="manage-jobs__table-wrap">
                    <table className="manage-jobs__table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Position</th>
                                <th>Experience</th>
                                <th>Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-10)' }}>No applications found</td></tr>
                            ) : (
                                applications.map((app, i) => (
                                    <tr key={app.id}>
                                        <td>
                                            <div className="dashboard__candidate" onClick={() => setSelectedApp(app)} style={{ cursor: 'pointer' }}>
                                                <div className="dashboard__candidate-avatar" style={{ background: `hsl(${(i * 72) % 360}, 50%, 55%)` }}>
                                                    {app.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, color: 'var(--color-text)' }} className="admin-link">{app.full_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{app.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="manage-jobs__td-secondary">
                                            <a href={`/admin/jobs?view_job_id=${app.job_id}`} className="admin-link">{app.job_title}</a>
                                        </td>
                                        <td className="manage-jobs__td-secondary">{app.years_experience ? `${app.years_experience} yrs` : '—'}</td>
                                        <td className="manage-jobs__td-secondary">
                                            {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td>
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                disabled={updatingStatus === app.id}
                                                className={`badge ${getStatusClass(app.status)}`}
                                                style={{ appearance: 'auto', cursor: 'pointer', paddingRight: '20px', border: 'none', outline: 'none', outlineOffset: '0' }}
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="shortlisted">Shortlisted</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="manage-jobs__actions">
                                                <button className="manage-jobs__action-btn" title="View details" onClick={() => setSelectedApp(app)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                </button>
                                                {app.resume_path && (
                                                    <a href={getResumeDownloadUrl(app.id)} download className="manage-jobs__action-btn" title="Download resume">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Candidate Detail Modal */}
            {selectedApp && (
                <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal__header">
                            <h2 className="modal__title">Candidate Profile</h2>
                            <button className="modal__close" onClick={() => setSelectedApp(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <div className="modal__body">
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                                <div className="dashboard__candidate-avatar" style={{ width: '56px', height: '56px', fontSize: '1.2rem', background: 'var(--color-accent)' }}>
                                    {selectedApp.full_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: '2px' }}>{selectedApp.full_name}</h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                                        Applied for: <strong>{selectedApp.job_title}</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value"><a href={`mailto:${selectedApp.email}`}>{selectedApp.email}</a></span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{selectedApp.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Experience</span>
                                    <span className="detail-value">{selectedApp.years_experience ? `${selectedApp.years_experience} years` : '—'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{selectedApp.current_location || '—'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Availability</span>
                                    <span className="detail-value">{selectedApp.availability || '—'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Expected Salary</span>
                                    <span className="detail-value">{selectedApp.expected_salary || '—'}</span>
                                </div>
                                {selectedApp.linkedin_url && (
                                    <div className="detail-item">
                                        <span className="detail-label">LinkedIn</span>
                                        <span className="detail-value"><a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer">View Profile</a></span>
                                    </div>
                                )}
                                {selectedApp.portfolio_url && (
                                    <div className="detail-item">
                                        <span className="detail-label">Portfolio</span>
                                        <span className="detail-value"><a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer">View Portfolio</a></span>
                                    </div>
                                )}
                            </div>

                            {selectedApp.cover_letter && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover Letter</h4>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '16px', borderRadius: '10px' }}>
                                        {selectedApp.cover_letter}
                                    </p>
                                </div>
                            )}

                            {/* Status Update */}
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Status: <span className={`badge ${getStatusClass(selectedApp.status)}`}>{selectedApp.status}</span>
                                </h4>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['new', 'reviewed', 'shortlisted', 'rejected'].filter(s => s !== selectedApp.status).map(status => (
                                        <button
                                            key={status}
                                            className={`btn btn-sm ${status === 'shortlisted' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => handleStatusChange(selectedApp.id, status)}
                                            disabled={updatingStatus === selectedApp.id}
                                            style={{ textTransform: 'capitalize' }}
                                        >
                                            {updatingStatus === selectedApp.id ? '...' : `Mark ${status}`}
                                        </button>
                                    ))}
                                </div>

                                {selectedApp.resume_path && (
                                    <a href={getResumeDownloadUrl(selectedApp.id)} download className="btn btn-secondary btn-sm" style={{ marginTop: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        Download Resume
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
