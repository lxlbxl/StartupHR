<?php
/**
 * PRIORITY TALENT - Database Installer Script
 * Run this script by visiting it in your browser to install the database schema and seed data.
 */

require_once __DIR__ . '/config.php';

header('Content-Type: text/plain');

echo "Starting Database Installation...\n\n";

$sqlFile = __DIR__ . '/database/install.sql';

if (!file_exists($sqlFile)) {
    die("Error: install.sql file not found at $sqlFile.\nDid you upload the 'backend/database/' folder?");
}

try {
    $db = getDB();

    // Read the SQL file
    $sql = file_get_contents($sqlFile);

    // Execute the SQL commands
    $db->exec($sql);

    echo "SUCCESS: Database schema and seed data installed correctly!\n\n";
    echo "IMPORTANT SECURITY NOTICE: Please delete 'backend/install.php' and 'backend/database/install.sql' from your server immediately.\n";

} catch (PDOException $e) {
    echo "DATABASE ERROR:\n";
    echo $e->getMessage() . "\n\n";
    echo "Make sure your database credentials in backend/env.php are correct.\n";
} catch (Exception $e) {
    echo "GENERAL ERROR:\n";
    echo $e->getMessage() . "\n";
}
