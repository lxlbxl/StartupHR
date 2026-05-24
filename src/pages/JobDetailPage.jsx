import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPublicJob } from '../services/api';
import './JobDetailPage.css';

function parseBulletList(text) {
    if (!text) return [];
    return text.split('\n')
        .map(line => line.replace(/^(?:[•\-\*]|ÔÇó|â€¢|ï‚·)+\s*/, '').trim())
        .filter(line => line.length > 0);
}

export default function JobDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJob();
    }, [slug]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const data = await getPublicJob(slug);
            setJob(data.job);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (job) {
            document.title = `${job.title} | Priority Talent`;
            let metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', job.description.substring(0, 160) + '...');
            } else {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                metaDescription.content = job.description.substring(0, 160) + '...';
                document.head.appendChild(metaDescription);
            }
        }
    }, [job]);

    const jsonLd = job ? {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "hiringOrganization": {
            "@type": "Organization",
            "name": "Priority Talent",
            "sameAs": window.location.origin
        },
        "employmentType": job.job_type === 'Full-time' ? 'FULL_TIME' :
            job.job_type === 'Part-time' ? 'PART_TIME' :
                job.job_type === 'Contract' ? 'CONTRACTOR' : 'OTHER',
        "datePosted": job.created_at,
        "validThrough": job.closing_date ? new Date(job.closing_date).toISOString() : undefined,
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location,
                "addressCountry": "NG"
            }
        }
    } : null;

    if (loading) {
        return (
            <div className="job-detail-page">
                <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="job-detail-page">
                <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
                    <h2>Job not found</h2>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0 var(--space-8)' }}>This position may have been filled or removed.</p>
                    <Link to="/" className="btn btn-primary">Browse All Jobs</Link>
                </div>
            </div>
        );
    }

    const payRange = job.pay_range_min && job.pay_range_max
        ? `₦${Number(job.pay_range_min).toLocaleString()} - ₦${Number(job.pay_range_max).toLocaleString()}`
        : 'Competitive';

    const daysLeft = job.closing_date
        ? Math.ceil((new Date(job.closing_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const responsibilities = parseBulletList(job.responsibilities);
    const requirements = parseBulletList(job.requirements);
    const benefits = parseBulletList(job.benefits);

    return (
        <div className="job-detail-page">
            {jsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            )}
            {/* Header */}
            <section className="job-detail__header">
                <div className="job-detail__header-bg">
                    <div className="bg-noise"></div>
                </div>
                <div className="container job-detail__header-content">
                    <button className="job-detail__back" onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Back to Jobs
                    </button>

                    <div className="job-detail__header-meta animate-fade-in-up">
                        <span className="badge badge-accent">{job.job_type}</span>
                        <span className="badge badge-primary">{job.industry}</span>
                        {daysLeft !== null && daysLeft <= 7 && <span className="badge badge-warning">Closing Soon</span>}
                    </div>

                    <h1 className="job-detail__title animate-fade-in-up stagger-1">{job.title}</h1>

                    <div className="job-detail__quick-info animate-fade-in-up stagger-2">
                        <div className="job-detail__info-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {job.location}
                        </div>
                        <div className="job-detail__info-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            {payRange}
                        </div>
                        {job.closing_date && (
                            <div className="job-detail__info-item">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                Closes {new Date(job.closing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="job-detail__body">
                <div className="container">
                    <div className="job-detail__layout">
                        <div className="job-detail__main">
                            <div className="job-detail__section animate-fade-in-up">
                                <h2 className="job-detail__section-title">About This Role</h2>
                                <p className="job-detail__description">{job.description}</p>
                            </div>

                            {responsibilities.length > 0 && (
                                <div className="job-detail__section animate-fade-in-up stagger-1">
                                    <h2 className="job-detail__section-title">Responsibilities</h2>
                                    <ul className="job-detail__list">
                                        {responsibilities.map((item, i) => (
                                            <li key={i} className="job-detail__list-item">
                                                <span className="job-detail__list-bullet"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {requirements.length > 0 && (
                                <div className="job-detail__section animate-fade-in-up stagger-2">
                                    <h2 className="job-detail__section-title">Requirements</h2>
                                    <ul className="job-detail__list">
                                        {requirements.map((item, i) => (
                                            <li key={i} className="job-detail__list-item">
                                                <span className="job-detail__list-bullet"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {benefits.length > 0 && (
                                <div className="job-detail__section animate-fade-in-up stagger-3">
                                    <h2 className="job-detail__section-title">Benefits & Perks</h2>
                                    <div className="job-detail__benefits-grid">
                                        {benefits.map((item, i) => (
                                            <div key={i} className="job-detail__benefit-card">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="job-detail__sidebar">
                            <div className="job-detail__apply-card">
                                <h3 className="job-detail__apply-title">Interested in this role?</h3>
                                <p className="job-detail__apply-text">Apply now and take the first step towards your next career milestone.</p>
                                <Link to={`/jobs/${slug}/apply`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                    Apply Now
                                </Link>
                                {daysLeft !== null && (
                                    <div className="job-detail__apply-note">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Closing today'}
                                    </div>
                                )}
                            </div>

                            <div className="job-detail__share-card">
                                <h4 className="job-detail__share-title">Share this role</h4>
                                <div className="job-detail__share-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky CTA */}
            <div className="job-detail__sticky-cta">
                <Link to={`/jobs/${slug}/apply`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Apply Now — {job.title}
                </Link>
            </div>
        </div>
    );
}
