<?php
/**
 * PRIORITY TALENT - Backend Configuration
 * Database connection, CORS, and helper functions
 */

// ── Error Reporting ──────────────────────────────────
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ── Session ──────────────────────────────────────────
// Shared hosting can be picky about session paths and domains.
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '', // Leave empty to match current domain
    'secure' => $is_https,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── CORS Headers ─────────────────────────────────────
$allowedOrigins = ['http://localhost:5173', 'http://localhost:8000', 'http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// On production, if we are on the same domain, HTTP_ORIGIN might be empty or match.
// Let's allow the current domain dynamically if it's not a local dev.
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} elseif (!empty($origin)) {
    // Dynamically allow the origin if it matches the current host (production)
    $host = $_SERVER['HTTP_HOST'];
    if (str_contains($origin, $host)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: http://localhost:5173');
    }
} else {
    // Fallback for requests without Origin header (same-site)
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Database Configuration ───────────────────────────
$envFile = __DIR__ . '/env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

defined('DB_HOST') or define('DB_HOST', 'localhost');
defined('DB_PORT') or define('DB_PORT', '3306');
defined('DB_NAME') or define('DB_NAME', 'priority_talent');
defined('DB_USER') or define('DB_USER', 'root');
defined('DB_PASS') or define('DB_PASS', '');

// ── Upload Configuration ─────────────────────────────
define('UPLOAD_DIR', __DIR__ . '/uploads/resumes/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

/**
 * Get PDO database connection
 */
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
        }
    }
    return $pdo;
}

// ── Response Helpers ─────────────────────────────────

/**
 * Send a JSON response and exit
 */
function jsonResponse(mixed $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Get JSON body from request
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Check if user is authenticated (any role)
 */
function requireAuth(): array
{
    if (empty($_SESSION['admin_id'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    return [
        'id' => $_SESSION['admin_id'],
        'name' => $_SESSION['admin_name'] ?? '',
        'email' => $_SESSION['admin_email'] ?? '',
        'role' => $_SESSION['admin_role'] ?? 'staff',
    ];
}

/**
 * Check if user has the required role
 */
function requireRole(string $role): array
{
    $user = requireAuth();
    if ($user['role'] !== $role) {
        jsonResponse(['error' => 'Forbidden: insufficient permissions'], 403);
    }
    return $user;
}

/**
 * Log an activity to the activity_logs table
 */
function logActivity(int $adminId, string $action, string $entityType, ?int $entityId = null): void
{
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO activity_logs (admin_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$adminId, $action, $entityType, $entityId]);
    } catch (Throwable $e) {
        // Silently fail logging rather than breaking the application flow
        error_log("Failed to log activity: " . $e->getMessage());
    }
}
