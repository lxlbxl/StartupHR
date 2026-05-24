import { Link } from 'react-router-dom';
import './JobCard.css';

export default function JobCard({ job, index = 0 }) {
  const daysLeft = Math.ceil((new Date(job.closingDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;

  return (
    <Link
      to={`/jobs/${job.slug || job.id}`}
      className="job-card animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="job-card__header">
        <div className="job-card__meta">
          <span className="badge badge-accent">{job.jobType}</span>
          {isUrgent && (
            <span className="badge badge-warning">
              <span className="job-card__pulse"></span>
              Closing Soon
            </span>
          )}
        </div>
        <div className="job-card__industry">{job.industry}</div>
      </div>

      <h3 className="job-card__title">{job.title}</h3>

      <div className="job-card__details">
        <div className="job-card__detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{job.location}</span>
        </div>
        <div className="job-card__detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>{job.payRange}</span>
        </div>
        <div className="job-card__detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Closes {new Date(job.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="job-card__footer">
        <span className="job-card__cta">
          View Details
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
