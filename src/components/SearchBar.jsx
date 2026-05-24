import './SearchBar.css';

export default function SearchBar({ searchTerm, onSearchChange, filters, onFilterChange, industries, locations, jobTypes }) {
    return (
        <div className="search-bar">
            <div className="search-bar__input-wrap">
                <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Search job titles, keywords..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchTerm && (
                    <button className="search-bar__clear" onClick={() => onSearchChange('')} aria-label="Clear search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                )}
            </div>

            <div className="search-bar__filters">
                <select
                    className="search-bar__select"
                    value={filters.industry}
                    onChange={(e) => onFilterChange('industry', e.target.value)}
                >
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>

                <select
                    className="search-bar__select"
                    value={filters.location}
                    onChange={(e) => onFilterChange('location', e.target.value)}
                >
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select
                    className="search-bar__select"
                    value={filters.jobType}
                    onChange={(e) => onFilterChange('jobType', e.target.value)}
                >
                    {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>
    );
}
