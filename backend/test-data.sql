-- First, let's check if we have any doctors
SELECT COUNT(*) as doctor_count FROM doctor;

-- If no doctors exist, let's insert a test doctor
INSERT INTO doctor (
    email,
    password, -- This will be a hashed password: "test123"
    firstName,
    lastName,
    speciality_id,
    experience_years,
    consultation_fee,
    specialty_description,
    degree,
    city,
    address
) VALUES (
    'test.doctor@example.com',
    '$2b$10$5QH.JK3LQD0IGRV5Zq1Qx.t0uMXqTRWMw0z3A3Jc5k5y9vY5X8Zvy',
    'John',
    'Doe',
    1, -- Cardiology
    10,
    150.00,
    'Experienced cardiologist specializing in heart diseases',
    'MD, Cardiology',
    'Paris',
    '123 Medical Street'
);

-- Let's also insert a second doctor with a different specialty
INSERT INTO doctor (
    email,
    password,
    firstName,
    lastName,
    speciality_id,
    experience_years,
    consultation_fee,
    specialty_description,
    degree,
    city,
    address
) VALUES (
    'jane.smith@example.com',
    '$2b$10$5QH.JK3LQD0IGRV5Zq1Qx.t0uMXqTRWMw0z3A3Jc5k5y9vY5X8Zvy',
    'Jane',
    'Smith',
    2, -- Dermatology
    8,
    120.00,
    'Specialist in skin conditions and treatments',
    'MD, Dermatology',
    'Lyon',
    '456 Health Avenue'
);

-- Verify the insertions
SELECT 
    d.id,
    d.firstName,
    d.lastName,
    d.email,
    s.name as speciality,
    d.experience_years,
    d.consultation_fee,
    d.city
FROM doctor d
JOIN specialities s ON d.speciality_id = s.id;
