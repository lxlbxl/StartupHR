import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const result = await getDashboardStats();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Failed to load dashboard: {error}</p>
                <button className="btn btn-primary" onClick={fetchStats} style={{ marginTop: 'var(--space-4)' }}>Retry</button>
            </div>
        );
    }

    const { stats, applications_per_job, recent_applications } = data;

    const statCards = [
        {
            label: 'Active Jobs',
            value: stats.active_jobs,
            change: `${stats.total_jobs} total`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
            color: 'var(--color-accent)'
        },
        {
            label: 'Total Applications',
            value: stats.total_applications,
            change: `${stats.new_applications} new`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
            ),
            color: 'var(--color-info)'
        },
        {
            label: 'New Applications',
            value: stats.new_applications,
            change: 'Pending review',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            color: 'var(--color-warning)'
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted,
            change: 'Candidates',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            color: 'var(--color-success)'
        }
    ];

    const maxApps = Math.max(...(applications_per_job || []).map(j => Number(j.application_count)), 1);

    return (
        <div className="dashboard">
            {/* Welcome */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text)', marginBottom: '4px' }}>
                    Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    Here's what's happening with your recruitment pipeline.
                </p>
            </div>

            {/* Stats */}
            <div className="dashboard__stats">
                {statCards.map((stat, index) => (
                    <div key={stat.label} className="stat-card animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                        <div className="stat-card__icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-card__content">
                            <div className="stat-card__value">{stat.value}</div>
                            <div className="stat-card__label">{stat.label}</div>
                            <div className="stat-card__change">{stat.change}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard__grid">
                {/* Recent Applications */}
                <div className="dashboard__panel animate-fade-in-up stagger-3">
                    <div className="dashboard__panel-header">
                        <h3 className="dashboard__panel-title">Recent Applications</h3>
                        <a href="/admin/applications" className="dashboard__panel-link">View all →</a>
                    </div>
                    <div className="dashboard__table-wrap">
                        <table className="dashboard__table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Position</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(recent_applications || []).length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>No applications yet</td></tr>
                                ) : (
                                    recent_applications.map((app, i) => (
                                        <tr key={app.id || i}>
                                            <td>
                                                <div className="dashboard__candidate">
                                                    <div className="dashboard__candidate-avatar" style={{ background: `hsl(${(i * 72) % 360}, 50%, 55%)` }}>
                                                        {app.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <span>{app.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="dashboard__td-secondary">{app.job_title}</td>
                                            <td className="dashboard__td-secondary">
                                                {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td>
                                                <span className={`badge ${app.status === 'new' ? 'badge-accent' : app.status === 'shortlisted' ? 'badge-success' : app.status === 'rejected' ? 'badge-warning' : 'badge-primary'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Jobs */}
                <div className="dashboard__panel animate-fade-in-up stagger-4">
                    <div className="dashboard__panel-header">
                        <h3 className="dashboard__panel-title">Top Performing Jobs</h3>
                        <a href="/admin/jobs" className="dashboard__panel-link">View all →</a>
                    </div>
                    <div className="dashboard__jobs-list">
                        {(applications_per_job || []).length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>No active jobs</p>
                        ) : (
                            applications_per_job.map((job) => (
                                <div key={job.id} className="dashboard__job-row">
                                    <div className="dashboard__job-info">
                                        <div className="dashboard__job-title">{job.title}</div>
                                    </div>
                                    <div className="dashboard__job-apps">
                                        <div className="dashboard__job-apps-bar">
                                            <div className="dashboard__job-apps-fill" style={{ width: `${Math.min((Number(job.application_count) / maxApps) * 100, 100)}%` }}></div>
                                        </div>
                                        <span className="dashboard__job-apps-count">{job.application_count} apps</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
