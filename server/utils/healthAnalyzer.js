/**
 * healthAnalyzer.js
 * Analyzes patient vitals against medical thresholds and generates
 * personalized health recommendations including diet, lifestyle, and tests.
 */

// ─── MEDICAL THRESHOLDS ───────────────────────────────────────────────
const THRESHOLDS = {
    bloodPressure: {
        normal:   { systolic: [0, 120], diastolic: [0, 80] },
        elevated: { systolic: [120, 129], diastolic: [0, 80] },
        stage1:   { systolic: [130, 139], diastolic: [80, 89] },
        stage2:   { systolic: [140, 300], diastolic: [90, 200] },
        crisis:   { systolic: [180, 999], diastolic: [120, 999] }
    },
    heartRate: {
        low:    [0, 60],
        normal: [60, 100],
        high:   [100, 300]
    },
    bloodSugar: {
        low:         [0, 70],
        normal:      [70, 100],
        prediabetic: [100, 126],
        diabetic:    [126, 999]
    },
    temperature: {  // Fahrenheit
        low:       [0, 97],
        normal:    [97, 99],
        lowFever:  [99, 101],
        fever:     [101, 103],
        highFever: [103, 200]
    },
    bmi: {
        underweight: [0, 18.5],
        normal:      [18.5, 25],
        overweight:  [25, 30],
        obese:       [30, 999]
    }
};

// ─── DIET RECOMMENDATIONS DATABASE ───────────────────────────────────
const DIET_RECOMMENDATIONS = {
    highBP: {
        eat: [
            'Leafy greens (spinach, kale, lettuce)',
            'Berries (blueberries, strawberries)',
            'Bananas and potatoes (potassium-rich)',
            'Oats and whole grains',
            'Low-fat dairy (yogurt, milk)',
            'Fish rich in omega-3 (salmon, mackerel)',
            'Garlic and beetroot'
        ],
        avoid: [
            'Excess salt (limit to <5g/day)',
            'Processed & packaged foods',
            'Pickles and papad',
            'Canned soups and sauces',
            'Red meat in excess',
            'Alcohol and caffeine in excess'
        ]
    },
    highSugar: {
        eat: [
            'Non-starchy vegetables (broccoli, cauliflower, spinach)',
            'Whole grains (brown rice, quinoa, oats)',
            'Legumes (lentils, chickpeas, kidney beans)',
            'Nuts and seeds (almonds, walnuts, flax)',
            'Lean proteins (chicken, fish, tofu)',
            'Bitter gourd (karela) and fenugreek seeds',
            'Cinnamon and turmeric'
        ],
        avoid: [
            'White rice, white bread, maida',
            'Sugary drinks (soda, fruit juices)',
            'Sweets, chocolates, pastries',
            'Fried foods and fast food',
            'Processed snacks (chips, biscuits)',
            'Excessive fruits high in sugar (mango, grapes)'
        ]
    },
    highHeartRate: {
        eat: [
            'Magnesium-rich foods (dark chocolate, avocado, nuts)',
            'Potassium-rich foods (bananas, sweet potatoes)',
            'Omega-3 fatty acids (fish, walnuts, flax seeds)',
            'Green tea (in moderation)',
            'Leafy greens and vegetables'
        ],
        avoid: [
            'Caffeine (coffee, energy drinks)',
            'Alcohol',
            'Spicy foods in excess',
            'Heavy meals before bedtime',
            'High-sodium foods'
        ]
    },
    fever: {
        eat: [
            'Clear soups and broths',
            'Khichdi and dal rice (easy to digest)',
            'Fresh fruits (oranges, watermelon, pomegranate)',
            'Coconut water and ORS',
            'Ginger-turmeric tea',
            'Yogurt and buttermilk'
        ],
        avoid: [
            'Oily and fried foods',
            'Cold drinks and ice cream',
            'Heavy and spicy foods',
            'Processed and junk food'
        ]
    },
    overweight: {
        eat: [
            'High-fiber foods (oats, vegetables, fruits with skin)',
            'Lean proteins (chicken breast, fish, egg whites, paneer)',
            'Salads with olive oil dressing',
            'Green tea and black coffee (no sugar)',
            'Sprouts, daliya, and millet-based meals',
            'Water (at least 3-4 liters/day)'
        ],
        avoid: [
            'Deep-fried foods (samosa, pakora, fries)',
            'Sugary beverages and desserts',
            'White bread, naan, and refined flour items',
            'Late-night snacking',
            'Butter, ghee, and cream in excess',
            'High-calorie fast food'
        ]
    },
    general: {
        eat: [
            'Balanced meals with all food groups',
            'Seasonal fruits and vegetables',
            'Adequate water (8-10 glasses/day)',
            'Protein-rich breakfast',
            'Home-cooked meals'
        ],
        avoid: [
            'Excessive processed foods',
            'Skipping meals',
            'Late-night heavy eating',
            'Excessive sugar and salt'
        ]
    }
};

// ─── LIFESTYLE RECOMMENDATIONS ───────────────────────────────────────
const LIFESTYLE_RECOMMENDATIONS = {
    highBP: [
        'Walk briskly for 30 minutes daily',
        'Practice deep breathing or meditation for 10 minutes',
        'Reduce stress — try yoga or relaxation techniques',
        'Monitor BP at home twice daily (morning & evening)',
        'Maintain a healthy weight',
        'Quit smoking if applicable'
    ],
    highSugar: [
        'Exercise for at least 30 minutes daily (walking, cycling)',
        'Check blood sugar regularly (fasting & post-meal)',
        'Take medications on time as prescribed',
        'Keep a food diary to track carbohydrate intake',
        'Wear comfortable footwear to prevent diabetic foot issues',
        'Get annual eye and kidney checkups'
    ],
    highHeartRate: [
        'Avoid strenuous exercise until evaluated by a doctor',
        'Practice slow deep breathing (4-7-8 technique)',
        'Get 7-8 hours of quality sleep',
        'Limit caffeine and stimulants',
        'Stay hydrated throughout the day',
        'Track your heart rate patterns and report to your doctor'
    ],
    fever: [
        'Rest adequately — avoid physical exertion',
        'Stay hydrated with fluids every 30 minutes',
        'Use a cool cloth on forehead if temperature is high',
        'Monitor temperature every 4-6 hours',
        'Seek medical attention if fever persists beyond 3 days',
        'Avoid self-medicating with antibiotics'
    ],
    overweight: [
        'Start with 20-30 minutes of daily walking, gradually increase',
        'Set realistic weight loss goals (0.5-1 kg per week)',
        'Practice portion control — use smaller plates',
        'Track daily calorie intake using an app',
        'Get 7-8 hours of sleep (poor sleep increases weight)',
        'Join a fitness group or find an exercise buddy'
    ],
    general: [
        'Maintain regular sleep schedule (7-8 hours)',
        'Stay physically active — at least 150 min/week',
        'Stay hydrated with adequate water intake',
        'Annual health checkup recommended',
        'Practice good hygiene and hand washing'
    ]
};

// ─── RECOMMENDED TESTS ──────────────────────────────────────────────
const TEST_RECOMMENDATIONS = {
    highBP: [
        'Complete Blood Count (CBC)',
        'Kidney Function Test (Creatinine, BUN)',
        'Lipid Profile (Cholesterol, Triglycerides)',
        'Echocardiogram',
        'Urine Albumin Test'
    ],
    highSugar: [
        'HbA1c (every 3 months)',
        'Fasting & Post-Prandial Blood Sugar',
        'Lipid Profile',
        'Kidney Function Test (eGFR, Creatinine)',
        'Urine Microalbumin',
        'Eye Examination (Retinopathy screening)'
    ],
    highHeartRate: [
        'ECG (Electrocardiogram)',
        'Thyroid Function Test (T3, T4, TSH)',
        'Complete Blood Count (to rule out anemia)',
        'Echocardiogram',
        'Holter Monitor (24-hour ECG)'
    ],
    fever: [
        'Complete Blood Count (CBC)',
        'Dengue NS1 & IgM (if suspected)',
        'Malaria Rapid Test',
        'Urine Routine & Culture',
        'Typhoid Test (Widal/Blood Culture)',
        'COVID-19 RT-PCR (if respiratory symptoms)'
    ],
    overweight: [
        'Lipid Profile',
        'Fasting Blood Sugar & HbA1c',
        'Thyroid Function Test',
        'Liver Function Test',
        'Vitamin D & B12 Levels'
    ],
    general: [
        'Complete Blood Count (CBC)',
        'Blood Sugar (Fasting)',
        'Lipid Profile',
        'Thyroid Function Test'
    ]
};

// ─── ANALYSIS FUNCTIONS ─────────────────────────────────────────────

function classifyRange(value, ranges) {
    for (const [label, [min, max]] of Object.entries(ranges)) {
        if (value >= min && value < max) return label;
    }
    return 'unknown';
}

function analyzeBloodPressure(systolic, diastolic) {
    if (!systolic || !diastolic) return null;

    let status = 'normal';
    if (systolic >= 180 || diastolic >= 120) status = 'crisis';
    else if (systolic >= 140 || diastolic >= 90) status = 'stage2';
    else if (systolic >= 130 || diastolic >= 80) status = 'stage1';
    else if (systolic >= 120) status = 'elevated';

    const labels = {
        normal: 'Normal', elevated: 'Elevated',
        stage1: 'Stage 1 Hypertension', stage2: 'Stage 2 Hypertension',
        crisis: 'Hypertensive Crisis'
    };

    return {
        status,
        label: labels[status],
        value: `${systolic}/${diastolic} mmHg`,
        target: '< 130/80 mmHg',
        isAbnormal: status !== 'normal'
    };
}

function analyzeHeartRate(hr) {
    if (!hr) return null;
    const status = classifyRange(hr, THRESHOLDS.heartRate);
    const labels = { low: 'Bradycardia (Low)', normal: 'Normal', high: 'Tachycardia (High)' };
    return {
        status,
        label: labels[status] || 'Unknown',
        value: `${hr} bpm`,
        target: '60-100 bpm',
        isAbnormal: status !== 'normal'
    };
}

function analyzeBloodSugar(sugar) {
    if (!sugar) return null;
    const status = classifyRange(sugar, THRESHOLDS.bloodSugar);
    const labels = { low: 'Hypoglycemia (Low)', normal: 'Normal', prediabetic: 'Pre-diabetic', diabetic: 'Diabetic Range' };
    return {
        status,
        label: labels[status] || 'Unknown',
        value: `${sugar} mg/dL`,
        target: '70-100 mg/dL (fasting)',
        isAbnormal: status !== 'normal'
    };
}

function analyzeTemperature(temp) {
    if (!temp) return null;
    const status = classifyRange(temp, THRESHOLDS.temperature);
    const labels = { low: 'Below Normal', normal: 'Normal', lowFever: 'Low-grade Fever', fever: 'Fever', highFever: 'High Fever' };
    return {
        status,
        label: labels[status] || 'Unknown',
        value: `${temp}°F`,
        target: '97-99°F',
        isAbnormal: status !== 'normal'
    };
}

function analyzeWeight(weight, heightCm) {
    if (!weight) return null;
    // If height not available, just return weight without BMI
    if (!heightCm) {
        return {
            status: 'unknown',
            label: 'Weight recorded (BMI needs height)',
            value: `${weight} kg`,
            target: 'Depends on height',
            isAbnormal: false
        };
    }
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const status = classifyRange(bmi, THRESHOLDS.bmi);
    const labels = { underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight', obese: 'Obese' };
    return {
        status,
        label: labels[status] || 'Unknown',
        value: `${weight} kg (BMI: ${bmi.toFixed(1)})`,
        target: 'BMI 18.5-24.9',
        isAbnormal: status !== 'normal',
        bmi: parseFloat(bmi.toFixed(1))
    };
}

/**
 * Main analysis function — takes vitals array and appointment data,
 * returns a comprehensive health summary with recommendations.
 */
function generateHealthSummary(vitalsHistory, appointments, userProfile) {
    // Get latest vitals (most recent reading)
    const sortedVitals = [...vitalsHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedVitals[0] || {};

    // Compute averages from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVitals = sortedVitals.filter(v => new Date(v.date) >= sevenDaysAgo);

    const avg = computeAverages(recentVitals);

    // Use averages if available, otherwise latest
    const systolic = avg.systolic || latest.systolic;
    const diastolic = avg.diastolic || latest.diastolic;
    const heartRate = avg.heartRate || latest.heartRate;
    const bloodSugar = avg.bloodSugar || latest.bloodSugar;
    const temperature = latest.temperature; // temperature = latest only (not averaged)
    const weight = latest.weight;

    // Analyze each vital
    const vitalsAnalysis = {
        bloodPressure: analyzeBloodPressure(systolic, diastolic),
        heartRate: analyzeHeartRate(heartRate),
        bloodSugar: analyzeBloodSugar(bloodSugar),
        temperature: analyzeTemperature(temperature),
        weight: analyzeWeight(weight, userProfile?.height)
    };

    // Detect conditions
    const conditions = [];
    const activeCategories = new Set();

    if (vitalsAnalysis.bloodPressure?.isAbnormal) {
        const bp = vitalsAnalysis.bloodPressure;
        conditions.push({
            name: bp.label,
            severity: bp.status === 'crisis' ? 'danger' : 'caution',
            details: `Your average BP is ${bp.value}. Target: ${bp.target}`,
            category: 'highBP'
        });
        activeCategories.add('highBP');
    }

    if (vitalsAnalysis.bloodSugar?.isAbnormal) {
        const bs = vitalsAnalysis.bloodSugar;
        conditions.push({
            name: bs.label,
            severity: bs.status === 'diabetic' ? 'danger' : bs.status === 'low' ? 'danger' : 'caution',
            details: `Blood sugar reading: ${bs.value}. Target: ${bs.target}`,
            category: 'highSugar'
        });
        activeCategories.add('highSugar');
    }

    if (vitalsAnalysis.heartRate?.isAbnormal) {
        const hr = vitalsAnalysis.heartRate;
        conditions.push({
            name: hr.label,
            severity: hr.status === 'high' ? 'caution' : 'info',
            details: `Heart rate: ${hr.value}. Target: ${hr.target}`,
            category: 'highHeartRate'
        });
        activeCategories.add('highHeartRate');
    }

    if (vitalsAnalysis.temperature?.isAbnormal) {
        const temp = vitalsAnalysis.temperature;
        conditions.push({
            name: temp.label,
            severity: ['fever', 'highFever'].includes(temp.status) ? 'danger' : 'caution',
            details: `Temperature: ${temp.value}. Target: ${temp.target}`,
            category: 'fever'
        });
        activeCategories.add('fever');
    }

    if (vitalsAnalysis.weight?.isAbnormal && vitalsAnalysis.weight.status !== 'unknown') {
        const w = vitalsAnalysis.weight;
        conditions.push({
            name: w.label,
            severity: w.status === 'obese' ? 'danger' : 'caution',
            details: `${w.value}. Target: ${w.target}`,
            category: 'overweight'
        });
        if (w.status === 'overweight' || w.status === 'obese') {
            activeCategories.add('overweight');
        }
    }

    // Determine overall status
    const hasDanger = conditions.some(c => c.severity === 'danger');
    const hasCaution = conditions.some(c => c.severity === 'caution');
    let overallStatus, statusColor;
    if (hasDanger) {
        overallStatus = 'Immediate Attention Required';
        statusColor = 'danger';
    } else if (hasCaution) {
        overallStatus = 'Needs Monitoring';
        statusColor = 'warning';
    } else if (conditions.length === 0 && vitalsHistory.length > 0) {
        overallStatus = 'Looking Good!';
        statusColor = 'good';
    } else {
        overallStatus = 'No Data — Please Log Your Vitals';
        statusColor = 'info';
    }

    // Build recommendations from active categories
    const diet = buildDietPlan(activeCategories);
    const lifestyle = buildLifestylePlan(activeCategories);
    const tests = buildTestPlan(activeCategories);
    const immediate = buildImmediateActions(conditions);

    // Extract doctor notes from latest completed appointment
    const completedApts = (appointments || [])
        .filter(a => a.doctorReport?.diagnosis)
        .sort((a, b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date));

    const lastReport = completedApts[0]?.doctorReport || null;
    const doctorNotes = lastReport ? {
        lastDiagnosis: lastReport.diagnosis,
        lastPrescription: lastReport.prescription,
        dosage: lastReport.dosage,
        duration: lastReport.duration,
        recommendations: lastReport.recommendations,
        testsRecommended: lastReport.testsRecommended,
        followUpDate: lastReport.followUpDate,
        severity: lastReport.severity,
        doctorName: completedApts[0]?.doctorId?.name || 'Your Doctor',
        reportDate: lastReport.reportDate
    } : null;

    // Active prescriptions from recent appointments
    const activePrescriptions = completedApts
        .filter(a => a.doctorReport?.prescription)
        .slice(0, 5)
        .map(a => ({
            medicine: a.doctorReport.prescription,
            dosage: a.doctorReport.dosage || 'As prescribed',
            duration: a.doctorReport.duration || 'As directed',
            doctor: a.doctorId?.name || 'Doctor',
            date: a.doctorReport.reportDate || a.date
        }));

    return {
        currentCondition: {
            overallStatus,
            statusColor,
            conditions
        },
        vitalsAnalysis,
        recommendations: {
            immediate,
            diet,
            lifestyle,
            tests
        },
        doctorNotes,
        activePrescriptions,
        lastVitalsDate: latest.date || null,
        vitalsCount: vitalsHistory.length,
        averages: avg
    };
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────

function computeAverages(vitals) {
    if (!vitals.length) return {};
    const sum = { systolic: 0, diastolic: 0, heartRate: 0, bloodSugar: 0 };
    const count = { systolic: 0, diastolic: 0, heartRate: 0, bloodSugar: 0 };

    for (const v of vitals) {
        if (v.systolic) { sum.systolic += v.systolic; count.systolic++; }
        if (v.diastolic) { sum.diastolic += v.diastolic; count.diastolic++; }
        if (v.heartRate) { sum.heartRate += v.heartRate; count.heartRate++; }
        if (v.bloodSugar) { sum.bloodSugar += v.bloodSugar; count.bloodSugar++; }
    }

    return {
        systolic: count.systolic ? Math.round(sum.systolic / count.systolic) : null,
        diastolic: count.diastolic ? Math.round(sum.diastolic / count.diastolic) : null,
        heartRate: count.heartRate ? Math.round(sum.heartRate / count.heartRate) : null,
        bloodSugar: count.bloodSugar ? Math.round(sum.bloodSugar / count.bloodSugar) : null
    };
}

function buildDietPlan(categories) {
    const eat = new Set();
    const avoid = new Set();

    if (categories.size === 0) {
        DIET_RECOMMENDATIONS.general.eat.forEach(i => eat.add(i));
        DIET_RECOMMENDATIONS.general.avoid.forEach(i => avoid.add(i));
    } else {
        for (const cat of categories) {
            const rec = DIET_RECOMMENDATIONS[cat];
            if (rec) {
                rec.eat.forEach(i => eat.add(i));
                rec.avoid.forEach(i => avoid.add(i));
            }
        }
    }

    return { eat: [...eat], avoid: [...avoid] };
}

function buildLifestylePlan(categories) {
    const tips = new Set();
    if (categories.size === 0) {
        LIFESTYLE_RECOMMENDATIONS.general.forEach(t => tips.add(t));
    } else {
        for (const cat of categories) {
            const rec = LIFESTYLE_RECOMMENDATIONS[cat];
            if (rec) rec.forEach(t => tips.add(t));
        }
    }
    return [...tips];
}

function buildTestPlan(categories) {
    const tests = new Set();
    if (categories.size === 0) {
        TEST_RECOMMENDATIONS.general.forEach(t => tests.add(t));
    } else {
        for (const cat of categories) {
            const rec = TEST_RECOMMENDATIONS[cat];
            if (rec) rec.forEach(t => tests.add(t));
        }
    }
    return [...tests];
}

function buildImmediateActions(conditions) {
    const actions = [];
    for (const cond of conditions) {
        if (cond.severity === 'danger') {
            actions.push(`⚠️ ${cond.name} detected — consult your doctor immediately`);
        } else if (cond.severity === 'caution') {
            actions.push(`Monitor ${cond.name} closely and track daily readings`);
        }
    }
    if (actions.length === 0) {
        actions.push('Continue maintaining your healthy lifestyle!');
    }
    return actions;
}

// ─── DAILY HEALTH PLAN GENERATOR ────────────────────────────────────
// Generates a personalized daily routine + rotating wellness tips
// based on patient conditions. Changes recommendations each day so
// patients get fresh, actionable advice.

const DAILY_TIPS_POOL = {
    highBP: [
        'Try the DASH diet today — focus on fruits, vegetables, and low-fat dairy.',
        'Take a 20-minute brisk walk this morning to help reduce blood pressure.',
        'Replace salt with herbs and spices in today\'s meals.',
        'Practice 10 minutes of deep breathing — inhale for 4 seconds, hold for 7, exhale for 8.',
        'Eat a banana today — it\'s rich in potassium which helps lower BP.',
        'Limit caffeine today — switch to herbal tea or warm lemon water.',
        'Weigh yourself today to track weight changes affecting BP.',
        'Spend 15 minutes doing gentle stretching exercises.',
        'Avoid processed or packaged foods today — cook a fresh meal.',
        'Write down your BP readings morning and evening in your log.',
        'Try adding garlic to your meals today — it has natural BP-lowering properties.',
        'Reduce screen time before bed tonight for better sleep and lower stress.',
        'Have a bowl of oatmeal for breakfast — great for heart health.',
        'Practice progressive muscle relaxation before bed tonight.'
    ],
    highSugar: [
        'Check your blood sugar before and 2 hours after your largest meal today.',
        'Take a 15-minute walk after lunch — it helps control post-meal sugar spikes.',
        'Choose whole grains over white rice/bread for all meals today.',
        'Drink a glass of water 30 minutes before each meal to manage portions.',
        'Add cinnamon to your tea or breakfast — it may help regulate blood sugar.',
        'Eat your dinner early today — at least 3 hours before bedtime.',
        'Snack on almonds or walnuts instead of biscuits or chips.',
        'Count your carbohydrate servings today — aim for balanced portions.',
        'Try bitter gourd juice or fenugreek water this morning.',
        'Check your feet today for any cuts, blisters, or numbness.',
        'Include green leafy vegetables in at least 2 meals today.',
        'Avoid fruit juices — eat whole fruits instead for more fiber.',
        'Practice mindful eating — chew slowly and avoid distractions.',
        'Review your medication schedule and set reminders if needed.'
    ],
    highHeartRate: [
        'Practice the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s.',
        'Avoid all caffeine today — switch to water and herbal drinks.',
        'Do a 10-minute guided meditation to calm your heart rate.',
        'Get at least 8 hours of sleep tonight — set a firm bedtime.',
        'Eat magnesium-rich foods today: dark chocolate, avocado, or spinach.',
        'Avoid intense physical activity today — gentle yoga is fine.',
        'Take a warm (not hot) bath before bed to help your body relax.',
        'Stay well-hydrated — dehydration can raise heart rate.',
        'Avoid heavy or spicy meals today, especially dinner.',
        'Sit quietly for 5 minutes and count your heartbeats per minute.',
        'Try listening to calming music for 20 minutes today.',
        'Avoid alcohol completely today.',
        'Keep a log of when your heart rate spikes and what you were doing.',
        'Eat foods rich in omega-3 today — fish, walnuts, or flax seeds.'
    ],
    fever: [
        'Rest is your priority today — no strenuous activity.',
        'Drink at least 3 liters of fluids today (water, ORS, soups, coconut water).',
        'Have light, easy-to-digest food — khichdi, dal rice, or clear soup.',
        'Monitor your temperature every 4 hours and note it down.',
        'Apply a cool, damp cloth to your forehead and neck.',
        'Take your prescribed medications on schedule.',
        'Wear light, breathable clothing to help your body cool down.',
        'Avoid cold drinks and ice cream even if you feel hot.',
        'Have ginger-turmeric tea with honey — it supports recovery.',
        'Eat citrus fruits (orange, lemon) for vitamin C to boost immunity.',
        'Keep your room well-ventilated but avoid direct fan/AC drafts.',
        'Call your doctor if fever has lasted more than 3 days or exceeds 103°F.',
        'Have a warm sponge bath rather than a cold one.',
        'Eat yogurt or probiotic-rich food to maintain gut health during illness.'
    ],
    overweight: [
        'Start your day with a glass of warm water and lemon.',
        'Take the stairs instead of the elevator today.',
        'Prepare a healthy, home-cooked lunch with lots of vegetables.',
        'Aim for 10,000 steps today — use your phone to track.',
        'Eat your dinner before 7 PM and keep it light.',
        'Swap your afternoon snack for fruits or sprouts.',
        'Drink green tea in the afternoon instead of a sugary drink.',
        'Do 15 minutes of bodyweight exercises (squats, lunges, planks).',
        'Measure your waist circumference today to monitor progress.',
        'Avoid fried or oily food today — try baking or steaming instead.',
        'Use a smaller plate for your meals today for portion control.',
        'Replace white rice with brown rice, quinoa, or millets.',
        'Keep a food diary today — write down everything you eat.',
        'Walk for 30 minutes after your largest meal today.'
    ],
    general: [
        'Drink 8-10 glasses of water throughout the day.',
        'Eat a colorful plate — include at least 3 different colored vegetables.',
        'Take a 20-minute walk outdoors today for fresh air and vitamin D.',
        'Practice gratitude — write down 3 things you\'re thankful for.',
        'Stretch for 10 minutes after waking up to energize your body.',
        'Eat a protein-rich breakfast to fuel your morning.',
        'Turn off screens 30 minutes before bedtime for better sleep quality.',
        'Take a 5-minute break every hour if you are sitting for long periods.',
        'Wash your hands thoroughly before meals and after using the bathroom.',
        'Floss and brush twice today — oral health impacts overall health.',
        'Schedule your annual health checkup if not done in the past year.',
        'Call or meet a friend today — social connection boosts mental health.',
        'Include nuts and seeds in your diet today (almonds, flax, pumpkin seeds).',
        'Do a short 10-minute meditation or quiet time today.'
    ]
};

const DAILY_ROUTINES = {
    highBP: {
        morning: [
            'Measure BP immediately after waking (before tea/coffee)',
            'Take prescribed BP medications with a glass of water',
            'Have a low-salt, potassium-rich breakfast (banana, oats, yogurt)',
            'Do 15-20 minutes of brisk walking or light exercise'
        ],
        afternoon: [
            'Eat a balanced, low-sodium lunch with plenty of vegetables',
            'Take a 10-minute deep breathing break',
            'Stay hydrated — drink water instead of salty beverages',
            'Avoid heavy, oily, or processed foods'
        ],
        evening: [
            'Measure BP again (evening reading)',
            'Do light stretching or yoga for 15 minutes',
            'Have an early, light dinner by 7-8 PM',
            'Avoid caffeine and alcohol in the evening'
        ],
        night: [
            'Take nighttime medications if prescribed',
            'Do 5 minutes of relaxation or meditation',
            'Go to bed by 10-10:30 PM for 7-8 hours of sleep',
            'Keep your bedroom cool, dark, and quiet'
        ]
    },
    highSugar: {
        morning: [
            'Check fasting blood sugar before breakfast',
            'Take prescribed diabetes medications/insulin',
            'Eat a fiber-rich breakfast (oats, whole grain toast, sprouts)',
            'Walk for 15-20 minutes after breakfast'
        ],
        afternoon: [
            'Have a balanced lunch — half plate vegetables, quarter protein, quarter whole grains',
            'Check post-meal blood sugar (2 hours after lunch)',
            'If snacking, choose nuts, buttermilk, or fruits with low GI',
            'Stay on your feet — avoid sitting for more than 1 hour'
        ],
        evening: [
            'Take evening medications on schedule',
            'Do 20-30 minutes of exercise (walking, cycling, yoga)',
            'Eat dinner early — at least 3 hours before bed',
            'Avoid sweets, fried snacks, and refined carbs'
        ],
        night: [
            'Check blood sugar before bed if recommended by your doctor',
            'Inspect your feet for any cuts or sores',
            'Keep a glucose tablet or juice by your bedside (for nocturnal lows)',
            'Get 7-8 hours of uninterrupted sleep'
        ]
    },
    highHeartRate: {
        morning: [
            'Check resting heart rate before getting out of bed',
            'Take prescribed heart medications with water',
            'Do 5-10 minutes of gentle breathing exercises',
            'Have a calm breakfast — avoid rushing'
        ],
        afternoon: [
            'Eat a light, heart-healthy lunch with omega-3 rich foods',
            'Take a 5-minute relaxation break if feeling stressed',
            'Stay hydrated — dehydration can spike heart rate',
            'Avoid heavy caffeine (coffee, energy drinks, cola)'
        ],
        evening: [
            'Do 15 minutes of slow yoga or stretching (avoid intense workouts)',
            'Record your heart rate and any palpitation episodes',
            'Have a light early dinner — avoid spicy or heavy meals',
            'Limit screen time and begin winding down'
        ],
        night: [
            'Take nighttime medications if prescribed',
            'Practice progressive muscle relaxation in bed',
            'Keep your room cool and dark',
            'Aim for 8 hours of sleep — sleep deprivation increases heart rate'
        ]
    },
    fever: {
        morning: [
            'Check your temperature immediately on waking',
            'Take prescribed medications (fever reducer if above 100°F)',
            'Have a light breakfast — toast, fruit, or porridge',
            'Drink warm lemon-honey water or herbal tea'
        ],
        afternoon: [
            'Rest — stay in bed or on the couch, avoid exertion',
            'Eat light soup or khichdi for lunch',
            'Keep sipping fluids every 30 minutes (water, ORS, coconut water)',
            'Recheck temperature after lunch'
        ],
        evening: [
            'Apply cool cloth to forehead if temperature is elevated',
            'Have easy-to-digest dinner (dal, bread, soft rice)',
            'Take evening dose of medications on schedule',
            'Avoid cold or chilled foods and drinks'
        ],
        night: [
            'Check temperature before bed',
            'Take nighttime medication if prescribed',
            'Wear light, cotton clothing to sleep',
            'Seek emergency care if temperature exceeds 103°F or seizures occur'
        ]
    },
    overweight: {
        morning: [
            'Drink a glass of warm water with lemon on waking',
            'Do 20-30 minutes of exercise (walking, jogging, or home workout)',
            'Have a protein-rich breakfast (eggs, paneer, sprouts, yogurt)',
            'Weigh yourself weekly (same day, same time)'
        ],
        afternoon: [
            'Eat a portion-controlled lunch — use a smaller plate',
            'Include salad and vegetables in at least half your plate',
            'Take a 10-15 minute walk after lunch',
            'Drink water instead of sweetened beverages'
        ],
        evening: [
            'Do another round of light exercise — yoga, cycling, or walking',
            'Snack on fruits, nuts, or roasted chana instead of chips/biscuits',
            'Have an early dinner (before 7:30 PM) with more protein, less carbs',
            'Avoid fried foods, sweets, and fast food'
        ],
        night: [
            'Avoid late-night snacking completely',
            'Do 5 minutes of stretching before bed',
            'Get 7-8 hours of sleep — poor sleep leads to weight gain',
            'Keep a food diary — write what you ate today'
        ]
    },
    general: {
        morning: [
            'Wake up at a consistent time each day',
            'Drink a glass of water first thing in the morning',
            'Have a nutritious breakfast — don\'t skip it',
            'Do 15-20 minutes of light exercise or stretching'
        ],
        afternoon: [
            'Eat a balanced lunch with protein, vegetables, and whole grains',
            'Stay hydrated — drink water throughout the day',
            'Take a short walk or stretching break from prolonged sitting',
            'Avoid excessive junk food or sugary snacks'
        ],
        evening: [
            'Do 20-30 minutes of physical activity',
            'Plan a healthy dinner with home-cooked food',
            'Spend quality time with family or do a hobby',
            'Reduce screen time 1 hour before bed'
        ],
        night: [
            'Avoid heavy meals close to bedtime',
            'Practice a short meditation or gratitude journaling',
            'Go to bed by 10:30 PM for adequate rest',
            'Keep your sleep environment comfortable and dark'
        ]
    }
};

/**
 * Generates a daily health plan with rotating tips and time-based routine.
 * Tips rotate based on the day of the year so patients get fresh advice daily.
 */
function generateDailyPlan(activeCategories, conditions) {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Select today's tips — rotate through the pool based on day of year
    const dailyTips = [];
    const categories = activeCategories.size > 0 ? [...activeCategories] : ['general'];

    for (const cat of categories) {
        const pool = DAILY_TIPS_POOL[cat] || DAILY_TIPS_POOL.general;
        const idx = dayOfYear % pool.length;
        dailyTips.push({
            category: cat,
            tip: pool[idx]
        });
        // Optionally add a second tip from the pool on alternate days
        if (pool.length > 1) {
            const idx2 = (dayOfYear + 7) % pool.length;
            if (idx2 !== idx) {
                dailyTips.push({
                    category: cat,
                    tip: pool[idx2]
                });
            }
        }
    }

    // Build daily routine - merge routines from active categories
    const routine = { morning: [], afternoon: [], evening: [], night: [] };
    const addedTasks = { morning: new Set(), afternoon: new Set(), evening: new Set(), night: new Set() };

    if (categories.length === 1 && categories[0] === 'general') {
        // Use general routine directly
        for (const slot of ['morning', 'afternoon', 'evening', 'night']) {
            routine[slot] = DAILY_ROUTINES.general[slot];
        }
    } else {
        // Merge routines from active categories (avoid duplicates)
        for (const cat of categories) {
            const r = DAILY_ROUTINES[cat] || DAILY_ROUTINES.general;
            for (const slot of ['morning', 'afternoon', 'evening', 'night']) {
                for (const task of r[slot]) {
                    if (!addedTasks[slot].has(task)) {
                        addedTasks[slot].add(task);
                        routine[slot].push(task);
                    }
                }
            }
        }
    }

    // Generate daily wellness score suggestion text
    const conditionCount = conditions.length;
    let dailyFocus;
    if (conditionCount === 0) {
        dailyFocus = 'Maintain your healthy habits! Focus on nutrition, exercise, and rest today.';
    } else if (conditionCount === 1) {
        dailyFocus = `Today, focus on managing your ${conditions[0].name}. Follow the routine below carefully.`;
    } else {
        const names = conditions.slice(0, 3).map(c => c.name).join(', ');
        dailyFocus = `You have multiple conditions to manage (${names}). Follow today\'s structured routine to stay on track.`;
    }

    return {
        date: dateStr,
        dayName,
        dailyFocus,
        dailyTips,
        routine
    };
}

module.exports = { generateHealthSummary, generateDailyPlan, THRESHOLDS };
