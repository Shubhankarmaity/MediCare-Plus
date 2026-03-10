const router = require('express').Router();
const Hospital = require('../models/Hospital');

// @route   GET /api/hospitals
// @desc    Get all hospitals or search by name/city
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, name } = req.query;
        let query = {};
        if (city) query.city = { $regex: city, $options: 'i' };
        if (name) query.name = { $regex: name, $options: 'i' };
        const hospitals = await Hospital.find(query);
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hospitals/by-insurance
// @desc    Get hospitals filtered by insurance company
// @access  Public
// @query   company=HDFC+ERGO | Niva+Bupa
router.get('/by-insurance', async (req, res) => {
    try {
        const { company } = req.query;
        if (!company) return res.status(400).json({ message: 'Insurance company is required' });

        const hospitals = await Hospital.find({
            insuranceCompany: { $regex: company, $options: 'i' },
            networkStatus: 'Active'
        }).sort({ rating: -1 });

        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hospitals/insurance-highlights
// @desc    Get hospital counts by insurance provider for home highlights
// @access  Public
router.get('/insurance-highlights', async (req, res) => {
    try {
        const hdfcCount = await Hospital.countDocuments({ insuranceCompany: { $regex: 'HDFC ERGO', $options: 'i' }, networkStatus: 'Active' });
        const nivaCount = await Hospital.countDocuments({ insuranceCompany: { $regex: 'Niva Bupa', $options: 'i' }, networkStatus: 'Active' });

        res.json({
            'HDFC ERGO': hdfcCount,
            'Niva Bupa': nivaCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hospitals/recommend
// @desc    AI-powered hospital recommendation engine
// @access  Public
// @body    { patientInfo: { medicalHistory, allergies, age, bloodGroup, ... }, hospitals: [...] }
router.post('/recommend', async (req, res) => {
    try {
        const { patientInfo, insuranceCompany } = req.body;

        let hospitalsQuery = { networkStatus: 'Active' };
        if (insuranceCompany) {
            hospitalsQuery.insuranceCompany = { $regex: insuranceCompany, $options: 'i' };
        }
        const hospitals = await Hospital.find(hospitalsQuery);

        if (!hospitals.length) {
            return res.json({ recommendedHospitals: [] });
        }

        const history = ((patientInfo.medicalHistory || '') + ' ' + (patientInfo.allergies || '')).toLowerCase();

        const isSeriousCondition = /diabetes|heart|cancer|kidney|stroke|hypertension|chronic|critical|tumor|renal/i.test(history);
        const needsEmergency = /accident|trauma|emergency|chest pain|sudden|critical/.test(history);

        const scoredHospitals = hospitals.map(h => {
            let score = 0;
            const reasons = [];

            // 1. Specialty match (up to 30 pts) — supports multi-specialty
            const hSpecialties = (h.specialties || '').toLowerCase();
            let specialtyMatched = false;
            for (const [spec, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
                const match = keywords.some(kw => history.includes(kw));
                if (match && hSpecialties.includes(spec.toLowerCase())) {
                    score += 30;
                    reasons.push(`Specializes in ${spec}, matching patient's condition`);
                    specialtyMatched = true;
                    break;
                }
            }
            if (!specialtyMatched && hSpecialties) score += 5;

            // 2. Treatment match bonus (up to 10 pts)
            const treatments = (h.availableTreatments || []).map(t => t.toLowerCase());
            const historyWords = history.split(/\s+/);
            const matchedTreatments = treatments.filter(t => historyWords.some(w => w.length > 3 && t.includes(w)));
            if (matchedTreatments.length > 0) {
                score += Math.min(matchedTreatments.length * 5, 10);
                reasons.push(`Offers relevant treatments: ${matchedTreatments.slice(0, 3).join(', ')}`);
            }

            // 3. ICU for serious conditions (up to 15 pts)
            if (isSeriousCondition && h.hasICU) {
                score += 15;
                reasons.push('ICU available for serious/chronic condition management');
            }

            // 4. Emergency for urgent needs (up to 10 pts)
            if (needsEmergency && h.hasEmergency) {
                score += 10;
                reasons.push('24/7 Emergency services match urgent care requirement');
            } else if (h.hasEmergency) {
                score += 3;
            }

            // 5. Rating + satisfaction (up to 15 pts)
            const ratingScore = Math.round(((h.rating || 0) / 5) * 10);
            score += ratingScore;
            const satisfaction = h.patientSatisfactionPct || 0;
            if (satisfaction >= 85) { score += 5; reasons.push(`${satisfaction}% patient satisfaction`); }
            else if (satisfaction >= 70) score += 3;
            if (h.rating >= 4.5) reasons.push(`Highly rated (${h.rating}⭐ from ${h.totalReviews || 0} reviews)`);

            // 6. NABH Accreditation (up to 5 pts)
            if (h.naabhAccredited) {
                score += 5;
                reasons.push('NABH Accredited — national healthcare quality standards');
            }

            // 7. Cashless insurance (up to 5 pts)
            if (h.cashlessAvailable) {
                score += 5;
                reasons.push(`Cashless treatment available (up to ₹${(h.cashlessLimit || 0).toLocaleString('en-IN')})`);
            }

            // 8. Key facilities bonus (up to 5 pts)
            const facilityCount = [h.diagnosticLab, h.pharmacyAvailable, h.hasOT, h.ambulanceAvailable, h.bloodBank].filter(Boolean).length;
            score += Math.min(facilityCount, 5);
            if (facilityCount >= 3) reasons.push('Comprehensive facilities available');

            score = Math.min(score, 100);

            const finalReason = reasons.length
                ? reasons.join('. ') + '.'
                : `General-purpose ${h.hospitalType || 'hospital'} with ${h.specialties || 'multiple'} specialty and ${h.rating || 'good'} rating.`;

            return {
                hospitalId: h._id,
                hospitalName: h.name,
                city: h.city,
                matchScore: score,
                reason: finalReason,
                rating: h.rating,
                specialties: h.specialties,
                cashlessAvailable: h.cashlessAvailable,
                coveragePct: h.coveragePct
            };
        });

        const top3 = scoredHospitals
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);

        res.json({ recommendedHospitals: top3 });
    } catch (err) {
        console.error('Recommendation error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/hospitals/ai-recommend
// @desc    Advanced multi-factor AI hospital recommendation
// @access  Public
// @body    {
//   condition, specialization, urgency,
//   budget, hasMediclaim, insuranceCompany,
//   facilities: [string],
//   patientLat, patientLng, city
// }
// ─────────────────────────────────────────────────────────────────────────────

// Haversine formula — returns distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceScore(km) {
    // Smooth exponential decay — better differentiation than hard buckets
    return Math.round(25 * Math.exp(-km / 15));
}

function budgetScore(fee, budget) {
    if (!budget || budget <= 0) return 10; // neutral if no budget given
    if (!fee) return 10;
    if (fee <= budget * 0.1) return 20;
    if (fee <= budget * 0.2) return 14;
    if (fee <= budget * 0.33) return 8;
    if (fee <= budget * 0.5) return 4;
    return 0; // over budget
}

const SPECIALTY_KEYWORDS = {
    'Cardiology': ['heart', 'cardiac', 'chest pain', 'hypertension', 'blood pressure', 'arrhythmia', 'coronary', 'palpitations', 'angina'],
    'Orthopedics': ['bone', 'joint', 'fracture', 'knee', 'spine', 'arthritis', 'ortho', 'scoliosis', 'ligament', 'sports injury', 'back pain'],
    'Oncology': ['cancer', 'tumor', 'chemotherapy', 'oncology', 'malignant', 'radiation', 'biopsy', 'lymphoma', 'leukemia'],
    'Neurology': ['brain', 'neuro', 'stroke', 'epilepsy', 'headache', 'migraine', 'nervous', 'alzheimer', 'paralysis', 'seizure', 'dizziness', 'numbness'],
    'Emergency Care': ['accident', 'emergency', 'trauma', 'injury', 'sudden', 'critical', 'bleeding', 'burn', 'poisoning', 'unconscious'],
    'Kidney Care': ['kidney', 'renal', 'dialysis', 'urinary', 'nephro', 'creatinine'],
    'Urology': ['kidney stone', 'prostate', 'bladder', 'urinary tract', 'urology'],
    'Gynecology': ['pregnancy', 'prenatal', 'delivery', 'maternity', 'gynec', 'obstetric', 'ivf', 'cesarean', 'menstrual', 'female'],
    'General Surgery': ['surgery', 'operation', 'appendix', 'hernia', 'gallbladder', 'laparoscopy', 'abscess'],
    'Pediatrics': ['child', 'infant', 'baby', 'pediatric', 'newborn', 'neonatal', 'vaccination'],
    'Dermatology': ['skin', 'derma', 'rash', 'eczema', 'psoriasis', 'acne', 'allergy', 'itching', 'fungal'],
    'Gastroenterology': ['stomach', 'liver', 'gut', 'intestine', 'gastro', 'digestion', 'colon', 'acidity', 'ulcer', 'jaundice', 'constipation'],
    'Pulmonology': ['lung', 'asthma', 'breath', 'copd', 'pulmonary', 'respiratory', 'tb', 'tuberculosis', 'pneumonia', 'coughing'],
    'Endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrine', 'insulin', 'sugar', 'pcos', 'adrenal'],
    'Psychiatry': ['mental', 'depression', 'anxiety', 'psychiatry', 'psychology', 'stress', 'insomnia', 'bipolar', 'addiction', 'panic'],
    'Ophthalmology': ['eye', 'vision', 'cataract', 'glaucoma', 'retina', 'ophthalmology', 'lasik', 'blindness'],
    'ENT': ['ear', 'nose', 'throat', 'tonsil', 'sinus', 'hearing', 'deafness', 'snoring', 'voice'],
    'General Medicine': ['fever', 'infection', 'flu', 'cold', 'cough', 'weakness', 'fatigue', 'checkup', 'body pain'],
    'Physiotherapy': ['rehabilitation', 'physiotherapy', 'recovery', 'muscle pain', 'stiffness'],
};

router.post('/ai-recommend', async (req, res) => {
    try {
        const {
            condition = '',
            specialization = '',
            urgency = 'routine',
            budget = 0,
            hasMediclaim = false,
            insuranceCompany = '',
            facilities = [],          // ['icu','emergency','ot','lab','pharmacy','ambulance','nabh']
            patientLat = null,
            patientLng = null,
            city = '',
        } = req.body;

        // Build DB query
        let dbQuery = { networkStatus: 'Active' };
        if (hasMediclaim && insuranceCompany) {
            dbQuery.insuranceCompany = { $regex: insuranceCompany, $options: 'i' };
        }
        if (city && (!patientLat || !patientLng)) {
            dbQuery.city = { $regex: city, $options: 'i' };
        }
        const hospitals = await Hospital.find(dbQuery);
        if (!hospitals.length) return res.json({ hospitals: [], total: 0 });

        const searchText = (condition + ' ' + specialization).toLowerCase();
        const isUrgent = urgency === 'emergency';
        const isSemiUrgent = urgency === 'semi-urgent';

        const facilityMap = {
            icu: 'hasICU',
            emergency: 'hasEmergency',
            ot: 'hasOT',
            lab: 'diagnosticLab',
            pharmacy: 'pharmacyAvailable',
            ambulance: 'ambulanceAvailable',
            nabh: 'naabhAccredited',
            bloodbank: 'bloodBank',
        };

        const scored = hospitals.map(h => {
            let score = 0;
            const reasons = [];
            const breakdown = {};

            // ── 1. SPECIALTY MATCH (max 25 pts) ──────────────────────────────
            let specScore = 0;
            const hSpecialty = (h.specialties || '').toLowerCase();
            let matchedSpec = null;

            // Direct specialization selection match
            if (specialization && hSpecialty.includes(specialization.toLowerCase())) {
                specScore = 25;
                matchedSpec = specialization;
            } else {
                // Keyword matching from condition text
                for (const [spec, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
                    if (keywords.some(kw => searchText.includes(kw)) &&
                        hSpecialty.includes(spec.toLowerCase())) {
                        specScore = 25;
                        matchedSpec = spec;
                        break;
                    }
                }
                if (specScore === 0 && hSpecialty) specScore = 3;
            }
            score += specScore;
            breakdown.specialty = specScore;
            if (matchedSpec) reasons.push(`Specializes in ${matchedSpec} matching your condition`);

            // ── 2. TREATMENT MATCH (max 10 pts — NEW) ─────────────────────────
            let treatScore = 0;
            const treatments = (h.availableTreatments || []).map(t => t.toLowerCase());
            const searchWords = searchText.split(/\s+/).filter(w => w.length > 3);
            const matchedTreatments = treatments.filter(t => searchWords.some(w => t.includes(w)));
            if (matchedTreatments.length > 0) {
                treatScore = Math.min(matchedTreatments.length * 5, 10);
                reasons.push(`Offers: ${matchedTreatments.slice(0, 3).join(', ')}`);
            }
            score += treatScore;
            breakdown.treatment = treatScore;

            // ── 3. DISTANCE (max 20 pts) ──────────────────────────────────────
            let distScore = 8; // neutral when no GPS
            let distKm = null;
            if (patientLat && patientLng && h.lat && h.lng) {
                distKm = haversineKm(patientLat, patientLng, h.lat, h.lng);
                distScore = Math.round(20 * Math.exp(-distKm / 15));
                if (distKm <= 5) reasons.push(`Very close — just ${distKm.toFixed(1)} km away`);
                else if (distKm <= 15) reasons.push(`Nearby — ${distKm.toFixed(1)} km from your location`);
            }
            score += distScore;
            breakdown.distance = distScore;

            // ── 4. BUDGET FIT (max 15 pts) ────────────────────────────────────
            const bScore = budgetScore(h.consultationFee, budget);
            const scaledBudget = Math.round(bScore * 15 / 20); // scale from 0-20 to 0-15
            score += scaledBudget;
            breakdown.budget = scaledBudget;
            if (bScore >= 14 && h.consultationFee) {
                reasons.push(`Consultation fee ₹${h.consultationFee} fits your budget well`);
            } else if (bScore === 0 && h.consultationFee) {
                reasons.push(`⚠️ Consultation fee ₹${h.consultationFee} exceeds your budget`);
            }

            // ── 5. FACILITY PREFERENCES (max 10 pts) ─────────────────────────
            let facScore = 0;
            const matchedFacilities = [];
            const missingFacilities = [];
            if (facilities.length > 0) {
                const perFacility = 10 / facilities.length;
                for (const fac of facilities) {
                    const key = facilityMap[fac];
                    if (key && h[key]) {
                        facScore += perFacility;
                        matchedFacilities.push(fac.toUpperCase());
                    } else {
                        missingFacilities.push(fac.toUpperCase());
                    }
                }
                facScore = Math.round(facScore);
            } else {
                const allFacs = [h.hasICU, h.hasEmergency, h.hasOT, h.diagnosticLab, h.pharmacyAvailable, h.ambulanceAvailable, h.bloodBank];
                facScore = Math.round((allFacs.filter(Boolean).length / allFacs.length) * 10);
            }
            if (isUrgent && h.hasEmergency) { facScore = Math.min(facScore + 3, 10); reasons.push('24/7 Emergency services for your urgent need'); }
            if ((isUrgent || isSemiUrgent) && h.hasICU) { reasons.push('ICU available for critical care'); }
            score += facScore;
            breakdown.facilities = facScore;
            if (matchedFacilities.length > 0) reasons.push(`Has required facilities: ${matchedFacilities.join(', ')}`);

            // ── 6. QUALITY SIGNALS (max 15 pts) ───────────────────────────────
            // Rating (max 8 pts)
            const rScore = Math.round(((h.rating || 0) / 5) * 8);
            score += rScore;
            // Patient satisfaction (max 5 pts)
            const satisfaction = h.patientSatisfactionPct || 0;
            const satScore = satisfaction >= 85 ? 5 : satisfaction >= 70 ? 3 : satisfaction >= 50 ? 1 : 0;
            score += satScore;
            // NABH (2 pts)
            if (h.naabhAccredited) { score += 2; reasons.push('NABH Accredited — national quality standards'); }
            breakdown.quality = rScore + satScore + (h.naabhAccredited ? 2 : 0);
            if (h.rating >= 4.5) reasons.push(`Top-rated hospital (${h.rating}⭐ from ${h.totalReviews || 0} reviews)`);
            else if (h.rating >= 4.0) reasons.push(`Well-rated (${h.rating}⭐)`);
            if (satisfaction >= 85) reasons.push(`${satisfaction}% patient satisfaction`);

            // ── 7. INSURANCE BONUS (max 5 pts) ────────────────────────────────
            let insScore = 0;
            if (hasMediclaim && h.cashlessAvailable) {
                insScore = 5;
                reasons.push(`Cashless treatment available (up to ₹${(h.cashlessLimit || 0).toLocaleString('en-IN')})`);
            }
            score += insScore;
            breakdown.insurance = insScore;

            score = Math.min(Math.round(score), 100);

            const finalReason = reasons.length
                ? reasons.join('. ') + '.'
                : `General-purpose hospital with ${h.specialties || 'multiple specialties'} and ${h.rating}⭐ rating.`;

            return {
                hospitalId: h._id,
                hospitalName: h.name,
                city: h.city,
                address: h.address,
                matchScore: score,
                reason: finalReason,
                breakdown,
                distanceKm: distKm ? Math.round(distKm * 10) / 10 : null,
                consultationFee: h.consultationFee,
                avgRoomCost: h.avgRoomCost,
                rating: h.rating,
                totalReviews: h.totalReviews,
                specialties: h.specialties,
                hospitalType: h.hospitalType,
                cashlessAvailable: h.cashlessAvailable,
                coveragePct: h.coveragePct,
                cashlessLimit: h.cashlessLimit,
                hasICU: h.hasICU,
                hasEmergency: h.hasEmergency,
                hasOT: h.hasOT,
                diagnosticLab: h.diagnosticLab,
                pharmacyAvailable: h.pharmacyAvailable,
                ambulanceAvailable: h.ambulanceAvailable,
                naabhAccredited: h.naabhAccredited,
                bloodBank: h.bloodBank,
                doctorCount: h.doctorCount,
                waitTimeMins: h.waitTimeMins,
                patientSatisfactionPct: h.patientSatisfactionPct,
                missingFacilities,
                matchedFacilities,
                image: h.image,
            };
        });

        const top5 = scored
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        res.json({ hospitals: top5, total: scored.length });

    } catch (err) {
        console.error('AI Recommend error:', err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hospitals
// @desc    Create a new hospital (for seeding/admin)
// @access  Public (should be protected in prod)
router.post('/', async (req, res) => {
    try {
        const newHospital = new Hospital(req.body);
        const savedHospital = await newHospital.save();

        // Trigger Dynamic ML Retraining
        let mlRetrainStatus = 'Bypassed';
        try {
            const axios = require('axios');
            // Fetch all active hospitals to retrain the model
            const allHospitals = await Hospital.find({ networkStatus: 'Active' })
                .select('name city rating specialties insuranceCompany cashlessAvailable hasICU hasEmergency hasOT');

            if (allHospitals.length > 0) {
                const mlPayload = {
                    hospitals: allHospitals
                };
                console.log(`Sending ${allHospitals.length} hospitals to ML service for retraining...`);
                // Use a short timeout so we don't block the request if ML server is down
                const mlRes = await axios.post('http://localhost:5001/retrain', mlPayload, { timeout: 10000 });
                console.log('ML Retrain Success:', mlRes.data);
                mlRetrainStatus = 'Success';
            }
        } catch (mlErr) {
            console.error('Failed to trigger ML retrain:', mlErr.message);
            // We don't want to fail the hospital creation just because ML is down
            mlRetrainStatus = 'Failed: ' + mlErr.message;
        }

        res.status(201).json({
            hospital: savedHospital,
            mlRetrainStatus
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

