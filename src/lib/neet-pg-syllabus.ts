// NEET PG syllabus (subjects + key topics). Used by the seed server fn.
export type SubjectSeed = { name: string; slug: string; topics: string[] };

export const NEET_PG_SUBJECTS: SubjectSeed[] = [
  { name: "Anatomy", slug: "anatomy", topics: ["Upper Limb", "Lower Limb", "Thorax", "Abdomen & Pelvis", "Head & Neck", "Neuroanatomy", "Embryology", "Histology"] },
  { name: "Physiology", slug: "physiology", topics: ["General Physiology", "Cardiovascular", "Respiratory", "Renal", "Endocrine", "Nervous System", "GIT"] },
  { name: "Biochemistry", slug: "biochemistry", topics: ["Carbohydrate Metabolism", "Lipid Metabolism", "Protein Metabolism", "Vitamins", "Enzymes", "Molecular Biology"] },
  { name: "Pathology", slug: "pathology", topics: ["General Pathology", "Hematology", "Cardiovascular Pathology", "Respiratory Pathology", "GI Pathology", "Renal Pathology", "Neoplasia"] },
  { name: "Microbiology", slug: "microbiology", topics: ["Bacteriology", "Virology", "Mycology", "Parasitology", "Immunology"] },
  { name: "Pharmacology", slug: "pharmacology", topics: ["ANS Drugs", "CVS Drugs", "Antimicrobials", "Chemotherapy", "CNS Drugs", "Endocrine Drugs"] },
  { name: "Forensic Medicine", slug: "forensic", topics: ["Thanatology", "Asphyxial Deaths", "Toxicology", "Forensic Psychiatry", "Medical Jurisprudence"] },
  { name: "Community Medicine (PSM)", slug: "psm", topics: ["Epidemiology", "Biostatistics", "National Health Programs", "Nutrition", "Vaccination"] },
  { name: "Ophthalmology", slug: "ophtha", topics: ["Cornea & Lens", "Retina", "Glaucoma", "Refraction", "Ocular Trauma"] },
  { name: "ENT", slug: "ent", topics: ["Ear Diseases", "Nose & Sinuses", "Throat & Larynx", "Head & Neck Tumours"] },
  { name: "Medicine", slug: "medicine", topics: ["Cardiology", "Pulmonology", "Gastroenterology", "Nephrology", "Endocrinology", "Hematology", "Infectious Diseases", "Neurology", "Rheumatology"] },
  { name: "Surgery", slug: "surgery", topics: ["General Surgery", "GI Surgery", "Urology", "Vascular Surgery", "Trauma & Burns", "Surgical Oncology"] },
  { name: "Obstetrics & Gynecology", slug: "obg", topics: ["Antenatal Care", "Labour & Delivery", "High-risk Pregnancy", "Gynec Oncology", "Contraception", "Infertility"] },
  { name: "Pediatrics", slug: "pediatrics", topics: ["Neonatology", "Growth & Development", "Vaccination", "Pediatric Infections", "Pediatric Cardiology"] },
  { name: "Orthopedics", slug: "ortho", topics: ["Fractures Upper Limb", "Fractures Lower Limb", "Spine", "Bone Tumours", "Pediatric Ortho"] },
  { name: "Dermatology", slug: "derma", topics: ["Bacterial Infections", "Viral Infections", "Psoriasis & Eczema", "STDs", "Pigmentary Disorders"] },
  { name: "Psychiatry", slug: "psych", topics: ["Mood Disorders", "Schizophrenia", "Anxiety Disorders", "Substance Abuse", "Child Psychiatry"] },
  { name: "Anesthesia", slug: "anesthesia", topics: ["General Anesthesia", "Regional Anesthesia", "Airway Management", "ICU Care"] },
  { name: "Radiology", slug: "radiology", topics: ["X-ray Basics", "CT & MRI", "Ultrasound", "Nuclear Medicine", "Interventional Radiology"] },
];

export type TestSeed = {
  slug: string;
  title: string;
  description: string;
  test_type: "grand" | "subject" | "daily";
  duration_min: number;
  total_questions: number;
  subject_slug?: string; // for subject tests
};

export const NEET_PG_TESTS: TestSeed[] = [
  {
    slug: "daily-quiz-mixed",
    title: "Daily Quiz — Mixed Bag",
    description: "10 high-yield NEET PG questions across multiple subjects. Quick daily warm-up.",
    test_type: "daily",
    duration_min: 15,
    total_questions: 10,
  },
  {
    slug: "subject-pharmacology",
    title: "Subject Test — Pharmacology",
    description: "Focused 25-question test on Pharmacology — ANS, antimicrobials, CNS, CVS drugs.",
    test_type: "subject",
    duration_min: 30,
    total_questions: 25,
    subject_slug: "pharmacology",
  },
  {
    slug: "grand-test-1",
    title: "Grand Test #1 — Full Pattern",
    description: "50-question NEET PG grand test across 19 subjects. Latest exam pattern.",
    test_type: "grand",
    duration_min: 60,
    total_questions: 50,
  },
];
