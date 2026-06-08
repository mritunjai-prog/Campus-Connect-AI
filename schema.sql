-- CampusConnect AI - MySQL Relational Schema
-- Use this script to instantiate the production MySQL database.

CREATE DATABASE IF NOT EXISTS campus_connect_db;
USE campus_connect_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'tpo', 'company') NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    branch VARCHAR(100) NOT NULL,
    cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    backlogs INT NOT NULL DEFAULT 0,
    skills TEXT, -- Comma-separated or JSON list of skills
    resume_url VARCHAR(512),
    resume_file_name VARCHAR(255),
    resume_score INT DEFAULT 0,
    resume_analysis JSON, -- Contains suggestions, ATS metrics, etc.
    profile_completeness INT DEFAULT 0,
    graduation_year VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_branch (branch),
    INDEX idx_student_cgpa (cgpa)
) ENGINE=InnoDB;

-- 3. TPO Profiles Table
CREATE TABLE IF NOT EXISTS tpo_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Company Profiles Table
CREATE TABLE IF NOT EXISTS company_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company_name (name)
) ENGINE=InnoDB;

-- 5. Placement Drives (Jobs) Table
CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    package_lpa DECIMAL(5, 2) NOT NULL, -- in LPA (e.g., 12.50 for 12.5 LPA)
    branch_eligibility TEXT NOT NULL, -- Comma-separated (e.g. "CSE,IT")
    minimum_cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    allowed_backlogs INT NOT NULL DEFAULT 0,
    job_description TEXT NOT NULL,
    skills_required TEXT, -- Comma-separated list of skills
    drive_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_drive_status (status),
    INDEX idx_drive_deadline (application_deadline)
) ENGINE=InnoDB;

-- 6. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    drive_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    package_lpa DECIMAL(5, 2) NOT NULL,
    student_id VARCHAR(36) NOT NULL, -- Reference to users(id) or student_profiles(id)
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_branch VARCHAR(100) NOT NULL,
    student_cgpa DECIMAL(4, 2) NOT NULL,
    student_backlogs INT NOT NULL,
    resume_url VARCHAR(512) NOT NULL,
    resume_score INT NOT NULL DEFAULT 0,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('applied', 'shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'rejected') DEFAULT 'applied',
    feedback TEXT,
    eligibility_explanation TEXT,
    FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_app_student (student_id),
    INDEX idx_app_drive (drive_id),
    INDEX idx_app_status (status)
) ENGINE=InnoDB;

-- 7. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    drive_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    type ENUM('virtual', 'in_person') DEFAULT 'virtual',
    link_or_venue VARCHAR(512),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    feedback TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_interview_student (student_id),
    INDEX idx_interview_status (status)
) ENGINE=InnoDB;

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
) ENGINE=InnoDB;

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(512) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB;
