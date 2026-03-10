/**
 * importHospitalsCSV.js
 * One-time script to parse hospital_recommendation_dataset.csv
 * and upsert all records into MongoDB.
 * Run: node importHospitalsCSV.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CSV_PATH = path.join(__dirname, '..', 'hospital_recommendation_dataset.csv');

function parseBoolean(val) {
    return val && val.trim().toLowerCase() === 'yes';
}

function parseNum(val) {
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
}

async function parseCSV(filePath) {
    const records = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    for await (const line of rl) {
        if (!line.trim()) continue;

        // Parse CSV respecting quoted fields
        const cols = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        cols.push(current.trim());

        if (!headers) { headers = cols; continue; }

        const row = {};
        headers.forEach((h, i) => { row[h] = cols[i] || ''; });

        records.push({
            csvHospitalId: row['hospital_id'],
            name: row['hospital_name'],
            city: row['city'],
            address: row['address'],
            pincode: row['pincode'],
            lat: parseNum(row['latitude']),
            lng: parseNum(row['longitude']),
            phone: 'N/A',           // Not in CSV, placeholder
            totalBeds: parseNum(row['Beds']) || 0,
            availableBeds: 0,       // Not in CSV
            icuAvailable: parseBoolean(row['ICU']),
            emergencyServices: parseBoolean(row['Emergency']),
            rating: parseNum(row['rating']) || 4.5,
            totalReviews: parseNum(row['total_reviews']) || 0,

            // Insurance
            insuranceCompany: row['insurance_company'],
            tpa: row['TPA'],
            cashlessAvailable: parseBoolean(row['cashless_available']),
            coveragePct: parseNum(row['insurance_coverage_percent']),
            cashlessLimit: parseNum(row['cashless_limit']),

            // Costs
            consultationFee: parseNum(row['consultation_fee']),
            avgRoomCost: parseNum(row['avg_room_cost']),
            avgSurgeryCost: parseNum(row['avg_surgery_cost']),

            // Facilities
            hasICU: parseBoolean(row['ICU']),
            hasEmergency: parseBoolean(row['Emergency']),
            hasOT: parseBoolean(row['Operation_Theatre']),
            ambulanceAvailable: parseBoolean(row['ambulance_available']),
            diagnosticLab: parseBoolean(row['diagnostic_lab']),
            pharmacyAvailable: parseBoolean(row['pharmacy_available']),

            // Accreditation & type
            naabhAccredited: parseBoolean(row['NABH_accredited']),
            specialties: row['specialties'],
            hospitalType: row['hospital_type'],

            // Treatments & capacity (new columns)
            availableTreatments: (row['available_treatments'] || '')
                .split(',').map(s => s.trim()).filter(Boolean),
            doctorCount: parseNum(row['doctor_count']) || 0,
            waitTimeMins: parseNum(row['wait_time_mins']) || 0,
            patientSatisfactionPct: parseNum(row['patient_satisfaction_pct']) || 0,
            bloodBank: parseBoolean(row['blood_bank']),
            icuBeds: parseNum(row['icu_beds']) || 0,
            ventilatorCount: parseNum(row['ventilator_count']) || 0,

            // Network
            networkStatus: row['network_status'] || 'Active',
            distanceFromCity: parseNum(row['distance_from_city_center_km']),
        });
    }
    return records;
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected');

        const records = await parseCSV(CSV_PATH);
        console.log(`📂 Parsed ${records.length} hospital records from CSV`);

        let inserted = 0, updated = 0;
        for (const record of records) {
            const result = await Hospital.findOneAndUpdate(
                { csvHospitalId: record.csvHospitalId },
                { $set: record },
                { upsert: true, new: true }
            );
            if (result.createdAt.getTime() === result.updatedAt.getTime()) inserted++;
            else updated++;
        }

        console.log(`✅ Import complete — ${records.length} hospitals processed`);
        console.log(`   Inserted: ${inserted} | Updated: ${updated}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

run();
