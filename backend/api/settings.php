<?php
/**
 * PRIORITY TALENT - Settings API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/Mailer.php';

function handleGetSettings(): void
{
    requireRole('admin');

    $db = getDB();
    $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
    $settingsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $settings = [];
    foreach ($settingsRaw as $row) {
        // Obscure password for safety, though admins can view it or we can just not return it
        if ($row['setting_key'] === 'smtp_pass' && !empty($row['setting_value'])) {
            // Return dummy value to indicate it is set
            $settings[$row['setting_key']] = '********';
        } else {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }

    jsonResponse(['settings' => $settings]);
}

function handleUpdateSettings(): void
{
    $currentUser = requireRole('admin');
    $body = getJsonBody();

    $db = getDB();
    // Expected keys
    $keys = [
        'mail_method',
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_pass',
        'smtp_secure',
        'smtp_from_email',
        'smtp_from_name'
    ];

    try {
        $db->beginTransaction();

        $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

        foreach ($keys as $key) {
            if (isset($body[$key])) {
                $val = $body[$key];
                // If they send the dummy password, don't update it
                if ($key === 'smtp_pass' && $val === '********') {
                    continue;
                }
                $stmt->execute([$key, trim($val)]);
            }
        }

        $db->commit();

        // Log activity
        logActivity($currentUser['id'], 'updated_settings', 'settings', null);

        jsonResponse(['message' => 'Settings updated successfully']);
    } catch (PDOException $e) {
        $db->rollBack();
        jsonResponse(['error' => 'Failed to update settings'], 500);
    }
}

function handleTestEmail(): void
{
    requireRole('admin');
    $body = getJsonBody();

    $testEmail = filter_var(trim($body['test_email'] ?? ''), FILTER_VALIDATE_EMAIL);

    if (!$testEmail) {
        jsonResponse(['error' => 'Valid test email address is required'], 400);
    }

    $db = getDB();
    $mailer = new Mailer($db);

    $subject = "Priority Talent - SMTP Test";
    $bodyHtml = "<p>If you are reading this email, your SMTP settings are configured correctly.</p>";

    $success = $mailer->sendEmail($testEmail, $subject, $bodyHtml);

    if ($success) {
        jsonResponse(['message' => 'Test email sent successfully']);
    } else {
        jsonResponse(['error' => 'Failed to send test email. Check server logs.'], 500);
    }
}
