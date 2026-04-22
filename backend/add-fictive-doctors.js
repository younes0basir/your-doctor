const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function addFictiveDoctors() {
    let client;
    
    try {
        console.log('👨‍⚕️ Adding fictitious doctors to database...\n');
        
        client = await pool.connect();
        console.log('✅ Connected to database\n');
        
        // Hash a common password for all doctors
        const commonPassword = await bcrypt.hash('doctor123', 10);
        
        // Sample doctors data with different specialities
        const doctors = [
            {
                email: 'dr.smith@hospital.com',
                firstName: 'John',
                lastName: 'Smith',
                speciality_id: 1, // Cardiology
                experience_years: 15,
                consultation_fee: 250.00,
                specialty_description: 'Expert in cardiovascular diseases and heart surgery with over 15 years of experience.',
                degree: 'MD, FACC',
                city: 'New York',
                address: '123 Medical Center Dr, New York, NY 10001',
                image_url: 'https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg'
            },
            {
                email: 'dr.johnson@clinic.com',
                firstName: 'Sarah',
                lastName: 'Johnson',
                speciality_id: 2, // Dermatology
                experience_years: 10,
                consultation_fee: 180.00,
                specialty_description: 'Specialized in skin conditions, cosmetic dermatology, and skin cancer treatment.',
                degree: 'MD, FAAD',
                city: 'Los Angeles',
                address: '456 Skin Care Blvd, Los Angeles, CA 90001',
                image_url: 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg'
            },
            {
                email: 'dr.williams@medcenter.com',
                firstName: 'Michael',
                lastName: 'Williams',
                speciality_id: 3, // Neurology
                experience_years: 20,
                consultation_fee: 300.00,
                specialty_description: 'Neurologist specializing in brain disorders, epilepsy, and stroke treatment.',
                degree: 'MD, PhD',
                city: 'Chicago',
                address: '789 Brain Institute Way, Chicago, IL 60601',
                image_url: 'https://img.freepik.com/free-photo/smiling-doctor-with-strethoscope-isolated-grey_651396-974.jpg'
            },
            {
                email: 'dr.brown@childrens.com',
                firstName: 'Emily',
                lastName: 'Brown',
                speciality_id: 4, // Pediatrics
                experience_years: 12,
                consultation_fee: 150.00,
                specialty_description: 'Pediatrician dedicated to children health from infancy through adolescence.',
                degree: 'MD, FAAP',
                city: 'Houston',
                address: '321 Kids Health Ave, Houston, TX 77001',
                image_url: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg'
            },
            {
                email: 'dr.davis@ortho.com',
                firstName: 'Robert',
                lastName: 'Davis',
                speciality_id: 5, // Orthopedics
                experience_years: 18,
                consultation_fee: 275.00,
                specialty_description: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
                degree: 'MD, FAAOS',
                city: 'Phoenix',
                address: '654 Bone & Joint St, Phoenix, AZ 85001',
                image_url: 'https://img.freepik.com/free-photo/doctor-offering-medical-advice_23-2147796523.jpg'
            },
            {
                email: 'dr.miller@mentalhealth.com',
                firstName: 'Jennifer',
                lastName: 'Miller',
                speciality_id: 6, // Psychiatry
                experience_years: 14,
                consultation_fee: 220.00,
                specialty_description: 'Psychiatrist focused on mental health, anxiety, depression, and therapy.',
                degree: 'MD',
                city: 'Philadelphia',
                address: '987 Mind Wellness Rd, Philadelphia, PA 19101',
                image_url: 'https://img.freepik.com/free-photo/female-doctor-white-coat-with-stethoscope_23-2148812996.jpg'
            },
            {
                email: 'dr.wilson@womenshealth.com',
                firstName: 'Lisa',
                lastName: 'Wilson',
                speciality_id: 7, // Gynecology
                experience_years: 16,
                consultation_fee: 240.00,
                specialty_description: 'OB/GYN specializing in women health, pregnancy care, and reproductive health.',
                degree: 'MD, FACOG',
                city: 'San Antonio',
                address: '147 Women Care Ln, San Antonio, TX 78201',
                image_url: 'https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg'
            },
            {
                email: 'dr.moore@eyecare.com',
                firstName: 'David',
                lastName: 'Moore',
                speciality_id: 8, // Ophthalmology
                experience_years: 13,
                consultation_fee: 200.00,
                specialty_description: 'Eye specialist in vision correction, cataract surgery, and eye diseases.',
                degree: 'MD, FACS',
                city: 'San Diego',
                address: '258 Vision Plaza, San Diego, CA 92101',
                image_url: 'https://img.freepik.com/free-photo/doctor-holding-digital-tablet-hospital_23-2148874938.jpg'
            },
            {
                email: 'dr.taylor@dental.com',
                firstName: 'Amanda',
                lastName: 'Taylor',
                speciality_id: 9, // Dentistry
                experience_years: 11,
                consultation_fee: 160.00,
                specialty_description: 'Dentist providing comprehensive dental care, cosmetic dentistry, and oral surgery.',
                degree: 'DDS',
                city: 'Dallas',
                address: '369 Smile Street, Dallas, TX 75201',
                image_url: 'https://img.freepik.com/free-photo/confident-attractive-caucasian-female-doctor-smiling-into-camera-crossing-arms-over-chest-blue-uniform_1258-66538.jpg'
            },
            {
                email: 'dr.anderson@familycare.com',
                firstName: 'James',
                lastName: 'Anderson',
                speciality_id: 10, // General Medicine
                experience_years: 22,
                consultation_fee: 140.00,
                specialty_description: 'Family physician providing comprehensive primary care for all ages.',
                degree: 'MD',
                city: 'San Jose',
                address: '741 Family Health Blvd, San Jose, CA 95101',
                image_url: 'https://img.freepik.com/free-photo/mature-male-doctor-gray-sweater_1262-12881.jpg'
            },
            {
                email: 'dr.thomas@endocrine.com',
                firstName: 'Patricia',
                lastName: 'Thomas',
                speciality_id: 11, // Endocrinology
                experience_years: 17,
                consultation_fee: 260.00,
                specialty_description: 'Endocrinologist specializing in diabetes, thyroid disorders, and hormonal imbalances.',
                degree: 'MD',
                city: 'Austin',
                address: '852 Hormone Health Way, Austin, TX 78701',
                image_url: 'https://img.freepik.com/free-photo/medium-shot-female-doctor-working_23-2148849043.jpg'
            },
            {
                email: 'dr.jackson@gastro.com',
                firstName: 'Christopher',
                lastName: 'Jackson',
                speciality_id: 12, // Gastroenterology
                experience_years: 19,
                consultation_fee: 280.00,
                specialty_description: 'Gastroenterologist expert in digestive system disorders and liver diseases.',
                degree: 'MD, FACG',
                city: 'Jacksonville',
                address: '963 Digestive Care Dr, Jacksonville, FL 32099',
                image_url: 'https://img.freepik.com/free-photo/male-doctor-with-stethoscope-hand_23-2149231576.jpg'
            }
        ];
        
        console.log(`Inserting ${doctors.length} doctors...\n`);
        
        let inserted = 0;
        let skipped = 0;
        
        for (const doctor of doctors) {
            try {
                // Check if doctor already exists
                const existing = await client.query(
                    'SELECT id FROM doctor WHERE email = $1',
                    [doctor.email]
                );
                
                if (existing.rows.length > 0) {
                    console.log(`⏭️  Skipped (exists): ${doctor.firstName} ${doctor.lastName}`);
                    skipped++;
                    continue;
                }
                
                // Insert doctor
                await client.query(
                    `INSERT INTO doctor (
                        email, password, firstName, lastName, speciality_id,
                        experience_years, consultation_fee, specialty_description,
                        degree, city, address, image_url, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'approved')`,
                    [
                        doctor.email,
                        commonPassword,
                        doctor.firstName,
                        doctor.lastName,
                        doctor.speciality_id,
                        doctor.experience_years,
                        doctor.consultation_fee,
                        doctor.specialty_description,
                        doctor.degree,
                        doctor.city,
                        doctor.address,
                        doctor.image_url
                    ]
                );
                
                console.log(`✅ Added: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialty_description.substring(0, 50)}...)`);
                inserted++;
                
            } catch (error) {
                console.log(`❌ Error adding ${doctor.firstName} ${doctor.lastName}:`, error.message);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total doctors processed: ${doctors.length}`);
        console.log(`✅ Successfully added: ${inserted}`);
        console.log(`⏭️  Skipped (already exist): ${skipped}`);
        console.log('='.repeat(60));
        
        console.log('\n🔐 Login Credentials:');
        console.log('   Password for all doctors: doctor123');
        console.log('\n✨ Fictitious doctors added successfully!');
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

addFictiveDoctors();
