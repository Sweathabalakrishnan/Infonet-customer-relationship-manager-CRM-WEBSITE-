CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS upselling_commitment;
DROP TABLE IF EXISTS reactivation_commitment;
DROP TABLE IF EXISTS new_connection_commitment;
DROP TABLE IF EXISTS l2_feasibility;
DROP TABLE IF EXISTS tech_ref_leads;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS zones;

CREATE TABLE zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT,
    branch_name VARCHAR(100),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('ADMIN','ZONE_MANAGER','BRANCH_MANAGER','SALES','TECH'),
    zone_id INT NULL,
    branch_id INT NULL,
    mobile VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100),
    plan_amount DECIMAL(10,2),
    speed VARCHAR(50)
);

CREATE TABLE tech_ref_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tech_ref_id VARCHAR(20),
    lead_date DATE,
    customer_name VARCHAR(100),
    mobile VARCHAR(20),
    location VARCHAR(200),
    plan VARCHAR(100),
    plan_value DECIMAL(10,2),
    sales_follow_status VARCHAR(100),
    updates TEXT,
    zone_id INT,
    branch_id INT,
    created_by INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE l2_feasibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(20),
    date DATE,
    customer_name VARCHAR(100),
    mobile VARCHAR(20),
    location VARCHAR(200),
    sales_person_id INT,
    l2_status VARCHAR(50),
    order_status VARCHAR(50),
    sales_follow_status VARCHAR(100),
    last_discussion_time DATETIME,
    zone_id INT,
    branch_id INT,
    created_by INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE new_connection_commitment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(20),
    week VARCHAR(20),
    ft_user_id INT,
    lead_id VARCHAR(50),
    plan VARCHAR(100),
    plan_amount DECIMAL(10,2),
    connection_type VARCHAR(50),
    connection_mode VARCHAR(50),
    payment_mode VARCHAR(50),
    zone_id INT,
    branch_id INT,
    created_by INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE reactivation_commitment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(20),
    week VARCHAR(20),
    ft_user_id INT,
    customer_id VARCHAR(50),
    customer_name VARCHAR(100),
    plan_amount DECIMAL(10,2),
    activation_date DATE,
    follow_status VARCHAR(100),
    zone_id INT,
    branch_id INT,
    created_by INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE upselling_commitment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(20),
    week VARCHAR(20),
    ft_user_id INT,
    lead_id VARCHAR(50),
    customer_id VARCHAR(50),
    customer_name VARCHAR(100),
    current_plan VARCHAR(100),
    current_plan_amount DECIMAL(10,2),
    current_payment_mode VARCHAR(50),
    change_plan VARCHAR(100),
    change_plan_amount DECIMAL(10,2),
    change_payment_mode VARCHAR(50),
    difference DECIMAL(10,2),
    zone_id INT,
    branch_id INT,
    created_by INT,
    assigned_to INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(50),
    record_id INT,
    assigned_to INT,
    followup_date DATETIME,
    note TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO zones (zone_name) VALUES
('Chennai'),
('Pondicherry'),
('Namakkal'),
('Madurai'),
('Tirunelveli'),
('Salem'),
('Krishnagiri'),
('Erode'),
('Coimbatore'),
('Trichy');

INSERT INTO branches (zone_id, branch_name) VALUES
(1,'Kancheepuram'),
(1,'Thiruvallur'),
(1,'Kalakurichi'),
(2,'Villupuram'),
(2,'Cuddalore'),
(3,'Namakkal'),
(4,'Madurai'),
(5,'Tirunelveli'),
(6,'Salem'),
(7,'Hosur'),
(8,'Erode'),
(9,'Coimbatore'),
(10,'Trichy');

INSERT INTO users (name, username, password_hash, role, is_active)
VALUES ('System Admin', 'admin', 'admin123', 'ADMIN', 1);


use crm_db;
show tables;


DESCRIBE l2_feasibility;
DESCRIBE new_connection_commitment;
DESCRIBE reactivation_commitment;
DESCRIBE upselling_commitment;
DESCRIBE tasks;

select *from new_connection_commitment;

USE crm_db;
SELECT * FROM plans;

USE crm_db;

INSERT INTO plans (plan_name, plan_amount, speed) VALUES
('399 Plan', 399.00, '40 Mbps'),
('499 Plan', 499.00, '60 Mbps'),
('599 Plan', 599.00, '100 Mbps'),
('699 Plan', 699.00, '125 Mbps'),
('799 Plan', 799.00, '150 Mbps'),
('899 Plan', 899.00, '175 Mbps'),
('999 Plan', 999.00, '200 Mbps'),
('1099 Plan', 1099.00, '250 Mbps'),
('1299 Plan', 1299.00, '300 Mbps'),
('1499 Plan', 1499.00, '400 Mbps');

SELECT * FROM plans;


SELECT * FROM  l2_feasibility;
SELECT * FROM  new_connection_commitment;
SELECT * FROM  reactivation_commitment;
SELECT * FROM  upselling_commitment;
SELECT * FROM  tasks;
