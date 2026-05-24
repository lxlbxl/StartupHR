-- --------------------------------------------------------
-- StartupHR - Full BOOTSTRAP Database Installation Script
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- DROP TABLES TO ENSURE CLEAN STATE
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `email_templates`;

-- --------------------------------------------------------
-- START OF: schema.sql
-- --------------------------------------------------------
-- PRIORITY TALENT - Database Schema
-- Run this file to create the database and tables




-- ============================================
-- ADMINS / STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    job_type ENUM('Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid') NOT NULL DEFAULT 'Full-time',
    pay_range_min DECIMAL(12, 2) DEFAULT NULL,
    pay_range_max DECIMAL(12, 2) DEFAULT NULL,
    closing_date DATE DEFAULT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT DEFAULT NULL,
    requirements TEXT DEFAULT NULL,
    benefits TEXT DEFAULT NULL,
    status ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    years_experience INT DEFAULT NULL,
    linkedin_url VARCHAR(300) DEFAULT NULL,
    portfolio_url VARCHAR(300) DEFAULT NULL,
    current_location VARCHAR(150) DEFAULT NULL,
    availability VARCHAR(100) DEFAULT NULL,
    resume_path VARCHAR(500) DEFAULT NULL,
    cover_letter TEXT DEFAULT NULL,
    expected_salary VARCHAR(100) DEFAULT NULL,
    status ENUM('new', 'reviewed', 'shortlisted', 'rejected') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- --------------------------------------------------------
-- START OF: migration_emails_settings.sql
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- START OF: seed.sql
-- --------------------------------------------------------
-- PRIORITY TALENT - Seed Data
-- Run after schema.sql to populate sample data



-- ============================================
-- ADMINS (password: admin123 / staff123)
-- Hash generated via PHP: password_hash('admin123', PASSWORD_DEFAULT)
-- ============================================
INSERT INTO admins (name, email, password_hash, role) VALUES
('StartupHR Admin', 'admin@startuphr.africa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('HR Staff', 'staff@startuphr.africa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff');

-- ============================================
-- JOBS
-- ============================================
INSERT INTO jobs (title, industry, location, job_type, pay_range_min, pay_range_max, closing_date, description, responsibilities, requirements, benefits, status) VALUES

('Senior Frontend Developer', 'Technology', 'Lagos, Nigeria', 'Full-time', 800000, 1500000,
 '2026-04-30',
 'We are looking for a Senior Frontend Developer to join our engineering team. You will be responsible for building responsive, high-performance web applications using modern JavaScript frameworks. You''ll work closely with designers and backend engineers to deliver pixel-perfect, accessible UIs.',
 '• Lead frontend architecture decisions and code reviews\n• Build reusable components and design system\n• Optimize web performance and Core Web Vitals\n• Mentor junior developers\n• Collaborate with product and design teams',
 '• 5+ years of frontend development experience\n• Expert in React.js or Vue.js\n• Strong TypeScript skills\n• Experience with CSS-in-JS or Tailwind CSS\n• Understanding of CI/CD pipelines\n• Familiarity with testing frameworks (Jest, Cypress)',
 '• Competitive salary with equity options\n• Remote-friendly work policy\n• Health insurance coverage\n• Annual learning & development budget\n• Flexible working hours',
 'active'),

('Product Manager', 'Technology', 'Nairobi, Kenya', 'Full-time', 600000, 1200000,
 '2026-04-15',
 'We''re hiring a Product Manager to drive the roadmap for our B2B SaaS platform. You''ll own the product lifecycle from ideation to launch, working with cross-functional teams to deliver features that delight our customers across Africa.',
 '• Define product vision, strategy, and roadmap\n• Conduct user research and competitive analysis\n• Write detailed PRDs and user stories\n• Prioritize features using data-driven frameworks\n• Coordinate sprints with engineering and design',
 '• 3+ years of product management experience\n• Experience with B2B SaaS products\n• Strong analytical and problem-solving skills\n• Excellent communication and stakeholder management\n• Familiarity with Agile/Scrum methodologies',
 '• Stock options\n• Health & dental coverage\n• Home office stipend\n• 25 days paid leave\n• Quarterly team retreats',
 'active'),

('HR Business Partner', 'Human Resources', 'Accra, Ghana', 'Hybrid', 400000, 800000,
 '2026-05-01',
 'Join our growing People team as an HR Business Partner. You''ll serve as a strategic advisor to business leaders, helping shape our culture and talent strategy as we scale across West Africa.',
 '• Partner with leadership on workforce planning\n• Drive performance management processes\n• Lead employee engagement initiatives\n• Manage employee relations cases\n• Support compensation and benefits reviews',
 '• 4+ years in HR business partnering\n• Deep knowledge of West African labor laws\n• Experience with HRIS systems\n• Strong interpersonal and coaching skills\n• CIPM or SHRM certification preferred',
 '• Hybrid work arrangement (3 days office, 2 remote)\n• Medical insurance for employee + family\n• Professional development allowance\n• Gym membership subsidy\n• Relocation support available',
 'active'),

('Data Analyst', 'Finance', 'Remote', 'Remote', 500000, 900000,
 '2026-03-31',
 'We need a Data Analyst to help our fintech startup make sense of millions of daily transactions. You''ll build dashboards, uncover insights, and power data-driven decisions that impact our customers'' financial lives.',
 '• Build and maintain analytical dashboards (Looker, Metabase)\n• Perform deep-dive analyses on user behavior and financials\n• Develop automated reporting pipelines\n• Collaborate with engineering on data infrastructure\n• Present insights to C-suite and investors',
 '• 2+ years of data analysis experience\n• Proficient in SQL and Python/R\n• Experience with BI tools (Looker, Tableau, Metabase)\n• Understanding of financial metrics and KPIs\n• Strong storytelling and visualization skills',
 '• 100% remote work\n• Competitive USD-pegged salary\n• Home office setup budget\n• Unlimited PTO policy\n• Annual company retreat',
 'active'),

('Marketing Lead', 'Marketing', 'Cape Town, South Africa', 'Full-time', 450000, 850000,
 '2026-04-20',
 'We''re looking for a Marketing Lead to scale our brand across Africa. You''ll design and execute go-to-market strategies, manage campaigns, and build a high-performing marketing team from scratch.',
 '• Develop and execute marketing strategy\n• Manage digital campaigns (SEO, SEM, social media)\n• Build and lead a marketing team\n• Own brand voice and content strategy\n• Track and optimize marketing ROI',
 '• 5+ years of marketing experience, 2+ in leadership\n• Proven track record in B2B or SaaS marketing\n• Experience with marketing automation tools\n• Strong writing and brand storytelling skills\n• Data-driven mindset with analytics proficiency',
 '• Competitive salary + performance bonus\n• Health insurance\n• Equity/stock options\n• Conference and travel budget\n• Flexible work schedule',
 'active');

-- ============================================
-- APPLICATIONS
-- ============================================
INSERT INTO applications (job_id, full_name, email, phone, years_experience, linkedin_url, portfolio_url, current_location, availability, resume_path, cover_letter, expected_salary, status) VALUES

-- Applications for Senior Frontend Developer (job_id = 1)
(1, 'Adewale Ogundimu', 'adewale.o@email.com', '+234 801 234 5678', 6,
 'https://linkedin.com/in/adewale-ogundimu', 'https://adewale.dev',
 'Lagos, Nigeria', 'Immediate', NULL,
 'I am passionate about building performant, accessible web experiences. With 6 years of React experience and a keen eye for design, I believe I can make a significant impact on your frontend team.',
 '1,200,000 NGN', 'new'),

(1, 'Fatima Bello', 'fatima.bello@email.com', '+234 802 345 6789', 5,
 'https://linkedin.com/in/fatimabello', 'https://fatimabello.com',
 'Abuja, Nigeria', '2 weeks notice', NULL,
 'I bring 5 years of experience building complex SPAs with Vue.js and React. I am eager to contribute to a team that values code quality and user experience.',
 '1,100,000 NGN', 'reviewed'),

(1, 'Kwame Asante', 'kwame.asante@email.com', '+233 24 567 8901', 8,
 'https://linkedin.com/in/kwameasante', NULL,
 'Accra, Ghana', '1 month notice', NULL,
 NULL,
 '1,400,000 NGN', 'shortlisted'),

-- Applications for Product Manager (job_id = 2)
(2, 'Amina Yusuf', 'amina.yusuf@email.com', '+254 712 345 678', 4,
 'https://linkedin.com/in/aminayusuf', NULL,
 'Nairobi, Kenya', 'Immediate', NULL,
 'As a product manager with 4 years of SaaS experience, I am excited about the opportunity to drive your product vision in the African market.',
 '900,000 KES', 'new'),

(2, 'Chidi Eze', 'chidi.eze@email.com', '+234 803 456 7890', 3,
 'https://linkedin.com/in/chidieze', NULL,
 'Lagos, Nigeria', '3 weeks notice', NULL,
 'I have led product development for two successful startups in Nigeria and I am ready for my next challenge.',
 '1,000,000 NGN', 'reviewed'),

-- Applications for HR Business Partner (job_id = 3)
(3, 'Nana Ama Owusu', 'nana.owusu@email.com', '+233 20 678 9012', 5,
 'https://linkedin.com/in/nanaowusu', NULL,
 'Accra, Ghana', 'Immediate', NULL,
 'With CIPM certification and 5 years of HR business partnering experience in West Africa, I am well-equipped to support your growing team.',
 '600,000 GHS', 'new'),

(3, 'Oluwaseun Adeyemi', 'seun.adeyemi@email.com', '+234 804 567 8901', 7,
 'https://linkedin.com/in/seunadeyemi', NULL,
 'Lagos, Nigeria', '1 month notice', NULL,
 NULL,
 '750,000 NGN', 'new'),

-- Applications for Data Analyst (job_id = 4)
(4, 'Wanjiku Mwangi', 'wanjiku.m@email.com', '+254 722 456 789', 3,
 'https://linkedin.com/in/wanjikumwangi', 'https://wanjiku-data.github.io',
 'Nairobi, Kenya', 'Immediate', NULL,
 'I have built data pipelines and dashboards for two fintech companies. I love turning messy data into actionable insights.',
 '700,000 KES', 'shortlisted'),

(4, 'Tunde Bakare', 'tunde.bakare@email.com', '+234 805 678 9012', 2,
 'https://linkedin.com/in/tundebakare', NULL,
 'Remote', 'Immediate', NULL,
 'Python and SQL are my bread and butter. I am looking for a remote role where I can grow as a data professional.',
 '600,000 NGN', 'new'),

-- Applications for Marketing Lead (job_id = 5)
(5, 'Zanele Dlamini', 'zanele.d@email.com', '+27 82 345 6789', 6,
 'https://linkedin.com/in/zaneledlamini', NULL,
 'Cape Town, South Africa', '2 weeks notice', NULL,
 'I have scaled marketing teams from 2 to 15 people and driven 300% growth in brand awareness across Southern Africa.',
 'R45,000/month', 'reviewed'),

(5, 'Emeka Obi', 'emeka.obi@email.com', '+234 806 789 0123', 5,
 'https://linkedin.com/in/emekaobi', 'https://emekaobi.com',
 'Lagos, Nigeria', '1 month notice', NULL,
 'I combine creativity with data-driven marketing. Ready to build your brand story across the continent.',
 '800,000 NGN', 'new');

SET FOREIGN_KEY_CHECKS = 1;
