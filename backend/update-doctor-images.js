const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bsyVxo4r3eOf@ep-bitter-math-alkhkavp-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function updateDoctorImages() {
    let client;
    
    try {
        console.log('🖼️  Updating doctor images...\n');
        
        client = await pool.connect();
        console.log('✅ Connected to database\n');
        
        // New image URLs for doctors
        const imageUpdates = [
            { id: 1, url: 'https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg' },
            { id: 2, url: 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg' },
            { id: 3, url: 'https://img.freepik.com/free-photo/smiling-doctor-with-strethoscope-isolated-grey_651396-974.jpg' },
            { id: 4, url: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg' },
            { id: 5, url: 'https://img.freepik.com/free-photo/doctor-offering-medical-advice_23-2147796523.jpg' },
            { id: 6, url: 'https://img.freepik.com/free-photo/nurse-uniform-medical-worker_53876-140854.jpg' },
            { id: 7, url: 'https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg' },
            { id: 8, url: 'https://img.freepik.com/free-photo/doctor-holding-digital-tablet-hospital_23-2148874938.jpg' },
            { id: 9, url: 'https://img.freepik.com/free-photo/confident-attractive-caucasian-female-doctor-smiling-into-camera-crossing-arms-over-chest-blue-uniform_1258-66538.jpg' },
            { id: 10, url: 'https://img.freepik.com/free-photo/senior-man-gray-sweater-smiling_1262-12881.jpg' },
            { id: 11, url: 'https://img.freepik.com/free-photo/medium-shot-scientist-working-lab_23-2148849043.jpg' },
            { id: 12, url: 'https://img.freepik.com/free-photo/front-view-medical-workers-standing-row_23-2148849032.jpg' },
            { id: 13, url: 'https://img.freepik.com/free-photo/doctor-with-stethoscope-hand_23-2149231576.jpg' },
            { id: 14, url: 'https://img.freepik.com/free-photo/medical-banner-with-doctor-working-laptop_23-2149611194.jpg' }
        ];
        
        console.log(`Updating ${imageUpdates.length} doctors with new images...\n`);
        
        let updated = 0;
        
        for (const update of imageUpdates) {
            try {
                const result = await client.query(
                    'UPDATE doctor SET image_url = $1 WHERE id = $2',
                    [update.url, update.id]
                );
                
                if (result.rowCount > 0) {
                    console.log(`✅ Updated doctor ID ${update.id}`);
                    updated++;
                } else {
                    console.log(`⚠️  Doctor ID ${update.id} not found`);
                }
            } catch (error) {
                console.log(`❌ Error updating doctor ID ${update.id}:`, error.message);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total updates attempted: ${imageUpdates.length}`);
        console.log(`✅ Successfully updated: ${updated}`);
        console.log('='.repeat(60));
        
        console.log('\n✨ Doctor images updated successfully!');
        console.log('\nRefresh your frontend to see the new images.');
        
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

updateDoctorImages();
