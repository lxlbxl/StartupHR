<?php
/**
 * PRIORITY TALENT - Jobs API
 */

// ── PUBLIC ENDPOINTS (Candidate-facing, no auth) ──

function autoExpireJobs($db): void
{
    $db->query("UPDATE jobs SET status = 'closed' WHERE status = 'active' AND closing_date IS NOT NULL AND closing_date < CURRENT_DATE()");
}

function handleListJobsPublic(): void
{
    $db = getDB();
    autoExpireJobs($db);

    $where = ["j.status = 'active'", "(j.closing_date IS NULL OR j.closing_date >= CURRENT_DATE())"];
    $params = [];

    // Search
    if (!empty($_GET['search'])) {
        $where[] = '(j.title LIKE ? OR j.industry LIKE ? OR j.location LIKE ?)';
        $search = '%' . $_GET['search'] . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    // Filter by job type
    if (!empty($_GET['job_type'])) {
        $where[] = 'j.job_type = ?';
        $params[] = $_GET['job_type'];
    }

    // Filter by industry
    if (!empty($_GET['industry'])) {
        $where[] = 'j.industry = ?';
        $params[] = $_GET['industry'];
    }

    // Filter by location
    if (!empty($_GET['location'])) {
        $where[] = 'j.location = ?';
        $params[] = $_GET['location'];
    }

    $whereClause = implode(' AND ', $where);

    $sql = "
        SELECT j.id, j.slug, j.title, j.industry, j.location, j.job_type, j.pay_range_min, j.pay_range_max,
               j.closing_date, j.description, j.status, j.created_at
        FROM jobs j
        WHERE {$whereClause}
        ORDER BY j.created_at DESC
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll();

    jsonResponse(['jobs' => $jobs]);
}

function handleGetJobPublic(string $slugOrId): void
{
    $db = getDB();
    autoExpireJobs($db);

    if (is_numeric($slugOrId)) {
        $stmt = $db->prepare("SELECT * FROM jobs WHERE id = ? AND status = 'active'");
    } else {
        $stmt = $db->prepare("SELECT * FROM jobs WHERE slug = ? AND status = 'active'");
    }
    $stmt->execute([$slugOrId]);
    $job = $stmt->fetch();

    if (!$job) {
        jsonResponse(['error' => 'Job not found'], 404);
    }

    jsonResponse(['job' => $job]);
}

// ── ADMIN ENDPOINTS (Auth required) ──

function handleListJobs(): void
{
    requireAuth();
    $db = getDB();
    autoExpireJobs($db);

    $where = ['1=1'];
    $params = [];

    // Search
    if (!empty($_GET['search'])) {
        $where[] = '(j.title LIKE ? OR j.industry LIKE ? OR j.location LIKE ?)';
        $search = '%' . $_GET['search'] . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    // Filter by status
    if (!empty($_GET['status']) && in_array($_GET['status'], ['active', 'closed', 'archived'])) {
        $where[] = 'j.status = ?';
        $params[] = $_GET['status'];
    }

    // Filter by job type
    if (!empty($_GET['job_type'])) {
        $where[] = 'j.job_type = ?';
        $params[] = $_GET['job_type'];
    }

    // Filter by industry
    if (!empty($_GET['industry'])) {
        $where[] = 'j.industry = ?';
        $params[] = $_GET['industry'];
    }

    $whereClause = implode(' AND ', $where);

    $sql = "
        SELECT j.*,
            (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
        FROM jobs j
        WHERE {$whereClause}
        ORDER BY j.created_at DESC
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll();

    jsonResponse(['jobs' => $jobs]);
}

function handleGetJob(string $slugOrId): void
{
    requireAuth();
    $db = getDB();

    if (is_numeric($slugOrId)) {
        $stmt = $db->prepare('
            SELECT j.*,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
            FROM jobs j WHERE j.id = ?
        ');
    } else {
        $stmt = $db->prepare('
            SELECT j.*,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
            FROM jobs j WHERE j.slug = ?
        ');
    }
    $stmt->execute([$slugOrId]);
    $job = $stmt->fetch();

    if (!$job) {
        jsonResponse(['error' => 'Job not found'], 404);
    }

    jsonResponse(['job' => $job]);
}

function handleCreateJob(): void
{
    $currentUser = requireAuth();
    $body = getJsonBody();

    // Validation
    $required = ['title', 'industry', 'location', 'job_type', 'description'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            jsonResponse(['error' => "Field '{$field}' is required"], 400);
        }
    }

    $db = getDB();

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['title'])));
    $slug = $slug . '-' . substr(uniqid(), -5);

    $stmt = $db->prepare('
        INSERT INTO jobs (title, slug, industry, location, job_type, pay_range_min, pay_range_max,
                         closing_date, description, responsibilities, requirements, benefits, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([
        $body['title'],
        $slug,
        $body['industry'],
        $body['location'],
        $body['job_type'],
        $body['pay_range_min'] ?? null,
        $body['pay_range_max'] ?? null,
        $body['closing_date'] ?? null,
        $body['description'],
        $body['responsibilities'] ?? null,
        $body['requirements'] ?? null,
        $body['benefits'] ?? null,
        $body['status'] ?? 'active',
    ]);

    $newId = $db->lastInsertId();

    // Fetch the created job
    $stmt = $db->prepare('SELECT * FROM jobs WHERE id = ?');
    $stmt->execute([$newId]);
    $job = $stmt->fetch();

    logActivity($currentUser['id'], 'created_job', 'job', $newId);

    jsonResponse(['message' => 'Job created successfully', 'job' => $job], 201);
}

function handleUpdateJob(string $slugOrId): void
{
    $currentUser = requireAuth();
    $body = getJsonBody();
    $db = getDB();

    // Check job exists
    if (is_numeric($slugOrId)) {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE id = ?');
    } else {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE slug = ?');
    }
    $stmt->execute([$slugOrId]);
    $jobRow = $stmt->fetch();

    if (!$jobRow) {
        jsonResponse(['error' => 'Job not found'], 404);
    }

    $id = $jobRow['id'];

    $fields = [];
    $params = [];

    $allowedFields = [
        'title',
        'industry',
        'location',
        'job_type',
        'pay_range_min',
        'pay_range_max',
        'closing_date',
        'description',
        'responsibilities',
        'requirements',
        'benefits',
        'status'
    ];

    foreach ($allowedFields as $field) {
        if (array_key_exists($field, $body)) {
            $fields[] = "{$field} = ?";
            $params[] = $body[$field];
        }
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }

    $params[] = $id;
    $sql = 'UPDATE jobs SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $db->prepare($sql)->execute($params);

    // Fetch updated
    $stmt = $db->prepare('SELECT * FROM jobs WHERE id = ?');
    $stmt->execute([$id]);
    $job = $stmt->fetch();

    logActivity($currentUser['id'], 'updated_job', 'job', $id);

    jsonResponse(['message' => 'Job updated successfully', 'job' => $job]);
}

function handleDeleteJob(string $slugOrId): void
{
    $currentUser = requireRole('admin');
    $db = getDB();

    if (is_numeric($slugOrId)) {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE id = ?');
    } else {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE slug = ?');
    }
    $stmt->execute([$slugOrId]);
    $jobRow = $stmt->fetch();

    if (!$jobRow) {
        jsonResponse(['error' => 'Job not found'], 404);
    }
    $id = $jobRow['id'];

    // Archive instead of hard delete
    $db->prepare('UPDATE jobs SET status = ? WHERE id = ?')->execute(['archived', $id]);

    logActivity($currentUser['id'], 'archived_job', 'job', $id);

    jsonResponse(['message' => 'Job archived successfully']);
}
