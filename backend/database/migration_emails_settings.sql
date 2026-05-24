-- Migration for Email Settings, Templates, and Job Slugs

-- 1. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default SMTP settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('smtp_host', 'sandbox.smtp.mailtrap.io'),
('smtp_port', '2525'),
('smtp_user', ''),
('smtp_pass', ''),
('smtp_secure', 'tls'),
('smtp_from_email', 'noreply@startuphr.com'),
('smtp_from_name', 'StartupHR Notifications');

-- 2. Create Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT DEFAULT NULL, -- Documentation for available variables
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default templates
INSERT IGNORE INTO email_templates (name, subject, body, variables) VALUES 
(
    'new_application_admin',
    'New Application Received: {{job_title}}',
    '<p>Hello Admin,</p><p>A new application has been received for the position of <strong>{{job_title}}</strong>.</p><p><strong>Candidate:</strong> {{candidate_name}}<br><strong>Email:</strong> {{candidate_email}}<br><strong>Phone:</strong> {{candidate_phone}}</p><p>Please log in to the admin dashboard to review the application.</p><p>Best,<br>StartupHR System</p>',
    '{{job_title}}, {{candidate_name}}, {{candidate_email}}, {{candidate_phone}}'
),
(
    'application_status_candidate',
    'Update on your application for {{job_title}}',
    '<p>Dear {{candidate_name}},</p><p>Your application for the position of <strong>{{job_title}}</strong> has been updated to: <strong>{{status}}</strong>.</p><p>Thank you for your interest in joining our team.</p><p>Best regards,<br>StartupHR Team</p>',
    '{{candidate_name}}, {{job_title}}, {{status}}'
);

-- 3. Add Slug to Jobs Table
ALTER TABLE jobs ADD COLUMN slug VARCHAR(255) DEFAULT NULL;

-- 4. Update existing jobs to have a slug (basic transformation: spaces to hyphens, lowercase)
UPDATE jobs SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '/', '-'), '&', 'and')) WHERE slug IS NULL;

-- 5. Add unique constraint to slug now that it's populated (handling duplicates mostly by relying on manual fix if needed, but for small datasets it should be fine. To be safe, we append ID.)
UPDATE jobs SET slug = CONCAT(slug, '-', id);

ALTER TABLE jobs ADD UNIQUE INDEX idx_jobs_slug(slug);
