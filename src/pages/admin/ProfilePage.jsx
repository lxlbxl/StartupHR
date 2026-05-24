import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const dataToUpdate = {
                name: formData.name,
                email: formData.email
            };

            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            const response = await updateProfile(dataToUpdate);
            setSuccess('Profile updated successfully');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

            // Re-authenticate silently to update context with the new details
            // The API response actually returns the updated user, but calling getMe (via useAuth context if needed) or just updating local state is fine.
            // Since our AuthContext doesn't have an expose update logic directly, we might need to reload or rely on a silent refresh if possible.
            // But a simple page reload is a safe bet for Admin Layout changes to pick up smoothly.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '24px', color: 'var(--color-text)' }}>My Profile</h1>

            <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
                {error && <div style={{ marginBottom: '16px', padding: '12px', background: 'hsl(0, 85%, 97%)', color: 'hsl(0, 70%, 45%)', borderRadius: '8px' }}>{error}</div>}
                {success && <div style={{ marginBottom: '16px', padding: '12px', background: 'hsl(142, 70%, 95%)', color: 'hsl(142, 60%, 35%)', borderRadius: '8px' }}>{success}</div>}

                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Name</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                    <input
                        type="email"
                        className="input-field"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '24px 0' }} />
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Change Password (Optional)</h3>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>New Password</label>
                    <input
                        type="password"
                        className="input-field"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave blank to keep current password"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                </div>

                {formData.password && (
                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Confirm New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required={!!formData.password}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
            </form>
        </div>
    );
}
