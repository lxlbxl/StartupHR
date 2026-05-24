import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';
import { useState } from 'react';

const adminNavItems = [
    {
        label: 'Dashboard',
        path: '/admin',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        )
    },
    {
        label: 'Manage Jobs',
        path: '/admin/jobs',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        )
    },
    {
        label: 'Applications',
        path: '/admin/applications',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        requireAdmin: false
    },
    {
        label: 'Staff',
        path: '/admin/staff',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        requireAdmin: true
    },
    {
        label: 'Activity Log',
        path: '/admin/activity',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 12h4l2-9 5 18 3-9h6" />
            </svg>
        ),
        requireAdmin: true
    },
    {
        label: 'Email Settings',
        path: '/admin/email-settings',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
            </svg>
        ),
        requireAdmin: true
    },
    {
        label: 'Email Templates',
        path: '/admin/email-templates',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        ),
        requireAdmin: true
    }
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login', { replace: true });
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="admin-sidebar__header">
                    <div className="admin-sidebar__brand">
                        <div className="admin-sidebar__logo-mark">
                            <span>P</span>
                        </div>
                        <div>
                            <div className="admin-sidebar__title">Priority Talent</div>
                            <div className="admin-sidebar__subtitle">Admin Dashboard</div>
                        </div>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    <div className="admin-sidebar__nav-label">Menu</div>
                    {adminNavItems.filter(item => !item.requireAdmin || isAdmin).map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    {user && (
                        <div className="admin-sidebar__user-info" onClick={() => { setSidebarOpen(false); navigate('/admin/profile'); }} style={{ cursor: 'pointer' }}>
                            <div className="admin-sidebar__user-avatar" style={{ background: isAdmin ? 'var(--color-accent)' : 'var(--color-info)' }}>
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="admin-sidebar__user-details">
                                <div className="admin-sidebar__user-name">{user.name}</div>
                                <div className="admin-sidebar__user-role">{user.role === 'admin' ? 'Administrator' : 'Staff'}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="admin-sidebar__link admin-sidebar__logout-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                    </button>
                    <a href="/" className="admin-sidebar__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Back to Site</span>
                    </a>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <button className="admin-topbar__menu" onClick={() => setSidebarOpen(true)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <div className="admin-topbar__title">
                        {adminNavItems.find(item =>
                            item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path)
                        )?.label || 'Dashboard'}
                    </div>
                    <div className="admin-topbar__actions">
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginRight: '8px', textTransform: 'capitalize' }}>
                            {user?.role}
                        </span>
                        <div className="admin-topbar__avatar" onClick={() => navigate('/admin/profile')} title="My Profile" style={{ background: isAdmin ? 'var(--color-accent)' : 'var(--color-info)', cursor: 'pointer' }}>
                            <span>{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="admin-bottom-nav">
                {adminNavItems
                    .filter(item => (!item.requireAdmin || isAdmin) && !['Email Settings', 'Email Templates'].includes(item.label))
                    .map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `admin-bottom-nav__link ${isActive ? 'admin-bottom-nav__link--active' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
            </nav>
        </div>
    );
}
