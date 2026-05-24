/**
 * PRIORITY TALENT - API Service
 * Centralized API calls with credentials for session cookies
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: {},
        ...options,
    };

    // Set JSON content type for non-FormData requests
    if (config.body && !(config.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        if (typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }
    }

    const response = await fetch(url, config);

    // Handle CSV export (binary download)
    if (response.headers.get('content-type')?.includes('text/csv')) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `applications_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return { success: true };
    }

    let data;
    const text = await response.text();
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = { error: text || 'Invalid JSON response from server' };
    }

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
}

// ── Auth ──────────────────────────────────────────────

export async function login(email, password) {
    return request('/auth/login', {
        method: 'POST',
        body: { email, password },
    });
}

export async function logout() {
    return request('/auth/logout', { method: 'POST' });
}

export async function getMe() {
    return request('/auth/me');
}

export async function updateProfile(data) {
    return request('/auth/profile', {
        method: 'PUT',
        body: data,
    });
}

// ── Public (Candidate-facing) ────────────────────────

export async function getPublicJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/public/jobs${query ? '?' + query : ''}`);
}

export async function getPublicJob(id) {
    return request(`/public/jobs/${id}`);
}

export async function submitApplication(jobId, formData) {
    return request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: formData, // FormData for multipart upload
    });
}

// ── Admin: Jobs ──────────────────────────────────────

export async function getAdminJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/jobs${query ? '?' + query : ''}`);
}

export async function getAdminJob(id) {
    return request(`/jobs/${id}`);
}

export async function createJob(jobData) {
    return request('/jobs', {
        method: 'POST',
        body: jobData,
    });
}

export async function updateJob(id, jobData) {
    return request(`/jobs/${id}`, {
        method: 'PUT',
        body: jobData,
    });
}

export async function deleteJob(id) {
    return request(`/jobs/${id}`, { method: 'DELETE' });
}

// ── Admin: Dashboard ─────────────────────────────────

export async function getDashboardStats() {
    return request('/dashboard/stats');
}

// ── Admin: Applications ──────────────────────────────

export async function getAllApplications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? '?' + query : ''}`);
}

export async function getApplicationsForJob(jobId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/jobs/${jobId}/applications${query ? '?' + query : ''}`);
}

export async function getApplication(id) {
    return request(`/applications/${id}`);
}

export async function updateApplicationStatus(id, status) {
    return request(`/applications/${id}`, {
        method: 'PUT',
        body: { status },
    });
}

export async function exportCSV(jobId = null) {
    const params = jobId ? `?job_id=${jobId}` : '';
    return request(`/applications/export${params}`);
}

export function getResumeDownloadUrl(applicationId) {
    return `${API_BASE}/applications/${applicationId}/resume`;
}
