<?php
/**
 * PRIORITY TALENT - Applications API
 */
require_once __DIR__ . '/../utils/Mailer.php';

function handleListApplications(int $jobId): void
{
    requireAuth();
    $db = getDB();

    // Verify job exists
    $stmt = $db->prepare('SELECT id, title FROM jobs WHERE id = ?');
    $stmt->execute([$jobId]);
    $job = $stmt->fetch();
    if (!$job) {
        jsonResponse(['error' => 'Job not found'], 404);
    }

    // Filter by status
    $where = ['a.job_id = ?'];
    $params = [$jobId];

    if (!empty($_GET['status']) && in_array($_GET['status'], ['new', 'reviewed', 'shortlisted', 'rejected'])) {
        $where[] = 'a.status = ?';
        $params[] = $_GET['status'];
    }

    // Search
    if (!empty($_GET['search'])) {
        $where[] = '(a.full_name LIKE ? OR a.email LIKE ?)';
        $search = '%' . $_GET['search'] . '%';
        $params[] = $search;
        $params[] = $search;
    }

    $whereClause = implode(' AND ', $where);

    $sql = "SELECT a.* FROM applications a WHERE {$whereClause} ORDER BY a.created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $applications = $stmt->fetchAll();

    jsonResponse([
        'job' => $job,
        'applications' => $applications,
        'total' => count($applications),
    ]);
}

function handleListAllApplications(): void
{
    requireAuth();
    $db = getDB();

    $where = ['1=1'];
    $params = [];

    // Filter by job
    if (!empty($_GET['job_id'])) {
        $where[] = 'a.job_id = ?';
        $params[] = $_GET['job_id'];
    }

    // Filter by status
    if (!empty($_GET['status']) && in_array($_GET['status'], ['new', 'reviewed', 'shortlisted', 'rejected'])) {
        $where[] = 'a.status = ?';
        $params[] = $_GET['status'];
    }

    // Search
    if (!empty($_GET['search'])) {
        $where[] = '(a.full_name LIKE ? OR a.email LIKE ?)';
        $search = '%' . $_GET['search'] . '%';
        $params[] = $search;
        $params[] = $search;
    }

    $whereClause = implode(' AND ', $where);

    $sql = "
        SELECT a.*, j.title as job_title, j.industry, j.location as job_location
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE {$whereClause}
        ORDER BY a.created_at DESC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $applications = $stmt->fetchAll();

    jsonResponse([
        'applications' => $applications,
        'total' => count($applications),
    ]);
}

function handleGetApplication(int $id): void
{
    requireAuth();
    $db = getDB();

    $stmt = $db->prepare('
        SELECT a.*, j.title as job_title, j.industry, j.location as job_location
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE a.id = ?
    ');
    $stmt->execute([$id]);
    $application = $stmt->fetch();

    if (!$application) {
        jsonResponse(['error' => 'Application not found'], 404);
    }

    jsonResponse(['application' => $application]);
}

function handleUpdateApplication(int $id): void
{
    $currentUser = requireAuth();
    $body = getJsonBody();
    $db = getDB();

    $stmt = $db->prepare('SELECT id FROM applications WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Application not found'], 404);
    }

    if (empty($body['status']) || !in_array($body['status'], ['new', 'reviewed', 'shortlisted', 'rejected'])) {
        jsonResponse(['error' => 'Invalid status. Must be: new, reviewed, shortlisted, or rejected'], 400);
    }

    $db->prepare('UPDATE applications SET status = ? WHERE id = ?')->execute([$body['status'], $id]);

    $stmt = $db->prepare('
        SELECT a.*, j.title as job_title 
        FROM applications a 
        JOIN jobs j ON j.id = a.job_id 
        WHERE a.id = ?
    ');
    $stmt->execute([$id]);
    $application = $stmt->fetch();

    logActivity($currentUser['id'], 'updated_application_status', 'application', $id);

    // Send email to candidate
    $mailer = new Mailer($db);
    $mailer->sendTemplateEmail($application['email'], 'application_status_candidate', [
        'candidate_name' => $application['full_name'],
        'job_title' => $application['job_title'],
        'status' => ucfirst($body['status'])
    ]);

    jsonResponse(['message' => 'Application status updated', 'application' => $application]);
}

function handleExportCSV(): void
{
    requireAuth();
    $db = getDB();

    $jobId = $_GET['job_id'] ?? null;

    $where = ['1=1'];
    $params = [];

    if ($jobId) {
        $where[] = 'a.job_id = ?';
        $params[] = $jobId;
    }

    $whereClause = implode(' AND ', $where);

    $stmt = $db->prepare("
        SELECT a.id, j.title as job_title, a.full_name, a.email, a.phone,
               a.years_experience, a.linkedin_url, a.portfolio_url,
               a.current_location, a.availability, a.expected_salary,
               a.status, a.created_at
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE {$whereClause}
        ORDER BY a.created_at DESC
    ");
    $stmt->execute($params);
    $applications = $stmt->fetchAll();

    // Output CSV
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="applications_export_' . date('Y-m-d') . '.csv"');

    $output = fopen('php://output', 'w');

    // Header row
    fputcsv($output, [
        'ID',
        'Job Title',
        'Full Name',
        'Email',
        'Phone',
        'Years Experience',
        'LinkedIn',
        'Portfolio',
        'Location',
        'Availability',
        'Expected Salary',
        'Status',
        'Applied Date'
    ]);

    foreach ($applications as $row) {
        fputcsv($output, array_values($row));
    }

    fclose($output);
    exit;
}

function handleSubmitApplication(string $slugOrId): void
{
    // This is the candidate-facing endpoint (no auth required)
    $db = getDB();

    // Verify job exists and is active
    if (is_numeric($slugOrId)) {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE id = ? AND status = ?');
    } else {
        $stmt = $db->prepare('SELECT id FROM jobs WHERE slug = ? AND status = ?');
    }
    $stmt->execute([$slugOrId, 'active']);
    $jobRow = $stmt->fetch();

    if (!$jobRow) {
        jsonResponse(['error' => 'Job not found or no longer accepting applications'], 404);
    }
    $jobId = $jobRow['id'];

    // Handle multipart form data or JSON
    $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;

    if ($isMultipart) {
        $body = $_POST;
    } else {
        $body = getJsonBody();
    }

    // Validate required fields
    $required = ['full_name', 'email', 'phone'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            jsonResponse(['error' => "Field '{$field}' is required"], 400);
        }
    }

    // Validate email format
    if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email address'], 400);
    }

    // Handle resume file upload
    $resumePath = null;
    if (!empty($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['resume'];

        // Validate file type
        $allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            jsonResponse(['error' => 'Resume must be a PDF or DOC/DOCX file'], 400);
        }

        // Validate file size
        if ($file['size'] > MAX_FILE_SIZE) {
            jsonResponse(['error' => 'Resume file must be under 5MB'], 400);
        }

        // Create upload dir if needed
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }

        // Generate unique filename
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'resume_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = UPLOAD_DIR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            jsonResponse(['error' => 'Failed to save resume file'], 500);
        }

        $resumePath = 'uploads/resumes/' . $filename;
    }

    $stmt = $db->prepare('
        INSERT INTO applications (job_id, full_name, email, phone, years_experience,
                                  linkedin_url, portfolio_url, current_location, availability,
                                  resume_path, cover_letter, expected_salary, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([
        $jobId,
        $body['full_name'],
        $body['email'],
        $body['phone'],
        $body['years_experience'] ?? null,
        $body['linkedin_url'] ?? null,
        $body['portfolio_url'] ?? null,
        $body['current_location'] ?? null,
        $body['availability'] ?? null,
        $resumePath,
        $body['cover_letter'] ?? null,
        $body['expected_salary'] ?? null,
        'new',
    ]);

    // Get job details for email
    $stmt = $db->prepare('SELECT title FROM jobs WHERE id = ?');
    $stmt->execute([$jobId]);
    $job = $stmt->fetch();
    $jobTitle = $job ? $job['title'] : 'Unknown Job';

    // Send email to admins
    $mailer = new Mailer($db);
    $stmt = $db->query("SELECT email FROM admins");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($admins as $admin) {
        $mailer->sendTemplateEmail($admin['email'], 'new_application_admin', [
            'job_title' => $jobTitle,
            'candidate_name' => $body['full_name'],
            'candidate_email' => $body['email'],
            'candidate_phone' => $body['phone']
        ]);
    }

    jsonResponse([
        'message' => 'Thank you for applying. Your application is under review.',
        'application_id' => $db->lastInsertId(),
    ], 201);
}

function handleDownloadResume(int $id): void
{
    requireAuth();
    $db = getDB();

    $stmt = $db->prepare('SELECT resume_path, full_name FROM applications WHERE id = ?');
    $stmt->execute([$id]);
    $app = $stmt->fetch();

    if (!$app || empty($app['resume_path'])) {
        jsonResponse(['error' => 'Resume not found'], 404);
    }

    $filePath = __DIR__ . '/../' . $app['resume_path'];
    if (!file_exists($filePath)) {
        jsonResponse(['error' => 'Resume file not found on server'], 404);
    }

    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $downloadName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $app['full_name']) . '_resume.' . $ext;

    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
}
