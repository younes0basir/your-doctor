-- PostgreSQL Schema for Doctor Appointment System (Neon DB)
-- Converted from MySQL

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS patient_history CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS assistant CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;
DROP TABLE IF EXISTS patient CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS specialities CASCADE;

-- Create specialities table
CREATE TABLE specialities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patient table
CREATE TABLE patient (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    phoneNumber VARCHAR(20),
    age INTEGER,
    image_url VARCHAR(255),
    image_public_id VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cin VARCHAR(32)
);

-- Create index on email for faster lookups
CREATE INDEX idx_patient_email ON patient(email);

-- Create doctor table
CREATE TABLE doctor (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'doctor',
    speciality_id INTEGER NOT NULL REFERENCES specialities(id),
    experience_years INTEGER NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    specialty_description TEXT,
    degree VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    image_url VARCHAR(255),
    image_public_id VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden'))
);

-- Create indexes for doctor table
CREATE INDEX idx_doctor_email ON doctor(email);
CREATE INDEX idx_doctor_speciality ON doctor(speciality_id);
CREATE INDEX idx_doctor_city ON doctor(city);

-- Create assistant table
CREATE TABLE assistant (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctor(id),
    patient_id INTEGER NOT NULL REFERENCES patient(id),
    appointment_date TIMESTAMP NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('physical', 'video')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'canceled')),
    meeting_link VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    queue_position INTEGER,
    is_in_queue VARCHAR(20) DEFAULT 'not_inqueue' CHECK (is_in_queue IN ('not_inqueue', 'pending', 'in_queue')),
    payment_status VARCHAR(20) DEFAULT 'not_paid' CHECK (payment_status IN ('paid', 'not_paid'))
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);

-- Create prescriptions table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    doctor_id INTEGER NOT NULL REFERENCES doctor(id),
    patient_id INTEGER NOT NULL REFERENCES patient(id),
    prescription_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patient_history table
CREATE TABLE patient_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient(id),
    doctor_id INTEGER REFERENCES doctor(id),
    appointment_id INTEGER REFERENCES appointments(id),
    diagnosis TEXT,
    prescription_id INTEGER REFERENCES prescriptions(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123 - hashed with bcrypt)
INSERT INTO admin (email, password) VALUES 
('admin@admin.com', '$2b$10$.Z6Lns4jG.Dv3mduvbxTi.8PmqdwcG23rSueUiSUFmEEE3vw77p5u');

-- Insert medical specialities
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
('General Medicine'),
('Endocrinology'),
('Gastroenterology'),
('Nephrology'),
('Pulmonology'),
('Rheumatology'),
('Allergy and Immunology'),
('Anesthesiology'),
('Hematology'),
('Infectious Disease'),
('Plastic Surgery'),
('Urology'),
('Radiology'),
('Sports Medicine'),
('Emergency Medicine'),
('Oncology'),
('Geriatrics'),
('Otolaryngology (ENT)'),
('Pathology'),
('Rehabilitation Medicine');

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_patient_updated_at BEFORE UPDATE ON patient
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_updated_at BEFORE UPDATE ON doctor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
