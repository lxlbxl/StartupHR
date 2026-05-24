<?php
/**
 * PRIORITY TALENT - Complete Auth & Database Fixer
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>StartupHR Diagnostic & Fixer</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; background: #f4f4f9; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Diagnostic & Fixer</h1>

    <div class="card">
        <h2>System Info</h2>
        <pre>
PHP Version: <?php echo PHP_VERSION; ?>
Session ID: <?php echo session_id(); ?>
HTTPS: <?php echo (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'Yes' : 'No'; ?>
        </pre>
    </div>

    <div class="card">
        <h2>Database Connection</h2>
        <?php
        try {
            $db = getDB();
            echo "<p class='success'>Connected to " . DB_NAME . " on " . DB_HOST . "</p>";
            
            if (isset($_POST['reset_passwords'])) {
                $new_hash = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt = $db->prepare("UPDATE admins SET password_hash = ?");
                $stmt->execute([$new_hash]);
                echo "<p class='success'>SUCCESS: All admin/staff passwords have been reset to: <b>admin123</b></p>";
            }

            $stmt = $db->query("SELECT id, name, email, role FROM admins");
            $admins = $stmt->fetchAll();
            echo "<h3>Users in DB:</h3><ul>";
            foreach ($admins as $admin) {
                echo "<li>{$admin['name']} (<b>{$admin['email']}</b>) - Role: {$admin['role']}</li>";
            }
            echo "</ul>";

        } catch (Exception $e) {
            echo "<p class='error'>Database Error: " . $e->getMessage() . "</p>";
        }
        ?>
        <form method="POST">
            <button type="submit" name="reset_passwords" class="btn" onclick="return confirm('This will set ALL users passwords to: admin123. Proceed?')">
                Reset All Passwords to 'admin123'
            </button>
        </form>
    </div>

    <div class="card">
        <h2>Instructions</h2>
        <ol>
            <li>If you are getting a 401 error on login, click the <b>Reset</b> button above.</li>
            <li>Once reset, use email <b>admin@startuphr.africa</b> and password <b>admin123</b>.</li>
            <li>If it still fails, check the console for CORS errors.</li>
        </ol>
    </div>

    <p style="text-align:center; color: #666; font-size: 0.8em;">Please delete this file (diag.php) after fixing the issue.</p>
</body>
</html>
