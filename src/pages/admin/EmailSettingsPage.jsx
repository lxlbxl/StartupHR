import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = '/api';

export default function EmailSettingsPage() {
    const { isAdmin } = useAuth();
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Test email state
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testMessage, setTestMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (isAdmin) {
            fetchSettings();
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setSettings(data.settings);
            }
        } catch (err) {
            setMessage({ text: 'Failed to load settings', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(settings)
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Settings saved successfully', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Failed to save settings', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error occurred', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmail) return;

        setIsTesting(true);
        setTestMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/settings/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ test_email: testEmail })
            });
            const data = await response.json();

            if (response.ok) {
                setTestMessage({ text: 'Test email sent successfully', type: 'success' });
            } else {
                setTestMessage({ text: data.error || 'Failed to send test email', type: 'error' });
            }
        } catch (err) {
            setTestMessage({ text: 'Network error occurred', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return <div className="admin-page">Loading...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Email Settings (SMTP)</h1>
                    <p className="admin-page__subtitle">Configure how system emails are sent.</p>
                </div>
            </div>

            {message.text && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', borderColor: message.type === 'error' ? '#fecaca' : '#bbf7d0', color: message.type === 'error' ? '#991b1b' : '#166534' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mail Method</label>
                        <select
                            name="mail_method"
                            value={settings.mail_method || 'smtp'}
                            onChange={handleInputChange}
                            style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}
                        >
                            <option value="smtp">SMTP (Recommended)</option>
                            <option value="phpmail">PHP mail()</option>
                        </select>
                    </div>

                    {(!settings.mail_method || settings.mail_method === 'smtp') && (
                        <>
                            <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-body)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>SMTP Configuration</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SMTP Host</label>
                                    <input type="text" name="smtp_host" value={settings.smtp_host || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SMTP Port</label>
                                    <input type="number" name="smtp_port" value={settings.smtp_port || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SMTP Username</label>
                                    <input type="text" name="smtp_user" value={settings.smtp_user || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SMTP Password</label>
                                    <input type="password" name="smtp_pass" value={settings.smtp_pass || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} placeholder={settings.smtp_pass === '********' ? '********' : ''} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SMTP Security Protocol</label>
                                    <select name="smtp_secure" value={settings.smtp_secure || 'tls'} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
                                        <option value="tls">TLS</option>
                                        <option value="ssl">SSL</option>
                                        <option value="">None</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-body)', fontWeight: '600', marginTop: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Sender Identity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>From Email</label>
                            <input type="email" name="smtp_from_email" value={settings.smtp_from_email || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>From Name</label>
                            <input type="text" name="smtp_from_name" value={settings.smtp_from_name || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }} required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>

            <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-body)', fontWeight: '600', marginTop: '3rem', marginBottom: '1rem' }}>Test Connection</h3>
            <div className="admin-card" style={{ padding: '2rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Send a test email to verify your SMTP configuration.</p>

                {testMessage.text && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid', backgroundColor: testMessage.type === 'error' ? '#fee2e2' : '#dcfce7', borderColor: testMessage.type === 'error' ? '#fecaca' : '#bbf7d0', color: testMessage.type === 'error' ? '#991b1b' : '#166534' }}>
                        {testMessage.text}
                    </div>
                )}

                <form onSubmit={handleTestEmail} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email address"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}
                        required
                    />
                    <button type="submit" className="btn btn-secondary" disabled={isTesting || !testEmail}>
                        {isTesting ? 'Sending...' : 'Send Test Email'}
                    </button>
                </form>
            </div>
        </div>
    );
}
