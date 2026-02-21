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
