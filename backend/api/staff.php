<?php
/**
 * PRIORITY TALENT - Staff API
 * Handles CRUD for admins table (Admin/Staff management)
 */

require_once __DIR__ . '/../config.php';

function handleListStaff(): void
{
    requireRole('admin');

    $db = getDB();
    $stmt = $db->query("SELECT id, name, email, role, last_login, created_at FROM admins ORDER BY created_at DESC");
    $staff = $stmt->fetchAll();

    jsonResponse(['staff' => $staff]);
}

function handleGetStaff(int $id): void
{
    requireRole('admin');

    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, role, last_login, created_at FROM admins WHERE id = ?");
    $stmt->execute([$id]);
    $staff = $stmt->fetch();

    if (!$staff) {
        jsonResponse(['error' => 'Staff member not found'], 404);
    }

    jsonResponse(['staff' => $staff]);
}

function handleCreateStaff(): void
{
    requireRole('admin');

    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    // Optional, defaults to 'staff' if not provided
    $role = in_array(strtolower($body['role'] ?? 'staff'), ['admin', 'staff']) ? strtolower($body['role']) : 'staff';

    if (empty($name) || empty($email) || empty($password)) {
        jsonResponse(['error' => 'Name, email, and password are required'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }

    $db = getDB();

    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email already exists'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $db->prepare("INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $passwordHash, $role]);
        $newId = $db->lastInsertId();

        // Fetch created record
        $stmt = $db->prepare("SELECT id, name, email, role, last_login, created_at FROM admins WHERE id = ?");
        $stmt->execute([$newId]);
        $staff = $stmt->fetch();

        // Log the activity
        $currentUser = requireAuth();
        logActivity($currentUser['id'], 'created_staff', 'staff', $newId);

        jsonResponse([
            'message' => 'Staff created successfully',
            'staff' => $staff
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to create staff: ' . $e->getMessage()], 500);
    }
}

function handleUpdateStaff(int $id): void
{
    $currentUser = requireRole('admin');

    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $role = isset($body['role']) && in_array(strtolower($body['role']), ['admin', 'staff']) ? strtolower($body['role']) : null;

    if (empty($name) || empty($email)) {
        jsonResponse(['error' => 'Name and email are required'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }

    $db = getDB();

    // Check if staff exists
    $stmt = $db->prepare("SELECT id, role FROM admins WHERE id = ?");
    $stmt->execute([$id]);
    $existingStaff = $stmt->fetch();

    if (!$existingStaff) {
        jsonResponse(['error' => 'Staff member not found'], 404);
    }

    // Check email uniqueness (excluding current user)
    $stmt = $db->prepare("SELECT id FROM admins WHERE email = ? AND id != ?");
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email already exists for another user'], 409);
    }

    // Prevent self-demotion
    if ($currentUser['id'] == $id && $role !== null && $role !== 'admin') {
        jsonResponse(['error' => 'You cannot remove your own admin privileges'], 403);
    }

    // If no role provided, keep the existing one
    $finalRole = $role !== null ? $role : $existingStaff['role'];

    try {
        if (!empty($password)) {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE admins SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?");
            $stmt->execute([$name, $email, $passwordHash, $finalRole, $id]);
        } else {
            $stmt = $db->prepare("UPDATE admins SET name = ?, email = ?, role = ? WHERE id = ?");
            $stmt->execute([$name, $email, $finalRole, $id]);
        }

        // Fetch updated
        $stmt = $db->prepare("SELECT id, name, email, role, last_login, created_at FROM admins WHERE id = ?");
        $stmt->execute([$id]);
        $staff = $stmt->fetch();

        // Log the activity
        logActivity($currentUser['id'], 'updated_staff', 'staff', $id);

        jsonResponse([
            'message' => 'Staff updated successfully',
            'staff' => $staff
        ]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to update staff: ' . $e->getMessage()], 500);
    }
}

function handleDeleteStaff(int $id): void
{
    $currentUser = requireRole('admin');

    if ($currentUser['id'] == $id) {
        jsonResponse(['error' => 'You cannot delete your own account'], 403);
    }

    $db = getDB();

    // Check if staff exists
    $stmt = $db->prepare("SELECT id FROM admins WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Staff member not found'], 404);
    }

    try {
        $stmt = $db->prepare("DELETE FROM admins WHERE id = ?");
        $stmt->execute([$id]);

        // Log the activity
        logActivity($currentUser['id'], 'deleted_staff', 'staff', $id);

        jsonResponse(['message' => 'Staff deleted successfully']);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to delete staff: ' . $e->getMessage()], 500);
    }
}
