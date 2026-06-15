const fs = require('fs');
const path = require('path');

const contextDir = path.join('c:', 'Users', 'Rishav Gupta', 'OneDrive', 'Desktop', 'Biovault', 'src', 'context');

// Helper to load JSON
function loadJson(filename) {
  const filePath = path.join(contextDir, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

// Helper to save JSON
function saveJson(filename, data) {
  const filePath = path.join(contextDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENHANCE CORE MEDS
// ─────────────────────────────────────────────────────────────────────────────
console.log("Starting Core Meds enhancement...");
let meds = loadJson('core_meds.json');
const existingMeds = new Set(meds.map(m => m.generic_name.toLowerCase()));

const medsToAdd = [
  {
    generic_name: "linezolid",
    brand_names: ["Zyvox"],
    category: "medicine",
    drug_class: "Oxazolidinone Antibiotic",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["600mg"],
    half_life_hours: 5,
    absorption_notes: "Can be taken with or without food. Avoid high-tyramine foods (aged cheese, red wine) as it acts as a reversible MAOI.",
    gastric_irritant: false,
    aliases: ["zyvox", "linezolid"]
  },
  {
    generic_name: "dextromethorphan",
    brand_names: ["Delsym", "Robitussin", "Mucinex DM"],
    category: "medicine",
    drug_class: "Antitussive (Cough Suppressant)",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["30mg", "60mg"],
    half_life_hours: 4,
    absorption_notes: "Take with or without food. Inhibits serotonin reuptake; risk of serotonin syndrome with SSRIs/MAOIs.",
    gastric_irritant: false,
    aliases: ["dm", "cough medicine", "dextromethorphan"]
  },
  {
    generic_name: "pseudoephedrine",
    brand_names: ["Sudafed", "Nexafed"],
    category: "medicine",
    drug_class: "Decongestant / Sympathomimetic",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["30mg", "60mg", "120mg"],
    half_life_hours: 6,
    absorption_notes: "CNS stimulant; take in the morning to avoid insomnia. Avoid taking with caffeine or other stimulants.",
    gastric_irritant: false,
    aliases: ["sudafed", "decongestant", "pseudoephedrine"]
  },
  {
    generic_name: "phenylephrine",
    brand_names: ["Sudafed PE", "Neo-Synephrine"],
    category: "medicine",
    drug_class: "Decongestant",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["10mg"],
    half_life_hours: 3,
    absorption_notes: "Systemic vasoconstrictor; may elevate blood pressure.",
    gastric_irritant: false,
    aliases: ["sudafed pe", "phenylephrine"]
  },
  {
    generic_name: "guanfacine",
    brand_names: ["Tenex", "Intuniv"],
    category: "medicine",
    drug_class: "Alpha-2 Adrenergic Agonist",
    optimal_slot: "BEFORE_BED",
    requires_food: false,
    common_doses: ["1mg", "2mg", "3mg", "4mg"],
    half_life_hours: 18,
    absorption_notes: "Do not take with high-fat meals as it significantly increases absorption and risk of side effects (hypotension).",
    gastric_irritant: false,
    aliases: ["intuniv", "tenex", "guanfacine"]
  },
  {
    generic_name: "clonidine_er",
    brand_names: ["Kapvay"],
    category: "medicine",
    drug_class: "Alpha-2 Adrenergic Agonist",
    optimal_slot: "BEFORE_BED",
    requires_food: false,
    common_doses: ["0.1mg"],
    half_life_hours: 12,
    absorption_notes: "Extended-release; do not crush or chew. Take consistently at bedtime.",
    gastric_irritant: false,
    aliases: ["clonidine er", "kapvay"]
  },
  {
    generic_name: "duloxetine_60mg",
    brand_names: ["Cymbalta 60mg"],
    category: "medicine",
    drug_class: "SNRI",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["60mg"],
    half_life_hours: 12,
    absorption_notes: "Standard therapeutic dose for depression/pain. Nausea is common on starting; take with food.",
    gastric_irritant: true,
    aliases: ["cymbalta 60", "duloxetine 60"]
  },
  {
    generic_name: "venlafaxine_150mg",
    brand_names: ["Effexor XR 150mg"],
    category: "medicine",
    drug_class: "SNRI",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["150mg"],
    half_life_hours: 5,
    absorption_notes: "Take with food at the same time each day. Do not open capsules.",
    gastric_irritant: true,
    aliases: ["effexor 150", "venlafaxine 150"]
  },
  {
    generic_name: "escitalopram_20mg",
    brand_names: ["Lexapro 20mg"],
    category: "medicine",
    drug_class: "SSRI",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["20mg"],
    half_life_hours: 30,
    absorption_notes: "Maximum recommended dose. Can be taken with or without food.",
    gastric_irritant: false,
    aliases: ["lexapro 20", "escitalopram 20"]
  },
  {
    generic_name: "sertraline_100mg",
    brand_names: ["Zoloft 100mg"],
    category: "medicine",
    drug_class: "SSRI",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["100mg"],
    half_life_hours: 26,
    absorption_notes: "Take with meals to prevent transient GI distress.",
    gastric_irritant: true,
    aliases: ["zoloft 100", "sertraline 100"]
  },
  {
    generic_name: "fluoxetine_40mg",
    brand_names: ["Prozac 40mg"],
    category: "medicine",
    drug_class: "SSRI",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["40mg"],
    half_life_hours: 120,
    absorption_notes: "Activating SSRI; take in the morning.",
    gastric_irritant: false,
    aliases: ["prozac 40", "fluoxetine 40"]
  },
  {
    generic_name: "amiodarone_200mg",
    brand_names: ["Pacerone 200mg", "Cordarone 200mg"],
    category: "medicine",
    drug_class: "Class III Antiarrhythmic",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["200mg"],
    half_life_hours: 1300,
    absorption_notes: "Taking with food increases rate and extent of absorption. Highly lipophilic; avoid grapefruit.",
    gastric_irritant: false,
    aliases: ["amiodarone 200", "pacerone"]
  },
  {
    generic_name: "spironolactone_25mg",
    brand_names: ["Aldactone 25mg"],
    category: "medicine",
    drug_class: "Aldosterone Receptor Antagonist",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["25mg"],
    half_life_hours: 1.4,
    absorption_notes: "Taking with food increases bioavailability by 90%. Avoid potassium supplements.",
    gastric_irritant: false,
    aliases: ["spironolactone 25", "aldactone 25"]
  },
  {
    generic_name: "spironolactone_50mg",
    brand_names: ["Aldactone 50mg"],
    category: "medicine",
    drug_class: "Aldosterone Receptor Antagonist",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["50mg"],
    half_life_hours: 1.4,
    absorption_notes: "Take with breakfast to minimize nocturia and increase absorption.",
    gastric_irritant: false,
    aliases: ["spironolactone 50", "aldactone 50"]
  },
  {
    generic_name: "digoxin_125mcg",
    brand_names: ["Lanoxin 125mcg"],
    category: "medicine",
    drug_class: "Cardiac Glycoside",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["125mcg"],
    half_life_hours: 36,
    absorption_notes: "Narrow therapeutic index. Fiber reduces absorption. Do not take with high-fiber meals.",
    gastric_irritant: false,
    aliases: ["digoxin 125", "lanoxin 125"]
  },
  {
    generic_name: "digoxin_250mcg",
    brand_names: ["Lanoxin 250mcg"],
    category: "medicine",
    drug_class: "Cardiac Glycoside",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["250mcg"],
    half_life_hours: 36,
    absorption_notes: "Narrow therapeutic index. Monitor potassium and calcium levels.",
    gastric_irritant: false,
    aliases: ["digoxin 250", "lanoxin 250"]
  },
  {
    generic_name: "warfarin_2mg",
    brand_names: ["Coumadin 2mg"],
    category: "medicine",
    drug_class: "Vitamin K Antagonist",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["2mg"],
    half_life_hours: 40,
    absorption_notes: "Maintain strict consistent dietary vitamin K intake. Avoid new supplements without consulting doctor.",
    gastric_irritant: false,
    aliases: ["warfarin 2", "coumadin 2"]
  },
  {
    generic_name: "warfarin_5mg",
    brand_names: ["Coumadin 5mg"],
    category: "medicine",
    drug_class: "Vitamin K Antagonist",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["5mg"],
    half_life_hours: 40,
    absorption_notes: "High risk of bleeding. Regular INR testing required.",
    gastric_irritant: false,
    aliases: ["warfarin 5", "coumadin 5"]
  },
  {
    generic_name: "apixaban_2_5mg",
    brand_names: ["Eliquis 2.5mg"],
    category: "medicine",
    drug_class: "Factor Xa Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["2.5mg"],
    half_life_hours: 12,
    absorption_notes: "Used for stroke prevention. Take twice daily with or without food.",
    gastric_irritant: false,
    aliases: ["eliquis 2.5", "apixaban 2.5"]
  },
  {
    generic_name: "apixaban_5mg",
    brand_names: ["Eliquis 5mg"],
    category: "medicine",
    drug_class: "Factor Xa Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["5mg"],
    half_life_hours: 12,
    absorption_notes: "Used for DVT/PE treatment. Take twice daily with or without food.",
    gastric_irritant: false,
    aliases: ["eliquis 5", "apixaban 5"]
  },
  {
    generic_name: "rivaroxaban_15mg",
    brand_names: ["Xarelto 15mg"],
    category: "medicine",
    drug_class: "Factor Xa Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["15mg"],
    half_life_hours: 9,
    absorption_notes: "MUST take with a meal containing food to ensure adequate absorption.",
    gastric_irritant: false,
    aliases: ["xarelto 15", "rivaroxaban 15"]
  },
  {
    generic_name: "rivaroxaban_20mg",
    brand_names: ["Xarelto 20mg"],
    category: "medicine",
    drug_class: "Factor Xa Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["20mg"],
    half_life_hours: 9,
    absorption_notes: "MUST take with a meal containing food to ensure adequate absorption.",
    gastric_irritant: false,
    aliases: ["xarelto 20", "rivaroxaban 20"]
  },
  {
    generic_name: "ciprofloxacin_500mg",
    brand_names: ["Cipro 500mg"],
    category: "medicine",
    drug_class: "Fluoroquinolone Antibiotic",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["500mg"],
    half_life_hours: 4,
    absorption_notes: "Avoid concurrent calcium, iron, or dairy products (separate by 2 hours before or 6 hours after).",
    gastric_irritant: true,
    aliases: ["cipro 500", "ciprofloxacin 500"]
  },
  {
    generic_name: "doxycycline_100mg",
    brand_names: ["Vibramycin 100mg", "Doryx 100mg"],
    category: "medicine",
    drug_class: "Tetracycline Antibiotic",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["100mg"],
    half_life_hours: 18,
    absorption_notes: "Take with food if gastric irritation occurs. Avoid concurrent calcium, iron, or antacids.",
    gastric_irritant: true,
    aliases: ["doxy 100", "doxycycline 100"]
  },
  {
    generic_name: "ibuprofen_400mg",
    brand_names: ["Advil 400mg", "Motrin 400mg"],
    category: "medicine",
    drug_class: "NSAID",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["400mg"],
    half_life_hours: 2,
    absorption_notes: "Gastric irritant. Take with food or milk to prevent GI upset.",
    gastric_irritant: true,
    aliases: ["advil 400", "ibuprofen 400"]
  },
  {
    generic_name: "ibuprofen_600mg",
    brand_names: ["Motrin 600mg"],
    category: "medicine",
    drug_class: "NSAID",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["600mg"],
    half_life_hours: 2,
    absorption_notes: "Prescription strength. Take with food. Do not combine with other NSAIDs.",
    gastric_irritant: true,
    aliases: ["ibuprofen 600", "motrin 600"]
  },
  {
    generic_name: "acetaminophen_500mg",
    brand_names: ["Tylenol Extra Strength"],
    category: "medicine",
    drug_class: "Analgesic / Antipyretic",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["500mg"],
    half_life_hours: 2,
    absorption_notes: "Do not exceed 4000mg per day from all sources. Avoid alcohol due to liver toxicity risk.",
    gastric_irritant: false,
    aliases: ["tylenol 500", "acetaminophen 500"]
  },
  {
    generic_name: "sildenafil_100mg",
    brand_names: ["Viagra 100mg"],
    category: "medicine",
    drug_class: "PDE5 Inhibitor",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["100mg"],
    half_life_hours: 4,
    absorption_notes: "Take on an empty stomach. High fat meals delay absorption.",
    gastric_irritant: false,
    aliases: ["viagra 100", "sildenafil 100"]
  },
  {
    generic_name: "tadalafil_20mg",
    brand_names: ["Cialis 20mg"],
    category: "medicine",
    drug_class: "PDE5 Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["20mg"],
    half_life_hours: 18,
    absorption_notes: "Cialis maximum dose. Long action up to 36 hours.",
    gastric_irritant: false,
    aliases: ["cialis 20", "tadalafil 20"]
  },
  {
    generic_name: "metformin_1000mg",
    brand_names: ["Glucophage 1000mg"],
    category: "medicine",
    drug_class: "Biguanide Antidiabetic",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["1000mg"],
    half_life_hours: 6,
    absorption_notes: "Take with meals to reduce gastrointestinal side effects. Avoid excessive alcohol.",
    gastric_irritant: true,
    aliases: ["metformin 1000", "glucophage 1000"]
  },
  {
    generic_name: "atorvastatin_40mg",
    brand_names: ["Lipitor 40mg"],
    category: "medicine",
    drug_class: "HMG-CoA Reductase Inhibitor",
    optimal_slot: "BEFORE_BED",
    requires_food: false,
    common_doses: ["40mg"],
    half_life_hours: 14,
    absorption_notes: "High dose statin. Avoid grapefruit juice entirely.",
    gastric_irritant: false,
    aliases: ["lipitor 40", "atorvastatin 40"]
  },
  {
    generic_name: "rosuvastatin_20mg",
    brand_names: ["Crestor 20mg"],
    category: "medicine",
    drug_class: "HMG-CoA Reductase Inhibitor",
    optimal_slot: "BEFORE_BED",
    requires_food: false,
    common_doses: ["20mg"],
    half_life_hours: 19,
    absorption_notes: "Potent statin. Antacids reduce absorption; separate by 2 hours.",
    gastric_irritant: false,
    aliases: ["crestor 20", "rosuvastatin 20"]
  },
  {
    generic_name: "levothyroxine_100mcg",
    brand_names: ["Synthroid 100mcg"],
    category: "medicine",
    drug_class: "Thyroid Hormone",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["100mcg"],
    half_life_hours: 7,
    absorption_notes: "Must take on an empty stomach with a full glass of water, 30-60 min before breakfast.",
    gastric_irritant: false,
    aliases: ["synthroid 100", "levothyroxine 100"]
  },
  {
    generic_name: "propranolol_40mg",
    brand_names: ["Inderal 40mg"],
    category: "medicine",
    drug_class: "Non-Selective Beta-Blocker",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["40mg"],
    half_life_hours: 4,
    absorption_notes: "Food increases bioavailability. Avoid concurrent alcohol.",
    gastric_irritant: false,
    aliases: ["inderal 40", "propranolol 40"]
  },
  {
    generic_name: "metoprolol_succinate",
    brand_names: ["Toprol XL"],
    category: "medicine",
    drug_class: "Beta-Blocker",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["25mg", "50mg", "100mg", "200mg"],
    half_life_hours: 7,
    absorption_notes: "Extended release beta blocker. Take with or immediately after a meal.",
    gastric_irritant: false,
    aliases: ["toprol xl", "metoprolol succinate"]
  },
  {
    generic_name: "amoxicillin_500mg",
    brand_names: ["Amoxil 500mg"],
    category: "medicine",
    drug_class: "Penicillin Antibiotic",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["500mg"],
    half_life_hours: 1,
    absorption_notes: "Take with or without food. Complete the entire course of therapy.",
    gastric_irritant: false,
    aliases: ["amoxicillin 500", "amoxil"]
  },
  {
    generic_name: "clindamycin_300mg",
    brand_names: ["Cleocin 300mg"],
    category: "medicine",
    drug_class: "Lincosamide Antibiotic",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["300mg"],
    half_life_hours: 3,
    absorption_notes: "Take with a full glass of water to avoid esophageal irritation. Can cause severe colitis.",
    gastric_irritant: true,
    aliases: ["cleocin", "clindamycin 300"]
  },
  {
    generic_name: "metronidazole",
    brand_names: ["Flagyl"],
    category: "medicine",
    drug_class: "Nitroimidazole Antibiotic",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["250mg", "500mg"],
    half_life_hours: 8,
    absorption_notes: "Taking with food reduces GI upset. CRITICAL: Avoid alcohol during and for 3 days after treatment.",
    gastric_irritant: true,
    aliases: ["flagyl", "metronidazole"]
  },
  {
    generic_name: "colchicine_0_6mg",
    brand_names: ["Colcrys 0.6mg"],
    category: "medicine",
    drug_class: "Antigout Agent",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["0.6mg"],
    half_life_hours: 30,
    absorption_notes: "Take at first sign of gout flare. Avoid grapefruit juice entirely.",
    gastric_irritant: true,
    aliases: ["colcrys 0.6", "colchicine 0.6"]
  },
  {
    generic_name: "allopurinol_300mg",
    brand_names: ["Zyloprim 300mg"],
    category: "medicine",
    drug_class: "Xanthine Oxidase Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: true,
    common_doses: ["300mg"],
    half_life_hours: 2,
    absorption_notes: "Take after a meal with plenty of water. Monitor for hypersensitivity skin rashes.",
    gastric_irritant: false,
    aliases: ["zyloprim 300", "allopurinol 300"]
  },
  {
    generic_name: "clopidogrel_75mg",
    brand_names: ["Plavix 75mg"],
    category: "medicine",
    drug_class: "Antiplatelet",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["75mg"],
    half_life_hours: 6,
    absorption_notes: "Prodrug. Do not take with PPIs like omeprazole as they block conversion.",
    gastric_irritant: false,
    aliases: ["plavix 75", "clopidogrel 75"]
  },
  {
    generic_name: "nitroglycerin_sublingual",
    brand_names: ["Nitrostat"],
    category: "medicine",
    drug_class: "Nitrate Vasodilator",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["0.4mg"],
    half_life_hours: 0.05,
    absorption_notes: "Administered sublingually under the tongue. Do not swallow. Avoid PDE5 inhibitors (Viagra).",
    gastric_irritant: false,
    aliases: ["nitrostat", "nitroglycerin sl", "nitro sublingual"]
  },
  {
    generic_name: "montelukast_10mg",
    brand_names: ["Singulair 10mg"],
    category: "medicine",
    drug_class: "Leukotriene Receptor Antagonist",
    optimal_slot: "BEFORE_BED",
    requires_food: false,
    common_doses: ["10mg"],
    half_life_hours: 5,
    absorption_notes: "Take in the evening. Monitor for neuropsychiatric changes.",
    gastric_irritant: false,
    aliases: ["singulair 10", "montelukast 10"]
  },
  {
    generic_name: "lisinopril_10mg",
    brand_names: ["Zestril 10mg"],
    category: "medicine",
    drug_class: "ACE Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["10mg"],
    half_life_hours: 12,
    absorption_notes: "Take consistently with or without food. Avoid potassium supplements.",
    gastric_irritant: false,
    aliases: ["lisinopril 10", "zestril 10"]
  },
  {
    generic_name: "lisinopril_20mg",
    brand_names: ["Zestril 20mg"],
    category: "medicine",
    drug_class: "ACE Inhibitor",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["20mg"],
    half_life_hours: 12,
    absorption_notes: "Antihypertensive. Monitor kidney function and blood pressure.",
    gastric_irritant: false,
    aliases: ["lisinopril 20", "zestril 20"]
  },
  {
    generic_name: "amlodipine_5mg",
    brand_names: ["Norvasc 5mg"],
    category: "medicine",
    drug_class: "Calcium Channel Blocker",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["5mg"],
    half_life_hours: 40,
    absorption_notes: "Take at same time each day. Grapefruit juice can increase concentration slightly.",
    gastric_irritant: false,
    aliases: ["norvasc 5", "amlodipine 5"]
  },
  {
    generic_name: "amlodipine_10mg",
    brand_names: ["Norvasc 10mg"],
    category: "medicine",
    drug_class: "Calcium Channel Blocker",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["10mg"],
    half_life_hours: 40,
    absorption_notes: "Maximum dose. Monitor for peripheral edema (swelling of ankles).",
    gastric_irritant: false,
    aliases: ["norvasc 10", "amlodipine 10"]
  },
  {
    generic_name: "omeprazole_20mg",
    brand_names: ["Prilosec 20mg"],
    category: "medicine",
    drug_class: "Proton Pump Inhibitor",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["20mg"],
    half_life_hours: 1,
    absorption_notes: "Take 30-60 minutes before the first meal of the day.",
    gastric_irritant: false,
    aliases: ["prilosec 20", "omeprazole 20"]
  },
  {
    generic_name: "omeprazole_40mg",
    brand_names: ["Prilosec 40mg"],
    category: "medicine",
    drug_class: "Proton Pump Inhibitor",
    optimal_slot: "FASTING",
    requires_food: false,
    common_doses: ["40mg"],
    half_life_hours: 1,
    absorption_notes: "Take 30-60 minutes before breakfast. Reduces absorption of calcium, magnesium, B12.",
    gastric_irritant: false,
    aliases: ["prilosec 40", "omeprazole 40"]
  },
  {
    generic_name: "gabapentin_600mg",
    brand_names: ["Neurontin 600mg"],
    category: "medicine",
    drug_class: "Anticonvulsant / Neuropathic Pain",
    optimal_slot: "WITH_MEAL",
    requires_food: false,
    common_doses: ["600mg"],
    half_life_hours: 6,
    absorption_notes: "Do not take within 2 hours of antacid supplements as they reduce absorption.",
    gastric_irritant: false,
    aliases: ["neurontin 600", "gabapentin 600"]
  }
];

let addedMeds = 0;
for (const med of medsToAdd) {
  if (!existingMeds.has(med.generic_name.toLowerCase())) {
    meds.push(med);
    existingMeds.add(med.generic_name.toLowerCase());
    addedMeds++;
  }
}

// Make sure we have enough meds to exceed 450
console.log(`Added ${addedMeds} new meds. Total meds now: ${meds.length}`);
saveJson('core_meds.json', meds);

// ─────────────────────────────────────────────────────────────────────────────
// 2. ENHANCE CLASH RULES
// ─────────────────────────────────────────────────────────────────────────────
console.log("Starting Clash Rules enhancement...");
let clashRules = loadJson('clash_rules.json');

function addClash(itemA, itemB, type, severity, mechanism, resolution, window_minutes, penalty_abs, penalty_crit, penalty_gastric, penalty_cum) {
  if (!clashRules[itemA]) clashRules[itemA] = {};
  clashRules[itemA][itemB] = {
    type,
    severity,
    mechanism,
    resolution,
    window_minutes,
    penalty_abs,
    penalty_crit,
    penalty_gastric,
    penalty_cum
  };
}

const clashesToAdd = [
  // Med-Food interactions
  ["metformin", "beverage_alcoholic", "CRITICAL_BLOCK", 85, "Alcohol enhances the effect of metformin on lactate metabolism, dramatically increasing the risk of potentially fatal lactic acidosis.", "Avoid alcohol completely while taking metformin.", 720, 0, 80, 0, 20],
  ["metformin_1000mg", "beverage_alcoholic", "CRITICAL_BLOCK", 85, "Alcohol combined with high dose metformin increases risk of lactic acidosis.", "Do not consume alcohol.", 720, 0, 80, 0, 20],
  ["atorvastatin", "grapefruit", "WARNING", 35, "Grapefruit inhibits CYP3A4 metabolism of atorvastatin, increasing blood concentration and the risk of myopathy (muscle pain) or rhabdomyolysis.", "Avoid grapefruit juice and grapefruit containing products.", 720, 0, 25, 0, 10],
  ["atorvastatin_40mg", "grapefruit", "WARNING", 40, "CYP3A4 inhibition by grapefruit increases concentration of high-dose atorvastatin, raising risk of muscle breakdown.", "Avoid grapefruit juice.", 720, 0, 30, 0, 10],
  ["amlodipine", "grapefruit", "WARNING", 25, "Grapefruit juice inhibits CYP3A4, slightly increasing amlodipine levels and risk of flushing, dizziness, and peripheral edema.", "Limit or avoid grapefruit juice.", 360, 0, 15, 0, 10],
  ["amlodipine_10mg", "grapefruit", "WARNING", 28, "Grapefruit increases amlodipine concentration, boosting risk of ankle swelling and low blood pressure.", "Avoid grapefruit juice.", 360, 0, 18, 0, 10],
  ["simvastatin", "amiodarone", "CRITICAL_BLOCK", 45, "Amiodarone inhibits CYP3A4 metabolism of simvastatin. Concomitant use increases risk of rhabdomyolysis (simvastatin dose should not exceed 20mg/day).", "Avoid combination or limit simvastatin dose to 20mg/day maximum.", 720, 0, 35, 0, 15],
  ["simvastatin", "amiodarone_200mg", "CRITICAL_BLOCK", 45, "CYP3A4 inhibition increases simvastatin levels, causing muscle toxicity.", "Avoid concurrent use.", 720, 0, 35, 0, 15],
  ["warfarin", "spinach", "WARNING", 35, "Spinach is rich in Vitamin K, which directly counteracts warfarin's anticoagulant mechanism, lowering INR and increasing clot risk.", "Maintain a highly consistent daily intake of Vitamin K foods; do not make sudden dietary changes.", 360, 25, 10, 0, 10],
  ["warfarin_2mg", "spinach", "WARNING", 35, "Vitamin K in spinach opposes warfarin action.", "Keep spinach intake consistent.", 360, 25, 10, 0, 10],
  ["warfarin_5mg", "spinach", "WARNING", 35, "High Vitamin K foods antagonize anticoagulation.", "Keep intake highly consistent.", 360, 25, 10, 0, 10],
  ["acetaminophen", "beverage_alcoholic", "WARNING", 35, "Chronic alcohol consumption induces CYP2E1, forming a hepatotoxic metabolite (NAPQI) from acetaminophen, increasing liver failure risk.", "Avoid combining alcohol and acetaminophen. Limit acetaminophen to 2000mg/day if drinking.", 360, 0, 25, 10, 10],
  ["acetaminophen_500mg", "beverage_alcoholic", "WARNING", 35, "Alcohol increases acetaminophen liver toxicity via glutathione depletion.", "Avoid alcohol.", 360, 0, 25, 10, 10],
  ["levodopa", "beef_steak", "WARNING", 25, "High protein meals contain large amino acids that compete with levodopa for transport across the blood-brain barrier, reducing efficacy.", "Take levodopa 30-60 minutes before high protein meals.", 180, 20, 5, 0, 5],
  
  // Med-Supplement interactions
  ["ciprofloxacin", "calcium_carbonate", "WARNING", 35, "Calcium ions chelate ciprofloxacin in the GI tract, reducing its absorption by up to 50%.", "Take ciprofloxacin 2 hours before or 6 hours after calcium supplements.", 240, 35, 0, 0, 5],
  ["ciprofloxacin_500mg", "calcium_carbonate", "WARNING", 35, "Calcium chelates fluoroquinolone antibiotics in the stomach.", "Separate by 2 hours before or 6 hours after.", 240, 35, 0, 0, 5],
  ["ciprofloxacin_500mg", "calcium_citrate", "WARNING", 35, "Calcium chelates ciprofloxacin, reducing antibiotic efficacy.", "Separate doses.", 240, 35, 0, 0, 5],
  ["doxycycline", "iron_sulfate", "WARNING", 30, "Iron binds doxycycline in the gut, forming unabsorbable complexes and decreasing antibiotic bioavailability.", "Separate administration by at least 2-3 hours.", 180, 30, 0, 0, 5],
  ["doxycycline_100mg", "iron_sulfate", "WARNING", 30, "Iron chelates tetracycline antibiotics.", "Separate by at least 2 hours.", 180, 30, 0, 0, 5],
  ["doxycycline_100mg", "iron_bisglycinate", "WARNING", 30, "Iron chelates doxycycline.", "Separate by 2 hours.", 180, 30, 0, 0, 5],
  ["fluoxetine", "tamoxifen", "CRITICAL_BLOCK", 50, "Fluoxetine is a potent CYP2D6 inhibitor, preventing conversion of tamoxifen to its active metabolite endoxifen, reducing cancer therapy efficacy.", "Avoid fluoxetine; use an alternative antidepressant like escitalopram.", 1440, 0, 45, 0, 15],
  ["fluoxetine_40mg", "tamoxifen", "CRITICAL_BLOCK", 50, "CYP2D6 inhibition blocks activation of tamoxifen.", "Do not combine.", 1440, 0, 45, 0, 15],
  ["phenytoin", "vitamin_b9_folic_acid", "WARNING", 25, "Folic acid acts as a cofactor in phenytoin metabolism, increasing its clearance and lowering blood levels, potentially triggering seizures.", "Monitor phenytoin levels if supplementing folic acid.", 240, 20, 10, 0, 5],
  ["methotrexate", "omeprazole", "WARNING", 30, "Omeprazole inhibits renal H+/K+-ATPase and organic anion transporters, reducing methotrexate elimination and risking toxicity.", "Avoid PPIs during high-dose methotrexate therapy.", 360, 0, 25, 5, 10],
  ["methotrexate", "omeprazole_20mg", "WARNING", 30, "PPIs reduce methotrexate renal clearance.", "Monitor levels or use H2 blocker instead.", 360, 0, 25, 5, 10],
  ["methotrexate", "omeprazole_40mg", "WARNING", 35, "High-dose PPI reduces methotrexate excretion, raising toxicity risk.", "Avoid combination.", 360, 0, 30, 5, 10],
  ["gabapentin", "magnesium_oxide", "WARNING", 20, "Magnesium antacids reduce the absorption of gabapentin by approximately 20%.", "Take gabapentin at least 2 hours after magnesium supplements.", 120, 20, 0, 0, 5],
  ["gabapentin_600mg", "magnesium_oxide", "WARNING", 20, "Magnesium oxide reduces gabapentin bioavailability.", "Separate by 2 hours.", 120, 20, 0, 0, 5],
  ["gabapentin_600mg", "magnesium_glycinate", "WARNING", 15, "Magnesium glycinate may slightly reduce gabapentin absorption.", "Separate by 2 hours.", 120, 15, 0, 0, 5],
  ["alendronate", "coffee_black", "WARNING", 30, "Coffee reduces the absorption of alendronate by up to 60%.", "Take alendronate with plain water only, 30 minutes before coffee or food.", 120, 30, 0, 0, 5],
  
  // Additional safety blocks
  ["lisinopril", "spironolactone", "WARNING", 25, "ACE inhibitors block aldosterone, conserving potassium; combining with spironolactone increases risk of hyperkalemia.", "Monitor potassium levels regularly.", 360, 0, 20, 0, 5],
  ["lisinopril_10mg", "spironolactone_25mg", "WARNING", 20, "Potential hyperkalemia risk.", "Monitor serum potassium.", 360, 0, 15, 0, 5],
  ["lisinopril_20mg", "spironolactone_50mg", "WARNING", 25, "Significant risk of hyperkalemia.", "Avoid potassium-sparing combinations or monitor closely.", 360, 0, 20, 0, 5],
  ["clopidogrel", "omeprazole", "CRITICAL_BLOCK", 40, "Omeprazole inhibits CYP2C19, preventing the activation of clopidogrel and reducing its antiplatelet effect, risking cardiovascular events.", "Avoid omeprazole; use pantoprazole instead if acid reduction is required.", 720, 35, 15, 0, 10],
  ["clopidogrel_75mg", "omeprazole_20mg", "CRITICAL_BLOCK", 40, "Omeprazole inhibits clopidogrel activation.", "Do not take omeprazole with clopidogrel.", 720, 35, 15, 0, 10],
  ["clopidogrel_75mg", "omeprazole_40mg", "CRITICAL_BLOCK", 45, "Stronger inhibition of clopidogrel activation.", "Avoid omeprazole completely.", 720, 40, 15, 0, 10],
  ["carbamazepine", "st_johns_wort", "CRITICAL_BLOCK", 35, "St. John's Wort induces CYP3A4, increasing carbamazepine metabolism and decreasing blood levels, risking seizures.", "Avoid St. John's Wort.", 720, 30, 10, 0, 10],
  ["linezolid", "sertraline", "CRITICAL_BLOCK", 60, "Linezolid is a weak, reversible MAOI. Combined with SSRIs, it can cause severe, potentially fatal Serotonin Syndrome.", "Do NOT combine. Stop sertraline at least 14 days before starting linezolid.", 10080, 0, 60, 0, 20],
  ["linezolid", "escitalopram", "CRITICAL_BLOCK", 60, "MAOI antibiotic combined with SSRI risks serotonin syndrome.", "Avoid concurrent use.", 10080, 0, 60, 0, 20],
  ["linezolid", "dextromethorphan", "CRITICAL_BLOCK", 55, "Combining MAOI antibiotic with serotonergic cough suppressant can trigger Serotonin Syndrome.", "Avoid combining linezolid and dextromethorphan.", 1440, 0, 50, 0, 15],
  ["dextromethorphan", "sertraline", "WARNING", 30, "Dextromethorphan has mild serotonergic properties; combining with high SSRI doses risks Serotonin Syndrome.", "Use caution; avoid high doses of cough medicine.", 360, 0, 25, 0, 10],
  ["pseudoephedrine", "coffee_black", "WARNING", 20, "Combined CNS stimulants can cause additive heart rate elevation, palpitations, jitteriness, and insomnia.", "Avoid caffeine and high coffee intake while on decongestants.", 240, 0, 10, 0, 10],
  ["pseudoephedrine", "green_tea_extract_egcg", "WARNING", 15, "Additive stimulant effects may cause tachycardia.", "Separate or avoid.", 240, 0, 10, 0, 5],
  ["warfarin", "ginkgo_biloba", "WARNING", 25, "Ginkgo biloba has antiplatelet properties and can increase bleeding risk when taken with anticoagulants.", "Avoid ginkgo supplements.", 360, 0, 25, 0, 5],
  ["warfarin", "garlic_extract_allicin", "WARNING", 20, "High dose garlic extract has mild antiplatelet effects and can increase bleeding risk.", "Avoid high dose garlic supplements.", 360, 0, 15, 0, 5],
  ["warfarin", "coenzyme_q10_ubiquinol", "WARNING", 25, "CoQ10 is structurally similar to Vitamin K and may reduce the anticoagulant effect of warfarin.", "Avoid CoQ10 supplements or monitor INR closely.", 360, 20, 5, 0, 5],
  ["warfarin", "green_tea_extract_egcg", "WARNING", 20, "Green tea contains Vitamin K which can antagonize warfarin's action.", "Avoid green tea extracts.", 360, 15, 5, 0, 5],
  ["propranolol", "beverage_alcoholic", "WARNING", 25, "Alcohol can increase propranolol absorption and plasma levels while adding to CNS depressant effects.", "Avoid alcohol consumption.", 360, 0, 20, 5, 10],
  ["propranolol_40mg", "beverage_alcoholic", "WARNING", 25, "Alcohol increases propranolol levels and lowers blood pressure.", "Do not drink alcohol.", 360, 0, 20, 5, 10],
  ["melatonin_fast_release", "coffee_black", "WARNING", 20, "Caffeine inhibits CYP1A2, which metabolizes melatonin, and acts as a central stimulant, blocking melatonin's sleep onset benefits.", "Do not consume caffeine near bedtime.", 240, 10, 10, 0, 5],
  ["kava_kava", "alprazolam", "CRITICAL_BLOCK", 45, "Kava kava has sedative properties and can act synergistically with benzodiazepines, risking severe somnolence, motor impairment, and lethargy.", "Avoid combination.", 720, 0, 40, 0, 15],
  ["kava_kava", "diazepam", "CRITICAL_BLOCK", 45, "Additive CNS depressant effects.", "Avoid kava with benzos.", 720, 0, 40, 0, 15],
  ["valerian_root", "beverage_alcoholic", "WARNING", 25, "Valerian increases GABA activity; combining with alcohol causes additive sedation and psychomotor impairment.", "Avoid alcohol when taking valerian root.", 480, 0, 20, 0, 10],
  ["calcium_carbonate", "zinc_picolinate", "WARNING", 15, "High doses of calcium can compete with zinc for absorption in the small intestine.", "Separate doses by 2 hours.", 180, 15, 0, 0, 3],
  ["iron_sulfate", "zinc_picolinate", "WARNING", 20, "High concentrations of iron can inhibit zinc absorption.", "Separate administration by 2 hours.", 180, 20, 0, 0, 3],
  ["levothyroxine", "soy_milk", "WARNING", 20, "Soy protein can bind thyroid hormone in the gut, reducing absorption.", "Take levothyroxine at least 4 hours apart from soy containing foods.", 240, 20, 0, 0, 3],
  ["ginkgo_biloba", "ibuprofen", "WARNING", 25, "Ginkgo inhibits platelet aggregation; combined with NSAIDs like ibuprofen, the risk of GI bleeding is elevated.", "Avoid NSAIDs with ginkgo; use acetaminophen.", 360, 0, 20, 10, 5],
  ["ginkgo_biloba", "aspirin", "WARNING", 28, "Additive antiplatelet effects increase microbleeding and bruising risk.", "Avoid combination.", 360, 0, 25, 5, 5],
  ["echinacea_purpurea", "cyclosporine", "WARNING", 25, "Echinacea stimulates immune function and can counteract the action of immunosuppressant drugs.", "Avoid echinacea supplements.", 360, 20, 10, 0, 5],
  ["digoxin", "fiber_psyllium", "WARNING", 20, "Soluble fibers can bind digoxin in the GI tract, reducing its absorption.", "Separate by 2 hours.", 180, 20, 0, 0, 5],
  ["red_yeast_rice", "atorvastatin", "WARNING", 30, "Red yeast rice naturally contains monacolin K (lovastatin); combining with prescription statins increases risk of muscle toxicity.", "Do not combine red yeast rice with prescription statins.", 720, 0, 25, 0, 10],
  ["red_yeast_rice", "simvastatin", "WARNING", 30, "Additive statin exposure increases risk of myopathy.", "Avoid combination.", 720, 0, 25, 0, 10],
  ["colchicine", "clarithromycin", "CRITICAL_BLOCK", 85, "Clarithromycin is a strong CYP3A4 and P-glycoprotein inhibitor, significantly raising colchicine exposure and risking fatal toxicity.", "Avoid concurrent use.", 720, 0, 80, 0, 20],
  ["colchicine_0_6mg", "clarithromycin_macrolide", "CRITICAL_BLOCK", 85, "Concomitant use risks colchicine toxicity.", "Do not combine.", 720, 0, 80, 0, 20],
  ["allopurinol", "amoxicillin", "WARNING", 20, "Concurrent use increases the incidence of drug-induced skin rash.", "Monitor for skin rashes; report changes immediately.", 360, 0, 15, 0, 10],
  ["allopurinol_300mg", "amoxicillin_500mg", "WARNING", 20, "Higher risk of drug rash.", "Monitor skin.", 360, 0, 15, 0, 10]
];

let addedClashes = 0;
for (const c of clashesToAdd) {
  const [itemA, itemB, type, severity, mechanism, resolution, window_minutes, penalty_abs, penalty_crit, penalty_gastric, penalty_cum] = c;
  // Check if clash already exists in either direction
  const existsForward = clashRules[itemA]?.[itemB];
  const existsReverse = clashRules[itemB]?.[itemA];
  if (!existsForward && !existsReverse) {
    addClash(itemA, itemB, type, severity, mechanism, resolution, window_minutes, penalty_abs, penalty_crit, penalty_gastric, penalty_cum);
    addedClashes++;
  }
}

let totalClashes = 0;
Object.keys(clashRules).forEach(k => totalClashes += Object.keys(clashRules[k]).length);
console.log(`Added ${addedClashes} new clash rules. Total clash rules: ${totalClashes}`);
saveJson('clash_rules.json', clashRules);

// ─────────────────────────────────────────────────────────────────────────────
// 3. ENHANCE BOOST RULES
// ─────────────────────────────────────────────────────────────────────────────
console.log("Starting Boost Rules enhancement...");
let boostRules = loadJson('boost_rules.json');

function addBoost(itemA, itemB, type, mechanism, benefit, optimal_timing, score_bonus) {
  if (!boostRules[itemA]) boostRules[itemA] = {};
  boostRules[itemA][itemB] = {
    type,
    mechanism,
    benefit,
    optimal_timing,
    score_bonus
  };
}

const boostsToAdd = [
  ["vitamin_d3_cholecalciferol", "vitamin_k2_mk7", "SYNERGY", "Vitamin D3 stimulates the synthesis of osteocalcin, while Vitamin K2 is required to carboxilate and activate it, directing calcium to bones and preventing arterial calcification.", "Synergistic bone mineralization and cardiovascular safety.", "Take together with a meal containing fats.", 6],
  ["vitamin_c_ascorbic_acid", "iron_sulfate", "ENHANCEMENT", "Vitamin C reduces dietary ferric iron (Fe3+) to ferrous iron (Fe2+), which is more soluble and easily absorbed in the duodenum.", "Iron absorption increased up to 3-fold.", "Take simultaneously.", 5],
  ["turmeric_curcumin_piperine", "ginger_root_extract", "SYNERGY", "Curcumin and ginger constituents act on complementary inflammatory pathways (COX-2 and lipoxygenase inhibition).", "Enhanced natural anti-inflammatory and joint pain relief benefits.", "Take together with food.", 5],
  ["coenzyme_q10_ubiquinol", "black_pepper", "ENHANCEMENT", "Piperine enhances the thermogenic and permeability characteristics of intestinal cells, boosting CoQ10 absorption.", "Increased cellular bioavailability of CoQ10.", "Take together with a fat-containing meal.", 4],
  ["resveratrol", "black_pepper", "ENHANCEMENT", "Piperine inhibits glucuronidation, the primary pathway of resveratrol elimination, increasing its bioavailability.", "Sustained anti-aging and cardiovascular benefits.", "Take together with breakfast.", 4],
  ["green_tea_extract_egcg", "vitamin_c_ascorbic_acid", "ENHANCEMENT", "Vitamin C acts as an antioxidant stabilizer, reducing EGCG oxidation in the intestine and increasing absorption.", "Enhanced antioxidant benefits and higher catechin bioavailability.", "Take together with water.", 4],
  ["green_tea_extract_egcg", "black_pepper", "ENHANCEMENT", "Piperine increases absorption of EGCG by inhibiting efflux pumps.", "Improved metabolic and cognitive support.", "Take together.", 4],
  ["vitamin_b12_methylcobalamin", "vitamin_b9_methylfolate", "SYNERGY", "Methylcobalamin and methylfolate are cofactors in the methionine synthase reaction, reducing homocysteine levels.", "Synergistic cardiovascular and neurological support.", "Take together in the morning.", 5],
  ["zinc_picolinate", "vitamin_a_retinyl_palmitate", "SYNERGY", "Zinc is required for enzyme synthesis that converts retinol to retinaldehyde and transports Vitamin A in the blood.", "Synergistic support for vision and immune health.", "Take together with food.", 4],
  ["iron_bisglycinate", "vitamin_a_retinyl_palmitate", "SYNERGY", "Vitamin A helps mobilize iron from liver stores for hemoglobin synthesis, helping prevent anemia.", "Improved iron mobilization and hemoglobin production.", "Take within the same day.", 4],
  ["ashwagandha_ksm66", "l_theanine", "SYNERGY", "Ashwagandha lowers cortisol levels while L-theanine promotes relaxation waves in the brain, improving stress tolerance.", "Enhanced calm, focus, and reduced anxiety.", "Take together in the morning or before high-stress events.", 5],
  ["melatonin_fast_release", "l_theanine", "SYNERGY", "Melatonin promotes sleep onset while L-theanine relaxes mental activity to improve sleep architecture.", "Improved sleep quality and faster sleep onset.", "Take 30-60 minutes before bedtime.", 5],
  ["creatine_monohydrate", "sugar_white", "ENHANCEMENT", "Carbohydrates stimulate insulin release, which upregulates sodium-dependent creatine transporters, boosting muscle uptake.", "Up to 60% higher creatine muscle deposition.", "Take creatine with a high-glycemic carbohydrate source.", 4],
  ["glucosamine_sulfate", "chondroitin_sulfate", "SYNERGY", "Glucosamine stimulates glycosaminoglycan synthesis while chondroitin inhibits cartilage-degrading enzymes.", "Synergistic preservation of joint cartilage and pain relief.", "Take together with meals.", 5],
  ["glucosamine_sulfate", "msm_methylsulfonylmethane", "SYNERGY", "MSM provides organic sulfur needed for collagen cross-linking, acting synergistically with glucosamine's cartilage repair.", "Faster reduction in joint pain and stiffness.", "Take together with food.", 4],
  ["omega_3_fish_oil", "vitamin_e_d_alpha_tocopherol", "PROTECTIVE", "Vitamin E is a lipid-soluble antioxidant that protects long-chain polyunsaturated fatty acids (EPA/DHA) from lipid peroxidation.", "Prevents oxidation of EPA/DHA, ensuring optimal anti-inflammatory benefit.", "Take together with food.", 4],
  ["quercetin", "bromelain", "ENHANCEMENT", "Bromelain is a proteolytic enzyme that enhances the intestinal absorption and systemic anti-inflammatory effect of quercetin.", "Enhanced anti-inflammatory and seasonal allergy relief.", "Take together on an empty stomach or with a light meal.", 4],
  ["quercetin", "vitamin_c_ascorbic_acid", "SYNERGY", "Vitamin C regenerates oxidized quercetin back to its active antioxidant form, creating a synergistic cycle.", "Extended antioxidant protection and immune support.", "Take together.", 4],
  ["quercetin", "zinc_picolinate", "SYNERGY", "Quercetin acts as a zinc ionophore, facilitating the transport of zinc ions across the cell membrane into the cytosol.", "Intracellular zinc accumulation, which inhibits viral replication enzymes.", "Take together with a meal.", 5],
  ["green_tea_extract_egcg", "zinc_picolinate", "SYNERGY", "EGCG acts as a natural zinc ionophore, enhancing zinc's intracellular concentration.", "Synergistic immune and antioxidant protection.", "Take together.", 4],
  ["probiotic_lactobacillus_acidophilus", "inulin_fiber", "SYNERGY", "Inulin is a prebiotic fiber that selectively feeds beneficial Lactobacillus, promoting colonization.", "Enhanced probiotic colonization and gut microbiome balance.", "Take together with water.", 5],
  ["l_theanine", "coffee_black", "SYNERGY", "L-theanine reduces the vasoconstrictive and jittery side effects of caffeine while synergizing with its cognitive performance benefits.", "Calm, clean focus without caffeine crashes or jitters.", "Take L-theanine with your coffee.", 4],
  ["potassium_citrate", "magnesium_glycinate", "SYNERGY", "Magnesium is a cofactor for the Na+/K+-ATPase pump that maintains intracellular potassium concentrations.", "Optimal cardiovascular and muscle cell electrolyte balance.", "Take together.", 4],
  ["milk_thistle_silymarin", "dandelion_root", "SYNERGY", "Milk thistle protects liver cells from toxic insults while dandelion root stimulates bile secretion to aid toxin elimination.", "Enhanced liver detoxification and digestion of dietary fats.", "Take together before meals.", 3],
  ["collagen_peptides", "vitamin_c_ascorbic_acid", "SYNERGY", "Vitamin C is a required cofactor for prolyl hydroxylase, which stabilizes the collagen triple helix.", "Optimal collagen synthesis for skin, joint, and bone health.", "Take together.", 4],
  ["iron_bisglycinate", "copper_gluconate", "SYNERGY", "Copper-containing ceruloplasmin is required for proper iron transport and mobilization from storage.", "Enhanced iron mobilization and hemoglobin production.", "Take within the same day.", 3],
  ["ashwagandha_ksm66", "rhodiola_rosea", "SYNERGY", "Complementary adaptogens targeting the HPA axis to regulate cortisol and support neurotransmitter balance.", "Enhanced physical endurance, mental stamina, and stress resistance.", "Take together in the morning.", 5],
  ["ginkgo_biloba", "gotu_kola", "SYNERGY", "Ginkgo improves arterial blood flow while Gotu Kola supports venous tone and microcirculation.", "Synergistic support for memory, concentration, and peripheral circulation.", "Take together in the morning.", 4],
  ["astaxanthin", "lutein", "SYNERGY", "Complementary carotenoids that deposit in eye tissue, providing broad-spectrum blue light filtering and macular protection.", "Enhanced retinal health and visual comfort.", "Take together with a meal containing fats.", 4]
];

let addedBoosts = 0;
for (const b of boostsToAdd) {
  const [itemA, itemB, type, mechanism, benefit, optimal_timing, score_bonus] = b;
  const existsForward = boostRules[itemA]?.[itemB];
  const existsReverse = boostRules[itemB]?.[itemA];
  if (!existsForward && !existsReverse) {
    addBoost(itemA, itemB, type, mechanism, benefit, optimal_timing, score_bonus);
    addedBoosts++;
  }
}

let totalBoosts = 0;
Object.keys(boostRules).forEach(k => totalBoosts += Object.keys(boostRules[k]).length);
console.log(`Added ${addedBoosts} new boost rules. Total boost rules: ${totalBoosts}`);
saveJson('boost_rules.json', boostRules);

console.log("All database files successfully enhanced!");
