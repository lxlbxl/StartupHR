<?php
/**
 * PRIORITY TALENT - Email Templates API
 */

require_once __DIR__ . '/../config.php';

function handleListTemplates(): void
{
    requireRole('admin');

    $db = getDB();
    $stmt = $db->query("SELECT id, name, subject, variables, updated_at FROM email_templates");
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(['templates' => $templates]);
}

function handleGetTemplate(string $name): void
{
    requireRole('admin');

    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, subject, body, variables, updated_at FROM email_templates WHERE name = ?");
    $stmt->execute([$name]);
    $template = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$template) {
        jsonResponse(['error' => 'Template not found'], 404);
    }

    jsonResponse(['template' => $template]);
}

function handleUpdateTemplate(string $name): void
{
    $currentUser = requireRole('admin');
    $body = getJsonBody();

    $subject = trim($body['subject'] ?? '');
    $bodyContent = trim($body['body'] ?? '');

    if (empty($subject) || empty($bodyContent)) {
        jsonResponse(['error' => 'Subject and body are required'], 400);
    }

    $db = getDB();

    try {
        $stmt = $db->prepare("UPDATE email_templates SET subject = ?, body = ? WHERE name = ?");
        $stmt->execute([$subject, $bodyContent, $name]);

        if ($stmt->rowCount() === 0) {
            // Might not exist or no changes were made. Let's verify it exists.
            $checkStmt = $db->prepare("SELECT id FROM email_templates WHERE name = ?");
            $checkStmt->execute([$name]);
            if (!$checkStmt->fetch()) {
                jsonResponse(['error' => 'Template not found'], 404);
            }
        }

        // Log activity
        logActivity($currentUser['id'], 'updated_template', 'email_template', null);

        jsonResponse(['message' => 'Template updated successfully']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to update template'], 500);
    }
}
