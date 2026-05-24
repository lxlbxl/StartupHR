import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManageStaffPage.css';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = '/api';

export default function ManageStaffPage() {
    const { user, isAdmin } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentStaff, setCurrentStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchStaff();
        }
    }, [isAdmin]);

    // Protect route: Only admins can access this page
    if (!isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    const fetchStaff = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/staff`, {
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                setStaffList(data.staff);
            } else {
                setError(data.error || 'Failed to fetch staff');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setModalMode('add');
        setCurrentStaff(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'staff'
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (staff) => {
        setModalMode('edit');
        setCurrentStaff(staff);
        setFormData({
            name: staff.name,
            email: staff.email,
            password: '', // leave empty unless they want to change it
            role: staff.role
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        const url = modalMode === 'add'
            ? `${API_BASE_URL}/staff`
            : `${API_BASE_URL}/staff/${currentStaff.id}`;

        const method = modalMode === 'add' ? 'POST' : 'PUT';

        // Remove password from payload if it's empty during edit
        const payload = { ...formData };
        if (modalMode === 'edit' && !payload.password) {
            delete payload.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                setIsModalOpen(false);
                fetchStaff();
            } else {
                setFormError(data.error || 'Operation failed');
            }
        } catch (err) {
            setFormError('Network error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (id === user.id) {
            alert('You cannot delete your own account.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                fetchStaff();
            } else {
                alert(data.error || 'Failed to delete staff member');
            }
        } catch (err) {
            alert('Network error occurred');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-page">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Manage Staff</h1>
                        <p className="admin-page__subtitle">Loading staff members...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Manage Staff</h1>
                    <p className="admin-page__subtitle">Add, edit, and manage staff members and their roles.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add Staff</span>
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <div className="admin-card">
                {staffList.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <p>No staff members found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Last Login</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td style={{ fontWeight: '500' }}>{staff.name}</td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{staff.email}</td>
                                        <td>
                                            <span className={`role-badge role-badge--${staff.role}`}>
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>
                                            {new Date(staff.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>
                                            {staff.last_login ? new Date(staff.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td>
                                            <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className="admin-table__action-btn"
                                                    onClick={() => handleOpenEditModal(staff)}
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                {staff.id !== user.id && (
                                                    <button
                                                        className="admin-table__action-btn admin-table__action-btn--delete"
                                                        onClick={() => handleDelete(staff.id)}
                                                        title="Delete"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal__header">
                            <h2 className="modal__title">
                                {modalMode === 'add' ? 'Add New Staff' : 'Edit Staff Member'}
                            </h2>
                            <button className="modal__close" onClick={handleCloseModal}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal__body">
                            {formError && (
                                <div className="alert alert-error" style={{ marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                                    {formError}
                                </div>
                            )}

                            <form id="staff-form" onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="input-field"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="password">
                                        Password {modalMode === 'edit' && <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>(leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="input-field"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={modalMode === 'add'}
                                        minLength={6}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="input-field"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        disabled={user.id === currentStaff?.id} // Can't change own role
                                        required
                                    >
                                        <option value="staff">Staff (Limited Access)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                    {user.id === currentStaff?.id && (
                                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                            You cannot change your own role.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="modal__footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="staff-form"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Staff Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
