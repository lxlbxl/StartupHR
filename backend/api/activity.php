<?php
/**
 * PRIORITY TALENT - Activity Logs API
 */

require_once __DIR__ . '/../config.php';

function handleListActivityLogs(): void
{
    requireRole('admin');
    $db = getDB();

    $sql = "
        SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at,
               a.name as admin_name, a.role as admin_role
        FROM activity_logs al
        JOIN admins a ON al.admin_id = a.id
        ORDER BY al.created_at DESC
        LIMIT 200
    ";

    $stmt = $db->query($sql);
    $logs = $stmt->fetchAll();

    jsonResponse(['logs' => $logs]);
}
