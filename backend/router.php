<?php
/**
 * PRIORITY TALENT - Router
 * Maps incoming requests to the correct API handler
 *
 * Usage: php -S localhost:8000 -t . backend/router.php
 */

// ── Serve static files ──────────────────────────────
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Let PHP built-in server handle actual static files
if (php_sapi_name() === 'cli-server') {
    $filePath = __DIR__ . '/../' . ltrim($requestUri, '/');
    if ($requestUri !== '/' && file_exists($filePath) && is_file($filePath)) {
        return false;
    }
}

// ── API Routes ───────────────────────────────────────
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim($requestUri, '/');

// Remove query string
$path = strtok($path, '?');

// Route matching
switch (true) {
    // ── Auth ──
    case $path === 'api/auth/login' && $method === 'POST':
        require __DIR__ . '/api/auth.php';
        handleLogin();
        break;

    case $path === 'api/auth/logout' && $method === 'POST':
        require __DIR__ . '/api/auth.php';
        handleLogout();
        break;

    case $path === 'api/auth/me' && $method === 'GET':
        require __DIR__ . '/api/auth.php';
        handleMe();
        break;

    case $path === 'api/auth/profile' && $method === 'PUT':
        require __DIR__ . '/api/auth.php';
        handleUpdateProfile();
        break;

    // ── Public Job Endpoints (Candidate-facing, no auth) ──
    case $path === 'api/public/jobs' && $method === 'GET':
        require __DIR__ . '/api/jobs.php';
        handleListJobsPublic();
        break;

    case preg_match('#^api/public/jobs/([a-zA-Z0-9\-]+)$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/jobs.php';
        handleGetJobPublic($m[1]);
        break;

    // ── Dashboard ──
    case $path === 'api/dashboard/stats' && $method === 'GET':
        require __DIR__ . '/api/dashboard.php';
        handleDashboardStats();
        break;

    // ── Admin Staff ──
    case $path === 'api/activity' && $method === 'GET':
        require __DIR__ . '/api/activity.php';
        handleListActivityLogs();
        break;

    // ── Settings & Templates ──
    case $path === 'api/settings' && $method === 'GET':
        require __DIR__ . '/api/settings.php';
        handleGetSettings();
        break;

    case $path === 'api/settings' && $method === 'POST':
        require __DIR__ . '/api/settings.php';
        handleUpdateSettings();
        break;

    case $path === 'api/settings/test' && $method === 'POST':
        require __DIR__ . '/api/settings.php';
        handleTestEmail();
        break;

    case $path === 'api/email-templates' && $method === 'GET':
        require __DIR__ . '/api/email_templates.php';
        handleListTemplates();
        break;

    case preg_match('#^api/email-templates/([^/]+)$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/email_templates.php';
        handleGetTemplate($m[1]);
        break;

    case preg_match('#^api/email-templates/([^/]+)$#', $path, $m) && $method === 'PUT':
        require __DIR__ . '/api/email_templates.php';
        handleUpdateTemplate($m[1]);
        break;

    case $path === 'api/staff' && $method === 'GET':
        require __DIR__ . '/api/staff.php';
        handleListStaff();
        break;

    case $path === 'api/staff' && $method === 'POST':
        require __DIR__ . '/api/staff.php';
        handleCreateStaff();
        break;

    case preg_match('#^api/staff/(\d+)$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/staff.php';
        handleGetStaff((int) $m[1]);
        break;

    case preg_match('#^api/staff/(\d+)$#', $path, $m) && $method === 'PUT':
        require __DIR__ . '/api/staff.php';
        handleUpdateStaff((int) $m[1]);
        break;

    case preg_match('#^api/staff/(\d+)$#', $path, $m) && $method === 'DELETE':
        require __DIR__ . '/api/staff.php';
        handleDeleteStaff((int) $m[1]);
        break;

    // ── Admin Jobs ──
    case $path === 'api/jobs' && $method === 'GET':
        require __DIR__ . '/api/jobs.php';
        handleListJobs();
        break;

    case $path === 'api/jobs' && $method === 'POST':
        require __DIR__ . '/api/jobs.php';
        handleCreateJob();
        break;

    case preg_match('#^api/jobs/([a-zA-Z0-9\-]+)$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/jobs.php';
        handleGetJob($m[1]);
        break;

    case preg_match('#^api/jobs/([a-zA-Z0-9\-]+)$#', $path, $m) && $method === 'PUT':
        require __DIR__ . '/api/jobs.php';
        handleUpdateJob($m[1]);
        break;

    case preg_match('#^api/jobs/([a-zA-Z0-9\-]+)$#', $path, $m) && $method === 'DELETE':
        require __DIR__ . '/api/jobs.php';
        handleDeleteJob($m[1]);
        break;

    // ── Applications ──
    case $path === 'api/applications' && $method === 'GET':
        require __DIR__ . '/api/applications.php';
        handleListAllApplications();
        break;

    case preg_match('#^api/jobs/(\d+)/applications$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/applications.php';
        handleListApplications((int) $m[1]);
        break;

    case $path === 'api/applications/export' && $method === 'GET':
        require __DIR__ . '/api/applications.php';
        handleExportCSV();
        break;

    case preg_match('#^api/applications/(\d+)$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/applications.php';
        handleGetApplication((int) $m[1]);
        break;

    case preg_match('#^api/applications/(\d+)$#', $path, $m) && $method === 'PUT':
        require __DIR__ . '/api/applications.php';
        handleUpdateApplication((int) $m[1]);
        break;

    case preg_match('#^api/applications/(\d+)/resume$#', $path, $m) && $method === 'GET':
        require __DIR__ . '/api/applications.php';
        handleDownloadResume((int) $m[1]);
        break;

    // ── Candidate-facing: submit application ──
    case preg_match('#^api/jobs/([a-zA-Z0-9\-]+)/apply$#', $path, $m) && $method === 'POST':
        require __DIR__ . '/api/applications.php';
        handleSubmitApplication($m[1]);
        break;

    // ── 404 ──
    default:
        jsonResponse(['error' => 'Not found', 'path' => $path], 404);
}
