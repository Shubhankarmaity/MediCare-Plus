/**
 * medicalKnowledge.js
 * Comprehensive medical Q&A knowledge base for MediBot.
 * Each entry has: keywords[], answer, category, severity (info/caution/danger)
 */

const MEDICAL_KB = [

    // ═══════════════════════════════════════════════════
    //  COMMON DISEASES & CONDITIONS
    // ═══════════════════════════════════════════════════
    {
        keywords: ['diabetes', 'blood sugar', 'sugar level', 'insulin', 'diabetic', 'hyperglycemia', 'type 1', 'type 2'],
        category: 'Chronic Disease',
        severity: 'caution',
        followUpQuestions: ['What diet is best for diabetes?', 'How often should I check blood sugar?', 'What are signs of diabetic emergency?'],
        answer: `**Diabetes** is a chronic condition where the body cannot properly regulate blood sugar.

**Types:**
• **Type 1** — Immune system destroys insulin-producing cells (requires insulin injections)
• **Type 2** — Body becomes resistant to insulin (most common, often lifestyle-related)
• **Gestational** — Occurs during pregnancy

**Symptoms:** Excessive thirst, frequent urination, fatigue, blurred vision, slow healing wounds.

**Normal Blood Sugar Levels:**
• Fasting: 70–100 mg/dL
• Post-meal (2 hrs): < 140 mg/dL
• HbA1c: < 5.7% (normal), 5.7–6.4% (prediabetes), ≥ 6.5% (diabetes)

**Management:**
- Diet: Low-carb, high-fiber foods; avoid sweets and processed foods
- Exercise: At least 30 min/day
- Medications: Metformin (Type 2), Insulin (Type 1 & advanced Type 2)
- Regular monitoring of blood sugar and HbA1c

⚠️ *Uncontrolled diabetes can damage kidneys, eyes, nerves, and heart.*
🏥 *Consult an Endocrinologist for a personalized treatment plan.*`
    },
    {
        keywords: ['hypertension', 'high blood pressure', 'bp high', 'high bp', 'blood pressure high', 'systolic', 'diastolic'],
        category: 'Cardiovascular',
        severity: 'caution',
        followUpQuestions: ['How can I lower my blood pressure naturally?', 'What foods should I avoid with high BP?', 'What is a hypertensive crisis?'],
        answer: `**Hypertension (High Blood Pressure)** is when blood pressure is consistently above 130/80 mmHg.

**Blood Pressure Classifications:**
| Category | Systolic | Diastolic |
|---|---|---|
| Normal | < 120 | < 80 |
| Elevated | 120–129 | < 80 |
| Stage 1 Hypertension | 130–139 | 80–89 |
| Stage 2 Hypertension | ≥ 140 | ≥ 90 |
| Hypertensive Crisis | > 180 | > 120 |

**Symptoms:** Usually *none* (silent killer). Severe cases: headache, dizziness, nosebleed, chest pain.

**Risk Factors:** Obesity, smoking, high salt intake, family history, stress, lack of exercise.

**Treatment:**
- Lifestyle: Reduce salt (<5g/day), DASH diet, exercise 30 min/day, quit smoking
- Medications: ACE inhibitors, ARBs, Beta-blockers, Calcium channel blockers, Diuretics

⚠️ *Untreated hypertension raises risk of stroke, heart attack, and kidney failure.*`
    },
    {
        keywords: ['heart disease', 'cardiac', 'heart attack', 'coronary', 'angina', 'myocardial infarction', 'heart failure', 'chest pain'],
        category: 'Cardiovascular',
        severity: 'danger',
        followUpQuestions: ['What are the warning signs of a heart attack?', 'How to prevent heart disease?', 'What tests detect heart problems?'],
        answer: `**Heart Disease** is the leading cause of death worldwide.

**Warning Signs of a Heart Attack 🚨:**
- Chest pain/pressure/tightness
- Pain radiating to left arm, jaw, or back
- Shortness of breath
- Nausea, cold sweat, lightheadedness

**🚨 If heart attack is suspected — CALL 112 IMMEDIATELY!**

**Types of Heart Disease:**
• Coronary Artery Disease (most common)
• Heart Failure
• Arrhythmia (irregular heartbeat)
• Valve disease

**Prevention:**
- Daily exercise (30 min cardio)
- Mediterranean or low-fat diet
- No smoking; limit alcohol
- Manage diabetes, BP, and cholesterol
- Aspirin (only if prescribed)

**Key Tests:** ECG, Echocardiogram, Stress Test, Coronary Angiography, Troponin blood test.

🏥 *See a Cardiologist immediately if you have chest pain or risk factors.*`
    },
    {
        keywords: ['kidney', 'renal', 'kidney disease', 'ckd', 'kidney failure', 'creatinine', 'dialysis', 'kidney stone', 'nephritis', 'nephrotic'],
        category: 'Nephrology',
        severity: 'caution',
        followUpQuestions: ['How to prevent kidney stones?', 'What foods are bad for kidneys?', 'When is dialysis needed?'],
        answer: `**Kidney Disease** affects the body's ability to filter blood.

**Chronic Kidney Disease (CKD) Stages:**
• Stage 1–2: Mild damage, normal/slightly reduced function
• Stage 3: Moderate reduction (eGFR 30–59)
• Stage 4: Severe (eGFR 15–29)
• Stage 5: Kidney failure / End-stage (eGFR < 15) → dialysis or transplant

**Symptoms:** Fatigue, swelling (hands/feet/face), decreased urine, foamy urine, nausea, high BP.

**Kidney Stones:** Sharp flank pain, blood in urine, pain during urination.

**Key Lab Tests:**
- Serum Creatinine (Normal: 0.7–1.3 mg/dL men; 0.5–1.1 mg/dL women)
- eGFR (Normal: > 60 mL/min)
- Urine Albumin/Creatinine Ratio

**Management:**
- Low protein, low potassium, low phosphorus diet
- Stay hydrated (unless restricted)
- Avoid NSAIDs (ibuprofen, diclofenac)
- Control blood sugar and BP

🏥 *Consult a Nephrologist for CKD management.*`
    },
    {
        keywords: ['cancer', 'tumor', 'malignant', 'oncology', 'chemotherapy', 'radiation', 'biopsy', 'carcinoma', 'lymphoma', 'leukemia'],
        category: 'Oncology',
        severity: 'danger',
        followUpQuestions: ['What are the early warning signs of cancer?', 'How is cancer diagnosed?', 'What cancer screenings should I get?'],
        answer: `**Cancer** is the uncontrolled growth of abnormal cells that can invade and damage tissue.

**Common Cancer Types:**
• Breast Cancer — Most common in women; lump in breast, nipple discharge
• Lung Cancer — Linked to smoking; cough, blood in sputum
• Colorectal Cancer — Blood in stool, change in bowel habits
• Prostate Cancer — Difficulty urinating (men)
• Blood/Lymph Cancers — Unexplained fatigue, swollen lymph nodes

**Warning Signs (10 cancer red flags):**
1. Unexplained weight loss
2. Persistent fatigue
3. Unexplained pain
4. Lump or thickening
5. Skin changes (new mole, sore that won't heal)
6. Change in bowel/bladder habits
7. Persistent cough or hoarseness
8. Difficulty swallowing
9. Unusual bleeding or discharge
10. Indigestion or swallowing difficulty

**Diagnosis:** Biopsy, PET scan, CT scan, MRI, blood markers (PSA, CEA, CA-125).

**Treatments:** Surgery, Chemotherapy, Radiation, Immunotherapy, Targeted therapy.

🏥 *Early detection saves lives — consult an Oncologist immediately if you have persistent symptoms.*`
    },
    {
        keywords: ['asthma', 'breathing difficulty', 'shortness of breath', 'wheeze', 'wheezing', 'bronchial', 'inhaler', 'respiratory'],
        category: 'Respiratory',
        severity: 'caution',
        followUpQuestions: ['How to use an inhaler correctly?', 'What triggers asthma attacks?', 'Can asthma be cured?'],
        answer: `**Asthma** is a chronic respiratory condition causing airway inflammation and narrowing.

**Symptoms:** Wheezing, breathlessness, chest tightness, coughing (especially at night).

**Triggers:** Dust, pollen, pet dander, cold air, exercise, smoke, stress, infections.

**Severity Levels:**
- Mild Intermittent: Symptoms ≤ 2 days/week
- Mild Persistent: > 2 days/week
- Moderate Persistent: Daily symptoms
- Severe Persistent: Continuous symptoms

**Medications:**
- **Reliever (rescue):** Salbutamol/Albuterol inhaler — quick relief during attacks
- **Controller:** Inhaled corticosteroids (Budesonide, Fluticasone) — daily prevention

**First Aid for Asthma Attack:**
1. Sit upright — don't lie flat
2. Use reliever inhaler (2 puffs)
3. If no improvement in 10 mins → repeat
4. If still no response → call 112

⚠️ *Carry your rescue inhaler at all times.*`
    },
    {
        keywords: ['arthritis', 'joint pain', 'rheumatoid', 'osteoarthritis', 'joint swelling', 'knee pain', 'joint inflammation'],
        category: 'Orthopedics',
        severity: 'info',
        followUpQuestions: ['What exercises help with arthritis?', 'Is knee replacement surgery safe?', 'What foods reduce joint inflammation?'],
        answer: `**Arthritis** is inflammation of one or more joints causing pain and stiffness.

**Types:**
• **Osteoarthritis (OA)** — Wear-and-tear; common in knees, hips, hands (elderly)
• **Rheumatoid Arthritis (RA)** — Autoimmune; symmetric joint swelling, morning stiffness

**Symptoms:** Joint pain, stiffness (especially morning), swelling, reduced range of motion.

**Diagnosis:** X-ray, MRI, Blood tests (RF, Anti-CCP for RA), ESR, CRP.

**Treatment:**
- **Non-pharmacological:** Exercise (low-impact), weight loss, physiotherapy, hot/cold packs
- **Medications:** 
  - OA: Paracetamol, NSAIDs (ibuprofen), Topical diclofenac
  - RA: Methotrexate, Hydroxychloroquine, Biologic agents (infliximab)
- **Surgical:** Joint replacement (knee/hip) for severe OA

🏥 *Consult an Orthopedic surgeon or Rheumatologist for proper diagnosis.*`
    },
    {
        keywords: ['stroke', 'brain stroke', 'paralysis', 'face drooping', 'speech slurred', 'tia', 'mini stroke', 'cerebrovascular'],
        category: 'Neurology',
        severity: 'danger',
        followUpQuestions: ['What is the FAST test for stroke?', 'Can stroke be prevented?', 'What is stroke rehabilitation?'],
        answer: `**Stroke** is a medical emergency where blood supply to the brain is interrupted.

**🚨 FAST Recognition — every minute counts!**
- **F**ace drooping (one side)
- **A**rm weakness (one arm weak/numb)
- **S**peech difficulty (slurred or confused)
- **T**ime — Call 112 IMMEDIATELY!

**Types:**
• Ischemic (87%) — Blood clot blocks artery → most common
• Hemorrhagic (13%) — Blood vessel ruptures in brain

**Risk Factors:** Hypertension, diabetes, smoking, heart disease, high cholesterol, AFib.

**Prevention:**
- Control blood pressure and blood sugar
- No smoking, limit alcohol
- Exercise regularly
- Take prescribed blood thinners if needed (warfarin, aspirin)

**Treatment Window:** Clot-busting drugs (tPA) must be given within 4.5 hours.

⏱️ *Time lost = Brain cells lost. Call 112 at the first sign of stroke.*`
    },
    {
        keywords: ['fever', 'high temperature', 'pyrexia', 'temperature high', 'body temperature', 'febrile'],
        category: 'General Medicine',
        severity: 'info',
        followUpQuestions: ['When is fever dangerous?', 'How to reduce fever naturally?', 'Should I take antibiotics for fever?'],
        answer: `**Fever** is a body temperature above 37.5°C (99.5°F) — a sign the body is fighting infection.

**Temperature Classifications:**
- Normal: 36.1–37.2°C (97–99°F)
- Low-grade fever: 37.3–38°C
- Moderate fever: 38–39°C
- High fever: 39–40°C
- Hyperpyrexia (dangerous): > 40°C (104°F)

**Common Causes:** Viral infections (cold, flu, COVID-19), bacterial infections, malaria, dengue, typhoid, UTI.

**Home Management:**
- Rest and plenty of fluids (ORS, coconut water, soups)
- Paracetamol (500–1000 mg every 6–8 hrs for adults)
- Lukewarm sponging (not cold water)
- Avoid heavy clothing/blankets

**Seek Medical Help If:**
- Fever > 39.5°C that doesn't respond to paracetamol
- Fever lasting > 3 days
- Fever with rash, stiff neck, difficulty breathing, confusion
- Fever in infants < 3 months (any temperature)

🏥 *If fever is with chills, body ache, and headache — rule out malaria or dengue.*`
    },
    {
        keywords: ['malaria', 'dengue', 'chikungunya', 'typhoid', 'mosquito', 'vector', 'platelet'],
        category: 'Infectious Disease',
        severity: 'caution',
        followUpQuestions: ['How to prevent dengue?', 'What platelet count is dangerous?', 'How is malaria diagnosed?'],
        answer: `**Vector-Borne Diseases** are spread by mosquitoes and other insects.

**Malaria:**
- Cause: Plasmodium parasite via Anopheles mosquito
- Symptoms: Cyclical fever with chills, sweating, headache, body ache
- Test: Rapid Malaria Antigen test, Peripheral smear, CMFL
- Treatment: Artemisinin-based combination therapy (ACT); Chloroquine for P. vivax

**Dengue:**
- Cause: Dengue virus via Aedes mosquito
- Symptoms: High fever (102–104°F), severe headache, pain behind eyes, joint/muscle pain, rash
- Watch for: Drop in platelet count below 1 lakh, bleeding gums, red spots on skin
- Treatment: Supportive — fluids, paracetamol (NO aspirin/ibuprofen); hospitalize if platelets fall

**Typhoid:**
- Cause: Salmonella typhi via contaminated food/water
- Symptoms: Prolonged fever (step-ladder pattern), abdominal pain, diarrhea or constipation
- Test: Widal test, Blood culture (gold standard)
- Treatment: Ceftriaxone, Azithromycin

🏥 *Any prolonged fever with chills or drop in platelet count needs immediate blood tests.*`
    },
    {
        keywords: ['thyroid', 'hypothyroid', 'hyperthyroid', 'tsh', 'thyroxine', 'goiter', 'hashimoto', 'graves'],
        category: 'Endocrinology',
        severity: 'info',
        followUpQuestions: ['Can thyroid be cured permanently?', 'What foods affect thyroid?', 'Is thyroid medication lifelong?'],
        answer: `**Thyroid Disease** affects the gland that controls metabolism.

**Hypothyroidism (Underactive thyroid):**
- TSH: High | T4: Low
- Symptoms: Fatigue, weight gain, cold intolerance, dry skin, hair loss, depression, constipation
- Treatment: Levothyroxine (once daily, on empty stomach)

**Hyperthyroidism (Overactive thyroid):**
- TSH: Low | T4: High
- Symptoms: Weight loss, palpitations, heat intolerance, sweating, anxiety, tremors, frequent stools
- Treatment: Methimazole, Propylthiouracil, Radioiodine therapy, Surgery

**Normal Thyroid Values:**
- TSH: 0.4–4.0 mIU/L
- Free T4: 0.8–1.8 ng/dL
- Free T3: 2.3–4.2 pg/mL

**Hashimoto's:** Autoimmune hypothyroidism (most common cause)
**Graves' Disease:** Autoimmune hyperthyroidism with eye protrusion (exophthalmos)

🏥 *Thyroid function tests (TSH, T3, T4) can be done at any diagnostic lab.*`
    },
    {
        keywords: ['anemia', 'hemoglobin', 'iron deficiency', 'low hemoglobin', 'pallor', 'blood count', 'hb low'],
        category: 'Hematology',
        severity: 'caution',
        followUpQuestions: ['What foods increase hemoglobin?', 'How long does iron treatment take?', 'What causes anemia in women?'],
        answer: `**Anemia** is a condition where red blood cells or hemoglobin are below normal.

**Normal Hemoglobin:**
- Men: 13.5–17.5 g/dL
- Women: 12.0–15.5 g/dL
- Children: 11–13 g/dL

**Severity:**
- Mild: Hb 10–12 g/dL
- Moderate: Hb 7–10 g/dL
- Severe: Hb < 7 g/dL

**Types & Causes:**
• Iron Deficiency (most common) — poor diet, blood loss, malabsorption
• Vitamin B12/Folate Deficiency — vegetarian diet, malabsorption
• Sickle Cell, Thalassemia — inherited
• Aplastic Anemia — bone marrow failure
• Anemia of Chronic Disease

**Symptoms:** Fatigue, pallor, dizziness, breathlessness on exertion, palpitations, cold hands/feet.

**Treatment:**
- Iron tablets (ferrous sulfate 200 mg twice daily with Vitamin C)
- B12 injections or oral supplements
- Folate supplements (folic acid)
- Treat underlying cause

🏥 *A blood CBC test is the first step to diagnose anemia.*`
    },
    {
        keywords: ['allergy', 'allergic', 'allergic reaction', 'hives', 'urticaria', 'anaphylaxis', 'antihistamine', 'pollen allergy'],
        category: 'Allergy',
        severity: 'caution',
        followUpQuestions: ['How to identify food allergies?', 'What is anaphylaxis emergency treatment?', 'Can allergies be cured?'],
        answer: `**Allergies** occur when the immune system overreacts to harmless substances.

**Common Allergens:**
- Food: Peanuts, tree nuts, shellfish, milk, eggs, wheat, soy
- Environmental: Pollen, dust mites, mold, pet dander
- Medications: Penicillin, aspirin, NSAIDs, sulfa drugs
- Insect stings: Bees, wasps
- Contact: Latex, nickel, certain plants

**Symptoms:**
- Mild: Runny nose, sneezing, watery eyes, skin rash, itching
- Moderate: Swelling, hives (urticaria), asthma
- Severe (Anaphylaxis 🚨): Throat swelling, difficulty breathing, drop in BP

**🚨 Anaphylaxis — Life-threatening Emergency:**
1. Inject Epinephrine (EpiPen) immediately
2. Call 112
3. Lay patient flat with legs elevated

**Treatment:**
- Antihistamines: Cetirizine, Loratadine, Fexofenadine (non-drowsy)
- Topical Corticosteroids for skin reactions
- Nasal steroids: Fluticasone for allergic rhinitis
- Immunotherapy (allergy shots) for long-term management
- Avoid known triggers`
    },
    {
        keywords: ['covid', 'coronavirus', 'covid-19', 'sars-cov-2', 'covid symptoms', 'covid treatment', 'covid vaccine'],
        category: 'Infectious Disease',
        severity: 'caution',
        followUpQuestions: ['What are long COVID symptoms?', 'When should I go to hospital for COVID?', 'Are COVID boosters necessary?'],
        answer: `**COVID-19** is caused by the SARS-CoV-2 coronavirus.

**Common Symptoms:**
- Fever, chills, fatigue
- Dry cough, shortness of breath
- Loss of taste/smell (anosmia)
- Body aches, headache
- Sore throat, congestion
- Nausea, diarrhea

**Severity Levels:**
- Mild (~80%): Managed at home
- Moderate: Hospitalization may be needed
- Severe: ICU care, oxygen support or ventilator

**Home Care (Mild):**
- Rest, hydration, paracetamol for fever/pain
- Monitor oxygen with pulse oximeter
- Isolate from others for 5–10 days
- **Seek care if SpO2 < 94% or breathlessness worsens**

**Vaccines:** COVID-19 vaccines significantly reduce severity and death — get vaccinated and boosted.

**When to Go to Hospital:**
- SpO2 below 94%
- Severe breathlessness
- Persistent chest pain
- Confusion or unresponsiveness

🏥 *Consult a doctor for COVID antiviral medications (e.g., Molnupiravir, Paxlovid) if high-risk.*`
    },
    {
        keywords: ['migraine', 'headache', 'tension headache', 'cluster headache', 'headache behind eyes', 'head pain', 'throbbing head'],
        category: 'Neurology',
        severity: 'info',
        followUpQuestions: ['What triggers migraines?', 'How to prevent frequent headaches?', 'When is a headache a medical emergency?'],
        answer: `**Headache Types and Management:**

**Tension Headache** (most common):
- Triggers: Stress, dehydration, eye strain, poor posture
- Character: Bilateral pressing/squeezing, mild-moderate
- Treatment: Paracetamol, NSAIDs, stretching, rest

**Migraine:**
- Phases: Prodrome → Aura (sometimes) → Headache → Postdrome
- Character: Unilateral throbbing, severe, with nausea/photophobia/phonophobia
- Triggers: Bright light, hormonal changes, stress, certain foods (cheese, wine, chocolate)
- Acute treatment: Triptans (Sumatriptan), NSAIDs, Ergotamine
- Prevention: Beta-blockers (Propranolol), Amitriptyline, Topiramate, Valproate

**Cluster Headache:**
- Severe unilateral orbital pain, watery eye, nasal congestion
- Occurs in clusters (daily attacks for weeks)
- Treatment: High-flow oxygen, Sumatriptan injection

**🚨 "Thunderclap Headache"** (worst headache of life, sudden onset) → Emergency! May indicate subarachnoid hemorrhage.

**Red flags requiring immediate attention:**
- Sudden severe headache
- Headache with fever and stiff neck
- Headache after head injury
- Progressive worsening over days`
    },
    {
        keywords: ['depression', 'mental health', 'anxiety', 'stress', 'panic attack', 'ocd', 'schizophrenia', 'bipolar', 'ptsd', 'sad', 'suicidal'],
        category: 'Mental Health',
        severity: 'caution',
        followUpQuestions: ['How to manage anxiety at home?', 'What are signs of clinical depression?', 'Where can I get mental health help?'],
        answer: `**Mental Health is just as important as physical health.**

**Depression:**
- Symptoms: Persistent sadness, loss of interest, fatigue, sleep changes, concentration issues, feelings of worthlessness
- Treatment: Psychotherapy (CBT), Antidepressants (SSRIs: Escitalopram, Sertraline), lifestyle changes

**Anxiety Disorders:**
- Symptoms: Excessive worry, restlessness, racing heart, sweating, difficulty concentrating
- Treatment: CBT, SSRIs/SNRIs, Beta-blockers (for acute symptoms), Mindfulness

**Panic Attacks:**
- Sudden, intense fear with physical symptoms (racing heart, chest pain, breathlessness)
- Management: Controlled breathing (4-7-8 technique), Benzodiazepines (short-term)

**When to Seek Immediate Help:**
- Thoughts of self-harm or suicide — **Call iCall: 9152987821 (India)**
- Psychosis symptoms (hallucinations, delusions)
- Inability to care for oneself

**Self-Help Strategies:**
- Regular exercise (30 min/day — as effective as antidepressants for mild depression)
- Sleep hygiene (7–9 hours)
- Social connection
- Mindfulness and meditation
- Limit alcohol and caffeine

🏥 *Seeing a Psychiatrist or Psychologist is a sign of strength, not weakness.*`
    },
    {
        keywords: ['diarrhea', 'loose stool', 'dysentery', 'gastroenteritis', 'food poisoning', 'stomach infection', 'vomiting and diarrhea'],
        category: 'Gastroenterology',
        severity: 'caution',
        followUpQuestions: ['How to make ORS at home?', 'When is diarrhea an emergency?', 'What foods to eat during diarrhea?'],
        answer: `**Diarrhea & Gastroenteritis** — Causes, Treatment & Prevention

**Common Causes:**
- Viral: Norovirus, Rotavirus (most common)
- Bacterial: E. coli, Salmonella, Shigella (often food/water contamination)
- Parasitic: Giardia, Amoeba
- Medications: Antibiotics disrupting gut flora

**Warning Signs (Seek Medical Attention):**
- Blood in stool (dysentery)
- Fever > 38.5°C
- Diarrhea > 3 days
- Signs of dehydration: dry mouth, no urine, dizziness

**Home Rehydration (ORS Recipe):**
Mix in 1 litre of clean water:
- 6 teaspoons sugar + 1/2 teaspoon salt
OR use standard ORS sachets

**Diet During Diarrhea (BRAT):**
- B: Bananas
- R: Rice
- A: Applesauce / boiled apple
- T: Toast / dry bread

**Medications:**
- ORS for rehydration
- Zinc (20 mg/day for children)
- Loperamide (adults only, not in bloody diarrhea)
- Antibiotics ONLY if bacterial (prescribed by doctor)

⚠️ *Avoid dairy, fatty foods, raw vegetables, and fruit juices during acute diarrhea.*`
    },
    {
        keywords: ['pregnancy', 'prenatal', 'maternity', 'antenatal', 'trimester', 'obstetric', 'fetal', 'baby kicks', 'morning sickness'],
        category: 'Obstetrics',
        severity: 'info',
        followUpQuestions: ['What foods to avoid during pregnancy?', 'What are danger signs in pregnancy?', 'What prenatal tests are important?'],
        answer: `**Pregnancy Guide — Trimester by Trimester**

**First Trimester (Weeks 1–12):**
- Morning sickness, breast tenderness, fatigue, frequent urination
- Start folic acid (400–800 mcg/day) ASAP — prevents neural tube defects
- First scan: Dating scan at 6–8 weeks; NT scan at 11–13 weeks

**Second Trimester (Weeks 13–26):**
- Generally the most comfortable period
- Anatomy scan at 18–20 weeks
- Feel fetal movements from ~18–20 weeks (first-time mothers) or ~16 weeks (experienced)
- Start Iron and Calcium supplements

**Third Trimester (Weeks 27–40):**
- Back pain, heartburn, Braxton Hicks contractions
- Kick counting: > 10 kicks in 2 hours (weeks 28+)
- GBS screening at 35–37 weeks
- Prepare birth plan

**Essential Antenatal Tests:**
- Blood group, Rh factor
- CBC, Blood sugar (diabetes screening)
- TORCH panel
- HIV, Hepatitis B, Syphilis
- Thyroid (TSH)

**⚠️ Warning Signs — Go to Hospital Immediately:**
- Vaginal bleeding
- Severe abdominal pain
- No fetal movement
- Severe headache, vision changes (preeclampsia)
- Fluid leaking from vagina (water breaking)

🏥 *Regular antenatal check-ups are critical — at least 8 visits recommended.*`
    },
    {
        keywords: ['skin', 'rash', 'eczema', 'psoriasis', 'acne', 'dermatitis', 'itching', 'fungal', 'ringworm', 'pimple', 'wart'],
        category: 'Dermatology',
        severity: 'info',
        followUpQuestions: ['How to treat acne at home?', 'What causes eczema flare-ups?', 'Is psoriasis curable?'],
        answer: `**Common Skin Conditions**

**Acne:**
- Causes: Excess sebum, bacteria, hormonal changes
- Treatment: Benzoyl peroxide, Salicylic acid, Tretinoin (topical), Antibiotics (moderate), Isotretinoin (severe)

**Eczema (Atopic Dermatitis):**
- Red, itchy, inflamed skin in flexural areas
- Triggers: Soaps, detergents, stress, allergens
- Treatment: Emollients (moisturizers daily), Topical corticosteroids, Antihistamines for itch

**Psoriasis:**
- Chronic autoimmune — silver scaly plaques on scalp, elbows, knees
- Treatment: Topical steroids, Vitamin D analogues, Phototherapy, Biologics (severe)

**Fungal Infections (Tinea/Ringworm):**
- Ring-shaped, red/scaly, itchy patches
- Treatment: Topical Clotrimazole, Miconazole; Oral Fluconazole for widespread/resistant

**Urticaria (Hives):**
- Itchy wheals; allergic/stress-triggered
- Treatment: Antihistamines (Cetirizine, Fexofenadine)

**Chickenpox (Varicella):**
- Itchy vesicular rash spreading from face to trunk
- Treatment: Calamine lotion, cool baths, Acyclovir for severe/immunocompromised

🏥 *For persistent or worsening skin conditions, see a Dermatologist.*`
    },
    {
        keywords: ['first aid', 'burn', 'bleeding', 'wound', 'cut', 'fracture', 'broken bone', 'choking', 'drowning', 'cpr', 'cardiac arrest'],
        category: 'First Aid',
        severity: 'danger',
        followUpQuestions: ['How to do CPR?', 'What to do for a burn?', 'How to help someone who is choking?'],
        answer: `**Emergency First Aid Guide 🚨**

**Cardiac Arrest / Unresponsive Person:**
1. Shout for help. Call 112.
2. Check breathing (< 10 seconds)
3. Start CPR: 30 chest compressions + 2 rescue breaths
4. Continue until ambulance arrives or person recovers

**Choking (Adult/Child > 1 year):**
1. Encourage coughing if they can
2. 5 back blows (between shoulder blades)
3. 5 abdominal thrusts (Heimlich maneuver)
4. Alternate until object expelled; call 112

**Severe Bleeding:**
1. Apply firm direct pressure with clean cloth
2. Do not remove cloth; add more if soaked
3. Elevate the limb above heart level
4. Call 112 if bleeding doesn't stop

**Burns:**
- **Minor**: Cool under running water 20 minutes; don't use ice/butter/toothpaste; cover with sterile dressing
- **Major (large area / face / genitals / deep)**: Call 112; cover with clean damp cloth

**Seizure:**
1. Clear area, put nothing in mouth
2. Place person on side (recovery position)
3. Time the seizure
4. Call 112 if lasts > 5 minutes or repeated

**Suspected Fracture:**
- Immobilize the limb
- Apply ice pack wrapped in cloth
- Do NOT attempt to realign
- Go to emergency or call 112

🚨 **Always call 112 in life-threatening emergencies!**`
    },
    {
        keywords: ['nutrition', 'diet', 'healthy food', 'vitamins', 'minerals', 'protein', 'calories', 'balanced diet', 'weight loss', 'obesity', 'bmi'],
        category: 'Nutrition',
        severity: 'info',
        followUpQuestions: ['What is a balanced diet?', 'How many calories do I need daily?', 'What supplements should I take?'],
        answer: `**Nutrition & Healthy Diet Guide 🥗**

**Balanced Plate (Indian Meal Plan):**
- 50% Vegetables & Fruits
- 25% Whole Grains (brown rice, roti, oats, millets)
- 25% Protein (dal, paneer, eggs, chicken, fish, tofu)
- Plus: Healthy fats (ghee, nuts, seeds in moderation)

**Key Nutrients:**
| Nutrient | Function | Sources |
|---|---|---|
| Protein | Muscle/repair | Eggs, dal, paneer, meat, soy |
| Iron | Blood health | Spinach, jaggery, red meat |
| Calcium | Bones/teeth | Milk, curd, ragi, sesame |
| Vitamin D | Immunity/bones | Sunlight, fatty fish, fortified milk |
| B12 | Nerves/blood | Eggs, meat, dairy (supplement if vegan) |
| Folate | Cell division | Green leafy veg, pulses, fortified cereals |

**BMI (Body Mass Index):**
- Underweight: < 18.5
- Normal: 18.5–24.9
- Overweight: 25–29.9
- Obese: ≥ 30

**Healthy Habits:**
- Drink 8–10 glasses of water/day
- Eat 3 meals + 2 small snacks
- Reduce ultra-processed food, sugar, salt
- 150 min moderate or 75 min vigorous exercise/week

🏥 *Consult a Dietitian for a personalized meal plan.*`
    },
    {
        keywords: ['sleep', 'insomnia', 'sleep disorder', 'not sleeping', 'sleep apnea', 'oversleep', 'sleep deprivation'],
        category: 'Sleep Medicine',
        severity: 'info',
        followUpQuestions: ['How to fall asleep faster?', 'What causes insomnia?', 'Is sleep apnea dangerous?'],
        answer: `**Sleep Health & Insomnia Guide 😴**

**Recommended Sleep Duration:**
- Adults: 7–9 hours
- Teenagers: 8–10 hours
- Children (6–12 yrs): 9–12 hours
- Infants (4–12 months): 12–16 hours

**Insomnia Types:**
- Acute: Stress-related, short-term
- Chronic: > 3 nights/week for > 3 months

**Good Sleep Hygiene (Sleep Habits):**
1. Fixed wake-up time (even weekends)
2. Avoid screens 1 hour before bed
3. Keep room dark, cool (18–20°C), quiet
4. Avoid caffeine after 2 PM
5. No alcohol or heavy meals before sleep
6. Brief daytime nap (< 20 min) if needed

**Sleep Apnea Signs:**
- Loud snoring, stopping breathing during sleep, gasping
- Daytime sleepiness despite full night's sleep
- → Requires sleep study (polysomnography) + CPAP therapy

**When Medication May Help (Short-term only):**
- Melatonin (0.5–5 mg, 30 min before bed) — for circadian reset
- Antihistamines (Diphenhydramine) — mild short-term
- Prescription: Zolpidem, Eszopiclone (only with doctor)

🏥 *Cognitive Behavioral Therapy for Insomnia (CBT-I) is the most effective long-term treatment.*`
    },
    {
        keywords: ['blood test', 'lab report', 'cbc', 'complete blood count', 'wbc', 'rbc', 'platelet', 'esr', 'crp', 'liver function', 'lft', 'kft', 'kidney function'],
        category: 'Laboratory',
        severity: 'info',
        followUpQuestions: ['What does high WBC count mean?', 'How to read my blood test report?', 'When should I get blood tests done?'],
        answer: `**Understanding Common Blood Test Results 🧪**

**CBC (Complete Blood Count):**
| Parameter | Normal Range |
|---|---|
| Hemoglobin (men) | 13.5–17.5 g/dL |
| Hemoglobin (women) | 12.0–15.5 g/dL |
| WBC (White Blood Cells) | 4,000–11,000 /µL |
| Platelets | 1.5–4.0 lakh /µL |
| Neutrophils | 50–70% of WBC |

**Liver Function Tests (LFT):**
| Test | Normal |
|---|---|
| SGPT (ALT) | 7–56 U/L |
| SGOT (AST) | 10–40 U/L |
| Bilirubin (total) | 0.3–1.2 mg/dL |
| Albumin | 3.5–5.0 g/dL |

**Kidney Function Tests (KFT):**
| Test | Normal |
|---|---|
| Creatinine (men) | 0.7–1.3 mg/dL |
| Blood Urea | 7–20 mg/dL |
| Uric Acid (men) | 3.4–7.0 mg/dL |

**Inflammation Markers:**
- ESR (men) < 15 mm/hr; (women) < 20 mm/hr
- CRP: < 1 mg/L (normal); > 10 mg/L (significant inflammation)

**Thyroid:** TSH 0.4–4.0 mIU/L | Blood Sugar (fasting): 70–100 mg/dL

🏥 *Always interpret results with your doctor — context matters!*`
    },
    {
        keywords: ['vaccine', 'vaccination', 'immunization', 'booster', 'dose', 'measles', 'hepatitis', 'bcg', 'polio', 'flu vaccine'],
        category: 'Preventive Medicine',
        severity: 'info',
        followUpQuestions: ['What vaccines do adults need?', 'Are vaccines safe?', 'What is the vaccination schedule for babies?'],
        answer: `**Vaccination Guide 💉**

**India's National Immunization Schedule (Key Vaccines):**
| Age | Vaccines |
|---|---|
| Birth | BCG, OPV-0, Hepatitis B-1 |
| 6 weeks | OPV-1, IPV-1, Penta-1, RV-1, PCV-1 |
| 10 weeks | OPV-2, Penta-2, RV-2, PCV-2 |
| 14 weeks | OPV-3, IPV-2, Penta-3, RV-3, PCV-3 |
| 9–12 months | MR-1, JE-1, Vitamin A |
| 16–24 months | DPT, OPV, MR-2, Vitamin A |

**Adult Vaccines to Consider:**
- Influenza (Flu): Annually, everyone ≥ 6 months
- COVID-19: Primary series + boosters
- Hepatitis B: If not vaccinated in childhood
- Typhoid: Every 3 years if endemic area
- HPV: Girls & boys 9–26 years (prevents cervical cancer)
- Pneumococcal: Adults ≥ 65 or with chronic disease
- Tdap: Every 10 years (tetanus/diphtheria booster)

**Travel Vaccines (Consult travel medicine clinic):**
- Cholera, Yellow Fever, Meningococcal, Japanese Encephalitis

🏥 *All standard vaccines are available free at government health centres.*`
    },
    {
        keywords: ['pain killer', 'paracetamol', 'ibuprofen', 'aspirin', 'antibiotic', 'amoxicillin', 'dosage', 'medication', 'drug', 'medicine', 'side effect', 'prescription'],
        category: 'Pharmacology',
        severity: 'caution',
        followUpQuestions: ['What is the correct dosage for paracetamol?', 'Can I take ibuprofen with other medicines?', 'Why should I complete the antibiotic course?'],
        answer: `**Common Medications Guide 💊**

**Pain Relievers:**
| Drug | Use | Adult Dose | Caution |
|---|---|---|---|
| Paracetamol | Fever, mild-mod pain | 500–1000 mg every 6–8 hrs | Max 4g/day; liver disease caution |
| Ibuprofen | Pain, inflammation | 400 mg every 8 hrs with food | Avoid: kidney disease, gastric ulcers, pregnancy 3rd trimester |
| Aspirin | Blood thinner, mild pain | 75–100 mg (low dose for heart) | Avoid in children < 16; Reye's risk |

**Antibiotics (Always Complete the Course):**
| Drug | Use |
|---|---|
| Amoxicillin | Throat, ear, chest infections |
| Azithromycin | Atypical pneumonia, skin infections |
| Ciprofloxacin | UTI, GI infections |
| Metronidazole | Anaerobic, parasitic infections |
| Ceftriaxone | Severe hospital infections (IV) |

⚠️ **Never self-prescribe antibiotics** — leads to antibiotic resistance!

**Antihistamines (Allergy):**
- Cetirizine 10 mg or Loratadine 10 mg once daily (non-drowsy)
- Diphenhydramine — older, sedating (avoid driving)

**Important Safety Rules:**
- Always take the full course of antibiotics
- Never crush coated or extended-release tablets
- Check for food-drug interactions (e.g., grapefruit + statins)
- Store medications as directed (cool, dry, out of reach of children)

🏥 *All prescription medications require a valid doctor's prescription.*`
    },

    // ═══════════════════════════════════════════════════
    //  CHILDREN'S HEALTH
    // ═══════════════════════════════════════════════════
    {
        keywords: ['child health', 'pediatric', 'baby', 'infant', 'newborn', 'child fever', 'child diarrhea', 'child nutrition', 'growth chart', 'child development'],
        category: 'Pediatrics',
        severity: 'info',
        followUpQuestions: ['What is the vaccination schedule for babies?', 'When should I take my child to a doctor?', 'What are normal developmental milestones?'],
        answer: `**Children's Health Guide 👶**

**Newborn Care:**
- Breastfeed exclusively for 6 months — No water, no formula unless medically needed
- Normal newborn: 2.5–4.5 kg at birth; loses 5–10% weight in first week (normal)
- Skin-to-skin contact (kangaroo care) is vital

**Growth Milestones:**
- 2 months: Smiles, follows movement
- 4 months: Holds head, reaches for objects
- 6 months: Sits with support, starts solid foods
- 9 months: Crawls, waves bye-bye
- 12 months: Stands, says 1–2 words
- 18 months: Walks well, 10–20 words

**Danger Signs in Infants (Seek Immediate Care):**
- Not feeding/drinking for > 8 hours
- Convulsions/fits
- Very fast or difficult breathing
- Fever in a baby < 3 months (any temperature)
- Sunken fontanelle (dehydration sign)
- Baby not waking/very lethargic

**Solid Foods Introduction (6 months+):**
- Start with single grain cereals, pureed vegetables, fruit, then mashed foods
- Introduce one new food every 3 days
- Avoid: honey (< 1 yr), salt, added sugar, whole nuts, raw carrots

**Common Childhood Illnesses:**
- Fever: Paracetamol drops by weight; tepid sponging
- Diarrhea: ORS + zinc drops; continue breastfeeding
- Cough: Steam inhalation; NO cough syrups under 2 years

🏥 *Regular growth monitoring at an ASHA centre or pediatrician is important.*`
    },

    // ═══════════════════════════════════════════════════
    //  ADDITIONAL CONDITIONS — EXPANDED KB
    // ═══════════════════════════════════════════════════
    {
        keywords: ['uti', 'urinary tract infection', 'urine infection', 'burning urine', 'frequent urination', 'painful urination', 'cystitis'],
        category: 'Urology',
        severity: 'caution',
        followUpQuestions: ['What antibiotics treat UTI?', 'How to prevent recurring UTIs?', 'When should I see a urologist?'],
        answer: `**Urinary Tract Infection (UTI)** is an infection in any part of the urinary system.

**Symptoms:** Burning during urination, frequent urge to urinate, cloudy/strong-smelling urine, lower abdominal pain, blood in urine.

**Risk Factors:** Women (short urethra), poor hydration, holding urine, kidney stones, catheter use, diabetes.

**Diagnosis:** Urine routine + culture sensitivity test.

**Treatment:**
- Antibiotics: Nitrofurantoin, Ciprofloxacin, Ceftriaxone (as per culture)
- Drink 3+ litres of water/day
- Cranberry juice may help prevention

⚠️ *Untreated UTI can spread to kidneys (pyelonephritis) — seek medical attention if fever develops.*
🏥 *Consult a Urologist or General Physician.*`
    },
    {
        keywords: ['back pain', 'lower back', 'spine', 'lumbar', 'sciatica', 'slip disc', 'slipped disc', 'herniated disc', 'spondylosis'],
        category: 'Orthopedics',
        severity: 'info',
        followUpQuestions: ['What exercises help with back pain?', 'When is back surgery needed?', 'What is the best sleeping position for back pain?'],
        answer: `**Back Pain** is one of the most common reasons for doctor visits.

**Common Causes:**
• Muscle strain/sprain (most common)
• Disc herniation (slip disc) — pain radiating to leg (sciatica)
• Spondylosis — age-related wear of spinal joints
• Spinal stenosis — narrowing of spinal canal
• Poor posture, prolonged sitting

**Red Flags (Seek Immediate Care):**
- Loss of bladder/bowel control
- Progressive leg weakness/numbness
- Fever with back pain
- History of trauma/fall

**Management:**
- Acute: Rest (1–2 days max), ice/heat packs, paracetamol/NSAIDs
- Chronic: Physiotherapy, core strengthening, yoga, swimming
- Avoid: Bed rest > 2 days, heavy lifting with bent back

**Prevention:**
- Maintain good posture
- Ergonomic workstation setup
- Regular exercise (core strength)
- Proper lifting technique (bend knees, not back)

🏥 *See an Orthopedic surgeon or Spine specialist if pain persists > 6 weeks or has red flags.*`
    },
    {
        keywords: ['eye', 'vision', 'cataract', 'glaucoma', 'myopia', 'eye pain', 'blurry vision', 'dry eye', 'conjunctivitis', 'pink eye', 'ophthalmology'],
        category: 'Ophthalmology',
        severity: 'info',
        followUpQuestions: ['How often should I get an eye exam?', 'What are signs of glaucoma?', 'Can myopia be reversed?'],
        answer: `**Common Eye Conditions**

**Refractive Errors:**
• Myopia (nearsightedness) — can see close, not far
• Hyperopia (farsightedness) — can see far, not close
• Astigmatism — blurry vision at all distances
• Presbyopia — age-related difficulty reading (starts ~40 years)

**Cataract:** Clouding of the eye lens; common in elderly; treated with surgery (phacoemulsification)
**Glaucoma:** Increased eye pressure damaging the optic nerve; silent vision thief; treated with eye drops or surgery
**Conjunctivitis (Pink Eye):** Viral/bacterial/allergic eye redness and discharge; treated with eye drops
**Dry Eye:** Insufficient tears; treated with artificial tears, omega-3 supplements

**Eye Care Tips:**
- 20-20-20 rule: Every 20 min, look 20 feet away for 20 seconds
- Annual eye exams after age 40
- Wear UV-protective sunglasses outdoors
- Never rub eyes vigorously

🏥 *See an Ophthalmologist for any sudden vision changes, eye pain, or flashes of light.*`
    },
    {
        keywords: ['ear', 'hearing', 'ear pain', 'ear infection', 'tinnitus', 'vertigo', 'dizziness', 'otitis', 'hearing loss', 'ent'],
        category: 'ENT',
        severity: 'info',
        followUpQuestions: ['What causes persistent ringing in ears?', 'How is vertigo treated?', 'When should I get a hearing test?'],
        answer: `**Ear, Nose & Throat (ENT) Issues**

**Ear Infections (Otitis):**
• Outer ear (swimmer's ear): Pain on pulling earlobe; treated with antibiotic ear drops
• Middle ear: Common in children; fever, ear pain; may need oral antibiotics

**Tinnitus (Ringing in Ears):** Buzzing/ringing sound; causes include noise exposure, age, medications, ear wax buildup.

**Vertigo (Dizziness/Spinning):**
• BPPV (most common): Positional vertigo triggered by head movements; treated with Epley maneuver
• Meniere's disease: Episodes of vertigo with hearing loss and tinnitus
• Labyrinthitis: Viral inflammation of inner ear

**When to Seek Help:**
- Sudden hearing loss (emergency!)
- Ear discharge (blood or pus)
- Vertigo with headache, vision changes, or weakness
- Persistent tinnitus affecting daily life

🏥 *Consult an ENT specialist for persistent ear issues.*`
    },
    {
        keywords: ['dental', 'tooth', 'teeth', 'toothache', 'cavity', 'gum', 'gingivitis', 'tooth decay', 'wisdom tooth', 'dental care', 'oral health'],
        category: 'Dentistry',
        severity: 'info',
        followUpQuestions: ['How to prevent cavities?', 'When should wisdom teeth be removed?', 'What causes gum bleeding?'],
        answer: `**Dental & Oral Health Guide 🦷**

**Common Dental Problems:**
• **Cavities (Dental Caries):** Tooth decay from bacteria + sugar; treated with fillings, root canal, or extraction
• **Gingivitis:** Red, swollen, bleeding gums; reversible with proper brushing + flossing
• **Periodontitis:** Advanced gum disease; irreversible bone loss; needs scaling and surgery
• **Wisdom Tooth:** Often impacted; causes pain, swelling; may need surgical removal

**Dental Care Basics:**
- Brush twice daily (2 minutes, soft-bristled brush)
- Floss daily
- Use fluoride toothpaste
- Limit sugary foods and acidic drinks
- Dental checkup and cleaning every 6 months

**Dental Emergencies:**
- Knocked-out tooth: Keep in milk, see dentist within 30 mins
- Severe toothache: Ibuprofen + clove oil; see dentist ASAP
- Broken tooth: Rinse mouth, cold compress, see dentist

🏥 *Regular dental checkups prevent most dental problems. Visit a Dentist every 6 months.*`
    },
    {
        keywords: ['liver', 'hepatitis', 'jaundice', 'fatty liver', 'cirrhosis', 'liver disease', 'liver function', 'liver failure', 'bilirubin high'],
        category: 'Gastroenterology',
        severity: 'caution',
        followUpQuestions: ['What diet is good for liver health?', 'Can fatty liver be reversed?', 'What are signs of liver failure?'],
        answer: `**Liver Diseases**

**Fatty Liver (NAFLD/AFLD):**
- Non-alcoholic: Linked to obesity, diabetes, high cholesterol
- Alcoholic: From excess alcohol consumption
- Usually reversible with lifestyle changes (diet, exercise, weight loss)

**Hepatitis (Liver Inflammation):**
| Type | Transmission | Vaccine |
|---|---|---|
| Hep A | Contaminated food/water | Yes |
| Hep B | Blood, sexual contact | Yes |
| Hep C | Blood (needles, transfusion) | No |
| Hep E | Contaminated water | Limited |

**Jaundice:** Yellow skin/eyes due to high bilirubin; causes include hepatitis, bile duct obstruction, hemolysis.

**Cirrhosis:** Late-stage scarring of liver; causes: chronic alcohol use, hepatitis B/C, fatty liver; leads to liver failure.

**Symptoms of Liver Disease:** Fatigue, yellowish skin, dark urine, right upper abdominal pain, swelling (ascites), easy bruising.

**Prevention:** Limit alcohol, maintain healthy weight, get vaccinated (Hep A & B), avoid sharing needles, practice safe sex.

🏥 *Consult a Gastroenterologist or Hepatologist for liver concerns.*`
    },
    {
        keywords: ['stomach', 'gastric', 'acidity', 'ulcer', 'gerd', 'acid reflux', 'heartburn', 'bloating', 'gas', 'indigestion', 'peptic ulcer', 'h pylori'],
        category: 'Gastroenterology',
        severity: 'info',
        followUpQuestions: ['What foods help with acid reflux?', 'How is H. pylori diagnosed?', 'When is gastric ulcer an emergency?'],
        answer: `**Gastric & Digestive Issues**

**GERD (Acid Reflux):**
- Symptoms: Heartburn, chest burning, regurgitation, sour taste, chronic cough
- Triggers: Spicy/fatty food, alcohol, caffeine, lying down after eating, obesity
- Treatment: PPIs (Omeprazole, Pantoprazole), antacids, lifestyle changes

**Peptic Ulcer:**
- Open sore in stomach/duodenum; often caused by H. pylori bacteria or NSAIDs
- Symptoms: Burning epigastric pain (improves/worsens with food), nausea, bleeding
- Diagnosis: Upper GI endoscopy, H. pylori breath test/stool antigen
- Treatment: Triple therapy for H. pylori (PPI + Amoxicillin + Clarithromycin)

**Bloating & Gas:**
- Causes: Swallowing air, high-fiber foods, lactose intolerance, IBS
- Relief: Simethicone, peppermint tea, probiotics, eat slowly

**When to Worry:**
- Vomiting blood or coffee-ground vomit
- Black tarry stools (melena)
- Severe sudden abdominal pain
- Unintentional weight loss

🏥 *See a Gastroenterologist for persistent digestive issues.*`
    },
    {
        keywords: ['cholesterol', 'lipid', 'ldl', 'hdl', 'triglycerides', 'high cholesterol', 'statin', 'lipid profile'],
        category: 'Cardiovascular',
        severity: 'caution',
        followUpQuestions: ['What foods lower cholesterol?', 'Do I need statins?', 'What is the ideal cholesterol level?'],
        answer: `**Cholesterol & Lipid Health**

**Normal Lipid Profile:**
| Parameter | Desirable | Borderline | High Risk |
|---|---|---|---|
| Total Cholesterol | < 200 mg/dL | 200–239 | ≥ 240 |
| LDL (bad) | < 100 mg/dL | 130–159 | ≥ 160 |
| HDL (good) | ≥ 60 mg/dL | 40–59 | < 40 (low) |
| Triglycerides | < 150 mg/dL | 150–199 | ≥ 200 |

**Why It Matters:** High LDL/Triglycerides → atherosclerosis → heart attack/stroke.

**Dietary Changes:**
- Increase: Oats, nuts, olive oil, fatty fish, beans, fruits, vegetables
- Reduce: Fried food, red meat, full-fat dairy, processed snacks, trans fats

**Medications:** Statins (Atorvastatin, Rosuvastatin) — prescribed if lifestyle changes insufficient or high cardiovascular risk.

**Lifestyle:** Exercise 150 min/week, maintain ideal weight, quit smoking, limit alcohol.

🏥 *Get a fasting lipid profile test annually after age 35.*`
    },
    {
        keywords: ['pneumonia', 'lung infection', 'chest infection', 'lower respiratory', 'bronchitis', 'copd', 'lung disease', 'emphysema'],
        category: 'Respiratory',
        severity: 'caution',
        followUpQuestions: ['How is pneumonia diagnosed?', 'What is the difference between bronchitis and pneumonia?', 'Can COPD be reversed?'],
        answer: `**Lung & Respiratory Infections**

**Pneumonia:**
- Infection of lung tissue (bacterial, viral, or fungal)
- Symptoms: High fever, productive cough (yellow/green sputum), breathlessness, chest pain on breathing
- Diagnosis: Chest X-ray, blood tests, sputum culture
- Treatment: Antibiotics (Amoxicillin, Azithromycin, Ceftriaxone); hospitalize if severe

**Bronchitis:**
- Inflammation of bronchial tubes; usually viral
- Acute: Cough with mucus for 1–3 weeks; self-limiting
- Chronic: Part of COPD; cough > 3 months/year for 2 years

**COPD (Chronic Obstructive Pulmonary Disease):**
- Progressive lung disease from smoking/pollution
- Includes chronic bronchitis + emphysema
- Symptoms: Chronic cough, excess sputum, breathlessness on exertion
- Treatment: Inhalers (bronchodilators + corticosteroids), pulmonary rehab, oxygen therapy
- **#1 Prevention: QUIT SMOKING**

🏥 *See a Pulmonologist for persistent cough, breathlessness, or smoking-related lung issues.*`
    },
    {
        keywords: ['epilepsy', 'seizure', 'fits', 'convulsion', 'epileptic', 'absence seizure'],
        category: 'Neurology',
        severity: 'caution',
        followUpQuestions: ['What triggers seizures?', 'Can epilepsy be cured?', 'What to do if someone is having a seizure?'],
        answer: `**Epilepsy & Seizures**

**What is Epilepsy?** A neurological condition causing recurrent unprovoked seizures due to abnormal brain electrical activity.

**Types of Seizures:**
• Generalized tonic-clonic (grand mal) — full body convulsions, loss of consciousness
• Absence (petit mal) — brief staring spells, common in children
• Focal (partial) — starts in one area; may spread

**First Aid for Seizures:**
1. Stay calm, time the seizure
2. Move sharp objects away
3. Turn person on their side (recovery position)
4. Do NOT put anything in mouth
5. Do NOT restrain the person
6. Call 112 if seizure lasts > 5 minutes or is the first seizure

**Treatment:** Antiepileptic drugs (Valproate, Levetiracetam, Carbamazepine, Phenytoin) — must take daily without missing doses.

**Lifestyle:** Adequate sleep, avoid alcohol, manage stress, avoid known triggers.

🏥 *See a Neurologist for diagnosis and ongoing management.*`
    },
    {
        keywords: ['diabetes diet', 'diabetic food', 'sugar diet', 'what to eat diabetes', 'diabetes meal plan', 'glycemic index'],
        category: 'Nutrition - Diabetes',
        severity: 'info',
        followUpQuestions: ['What fruits can I eat with diabetes?', 'Is rice bad for diabetics?', 'What snacks are safe for diabetics?'],
        answer: `**Diabetic Diet Guide 🥗**

**Foods to INCLUDE:**
- Vegetables: Spinach, broccoli, bitter gourd (karela), methi, cabbage
- Proteins: Eggs, fish, chicken, paneer, tofu, lentils/dal
- Whole grains: Brown rice, oats, ragi, bajra, whole wheat roti
- Healthy fats: Nuts (almonds, walnuts), seeds (flax, chia), olive oil
- Low-GI fruits: Guava, apple, pear, berries, papaya (in moderation)

**Foods to AVOID:**
- White rice, maida/refined flour products, white bread
- Sugary drinks (cola, packaged juice, sweetened tea)
- Sweets, mithai, cakes, biscuits
- Fried foods, fast food
- Excessive potatoes, bananas, mangoes, grapes

**Meal Timing:**
- Eat every 3–4 hours (3 meals + 2 snacks)
- Never skip breakfast
- Dinner at least 2 hours before sleeping
- Consistent timing helps stabilize blood sugar

**Glycemic Index (GI) Guide:**
- Low GI (< 55): Best — oats, dal, most vegetables
- Medium GI (56–69): Moderate — basmati rice, whole wheat bread
- High GI (> 70): Avoid — white rice, potato, watermelon

🏥 *Consult a Dietitian for a personalized diabetic meal plan.*`
    },
    {
        keywords: ['pcos', 'pcod', 'polycystic', 'irregular periods', 'ovarian cyst', 'menstrual', 'period problem', 'period pain', 'dysmenorrhea', 'amenorrhea'],
        category: 'Gynecology',
        severity: 'info',
        followUpQuestions: ['Can PCOS be cured?', 'What is the best diet for PCOS?', 'Does PCOS affect fertility?'],
        answer: `**PCOS / PCOD & Menstrual Health**

**PCOS (Polycystic Ovary Syndrome):**
- Hormonal disorder causing enlarged ovaries with small cysts
- Affects 1 in 10 women of reproductive age

**Symptoms:** Irregular/absent periods, excess facial/body hair (hirsutism), acne, weight gain, hair thinning, difficulty conceiving.

**Diagnosis:** Ultrasound, blood tests (LH, FSH, Testosterone, DHEAS, Insulin, Thyroid).

**Treatment:**
- Lifestyle: Weight loss (even 5–10% improves symptoms), exercise, low-GI diet
- Medications: Combined OCP (for cycle regulation), Metformin (insulin resistance), Spironolactone (for hair/acne)
- Fertility: Clomiphene, Letrozole, or IVF if needed

**Period Pain (Dysmenorrhea):**
- Primary: No underlying disease; cramping on day 1–2
- Secondary: Due to endometriosis, fibroids, adenomyosis
- Relief: Ibuprofen, heating pad, exercise, hormonal contraceptives

🏥 *Consult a Gynecologist for irregular periods, PCOS management, or fertility concerns.*`
    },
    {
        keywords: ['constipation', 'hard stool', 'irregular bowel', 'ibs', 'irritable bowel', 'bowel movement', 'piles', 'hemorrhoids', 'fissure'],
        category: 'Gastroenterology',
        severity: 'info',
        followUpQuestions: ['What foods relieve constipation?', 'When is constipation serious?', 'How to treat hemorrhoids at home?'],
        answer: `**Constipation & Bowel Health**

**Constipation:** Fewer than 3 bowel movements per week, hard/dry stools, straining.

**Causes:** Low fiber diet, dehydration, sedentary lifestyle, medications (opioids, antacids), thyroid issues, IBS.

**Home Remedies:**
- Increase fiber: Fruits, vegetables, whole grains, psyllium husk (isabgol)
- Drink 8–10 glasses of water daily
- Regular exercise (30 min walk)
- Establish a routine (same time daily)
- Probiotics (curd, yogurt)

**IBS (Irritable Bowel Syndrome):**
- Chronic condition: abdominal pain, bloating, alternating diarrhea/constipation
- Triggers: Stress, certain foods (FODMAPs)
- Treatment: Dietary modification (low FODMAP), antispasmodics, stress management

**Hemorrhoids (Piles):**
- Swollen veins around anus; caused by straining, pregnancy, chronic constipation
- Symptoms: Bleeding during defecation, itching, lump
- Treatment: Sitz baths, fiber supplements, topical creams, surgery (if severe)

🏥 *See a Gastroenterologist for persistent bowel issues or blood in stool.*`
    },
    {
        keywords: ['dehydration', 'electrolyte', 'ors', 'oral rehydration', 'heatstroke', 'heat exhaustion', 'sunstroke'],
        category: 'General Medicine',
        severity: 'caution',
        followUpQuestions: ['How to make ORS at home?', 'Signs of severe dehydration?', 'How much water should I drink daily?'],
        answer: `**Dehydration & Heat-Related Illness**

**Signs of Dehydration:**
- Mild: Thirst, dry mouth, dark yellow urine, headache
- Moderate: Very dry mouth, reduced urination, dizziness, rapid heartbeat
- Severe: No urination, sunken eyes, confusion, fainting — **EMERGENCY**

**ORS (Oral Rehydration Solution) Recipe:**
Mix in 1 litre of clean water:
- 6 level teaspoons of sugar
- 1/2 level teaspoon of salt
- Sip frequently; do not gulp

**Heatstroke vs Heat Exhaustion:**
| | Heat Exhaustion | Heatstroke 🚨 |
|---|---|---|
| Temperature | < 40°C | ≥ 40°C |
| Skin | Sweaty, cool | Hot, dry, red |
| Consciousness | Alert but weak | Confused/unconscious |
| Treatment | Rest, fluids, cool place | **Call 112** — ice packs, cool water |

**Prevention in Hot Weather:**
- Drink water regularly (don't wait for thirst)
- Avoid direct sun 12–3 PM
- Wear light, loose clothing
- Never leave children/pets in parked cars

🏥 *Severe dehydration or heatstroke needs immediate emergency care.*`
    },
    {
        keywords: ['obesity', 'weight management', 'overweight', 'weight loss surgery', 'bariatric', 'metabolism', 'calories burned'],
        category: 'Nutrition',
        severity: 'info',
        followUpQuestions: ['How many calories should I eat to lose weight?', 'What exercises burn the most fat?', 'Is bariatric surgery safe?'],
        answer: `**Obesity & Weight Management**

**BMI Classification:**
- Underweight: < 18.5
- Normal: 18.5–24.9
- Overweight: 25–29.9
- Obese Class I: 30–34.9
- Obese Class II: 35–39.9
- Morbidly Obese: ≥ 40

**Health Risks of Obesity:** Type 2 diabetes, heart disease, stroke, sleep apnea, certain cancers, joint problems, fatty liver.

**Weight Loss Fundamentals:**
- Calorie deficit: Consume less than you burn (500 cal/day deficit = ~0.5 kg/week loss)
- Protein-rich diet: Keeps you full, preserves muscle
- Exercise: 150 min moderate + 2× strength training per week
- Sleep: 7–9 hours (poor sleep increases hunger hormones)

**Bariatric Surgery (BMI ≥ 35 with comorbidities or ≥ 40):**
- Sleeve gastrectomy, Roux-en-Y gastric bypass
- Significant long-term weight loss and diabetes remission
- Requires lifelong dietary modifications

**Avoid:** Crash diets, detox teas, fat-burning pills, spot reduction myths.

🏥 *Consult a Bariatric surgeon or Endocrinologist for medical weight management.*`
    },
    {
        keywords: ['vitamin d', 'vitamin b12', 'vitamin deficiency', 'iron deficiency', 'calcium deficiency', 'supplement', 'micronutrient'],
        category: 'Nutrition',
        severity: 'info',
        followUpQuestions: ['What are symptoms of vitamin D deficiency?', 'Should I take supplements?', 'Best food sources for B12?'],
        answer: `**Common Vitamin & Mineral Deficiencies**

**Vitamin D Deficiency (Very Common in India):**
- Symptoms: Bone pain, fatigue, muscle weakness, frequent infections, depression
- Normal: 30–100 ng/mL | Deficient: < 20 ng/mL
- Sources: Sunlight (15–20 min/day), fatty fish, fortified milk, egg yolks
- Supplement: Cholecalciferol 60,000 IU weekly for 8 weeks (if deficient)

**Vitamin B12 Deficiency:**
- Common in vegetarians and elderly
- Symptoms: Fatigue, numbness/tingling in hands/feet, memory issues, glossitis
- Normal: 200–900 pg/mL | Deficient: < 200 pg/mL
- Sources: Eggs, meat, dairy, fortified cereals
- Supplement: B12 injections or oral methylcobalamin

**Iron Deficiency:**
- Most common nutritional deficiency worldwide
- Symptoms: Fatigue, pallor, brittle nails, ice cravings (pica)
- Sources: Spinach, jaggery, red meat, beans, fortified cereals
- Take with Vitamin C (lemon water) for better absorption

**Calcium Deficiency:**
- Risk: Osteoporosis, fractures, muscle cramps
- Sources: Milk, curd, ragi, sesame seeds, almonds
- Need: 1000 mg/day adults; 1200 mg/day after 50

🏥 *Get tested before starting supplements. Excess can be harmful.*`
    },
    {
        keywords: ['malnutrition', 'underweight', 'weight gain', 'too thin', 'eating disorder', 'anorexia', 'bulimia'],
        category: 'Nutrition',
        severity: 'caution',
        followUpQuestions: ['How can I gain weight healthily?', 'What are signs of an eating disorder?', 'When to see a doctor for being underweight?'],
        answer: `**Malnutrition & Eating Disorders**

**Underweight (BMI < 18.5):**
- Causes: Inadequate diet, chronic illness, hyperthyroidism, celiac disease, depression
- Health risks: Weakened immunity, osteoporosis, anemia, fertility issues

**Healthy Weight Gain Tips:**
- Increase calories by 300–500/day with nutrient-dense foods (not junk)
- Eat 5–6 smaller meals/day
- Add healthy fats: Ghee, nuts, peanut butter, avocado, olive oil
- Protein: Eggs, paneer, chicken, lentils, protein shakes
- Strength training to build muscle mass

**Eating Disorders (Mental Health Condition):**
• **Anorexia Nervosa** — Severe food restriction, fear of gaining weight, distorted body image
• **Bulimia Nervosa** — Binge eating followed by purging (vomiting, laxatives)
• **Binge Eating Disorder** — Uncontrolled eating without purging

**Warning Signs:** Dramatic weight loss, obsession with calories, avoiding meals, excessive exercise, dental problems (from purging).

⚠️ *Eating disorders are serious mental health conditions requiring professional help.*
🏥 *Consult a Psychiatrist and Dietitian together for comprehensive treatment.*`
    },
    {
        keywords: ['prostate', 'prostate cancer', 'psa', 'prostate enlargement', 'bph', 'urinary difficulty men'],
        category: 'Urology',
        severity: 'caution',
        followUpQuestions: ['What PSA level is concerning?', 'What are treatment options for BPH?', 'At what age should prostate screening start?'],
        answer: `**Prostate Health (Men)**

**BPH (Benign Prostatic Hyperplasia):**
- Enlarged prostate (non-cancerous); common after age 50
- Symptoms: Weak urine stream, frequency, urgency, incomplete emptying, nocturia
- Treatment: Alpha-blockers (Tamsulosin), 5-alpha reductase inhibitors (Finasteride), surgery (TURP)

**Prostate Cancer:**
- Most common cancer in men over 50
- Often slow-growing; may cause no symptoms initially
- Screening: PSA blood test + Digital Rectal Exam (DRE)
- PSA: Normal < 4 ng/mL; elevated needs further workup (not always cancer)
- Treatment: Active surveillance, surgery, radiation, hormonal therapy

**When to See a Urologist:**
- Difficulty urinating or weak stream
- Blood in urine
- Frequent night-time urination
- PSA > 4 ng/mL

🏥 *Men over 50 should discuss prostate screening with their doctor.*`
    },
    {
        keywords: ['osteoporosis', 'bone density', 'weak bones', 'bone loss', 'fracture risk', 'calcium', 'dexa scan'],
        category: 'Orthopedics',
        severity: 'info',
        followUpQuestions: ['How to prevent osteoporosis?', 'Who should get a DEXA scan?', 'Best exercises for bone health?'],
        answer: `**Osteoporosis (Weak Bones)**

**What is it?** Bones become porous, brittle, and prone to fractures. Often called the "silent disease" — no symptoms until a fracture.

**Risk Factors:** Post-menopausal women, age > 60, family history, low calcium intake, vitamin D deficiency, smoking, sedentary lifestyle, steroid use.

**Diagnosis:** DEXA scan (bone mineral density test)
- T-score > -1: Normal
- T-score -1 to -2.5: Osteopenia (low bone mass)
- T-score < -2.5: Osteoporosis

**Prevention & Treatment:**
- Calcium: 1000–1200 mg/day (dairy, ragi, sesame, almonds)
- Vitamin D: 600–800 IU/day (sunlight + supplements if needed)
- Weight-bearing exercise: Walking, jogging, climbing stairs, dancing
- Medications: Bisphosphonates (Alendronate, Zoledronic acid), Denosumab
- Fall prevention: Good lighting, handrails, non-slip mats

🏥 *Women over 50 and men over 70 should get a DEXA scan.*`
    },
    {
        keywords: ['tuberculosis', 'tb', 'cough blood', 'night sweats', 'mantoux', 'tuberculin'],
        category: 'Infectious Disease',
        severity: 'danger',
        followUpQuestions: ['How long is TB treatment?', 'Is TB contagious?', 'What is MDR-TB?'],
        answer: `**Tuberculosis (TB)**

**What is TB?** A bacterial infection (Mycobacterium tuberculosis) primarily affecting lungs, but can affect any organ.

**Symptoms:**
- Persistent cough > 2 weeks (with/without blood)
- Night sweats, low-grade evening fever
- Unexplained weight loss
- Fatigue, loss of appetite

**Diagnosis:**
- Sputum AFB microscopy + GeneXpert (MTB/RIF)
- Chest X-ray
- Mantoux/Tuberculin skin test
- Blood: IGRA (Interferon Gamma Release Assay)

**Treatment (DOTS — Directly Observed Therapy):**
- Intensive phase (2 months): HRZE (Isoniazid + Rifampicin + Pyrazinamide + Ethambutol)
- Continuation phase (4 months): HR (Isoniazid + Rifampicin)
- **Total: 6 months minimum — NEVER stop early!**

**MDR-TB (Multi-Drug Resistant):** Resistant to first-line drugs; requires 9–20 months of intensive treatment.

⚠️ *TB is curable but ONLY if the full course is completed. Stopping early causes drug resistance.*
🏥 *Free TB treatment is available at all government health centers (NTEP).*`
    },
    {
        keywords: ['std', 'sti', 'sexual health', 'hiv', 'aids', 'herpes', 'gonorrhea', 'syphilis', 'chlamydia', 'sexually transmitted'],
        category: 'Sexual Health',
        severity: 'caution',
        followUpQuestions: ['How soon should I get tested after exposure?', 'Can STIs be cured?', 'Where can I get confidential STI testing?'],
        answer: `**Sexually Transmitted Infections (STIs)**

**Common STIs:**
| STI | Symptoms | Treatment |
|---|---|---|
| Chlamydia | Often none; discharge, burning | Azithromycin/Doxycycline |
| Gonorrhea | Discharge, painful urination | Ceftriaxone + Azithromycin |
| Syphilis | Painless sore → rash → organ damage | Penicillin injection |
| Herpes (HSV) | Painful blisters/sores | Acyclovir (manages, no cure) |

**HIV/AIDS:**
- Transmitted via unprotected sex, contaminated blood/needles, mother-to-child
- Window period: 2–12 weeks after exposure before test turns positive
- Treatment: Antiretroviral Therapy (ART) — lifelong, makes virus undetectable
- **PEP** (Post-Exposure Prophylaxis): Must be started within 72 hours of exposure

**Prevention:**
- Consistent condom use
- Get tested regularly if sexually active
- HPV vaccination (prevents cervical + other cancers)
- Pre-exposure prophylaxis (PrEP) for high-risk individuals

⚠️ *Many STIs have no symptoms. Regular testing is the only way to know.*
🏥 *Confidential STI/HIV testing available at ICTC (Integrated Counselling & Testing Centres).*`
    },
    {
        keywords: ['smoking', 'quit smoking', 'tobacco', 'nicotine', 'vaping', 'e-cigarette', 'lung cancer risk'],
        category: 'Preventive Medicine',
        severity: 'caution',
        followUpQuestions: ['What are the best methods to quit smoking?', 'How long before lungs recover after quitting?', 'Is vaping safer than smoking?'],
        answer: `**Smoking Cessation Guide 🚭**

**Health Damage from Smoking:**
- Lung cancer, COPD, chronic bronchitis
- Heart disease, stroke
- Oral/throat/bladder cancer
- Poor wound healing, skin aging
- Reduced fertility in both sexes

**Benefits After Quitting (Timeline):**
- 20 min: Heart rate drops
- 12 hrs: CO levels in blood normalize
- 2–12 weeks: Circulation improves, lung function increases
- 1–9 months: Coughing decreases
- 1 year: Heart disease risk halved
- 10 years: Lung cancer risk halved

**How to Quit:**
1. Set a quit date
2. Nicotine Replacement Therapy (NRT): Patches, gum, lozenges
3. Medications: Varenicline (Champix) — most effective; Bupropion
4. Behavioral support: Counseling, Quitline (1800-11-2356)
5. Avoid triggers: Alcohol, stress, smoking friends

**Vaping:** NOT safe; still contains nicotine + harmful chemicals. Not FDA-approved for cessation.

🏥 *Consult a Pulmonologist or addiction specialist for quitting support.*`
    },
    {
        keywords: ['exercise', 'fitness', 'workout', 'physical activity', 'gym', 'yoga', 'cardio', 'strength training', 'walking'],
        category: 'Fitness',
        severity: 'info',
        followUpQuestions: ['How much exercise do I need per week?', 'Best exercises for beginners?', 'Is walking enough exercise?'],
        answer: `**Exercise & Physical Activity Guide 🏃‍♂️**

**WHO Recommendations:**
- Adults: 150 min moderate OR 75 min vigorous exercise/week + 2× strength training
- Children/Adolescents: 60 min moderate-vigorous activity daily

**Types of Exercise:**
| Type | Examples | Benefits |
|---|---|---|
| Cardio | Walking, jogging, cycling, swimming | Heart health, endurance, weight loss |
| Strength | Weight lifting, bodyweight exercises | Muscle, bone density, metabolism |
| Flexibility | Yoga, stretching | Joint mobility, injury prevention |
| Balance | Tai chi, single-leg stands | Fall prevention (elderly) |

**Beginner Plan (Week 1–4):**
- Walk 30 min/day at brisk pace
- Add bodyweight exercises: Squats, push-ups, planks (10 min)
- Stretch after every session (5 min)

**Exercise for Specific Conditions:**
- Diabetes: Walking, cycling — lowers blood sugar
- Heart disease: Moderate cardio (doctor-approved)
- Back pain: Core strengthening, swimming
- Depression/Anxiety: Any exercise — proven mood booster

⚠️ *Start slowly and increase gradually. Listen to your body.*
🏥 *Get a fitness assessment before starting intense exercise if you have heart disease, uncontrolled BP, or are over 45.*`
    },
    {
        keywords: ['breast cancer', 'mammogram', 'breast lump', 'breast self exam', 'breast pain'],
        category: 'Oncology',
        severity: 'caution',
        followUpQuestions: ['When should I start mammogram screening?', 'Are all breast lumps cancerous?', 'What does breast cancer treatment involve?'],
        answer: `**Breast Health & Breast Cancer**

**Breast Self-Examination (BSE) — Monthly:**
1. Stand before a mirror, arms raised — check for dimpling, asymmetry, nipple changes
2. Lie down flat — use pads of fingers to feel for lumps in circular motions
3. Check armpits for swollen lymph nodes
4. Best time: 7 days after period starts

**Warning Signs:**
- New lump or thickening in breast/armpit
- Change in size, shape, or skin (orange peel texture)
- Nipple discharge (especially bloody)
- Nipple inversion (new)
- Persistent breast pain in one spot

**Screening:**
- Mammogram: Women ≥ 40 years every 1–2 years
- High-risk women (family history, BRCA gene): MRI + mammogram from age 30

**Treatment Options:** Lumpectomy, mastectomy, chemotherapy, radiation, hormonal therapy (Tamoxifen), targeted therapy (Herceptin).

⚠️ *Most breast lumps are NOT cancer (often fibroadenoma or cyst), but all lumps should be checked.*
🏥 *Consult a Breast Surgeon or Oncologist for any breast lump.*`
    },
    {
        keywords: ['alcohol', 'drinking', 'liver cirrhosis alcohol', 'alcohol addiction', 'alcoholism', 'binge drinking'],
        category: 'Addiction Medicine',
        severity: 'caution',
        followUpQuestions: ['How much alcohol is too much?', 'What are the signs of alcohol addiction?', 'How to reduce alcohol consumption?'],
        answer: `**Alcohol & Health**

**Safe Drinking Limits (approx):**
- Men: ≤ 2 standard drinks/day
- Women: ≤ 1 standard drink/day
- 1 standard drink = 330 ml beer = 150 ml wine = 45 ml spirits

**Health Risks of Excess Alcohol:**
- Fatty liver → Alcoholic hepatitis → Cirrhosis
- Pancreatitis (acute & chronic)
- Heart disease (cardiomyopathy)
- Depression, anxiety, sleep disruption
- Increased cancer risk (mouth, liver, breast, colon)
- Nutritional deficiencies (B1, B12, folate)

**Signs of Alcohol Use Disorder:**
- Inability to cut down despite wanting to
- Drinking more than intended
- Neglecting responsibilities
- Withdrawal symptoms (tremors, sweating, anxiety, seizures)

**Treatment:**
- Counseling & behavioral therapy
- Medications: Disulfiram (Antabuse), Naltrexone, Acamprosate
- Support groups: Alcoholics Anonymous (AA)
- Detox under medical supervision for heavy drinkers

🏥 *Seek help from a Psychiatrist or addiction specialist. Recovery is possible.*`
    },
    {
        keywords: ['hernia', 'inguinal hernia', 'umbilical hernia', 'abdominal bulge', 'groin swelling'],
        category: 'Surgery',
        severity: 'info',
        followUpQuestions: ['Does hernia always need surgery?', 'What are signs of a strangulated hernia?', 'Recovery time after hernia surgery?'],
        answer: `**Hernia**

**What is a Hernia?** An organ or tissue pushing through a weakness in the muscle or surrounding tissue wall.

**Common Types:**
• **Inguinal** (most common) — groin region; mostly in men
• **Umbilical** — around belly button; common in infants
• **Hiatal** — stomach pushes through diaphragm into chest
• **Incisional** — through previous surgical incision

**Symptoms:** Bulge that increases on coughing/straining, heaviness, dull ache, pain during lifting.

**🚨 Strangulated Hernia (Emergency):**
- Bulge becomes hard, tender, and cannot be pushed back
- Nausea, vomiting, severe pain
- Requires emergency surgery — blood supply to organ is cut off

**Treatment:**
- Small, asymptomatic: Watchful waiting (under medical guidance)
- Symptomatic: Surgery (laparoscopic mesh repair preferred)
- Recovery: 1–2 weeks (laparoscopic); 4–6 weeks (open)

🏥 *Consult a General Surgeon for hernia evaluation.*`
    },
    {
        keywords: ['appendicitis', 'appendix', 'right side pain', 'lower right abdomen', 'appendix burst'],
        category: 'Surgery',
        severity: 'danger',
        followUpQuestions: ['What are the first signs of appendicitis?', 'How is appendicitis diagnosed?', 'What happens if appendix bursts?'],
        answer: `**Appendicitis**

**What is it?** Inflammation of the appendix (small pouch near the junction of small and large intestine).

**Classic Symptoms:**
1. Pain starts around navel → moves to RIGHT LOWER abdomen (within 12–24 hrs)
2. Pain worsens with coughing, walking, or pressing
3. Nausea, vomiting, loss of appetite
4. Low-grade fever
5. Point tenderness at McBurney's point (1/3 distance from hip bone to navel)

**🚨 THIS IS A SURGICAL EMERGENCY**
- Untreated appendicitis can rupture → peritonitis → life-threatening infection

**Diagnosis:** Physical exam, blood tests (high WBC), ultrasound, CT scan.

**Treatment:** Appendectomy (surgical removal) — usually laparoscopic. Recovery 1–3 weeks.

**When to Go to ER:**
- Severe right lower abdominal pain
- Pain with fever and nausea
- Pain that suddenly gets worse then temporarily improves (possible rupture)

🏥 *Do NOT take painkillers to mask the pain — go to the Emergency Room immediately.*`
    },
    {
        keywords: ['food allergy', 'gluten', 'celiac', 'lactose intolerance', 'food intolerance', 'wheat allergy', 'nut allergy'],
        category: 'Allergy',
        severity: 'caution',
        followUpQuestions: ['How is food allergy different from intolerance?', 'Can celiac disease be cured?', 'What are gluten-free alternatives?'],
        answer: `**Food Allergies & Intolerances**

**Food Allergy vs Intolerance:**
| | Allergy | Intolerance |
|---|---|---|
| Mechanism | Immune system reaction | Digestive issue |
| Severity | Can be life-threatening | Uncomfortable but not dangerous |
| Onset | Minutes to hours | Hours to days |
| Amount | Tiny amount triggers | Dose-dependent |

**Common Food Allergies:** Peanuts, tree nuts, milk, eggs, shellfish, wheat, soy, fish — can cause anaphylaxis.

**Lactose Intolerance:** Cannot digest milk sugar; symptoms: bloating, gas, diarrhea after dairy. Solution: Lactose-free dairy, enzyme supplements, plant milk.

**Celiac Disease:** Autoimmune reaction to gluten (wheat, barley, rye); damages small intestine villi; symptoms: diarrhea, bloating, fatigue, weight loss, nutrient deficiencies.
- Diagnosis: tTG-IgA blood test, endoscopy with biopsy
- Treatment: Strict lifelong gluten-free diet (no wheat, barley, rye, most processed foods)

**Gluten-Free Alternatives:** Rice, corn, quinoa, millets (ragi, jowar, bajra), buckwheat, oats (certified GF).

🏥 *See an Allergist or Gastroenterologist for proper diagnosis. Self-diagnosis can be misleading.*`
    },
    {
        keywords: ['gallstone', 'gallbladder', 'bile', 'cholecystitis', 'gallbladder attack', 'biliary colic'],
        category: 'Surgery',
        severity: 'caution',
        followUpQuestions: ['Can gallstones be dissolved without surgery?', 'What diet prevents gallstones?', 'What happens during gallbladder surgery?'],
        answer: `**Gallstones & Gallbladder Disease**

**What are Gallstones?** Hardened deposits (cholesterol or bilirubin stones) in the gallbladder.

**Symptoms:**
- Right upper abdominal pain (biliary colic) — often after fatty meals
- Pain radiating to right shoulder or back
- Nausea, vomiting, bloating
- **Acute Cholecystitis:** Persistent pain + fever + tenderness (infected/inflamed gallbladder)

**Risk Factors (4 F's):** Female, Forty+, Fat (obese), Fertile (pregnancy/hormones).

**Diagnosis:** Ultrasound abdomen (best initial test), LFT, MRCP for bile duct stones.

**Treatment:**
- Asymptomatic: Usually no treatment needed
- Symptomatic: **Laparoscopic Cholecystectomy** (gallbladder removal) — gold standard
- Can live normally without gallbladder — bile flows directly from liver to intestine

**Diet After Surgery:** Low-fat diet for initial weeks; gradually return to normal.

🏥 *See a General Surgeon for gallstone management.*`
    },
    {
        keywords: ['panic', 'anxiety attack', 'cant breathe', 'hyperventilating', 'palpitations', 'racing heart', 'heart racing', 'shaking'],
        category: 'Mental Health',
        severity: 'caution',
        followUpQuestions: ['How do I stop a panic attack?', 'When is a racing heart serious?', 'Should I see a cardiologist or psychiatrist?'],
        answer: `**Panic Attack vs Heart Attack — Know the Difference**

| Feature | Panic Attack | Heart Attack |
|---|---|---|
| Pain | Sharp, stabbing | Pressure, squeezing |
| Location | Central chest | Left chest, radiates |
| Duration | 10–30 minutes peak | Gets worse over time |
| Breathing | Hyperventilation | Shortness of breath |
| Other | Tingling, fear of dying | Nausea, cold sweat |
| Age/Risk | Any age, anxiety history | Usually 45+, risk factors |

**⚠️ When in doubt, ALWAYS treat as heart attack — call 112!**

**How to Stop a Panic Attack:**
1. **4-7-8 Breathing:** Inhale 4 sec → Hold 7 sec → Exhale 8 sec
2. **Grounding (5-4-3-2-1):** Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste
3. Remind yourself: "This is a panic attack. It will pass. I am safe."
4. Avoid fighting it — let the wave pass
5. Cold water on face/wrists can help

**Long-term Management:** CBT therapy, SSRIs, regular exercise, stress management, adequate sleep.

🏥 *First-time chest symptoms should always be evaluated in an ER to rule out cardiac causes.*`
    },
    {
        keywords: ['wound care', 'wound healing', 'stitch', 'suture', 'tetanus', 'dog bite', 'animal bite', 'rabies'],
        category: 'Emergency Medicine',
        severity: 'caution',
        followUpQuestions: ['When does a wound need stitches?', 'What is the rabies vaccination schedule?', 'How to prevent wound infection?'],
        answer: `**Wound Care & Animal Bites**

**Basic Wound Care:**
1. Wash hands; clean wound with clean running water
2. Apply gentle pressure with clean cloth if bleeding
3. Apply antiseptic (Betadine/Povidone-iodine)
4. Cover with sterile dressing/bandage
5. Change dressing daily; watch for infection signs

**When Stitches Are Needed:**
- Deep wound (fat/muscle visible)
- Edges don't come together
- Wound > 1 cm long
- On face, hands, or joints
- Active bleeding that doesn't stop

**Tetanus Booster:** Needed if wound is dirty and last booster was > 5 years ago.

**Dog/Animal Bite (Rabies Risk):**
1. Wash wound thoroughly with soap and running water for 15 minutes
2. Apply Betadine/alcohol
3. **Do NOT suture bite wounds (initially)**
4. Go to hospital immediately for:
   - Anti-Rabies Vaccine (ARV): Days 0, 3, 7, 14, 28
   - Rabies Immunoglobulin (RIG): If unprovoked bite by unknown or stray animal
5. **Rabies is 100% fatal once symptoms appear — vaccination is the only prevention**

🏥 *Any animal bite needs immediate medical attention. Do not delay vaccination.*`
    },
    {
        keywords: ['sore throat', 'tonsils', 'tonsillitis', 'pharyngitis', 'throat pain', 'strep throat', 'difficulty swallowing'],
        category: 'ENT',
        severity: 'info',
        followUpQuestions: ['Is sore throat viral or bacterial?', 'When do tonsils need to be removed?', 'Home remedies for sore throat?'],
        answer: `**Sore Throat & Tonsillitis**

**Common Causes:**
- Viral (most common ~80%): Cold, flu, COVID-19, mononucleosis
- Bacterial (~20%): Streptococcus (strep throat)
- Allergies, dry air, acid reflux, irritants (smoking)

**Viral vs Bacterial:**
| Feature | Viral | Strep (Bacterial) |
|---|---|---|
| Cough | Usually present | Absent |
| Fever | Low grade | High (> 38.3°C) |
| Tonsils | Slightly red | Red, swollen, white patches |
| Treatment | Supportive | Antibiotics (Amoxicillin) |

**Home Remedies:**
- Warm salt water gargle (1/2 tsp in 1 cup warm water)
- Warm liquids: Honey-lemon tea, soup
- Lozenges/throat spray for pain relief
- Stay hydrated; rest voice

**When to See a Doctor:**
- Severe pain or difficulty swallowing/breathing
- Fever > 38.5°C
- Symptoms > 1 week
- Recurrent tonsillitis (> 5–7 episodes/year → consider tonsillectomy)

🏥 *See an ENT specialist for recurrent tonsillitis or persistent sore throat.*`
    },
    {
        keywords: ['sprain', 'strain', 'sports injury', 'muscle tear', 'ligament', 'tendon', 'rice method', 'ankle sprain'],
        category: 'Orthopedics',
        severity: 'info',
        followUpQuestions: ['How long does a sprain take to heal?', 'Should I use ice or heat?', 'When is imaging needed for sprains?'],
        answer: `**Sprains, Strains & Sports Injuries**

**Sprain vs Strain:**
- **Sprain:** Stretching/tearing of a ligament (connects bone to bone) — ankle, knee, wrist
- **Strain:** Stretching/tearing of a muscle or tendon — hamstring, back, calf

**RICE Method (First 48–72 hours):**
- **R**est: Avoid weight-bearing; use crutches if needed
- **I**ce: 20 minutes on, 20 minutes off (wrap ice in cloth)
- **C**ompression: Elastic bandage (not too tight)
- **E**levation: Above heart level to reduce swelling

**Severity:**
- Grade 1 (Mild): Stretching, minor tearing — heals in 2–4 weeks
- Grade 2 (Moderate): Partial tear — 4–8 weeks
- Grade 3 (Severe): Complete tear — may need surgery

**When to Seek Medical Help:**
- Unable to bear weight
- Significant swelling or bruising
- Joint feels unstable or locks
- Numbness below the injury
- No improvement after 3 days of RICE

**Prevention:** Warm-up before exercise, proper footwear, strengthen stabilizer muscles, don't push through pain.

🏥 *See an Orthopedic surgeon or Sports Medicine specialist for Grade 2–3 injuries.*`
    }
];

/**
 * Find the best answer from the knowledge base for a given query.
 * Returns { answer, category, severity } or null if no match found.
 */
function findMedicalAnswer(query) {
    const lower = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of MEDICAL_KB) {
        const score = entry.keywords.filter(kw => lower.includes(kw)).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    return bestScore > 0 ? bestMatch : null;
}

module.exports = { MEDICAL_KB, findMedicalAnswer };
