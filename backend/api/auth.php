<?php
/**
 * PRIORITY TALENT - Auth API
 */

function handleLogin(): void
{
    $body = getJsonBody();
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($email) || empty($password)) {
        jsonResponse(['error' => 'Email and password are required'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT id, name, email, password_hash, role FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    // Update last login
    $updateStmt = $db->prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    $updateStmt->execute([$admin['id']]);

    // Set session
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_name'] = $admin['name'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_role'] = $admin['role'];

    jsonResponse([
        'message' => 'Login successful',
        'user' => [
            'id' => $admin['id'],
            'name' => $admin['name'],
            'email' => $admin['email'],
            'role' => $admin['role'],
        ]
    ]);
}

function handleLogout(): void
{
    session_destroy();
    jsonResponse(['message' => 'Logged out']);
}

function handleMe(): void
{
    $user = requireAuth();
    jsonResponse(['user' => $user]);
}

function handleUpdateProfile(): void
{
    $currentUser = requireAuth();
    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($name) || empty($email)) {
        jsonResponse(['error' => 'Name and email are required'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }

    $db = getDB();

    // Check if email already exists for another user
    $stmt = $db->prepare("SELECT id FROM admins WHERE email = ? AND id != ?");
    $stmt->execute([$email, $currentUser['id']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email already exists for another user'], 409);
    }

    try {
        if (!empty($password)) {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE admins SET name = ?, email = ?, password_hash = ? WHERE id = ?");
            $stmt->execute([$name, $email, $passwordHash, $currentUser['id']]);
        } else {
            $stmt = $db->prepare("UPDATE admins SET name = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $currentUser['id']]);
        }

        // Update session
        $_SESSION['admin_name'] = $name;
        $_SESSION['admin_email'] = $email;

        // Log the activity
        logActivity($currentUser['id'], 'updated_profile', 'staff', $currentUser['id']);

        // Fetch updated user info for response
        $stmt = $db->prepare("SELECT id, name, email, role FROM admins WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        $updatedUser = $stmt->fetch();

        jsonResponse([
            'message' => 'Profile updated successfully',
            'user' => $updatedUser
        ]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to update profile: ' . $e->getMessage()], 500);
    }
}
