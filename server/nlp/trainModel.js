/**
 * trainModel.js
 * Custom NLP training script for MediBot.
 * Trains a node-nlp model with 100+ medical intents and utterances.
 * Run: node server/nlp/trainModel.js
 */

const { NlpManager } = require('node-nlp');
const path = require('path');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// ═══════════════════════════════════════════════════
//  INTENT: greeting
// ═══════════════════════════════════════════════════
const greetings = [
    'hello', 'hi', 'hey', 'hi there', 'hello there', 'hey there',
    'good morning', 'good afternoon', 'good evening', 'howdy',
    'what\'s up', 'greetings', 'yo', 'hiya', 'sup',
    'hello bot', 'hi bot', 'hey medibot', 'hello medibot',
    'namaste', 'namaskar'
];
greetings.forEach(u => manager.addDocument('en', u, 'greeting'));

manager.addAnswer('en', 'greeting', 'Hello! 👋 I\'m MediBot, your health assistant. How can I help you today?');
manager.addAnswer('en', 'greeting', 'Hi there! 😊 I can help you with medical information, hospital recommendations, and navigating our website. What do you need?');

// ═══════════════════════════════════════════════════
//  INTENT: farewell
// ═══════════════════════════════════════════════════
const farewells = [
    'bye', 'goodbye', 'see you', 'see ya', 'later', 'take care',
    'good night', 'thanks bye', 'thank you bye', 'bye bye',
    'I\'m done', 'that\'s all', 'nothing else', 'no more questions',
    'ok bye', 'ok thanks bye', 'gotta go', 'have a good day'
];
farewells.forEach(u => manager.addDocument('en', u, 'farewell'));

manager.addAnswer('en', 'farewell', 'Goodbye! Take care of your health. Feel free to come back anytime! 👋');
manager.addAnswer('en', 'farewell', 'Bye! Stay healthy! 😊 Don\'t hesitate to ask if you need anything later.');

// ═══════════════════════════════════════════════════
//  INTENT: thanks
// ═══════════════════════════════════════════════════
const thanks = [
    'thanks', 'thank you', 'thanks a lot', 'thank you so much',
    'thanks for the help', 'appreciate it', 'that was helpful',
    'great thanks', 'awesome thanks', 'perfect thank you',
    'ty', 'thx', 'thnx', 'thankyou', 'dhanyavaad', 'shukriya'
];
thanks.forEach(u => manager.addDocument('en', u, 'thanks'));

manager.addAnswer('en', 'thanks', 'You\'re welcome! 😊 Let me know if you have more questions.');
manager.addAnswer('en', 'thanks', 'Happy to help! Take care of your health! 🏥');

// ═══════════════════════════════════════════════════
//  INTENT: medical.info (general medical queries)
// ═══════════════════════════════════════════════════
const medicalInfoUtterances = [
    'what is diabetes', 'tell me about diabetes', 'diabetes symptoms',
    'what are the symptoms of diabetes', 'how to manage diabetes',
    'what is blood pressure', 'tell me about hypertension', 'bp symptoms',
    'what is heart disease', 'heart attack symptoms', 'cardiac problems',
    'what is asthma', 'asthma treatment', 'how to use inhaler',
    'what is cancer', 'cancer symptoms', 'cancer treatment options',
    'kidney disease symptoms', 'what causes kidney stones',
    'what is thyroid', 'thyroid symptoms', 'hypothyroid vs hyperthyroid',
    'what is anemia', 'iron deficiency symptoms', 'low hemoglobin causes',
    'what is arthritis', 'joint pain treatment', 'knee pain causes',
    'what causes stroke', 'stroke symptoms', 'how to prevent stroke',
    'tell me about fever', 'when is fever dangerous',
    'what is malaria', 'dengue symptoms', 'typhoid treatment',
    'what is epilepsy', 'seizure first aid', 'epilepsy treatment',
    'what is pneumonia', 'lung infection symptoms', 'copd treatment',
    'what is depression', 'anxiety symptoms', 'mental health help',
    'migraine causes', 'headache types', 'how to treat migraines',
    'skin conditions', 'acne treatment', 'eczema causes',
    'pregnancy tips', 'prenatal care', 'what to eat during pregnancy',
    'what causes diarrhea', 'food poisoning treatment',
    'what is tuberculosis', 'tb treatment duration',
    'cholesterol levels', 'how to lower cholesterol',
    'allergy symptoms', 'anaphylaxis treatment',
    'covid symptoms', 'when to go hospital for covid',
    'what is uti', 'urinary infection symptoms',
    'back pain causes', 'sciatica treatment',
    'eye problems', 'glaucoma symptoms', 'cataract surgery',
    'ear infection symptoms', 'vertigo treatment',
    'dental care tips', 'toothache treatment',
    'liver disease symptoms', 'fatty liver treatment',
    'stomach ulcer symptoms', 'acid reflux treatment',
    'pcos symptoms', 'irregular periods causes',
    'constipation treatment', 'hemorrhoids treatment',
    'breast cancer screening', 'mammogram age',
    'prostate health', 'psa test meaning',
    'osteoporosis prevention', 'bone density test',
    'hernia symptoms', 'appendicitis symptoms',
    'gallstone symptoms', 'gallbladder surgery',
    'panic attack vs heart attack', 'anxiety attack help',
    'wound care tips', 'dog bite treatment', 'rabies vaccine',
    'sore throat treatment', 'tonsillitis symptoms',
    'sprain treatment', 'rice method',
    'what causes weight gain', 'how to lose weight',
    'vitamin d deficiency', 'vitamin b12 symptoms',
    'food allergy vs intolerance', 'celiac disease',
    'quit smoking tips', 'effects of smoking',
    'exercise recommendations', 'how much exercise do i need',
    'dehydration symptoms', 'heatstroke treatment',
    'eating disorder symptoms', 'anorexia treatment',
    'alcohol addiction help', 'how much alcohol is safe',
    'diabetes diet plan', 'what can diabetics eat',
    'i have a headache', 'my stomach hurts', 'i feel sick',
    'i have chest pain', 'i cant sleep', 'i feel dizzy',
    'what is this rash', 'i have a fever', 'my knee hurts',
    'i feel tired', 'i feel stressed', 'i feel anxious',
    'medicine for cold', 'medicine for cough', 'medicine for fever',
    'paracetamol dose', 'ibuprofen dose', 'when to take antibiotics',
    'blood test meaning', 'cbc test', 'liver function test',
    'vaccination schedule', 'which vaccines do i need',
    'first aid for burns', 'cpr steps', 'choking treatment',
    'nutrition tips', 'balanced diet', 'how many calories',
    'sleep tips', 'insomnia treatment', 'sleep apnea symptoms',
    'child health', 'baby fever', 'child vaccination',
    'std symptoms', 'hiv testing', 'safe sex',
    'what is a medical condition', 'health information',
    'symptoms of', 'treatment for', 'causes of', 'cure for',
    'how to treat', 'what medicine for', 'is it serious',
    'should i see a doctor', 'when to go to hospital'
];
medicalInfoUtterances.forEach(u => manager.addDocument('en', u, 'medical.info'));

// ═══════════════════════════════════════════════════
//  INTENT: hospital.recommendation
// ═══════════════════════════════════════════════════
const hospitalRecUtterances = [
    'recommend a hospital', 'find hospital', 'best hospital near me',
    'hospital for diabetes', 'hospital for heart', 'hospital for cancer',
    'suggest a hospital', 'which hospital should I go',
    'best hospital in my city', 'hospital recommendation',
    'i need a hospital', 'hospital for surgery',
    'find me a hospital', 'suggest hospital for my condition',
    'hospital for children', 'pediatric hospital',
    'cardiology hospital', 'orthopedic hospital', 'eye hospital',
    'which hospital accepts my insurance',
    'nearest hospital', 'hospital nearby',
    'good hospital for delivery', 'maternity hospital',
    'cancer treatment hospital', 'oncology hospital',
    'I need to find a specialist', 'specialist near me',
    'where should I get treatment', 'treatment centres',
    'hospital with emergency', 'trauma center',
    'affordable hospital', 'government hospital',
    'private hospital', 'multi-specialty hospital'
];
hospitalRecUtterances.forEach(u => manager.addDocument('en', u, 'hospital.recommendation'));

// ═══════════════════════════════════════════════════
//  INTENT: emergency.sos
// ═══════════════════════════════════════════════════
const emergencyUtterances = [
    'emergency', 'help', 'sos', 'urgent', 'i need help now',
    'call ambulance', 'i need an ambulance', 'medical emergency',
    'someone is dying', 'heart attack help', 'stroke happening',
    'cant breathe emergency', 'severe bleeding',
    'unconscious person', 'someone collapsed', 'accident',
    'chest pain emergency', 'choking', 'poison', 'poisoning',
    'overdose', 'allergic reaction severe', 'anaphylaxis help',
    'seizure happening now', 'burns emergency',
    'suicidal thoughts', 'want to hurt myself',
    'severe pain', 'baby not breathing'
];
emergencyUtterances.forEach(u => manager.addDocument('en', u, 'emergency.sos'));

manager.addAnswer('en', 'emergency.sos', '🚨 **EMERGENCY DETECTED!** Please call **112** (India Emergency) or your local emergency number immediately! If someone needs CPR, start chest compressions now. Use our ambulance tracking feature for fastest response.');

// ═══════════════════════════════════════════════════
//  INTENT: website.navigation
// ═══════════════════════════════════════════════════
const navigationUtterances = [
    'how to book appointment', 'book an appointment', 'schedule appointment',
    'where is my dashboard', 'go to dashboard', 'open dashboard',
    'how to login', 'how to sign up', 'create account',
    'where to see my appointments', 'my appointments',
    'how to find a doctor', 'search for doctor', 'doctor list',
    'where is the hospital list', 'hospital directory',
    'how to contact support', 'contact us', 'help page',
    'how to use this website', 'website guide', 'site map',
    'ambulance service', 'how to call ambulance', 'track ambulance',
    'my profile', 'edit profile', 'update my information',
    'my medical records', 'view reports', 'test results',
    'payment history', 'billing', 'payment options',
    'notifications', 'my notifications', 'alerts',
    'how to rate a doctor', 'feedback', 'review',
    'home page', 'go to home', 'take me to home',
    'about this hospital', 'about us'
];
navigationUtterances.forEach(u => manager.addDocument('en', u, 'website.navigation'));

// ═══════════════════════════════════════════════════
//  INTENT: appointment.query
// ═══════════════════════════════════════════════════
const appointmentUtterances = [
    'when is my next appointment', 'my appointment details',
    'cancel my appointment', 'reschedule appointment',
    'appointment status', 'is my appointment confirmed',
    'how to book with a specific doctor', 'available slots',
    'appointment fees', 'consultation charges',
    'do i need to come in person', 'online consultation available',
    'video consultation', 'telemedicine', 'teleconsultation'
];
appointmentUtterances.forEach(u => manager.addDocument('en', u, 'appointment.query'));

// ═══════════════════════════════════════════════════
//  INTENT: insurance.query
// ═══════════════════════════════════════════════════
const insuranceUtterances = [
    'does this hospital accept insurance', 'insurance coverage',
    'which insurance do you accept', 'cashless treatment',
    'star health insurance', 'HDFC ergo', 'mediclaim',
    'insurance claim process', 'TPA', 'third party administrator',
    'health insurance plans', 'recommended insurance'
];
insuranceUtterances.forEach(u => manager.addDocument('en', u, 'insurance.query'));

// ═══════════════════════════════════════════════════
//  TRAINING & SAVING
// ═══════════════════════════════════════════════════
async function trainAndSave() {
    console.log('🧠 Training NLP model with medical intents...');
    console.log('   This may take a moment...\n');

    await manager.train();

    const modelPath = path.join(__dirname, '..', 'nlp_model.nlp');
    manager.save(modelPath);

    console.log('✅ Model trained and saved to:', modelPath);
    console.log('\nIntent summary:');
    console.log('  - greeting:', greetings.length, 'utterances');
    console.log('  - farewell:', farewells.length, 'utterances');
    console.log('  - thanks:', thanks.length, 'utterances');
    console.log('  - medical.info:', medicalInfoUtterances.length, 'utterances');
    console.log('  - hospital.recommendation:', hospitalRecUtterances.length, 'utterances');
    console.log('  - emergency.sos:', emergencyUtterances.length, 'utterances');
    console.log('  - website.navigation:', navigationUtterances.length, 'utterances');
    console.log('  - appointment.query:', appointmentUtterances.length, 'utterances');
    console.log('  - insurance.query:', insuranceUtterances.length, 'utterances');

    const total = greetings.length + farewells.length + thanks.length +
        medicalInfoUtterances.length + hospitalRecUtterances.length +
        emergencyUtterances.length + navigationUtterances.length +
        appointmentUtterances.length + insuranceUtterances.length;
    console.log('\n  Total training utterances:', total);

    // Quick test
    console.log('\n--- Quick Test ---');
    const tests = [
        'hello there', 'what is diabetes', 'recommend hospital for heart',
        'emergency help needed', 'how to book appointment', 'thanks a lot',
        'bye', 'when is my appointment', 'do you accept insurance'
    ];
    for (const test of tests) {
        const result = await manager.process('en', test);
        console.log(`  "${test}" → ${result.intent} (${(result.score * 100).toFixed(1)}%)`);
    }
}

trainAndSave().catch(console.error);
