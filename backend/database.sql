-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pfe;
USE pfe;

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS patient;

-- Create patient table with simplified Cloudinary image handling
CREATE TABLE patient (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    phoneNumber VARCHAR(20),
    age INT,
    image_url VARCHAR(255),
    image_public_id VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_phone CHECK (phoneNumber REGEXP '^[0-9+()-]{10,15}$'),
    CONSTRAINT chk_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optimized indexes
CREATE INDEX idx_email ON patient(email);

-- Drop the table if it exists
DROP TABLE IF EXISTS specialities;
CREATE TABLE specialities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert common specialities
INSERT INTO specialities (name) VALUES 
    ('Cardiology'),
    ('Dermatology'),
    ('Neurology'),
    ('Pediatrics'),
    ('Orthopedics'),
    ('Psychiatry'),
    ('Gynecology'),
    ('Ophthalmology'),
    ('Dentistry'),
    ('General Medicine');

-- Drop the table if it exists
DROP TABLE IF EXISTS doctor;

-- Create doctor table with speciality reference
CREATE TABLE doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'doctor',
    speciality_id INT NOT NULL,
    experience_years INT NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    specialty_description TEXT,
    degree VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL CHECK (city IN (
        'Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Agadir', 
        'Tangier', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan',
        'Safi', 'Mohammedia', 'El Jadida', 'Beni Mellal', 'Nador',
        'Taza', 'Settat', 'Larache', 'Khouribga', 'Ouarzazate'
    )),
    address TEXT NOT NULL,
    image_url VARCHAR(255),
    image_public_id VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'hidden') DEFAULT 'pending',
    CONSTRAINT fk_doctor_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id),
    CONSTRAINT chk_doctor_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_experience CHECK (experience_years >= 0),
    CONSTRAINT chk_fee CHECK (consultation_fee >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for frequently queried columns
CREATE INDEX idx_doctor_email ON doctor(email);
CREATE INDEX idx_doctor_speciality ON doctor(speciality_id);
CREATE INDEX idx_doctor_city ON doctor(city);
-- Drop the table if it exists
DROP TABLE IF EXISTS appointments;

-- Create appointments table with references to doctor and patient
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    type ENUM('physical', 'video') NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'canceled') DEFAULT 'pending',
    is_in_queue ENUM('not_inqueue', 'pending', 'in_queue') DEFAULT 'not_inqueue',
    queue_position INT DEFAULT NULL,
    meeting_link VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id),
    FOREIGN KEY (patient_id) REFERENCES patient(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour accélérer les recherches par médecin et patient
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_queue ON appointments(doctor_id, is_in_queue, queue_position);

-- Create admin table for admin users
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add doctor_id column to patient_history table
ALTER TABLE patient_history
ADD COLUMN doctor_id INT NOT NULL AFTER patient_id,
ADD CONSTRAINT fk_patient_history_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id);

-- Ensure indexes for faster queries
CREATE INDEX idx_patient_history_doctor ON patient_history(doctor_id);
