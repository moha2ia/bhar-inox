-- ============================================================
-- BHAR INOX — Schéma MySQL / MariaDB
-- Base : bhar_inox (utf8mb4)
-- Exécution : php server/install.php
-- (ou mysql -u root < server/schema.sql)
-- ============================================================

CREATE DATABASE IF NOT EXISTS bhar_inox
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bhar_inox;

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Autre',
  location VARCHAR(191) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  KEY idx_project_images_project (project_id, sort_order),
  CONSTRAINT fk_project_images_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  hero_title VARCHAR(255) NOT NULL DEFAULT '',
  hero_subtitle TEXT NOT NULL,
  about_intro TEXT NOT NULL,
  phone VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(191) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL DEFAULT '',
  hours VARCHAR(191) NOT NULL DEFAULT '',
  seo_title VARCHAR(255) NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL,
  map_lat DECIMAL(10, 7) NOT NULL DEFAULT 0,
  map_lng DECIMAL(10, 7) NOT NULL DEFAULT 0,
  map_zoom TINYINT UNSIGNED NOT NULL DEFAULT 16
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (id) VALUES (1)
  ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS quote_requests (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  reference VARCHAR(32) NOT NULL UNIQUE,
  project_type VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(191) NOT NULL DEFAULT '',
  dimensions VARCHAR(255) DEFAULT NULL,
  quantity INT DEFAULT NULL,
  finish VARCHAR(191) DEFAULT NULL,
  budget VARCHAR(191) DEFAULT NULL,
  deadline VARCHAR(191) DEFAULT NULL,
  full_name VARCHAR(191) NOT NULL,
  company VARCHAR(191) DEFAULT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(191) NOT NULL,
  status ENUM('nouveau', 'en_cours', 'devis_envoye', 'accepte', 'refuse', 'archive')
    NOT NULL DEFAULT 'nouveau',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_quotes_status (status),
  KEY idx_quotes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quote_files (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  quote_reference VARCHAR(32) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL DEFAULT 0,
  file_type VARCHAR(100) NOT NULL DEFAULT '',
  KEY idx_quote_files_reference (quote_reference),
  CONSTRAINT fk_quote_files_quote FOREIGN KEY (quote_reference)
    REFERENCES quote_requests (reference) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_messages_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS counters (
  name VARCHAR(64) NOT NULL PRIMARY KEY,
  value INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
