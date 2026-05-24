import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminJobs, createJob, updateJob, deleteJob } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ManageJobsPage.css';

const emptyJob = {
    title: '', industry: '', location: '', job_type: 'Full-time',
    pay_range_min: '', pay_range_max: '', closing_date: '',
    description: '', responsibilities: '', requirements: '', benefits: '', status: 'active'
};

export default function ManageJobsPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [viewingJob, setViewingJob] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({ ...emptyJob });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => { fetchJobs(); }, [statusFilter, searchTerm]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;
            const data = await getAdminJobs(params);
            setJobs(data.jobs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const viewJobId = queryParams.get('view_job_id');
        if (viewJobId && jobs.length > 0) {
            const job = jobs.find(j => j.id.toString() === viewJobId);
            if (job) setViewingJob(job);
        } else {
            setViewingJob(null);
        }
    }, [location.search, jobs]);

    const openCreateModal = () => {
        setEditingJob(null);
        setFormData({ ...emptyJob });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title || '',
            industry: job.industry || '',
            location: job.location || '',
            job_type: job.job_type || 'Full-time',
            pay_range_min: job.pay_range_min || '',
            pay_range_max: job.pay_range_max || '',
            closing_date: job.closing_date || '',
            description: job.description || '',
            responsibilities: job.responsibilities || '',
            requirements: job.requirements || '',
            benefits: job.benefits || '',
            status: job.status || 'active',
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.title || !formData.industry || !formData.location || !formData.description) {
            setFormError('Please fill in all required fields (title, industry, location, description)');
            return;
        }
        setSaving(true);
        try {
            if (editingJob) {
                await updateJob(editingJob.id, formData);
            } else {
                await createJob(formData);
            }
            setShowModal(false);
            fetchJobs();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (job) => {
        if (!window.confirm(`Archive "${job.title}"? This will hide it from candidates.`)) return;
        try {
            await deleteJob(job.id);
            fetchJobs();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const [updatingStatus, setUpdatingStatus] = useState(null);

    const handleStatusChange = async (jobId, newStatus) => {
        setUpdatingStatus(jobId);
        try {
            await updateJob(jobId, { status: newStatus });
            setJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: newStatus } : job
            ));
        } catch (err) {
            alert('Error updating status: ' + err.message);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'closed': return 'badge-warning';
            case 'archived': return 'badge-primary';
            default: return 'badge-primary';
        }
    };

    return (
        <div className="manage-jobs">
            {/* Header */}
            <div className="manage-jobs__header">
                <div className="admin-header-controls">
                    <div className="admin-search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text" placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="admin-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                    </select>

                    <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Post New Job
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: '12px 16px', background: 'hsl(0, 85%, 97%)', color: 'hsl(0, 70%, 45%)', border: '1px solid hsl(0, 70%, 90%)', borderRadius: '10px', marginBottom: 'var(--space-4)' }}>{error}</div>
            )}

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
                                <th>Position</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Applications</th>
                                <th>Status</th>
                                <th>Posted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-10)' }}>No jobs found</td></tr>
                            ) : (
                                jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>
                                            <div className="manage-jobs__job-title admin-link" onClick={() => setViewingJob(job)} style={{ cursor: 'pointer' }}>{job.title}</div>
                                            <div className="manage-jobs__job-industry">{job.industry}</div>
                                        </td>
                                        <td className="manage-jobs__td-secondary">{job.location}</td>
                                        <td><span className="badge badge-primary">{job.job_type}</span></td>
                                        <td><span className="manage-jobs__app-count">{job.application_count || 0}</span></td>
                                        <td>
                                            <select
                                                value={job.status}
                                                onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                                disabled={updatingStatus === job.id}
                                                className={`badge ${getStatusClass(job.status)}`}
                                                style={{ appearance: 'auto', cursor: 'pointer', paddingRight: '20px', border: 'none', outline: 'none', outlineOffset: '0' }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </td>
                                        <td className="manage-jobs__td-secondary">
                                            {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <div className="manage-jobs__actions">
                                                <button className="manage-jobs__action-btn" title="View Applications" onClick={() => navigate(`/admin/applications?job_id=${job.id}`)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                                </button>
                                                <button className="manage-jobs__action-btn" title="Edit" onClick={() => openEditModal(job)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                {isAdmin && job.status !== 'archived' && (
                                                    <button className="manage-jobs__action-btn manage-jobs__action-btn--danger" title="Archive" onClick={() => handleArchive(job)}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
                            <button className="modal__close" onClick={() => setShowModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="modal__body">
                            {formError && (
                                <div style={{ padding: '10px 14px', background: 'hsl(0, 85%, 97%)', color: 'hsl(0, 70%, 45%)', border: '1px solid hsl(0, 70%, 90%)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{formError}</div>
                            )}

                            <div className="modal__row">
                                <div className="input-group">
                                    <label className="input-label">Job Title *</label>
                                    <input className="input-field" placeholder="e.g. Senior Frontend Developer" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Industry *</label>
                                    <input className="input-field" placeholder="e.g. Technology" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} required />
                                </div>
                            </div>

                            <div className="modal__row">
                                <div className="input-group">
                                    <label className="input-label">Location *</label>
                                    <input className="input-field" placeholder="e.g. Lagos, Nigeria" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Job Type</label>
                                    <select className="input-field" value={formData.job_type} onChange={e => setFormData(p => ({ ...p, job_type: e.target.value }))}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal__row">
                                <div className="input-group">
                                    <label className="input-label">Min Salary</label>
                                    <input className="input-field" type="number" placeholder="e.g. 500000" value={formData.pay_range_min} onChange={e => setFormData(p => ({ ...p, pay_range_min: e.target.value }))} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Max Salary</label>
                                    <input className="input-field" type="number" placeholder="e.g. 1200000" value={formData.pay_range_max} onChange={e => setFormData(p => ({ ...p, pay_range_max: e.target.value }))} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Closing Date</label>
                                    <input className="input-field" type="date" value={formData.closing_date} onChange={e => setFormData(p => ({ ...p, closing_date: e.target.value }))} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Description *</label>
                                <textarea className="input-field" rows="3" placeholder="Describe the role..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Responsibilities</label>
                                <textarea className="input-field" rows="3" placeholder="• List responsibilities, one per line" value={formData.responsibilities} onChange={e => setFormData(p => ({ ...p, responsibilities: e.target.value }))} />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Requirements</label>
                                <textarea className="input-field" rows="3" placeholder="• List requirements, one per line" value={formData.requirements} onChange={e => setFormData(p => ({ ...p, requirements: e.target.value }))} />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Benefits</label>
                                <textarea className="input-field" rows="3" placeholder="• List benefits, one per line" value={formData.benefits} onChange={e => setFormData(p => ({ ...p, benefits: e.target.value }))} />
                            </div>

                            {editingJob && (
                                <div className="input-group">
                                    <label className="input-label">Status</label>
                                    <select className="input-field" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            )}

                            <div className="modal__footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Publish Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Job Overview Modal */}
            {viewingJob && (
                <div className="modal-overlay" onClick={() => setViewingJob(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <div className="modal__header">
                            <h2 className="modal__title">Job Overview</h2>
                            <button className="modal__close" onClick={() => setViewingJob(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div className="modal__body">
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: '16px', color: 'var(--color-primary)' }}>
                                {viewingJob.title}
                            </h3>

                            <div className="detail-grid" style={{ marginBottom: '24px' }}>
                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">
                                        <span className={`badge ${getStatusClass(viewingJob.status)}`}>{viewingJob.status}</span>
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Applications Output</span>
                                    <span className="detail-value" style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{viewingJob.application_count || 0} applications received</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{viewingJob.location}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Job Type</span>
                                    <span className="detail-value">{viewingJob.job_type}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Pay Range</span>
                                    <span className="detail-value">{viewingJob.pay_range_min ? `${viewingJob.pay_range_min} - ${viewingJob.pay_range_max}` : 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Posted On</span>
                                    <span className="detail-value">{new Date(viewingJob.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: '1.6', background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', padding: '16px', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
                                    {viewingJob.description}
                                </p>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px' }}>
                                <button className="btn btn-primary" onClick={() => { setViewingJob(null); openEditModal(viewingJob); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: '6px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    Edit Job
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate(`/admin/applications?job_id=${viewingJob.id}`)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: '6px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                    View Applications
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
