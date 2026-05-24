<?php
/**
 * PRIORITY TALENT - Dashboard API
 */

function handleDashboardStats(): void
{
    requireAuth();
    $db = getDB();

    // Active jobs count
    $activeJobs = $db->query("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'")->fetch()['count'];

    // Total jobs
    $totalJobs = $db->query("SELECT COUNT(*) as count FROM jobs")->fetch()['count'];

    // Total applications
    $totalApps = $db->query("SELECT COUNT(*) as count FROM applications")->fetch()['count'];

    // New applications (unreviewed)
    $newApps = $db->query("SELECT COUNT(*) as count FROM applications WHERE status = 'new'")->fetch()['count'];

    // Shortlisted candidates
    $shortlisted = $db->query("SELECT COUNT(*) as count FROM applications WHERE status = 'shortlisted'")->fetch()['count'];

    // Applications per job (top 5)
    $appsPerJob = $db->query("
        SELECT j.id, j.title, COUNT(a.id) as application_count
        FROM jobs j
        LEFT JOIN applications a ON a.job_id = j.id
        WHERE j.status = 'active'
        GROUP BY j.id, j.title
        ORDER BY application_count DESC
        LIMIT 5
    ")->fetchAll();

    // Applications by status
    $appsByStatus = $db->query("
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
    ")->fetchAll();

    // Recent applications (last 10)
    $recentApps = $db->query("
        SELECT a.id, a.full_name, a.email, a.status, a.created_at,
               j.title as job_title
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        ORDER BY a.created_at DESC
        LIMIT 10
    ")->fetchAll();

    // Applications trend (last 7 days)
    $trend = $db->query("
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM applications
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ")->fetchAll();

    jsonResponse([
        'stats' => [
            'active_jobs' => (int) $activeJobs,
            'total_jobs' => (int) $totalJobs,
            'total_applications' => (int) $totalApps,
            'new_applications' => (int) $newApps,
            'shortlisted' => (int) $shortlisted,
        ],
        'applications_per_job' => $appsPerJob,
        'applications_by_status' => $appsByStatus,
        'recent_applications' => $recentApps,
        'trend' => $trend,
    ]);
}
