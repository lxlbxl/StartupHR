import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid var(--color-border)',
                        borderTopColor: 'var(--color-accent)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--color-bg)',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                padding: '24px',
            }}>
                <div>
                    <h2 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>Access Denied</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
