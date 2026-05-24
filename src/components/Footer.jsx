import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__accent-line"></div>
            <div className="container">
                <div className="footer__inner">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <div className="footer__logo-mark">
                                <span>P</span>
                            </div>
                            <div>
                                <div className="footer__logo-name">Priority Talent</div>
                                <div className="footer__logo-tagline">by StartupHR Africa</div>
                            </div>
                        </div>
                        <p className="footer__description">
                            Connecting top talent with Africa's most innovative companies.
                            Find your next opportunity or hire your dream team.
                        </p>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__heading">For Candidates</h5>
                        <ul className="footer__list">
                            <li><a href="/">Browse Jobs</a></li>
                            <li><a href="/">Career Resources</a></li>
                            <li><a href="/">Salary Guide</a></li>
                        </ul>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__heading">For Employers</h5>
                        <ul className="footer__list">
                            <li><a href="/admin">Post a Job</a></li>
                            <li><a href="/">Talent Solutions</a></li>
                            <li><a href="/">Pricing</a></li>
                        </ul>
                    </div>

                    <div className="footer__links-group">
                        <h5 className="footer__heading">Company</h5>
                        <ul className="footer__list">
                            <li><a href="https://startuphr.africa" target="_blank" rel="noopener noreferrer">About StartupHR</a></li>
                            <li><a href="/">Contact</a></li>
                            <li><a href="/">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {currentYear} StartupHR Africa. All rights reserved.</p>
                    <div className="footer__social">
                        <a href="/" aria-label="LinkedIn" className="footer__social-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                        <a href="/" aria-label="Twitter" className="footer__social-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
