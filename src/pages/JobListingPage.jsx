import { useState, useEffect, useMemo } from 'react';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { getPublicJobs } from '../services/api';
import './JobListingPage.css';

const industries = ["All Industries", "Technology", "Human Resources", "Marketing", "Sales", "Finance"];
const locations = ["All Locations", "Lagos, Nigeria", "Nairobi, Kenya", "Accra, Ghana", "Cape Town, South Africa", "Remote"];
const jobTypes = ["All Types", "Full-time", "Part-time", "Contract", "Remote", "Hybrid"];

export default function JobListingPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        industry: 'All Industries',
        location: 'All Locations',
        jobType: 'All Types'
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getPublicJobs();
            // Normalize the data from DB format to component format
            const normalized = (data.jobs || []).map(job => ({
                id: job.id,
                slug: job.slug,
                title: job.title,
                industry: job.industry,
                payRange: job.pay_range_min && job.pay_range_max
                    ? `₦${Number(job.pay_range_min).toLocaleString()} - ₦${Number(job.pay_range_max).toLocaleString()}`
                    : 'Competitive',
                location: job.location,
                jobType: job.job_type,
                closingDate: job.closing_date,
                description: job.description,
                status: job.status,
            }));
            setJobs(normalized);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = !searchTerm ||
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.industry.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesIndustry = filters.industry === 'All Industries' || job.industry === filters.industry;
            const matchesLocation = filters.location === 'All Locations' || job.location === filters.location;
            const matchesType = filters.jobType === 'All Types' || job.jobType === filters.jobType;

            return matchesSearch && matchesIndustry && matchesLocation && matchesType;
        });
    }, [jobs, searchTerm, filters]);

    const activeFilterCount = Object.values(filters).filter(v => !v.startsWith('All')).length + (searchTerm ? 1 : 0);

    if (loading) {
        return (
            <div className="job-listing-page">
                <section className="hero">
                    <div className="hero__bg">
                        <div className="bg-noise"></div>
                    </div>
                    <div className="container hero__content">
                        <div className="hero__badge animate-fade-in-up">
                            <span className="hero__badge-dot"></span>
                            Loading positions...
                        </div>
                        <h1 className="hero__title animate-fade-in-up stagger-1">
                            Find Your Next<br />
                            <span className="hero__title-accent">Career Move</span>
                        </h1>
                        <p className="hero__subtitle animate-fade-in-up stagger-2">
                            Discover opportunities at Africa's most innovative companies.
                            Your next chapter starts here.
                        </p>
                    </div>
                </section>
                <section className="jobs-section">
                    <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                    </div>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="job-listing-page">
                <section className="hero">
                    <div className="hero__bg">
                        <div className="bg-noise"></div>
                    </div>
                    <div className="container hero__content">
                        <h1 className="hero__title">Something went wrong</h1>
                        <p className="hero__subtitle">{error}</p>
                        <button className="btn btn-primary" onClick={fetchJobs} style={{ marginTop: 'var(--space-6)' }}>Try Again</button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="job-listing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__bg">
                    <div className="bg-noise"></div>
                </div>
                <div className="container hero__content">
                    <div className="hero__badge animate-fade-in-up">
                        <span className="hero__badge-dot"></span>
                        {jobs.length} open positions
                    </div>
                    <h1 className="hero__title animate-fade-in-up stagger-1">
                        Find Your Next<br />
                        <span className="hero__title-accent">Career Move</span>
                    </h1>
                    <p className="hero__subtitle animate-fade-in-up stagger-2">
                        Discover opportunities at Africa's most innovative companies.
                        Your next chapter starts here.
                    </p>
                </div>
            </section>

            {/* Search & Results */}
            <section className="jobs-section">
                <div className="container">
                    <div className="jobs-section__search animate-fade-in-up stagger-3">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            industries={industries}
                            locations={locations}
                            jobTypes={jobTypes}
                        />
                    </div>

                    <div className="jobs-section__header">
                        <div className="jobs-section__count">
                            <span className="jobs-section__count-number">{filteredJobs.length}</span>
                            <span className="jobs-section__count-label">
                                {filteredJobs.length === 1 ? 'role' : 'roles'} found
                                {activeFilterCount > 0 && (
                                    <button className="jobs-section__clear-filters" onClick={() => {
                                        setSearchTerm('');
                                        setFilters({ industry: 'All Industries', location: 'All Locations', jobType: 'All Types' });
                                    }}>
                                        Clear all filters
                                    </button>
                                )}
                            </span>
                        </div>
                    </div>

                    {filteredJobs.length > 0 ? (
                        <div className="jobs-grid">
                            {filteredJobs.map((job, index) => (
                                <JobCard key={job.id} job={job} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="jobs-empty">
                            <div className="jobs-empty__icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <h3 className="jobs-empty__title">No matching roles found</h3>
                            <p className="jobs-empty__text">Try adjusting your search or filters to discover more opportunities.</p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({ industry: 'All Industries', location: 'All Locations', jobType: 'All Types' });
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
