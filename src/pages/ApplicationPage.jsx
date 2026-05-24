import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicJob, submitApplication } from '../services/api';
import './ApplicationPage.css';

const STEPS = [
    { id: 1, label: 'Basic Info', icon: '👤' },
    { id: 2, label: 'Experience', icon: '💼' },
    { id: 3, label: 'Documents', icon: '📄' }
];

export default function ApplicationPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        yearsExperience: '',
        linkedin: '',
        portfolio: '',
        currentLocation: '',
        availability: '',
        resume: null,
        coverLetter: '',
        expectedSalary: ''
    });

    useEffect(() => {
        fetchJob();
    }, [slug]);

    const fetchJob = async () => {
        try {
            const data = await getPublicJob(slug);
            setJob(data.job);
        } catch {
            setJob(null);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        }
        if (step === 2) {
            if (!formData.yearsExperience) newErrors.yearsExperience = 'Please select your experience level';
        }
        if (step === 3) {
            if (!formData.resume) newErrors.resume = 'Please upload your resume';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            // Build FormData for multipart upload
            const fd = new FormData();
            fd.append('full_name', formData.fullName);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('years_experience', formData.yearsExperience);
            if (formData.linkedin) fd.append('linkedin_url', formData.linkedin);
            if (formData.portfolio) fd.append('portfolio_url', formData.portfolio);
            if (formData.currentLocation) fd.append('current_location', formData.currentLocation);
            if (formData.availability) fd.append('availability', formData.availability);
            if (formData.resume) fd.append('resume', formData.resume);
            if (formData.coverLetter) fd.append('cover_letter', formData.coverLetter);
            if (formData.expectedSalary) fd.append('expected_salary', formData.expectedSalary);

            await submitApplication(slug, fd);
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, resume: 'Please upload a PDF or DOC/DOCX file' }));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, resume: 'File size must be under 5MB' }));
                return;
            }
            updateField('resume', file);
        }
    };

    if (loading) {
        return (
            <div className="application-page">
                <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="application-page">
                <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
                    <h2>Job not found</h2>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>Browse Jobs</Link>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="application-page">
                <div className="application-success">
                    <div className="application-success__inner animate-fade-in-up">
                        <div className="application-success__icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2 className="application-success__title">Application Submitted!</h2>
                        <p className="application-success__text">
                            Thank you for applying to <strong>{job.title}</strong>.
                            Your application is under review and we'll be in touch soon.
                        </p>
                        <p className="application-success__email">
                            A confirmation email has been sent to <strong>{formData.email}</strong>
                        </p>
                        <div className="application-success__actions">
                            <Link to="/" className="btn btn-primary">Browse More Jobs</Link>
                            <Link to={`/jobs/${slug}`} className="btn btn-secondary">Back to Job Details</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="application-page">
            <div className="application-page__header">
                <div className="container application-page__header-content">
                    <button className="job-detail__back" onClick={() => navigate(`/jobs/${slug}`)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', margin: '0 auto var(--space-4)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Back to {job.title}
                    </button>
                    <h1 className="application-page__title animate-fade-in-up">Apply for {job.title}</h1>
                    <p className="application-page__subtitle animate-fade-in-up stagger-1">{job.location} · {job.job_type}</p>
                </div>
            </div>

            <div className="container">
                <div className="application-form-container animate-fade-in-up stagger-2">
                    {/* Minimalist Step Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', padding: '0 var(--space-4)' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Step {currentStep} of {STEPS.length}</span>
                        <span style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--text-sm)' }}>{STEPS[currentStep - 1]?.label}</span>
                    </div>

                    {submitError && (
                        <div style={{ padding: '12px 16px', background: 'hsl(0, 85%, 97%)', color: 'hsl(0, 70%, 45%)', border: '1px solid hsl(0, 70%, 90%)', borderRadius: '10px', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
                            {submitError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="application-form">
                        <div className="application-form__progress">
                            <div className="application-form__progress-fill" style={{ width: `${(currentStep / STEPS.length) * 100}%` }}></div>
                        </div>

                        {/* Step 1 */}
                        <div className={`application-form__step ${currentStep === 1 ? 'application-form__step--active' : ''}`}>
                            <div className="application-form__step-header">
                                <h2>Let's start with the basics</h2>
                                <p>Tell us a little about yourself — we'd love to get to know you.</p>
                            </div>

                            <div className="application-form__fields">
                                <div className="quiz-input-group">
                                    <input id="fullName" type="text" className={`quiz-input ${errors.fullName ? 'error' : ''}`} placeholder="John Doe" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
                                    <label className="quiz-label" htmlFor="fullName">Full Name *</label>
                                    {errors.fullName && <span className="input-error">{errors.fullName}</span>}
                                </div>

                                <div className="quiz-input-group">
                                    <input id="email" type="email" className={`quiz-input ${errors.email ? 'error' : ''}`} placeholder="john@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} />
                                    <label className="quiz-label" htmlFor="email">Email Address *</label>
                                    {errors.email && <span className="input-error">{errors.email}</span>}
                                </div>

                                <div className="quiz-input-group">
                                    <input id="phone" type="tel" className={`quiz-input ${errors.phone ? 'error' : ''}`} placeholder="+234 800 000 0000" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                                    <label className="quiz-label" htmlFor="phone">Phone Number *</label>
                                    {errors.phone && <span className="input-error">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`application-form__step ${currentStep === 2 ? 'application-form__step--active' : ''}`}>
                            <div className="application-form__step-header">
                                <h2>Your experience & details</h2>
                                <p>Help us understand your professional background.</p>
                            </div>

                            <div className="application-form__fields">
                                <div className="quiz-input-group">
                                    <select id="yearsExperience" className={`quiz-input ${errors.yearsExperience ? 'error' : ''}`} value={formData.yearsExperience} onChange={e => updateField('yearsExperience', e.target.value)}>
                                        <option value="" disabled hidden>Select experience level</option>
                                        <option value="0-1">0 – 1 years</option>
                                        <option value="2-3">2 – 3 years</option>
                                        <option value="4-6">4 – 6 years</option>
                                        <option value="7-10">7 – 10 years</option>
                                        <option value="10+">10+ years</option>
                                    </select>
                                    <label className="quiz-label" htmlFor="yearsExperience">Years of Experience *</label>
                                    {errors.yearsExperience && <span className="input-error">{errors.yearsExperience}</span>}
                                </div>

                                <div className="quiz-input-group">
                                    <input id="linkedin" type="url" className="quiz-input" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedin} onChange={e => updateField('linkedin', e.target.value)} />
                                    <label className="quiz-label" htmlFor="linkedin">LinkedIn Profile URL</label>
                                </div>

                                <div className="quiz-input-group">
                                    <input id="portfolio" type="url" className="quiz-input" placeholder="https://yourportfolio.com" value={formData.portfolio} onChange={e => updateField('portfolio', e.target.value)} />
                                    <label className="quiz-label" htmlFor="portfolio">Portfolio URL</label>
                                </div>

                                <div className="application-form__fields-row">
                                    <div className="quiz-input-group">
                                        <input id="currentLocation" type="text" className="quiz-input" placeholder="City, Country" value={formData.currentLocation} onChange={e => updateField('currentLocation', e.target.value)} />
                                        <label className="quiz-label" htmlFor="currentLocation">Current Location</label>
                                    </div>
                                    <div className="quiz-input-group">
                                        <select id="availability" className="quiz-input" value={formData.availability} onChange={e => updateField('availability', e.target.value)}>
                                            <option value="" disabled hidden>Select availability</option>
                                            <option value="immediately">Immediately</option>
                                            <option value="2-weeks">2 weeks notice</option>
                                            <option value="1-month">1 month notice</option>
                                            <option value="3-months">3 months notice</option>
                                        </select>
                                        <label className="quiz-label" htmlFor="availability">Availability</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`application-form__step ${currentStep === 3 ? 'application-form__step--active' : ''}`}>
                            <div className="application-form__step-header">
                                <h2>Almost there!</h2>
                                <p>Upload your documents and let us know your expectations.</p>
                            </div>

                            <div className="application-form__fields">
                                <div className="input-group">
                                    <label className="input-label">Resume / CV *</label>
                                    <div className={`file-upload ${errors.resume ? 'file-upload--error' : ''} ${formData.resume ? 'file-upload--has-file' : ''}`}>
                                        {formData.resume ? (
                                            <div className="file-upload__preview">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                <div>
                                                    <div className="file-upload__name">{formData.resume.name}</div>
                                                    <div className="file-upload__size">{(formData.resume.size / 1024).toFixed(0)} KB</div>
                                                </div>
                                                <button type="button" className="file-upload__remove" onClick={() => updateField('resume', null)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="file-upload__label">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                <span className="file-upload__text">Drag & drop or <strong>browse</strong></span>
                                                <span className="file-upload__hint">PDF, DOC, DOCX — Max 5MB</span>
                                                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} hidden />
                                            </label>
                                        )}
                                    </div>
                                    {errors.resume && <span className="input-error">{errors.resume}</span>}
                                </div>

                                <div className="quiz-input-group">
                                    <textarea id="coverLetter" className="quiz-input" placeholder="Tell us why you're a great fit for this role..." value={formData.coverLetter} onChange={e => updateField('coverLetter', e.target.value)} rows={3}></textarea>
                                    <label className="quiz-label" htmlFor="coverLetter">Cover Letter (Optional)</label>
                                </div>

                                <div className="quiz-input-group">
                                    <input id="expectedSalary" type="text" className="quiz-input" placeholder="e.g. ₦1,200,000" value={formData.expectedSalary} onChange={e => updateField('expectedSalary', e.target.value)} />
                                    <label className="quiz-label" htmlFor="expectedSalary">Expected Salary (Annual)</label>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="application-form__nav">
                            {currentStep > 1 && (
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                    Previous
                                </button>
                            )}
                            <div style={{ flex: 1 }}></div>
                            {currentStep < 3 ? (
                                <button type="button" className="btn btn-primary" onClick={handleNext}>
                                    Continue
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                    {!submitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
