-- Database Creation
CREATE DATABASE IF NOT EXISTS kms;
USE kms;

-- Kovil Table
CREATE TABLE IF NOT EXISTS kovil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kovil_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Donations)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(150) NOT NULL,
    lastname VARCHAR(150) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    dates DATE NOT NULL,
    kovil_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kovil_id) REFERENCES kovil(id) ON DELETE CASCADE
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    kovil_id INT NOT NULL,
    bill_image VARCHAR(500) NOT NULL,
    dates DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kovil_id) REFERENCES kovil(id) ON DELETE CASCADE
);

-- Sample Data Insertion
INSERT INTO kovil (kovil_name, created_at) VALUES
('Sri Meenakshi Amman Temple', NOW()),
('Sri Bala Vinayagar Temple', NOW()),
('Seli Amman Temple', NOW()),
('Iyyanar Temple', NOW()),
('Shivan Kovil', NOW()),
('Perumal Kovil', NOW());
