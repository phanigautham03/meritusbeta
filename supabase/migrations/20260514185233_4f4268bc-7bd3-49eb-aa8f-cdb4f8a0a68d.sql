
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.subjects (exam_id, name, slug, sort_order) VALUES
('neet_pg','Anatomy','anatomy',1),('neet_pg','Physiology','physiology',2),('neet_pg','Biochemistry','biochemistry',3),
('neet_pg','Pathology','pathology',4),('neet_pg','Microbiology','microbiology',5),('neet_pg','Pharmacology','pharmacology',6),
('neet_pg','Forensic Medicine','forensic',7),('neet_pg','Community Medicine (PSM)','psm',8),('neet_pg','Ophthalmology','ophtha',9),
('neet_pg','ENT','ent',10),('neet_pg','Medicine','medicine',11),('neet_pg','Surgery','surgery',12),
('neet_pg','Obstetrics & Gynecology','obg',13),('neet_pg','Pediatrics','pediatrics',14),('neet_pg','Orthopedics','ortho',15),
('neet_pg','Dermatology','derma',16),('neet_pg','Psychiatry','psych',17),('neet_pg','Anesthesia','anesthesia',18),
('neet_pg','Radiology','radiology',19)
ON CONFLICT DO NOTHING;

INSERT INTO public.topics (subject_id, name, sort_order)
SELECT s.id, t.name, t.ord FROM public.subjects s
JOIN (VALUES
  ('pharmacology','ANS Drugs',1),('pharmacology','Antimicrobials',2),('pharmacology','CVS Drugs',3),('pharmacology','CNS Drugs',4),('pharmacology','Endocrine Drugs',5),
  ('pathology','General Pathology',1),('pathology','Hematology',2),('pathology','Neoplasia',3),
  ('physiology','Cardiovascular',1),('physiology','Respiratory',2),('physiology','Renal',3),
  ('medicine','Cardiology',1),('medicine','Endocrinology',2),('medicine','Infectious Diseases',3),
  ('microbiology','Bacteriology',1),('microbiology','Virology',2)
) AS t(slug,name,ord) ON t.slug = s.slug AND s.exam_id='neet_pg'
ON CONFLICT DO NOTHING;

INSERT INTO public.tests (exam_id, title, description, test_type, duration_min, total_questions, marks_per_correct, marks_per_wrong, is_published)
SELECT * FROM (VALUES
  ('neet_pg','Daily Quiz — Mixed Bag','10 high-yield NEET PG questions across multiple subjects. Quick daily warm-up.','daily',15,10,4::numeric,-1::numeric,true),
  ('neet_pg','Subject Test — Pharmacology','Focused 10-question test on Pharmacology: ANS, antimicrobials, CNS, CVS, endocrine drugs.','subject',20,10,4::numeric,-1::numeric,true),
  ('neet_pg','Grand Test #1 — Full Pattern','20-question NEET PG grand test across multiple subjects. Latest exam pattern.','grand',30,20,4::numeric,-1::numeric,true)
) AS v(exam_id,title,description,test_type,duration_min,total_questions,mc,mw,pub)
WHERE NOT EXISTS (SELECT 1 FROM public.tests t WHERE t.title = v.title);

WITH q_data(slug, stem, opts, ci, expl, diff) AS (VALUES
('pharmacology','First-line drug for status epilepticus is:', '["Phenytoin","Lorazepam","Valproate","Diazepam"]'::jsonb,1,'IV lorazepam is first-line; faster brain entry & longer duration than diazepam.','easy'),
('pharmacology','Mechanism of action of metformin:', '["Increases insulin secretion","Activates AMP-kinase, decreases hepatic gluconeogenesis","Inhibits alpha-glucosidase","Blocks SGLT2"]'::jsonb,1,'Metformin activates AMPK and reduces hepatic glucose production.','easy'),
('pharmacology','Drug of choice for MRSA bacteremia:', '["Ceftriaxone","Vancomycin","Penicillin G","Amoxicillin"]'::jsonb,1,'Vancomycin remains first-line for MRSA bacteremia; daptomycin is an alternative.','medium'),
('pharmacology','Aspirin irreversibly inhibits:', '["COX-1 only","COX-2 only","COX-1 and COX-2","Lipoxygenase"]'::jsonb,2,'Aspirin acetylates serine of both COX-1 and COX-2.','easy'),
('pharmacology','Beta-blocker contraindicated in asthma:', '["Atenolol","Metoprolol","Propranolol","Bisoprolol"]'::jsonb,2,'Propranolol is non-selective; blocks beta-2 causing bronchospasm.','easy'),
('pharmacology','Antidote for warfarin overdose:', '["Protamine","Vitamin K","Naloxone","Flumazenil"]'::jsonb,1,'Vitamin K reverses warfarin; FFP for emergencies.','easy'),
('pharmacology','Drug causing gingival hyperplasia:', '["Carbamazepine","Phenytoin","Lamotrigine","Levetiracetam"]'::jsonb,1,'Phenytoin classically causes gum hyperplasia (also cyclosporine, nifedipine).','easy'),
('pharmacology','Selective COX-2 inhibitor:', '["Ibuprofen","Naproxen","Celecoxib","Indomethacin"]'::jsonb,2,'Celecoxib is a selective COX-2 inhibitor with reduced GI toxicity.','easy'),
('pharmacology','Mechanism of acyclovir:', '["DNA gyrase inhibitor","Viral DNA polymerase inhibition after phosphorylation","Reverse transcriptase inhibitor","Neuraminidase inhibitor"]'::jsonb,1,'Phosphorylated by viral thymidine kinase; inhibits viral DNA polymerase.','medium'),
('pharmacology','Loop diuretic of choice:', '["Hydrochlorothiazide","Spironolactone","Furosemide","Acetazolamide"]'::jsonb,2,'Furosemide acts on thick ascending limb of loop of Henle.','easy'),
('pathology','Reed-Sternberg cells are characteristic of:', '["Burkitt lymphoma","Hodgkin lymphoma","CLL","Multiple myeloma"]'::jsonb,1,'Owl-eye RS cells are pathognomonic of Hodgkin lymphoma.','easy'),
('pathology','Most common type of renal cell carcinoma:', '["Papillary","Clear cell","Chromophobe","Collecting duct"]'::jsonb,1,'Clear cell RCC ~75% of cases; associated with VHL mutations.','easy'),
('pathology','Philadelphia chromosome translocation:', '["t(8;14)","t(9;22)","t(15;17)","t(14;18)"]'::jsonb,1,'t(9;22) BCR-ABL fusion; CML and some ALL.','easy'),
('pathology','Most common primary brain tumor in adults:', '["Meningioma","Glioblastoma","Schwannoma","Medulloblastoma"]'::jsonb,1,'GBM is the most common malignant primary CNS tumor in adults.','medium'),
('pathology','Classic finding in iron deficiency anemia:', '["Macrocytic","Microcytic hypochromic","Normocytic","Megaloblastic"]'::jsonb,1,'Iron deficiency causes microcytic hypochromic anemia with low ferritin.','easy'),
('physiology','Normal cardiac output at rest (L/min):', '["1-2","3-4","5-6","8-10"]'::jsonb,2,'Resting CO is approximately 5 L/min in average adult.','easy'),
('physiology','Hormone secreted by zona glomerulosa:', '["Cortisol","Aldosterone","Androgens","Adrenaline"]'::jsonb,1,'Glomerulosa secretes aldosterone (mineralocorticoid).','easy'),
('physiology','Site of erythropoietin production:', '["Liver","Kidney peritubular cells","Bone marrow","Spleen"]'::jsonb,1,'Renal peritubular interstitial cells in response to hypoxia.','easy'),
('physiology','Bohr effect describes:', '["Increased pH increases O2 affinity","Decreased pH decreases O2 affinity","CO2 increases O2 affinity","2,3-BPG decreases O2 release"]'::jsonb,1,'Lower pH shifts ODC right, releasing more O2 to tissues.','medium'),
('physiology','Peak expiratory flow rate is measured by:', '["Spirometry","Peak flow meter","Body plethysmography","DLCO"]'::jsonb,1,'PEFR uses a Wright peak flow meter; useful for asthma monitoring.','easy'),
('medicine','Most common cause of community-acquired pneumonia:', '["Mycoplasma","Strep pneumoniae","Klebsiella","Legionella"]'::jsonb,1,'Streptococcus pneumoniae is the most common bacterial cause of CAP.','easy'),
('medicine','First-line therapy for hyperthyroidism in pregnancy (1st trimester):', '["Methimazole","PTU","Radioactive iodine","Surgery"]'::jsonb,1,'PTU preferred in 1st trimester due to teratogenicity of methimazole.','medium'),
('medicine','HbA1c target for most diabetics:', '["<5%","<6%","<7%","<8%"]'::jsonb,2,'ADA recommends <7% for most non-pregnant adults with diabetes.','easy'),
('medicine','S3 gallop indicates:', '["Aortic stenosis","Heart failure / volume overload","Mitral stenosis","Hypertrophy"]'::jsonb,1,'S3 in early diastole due to rapid ventricular filling; common in CHF.','easy'),
('medicine','Earliest serum marker rising in acute MI:', '["LDH","CK-MB","Troponin I","Myoglobin"]'::jsonb,3,'Myoglobin rises earliest (1-4h); troponin remains diagnostic gold standard.','medium'),
('microbiology','Causative organism of typhoid fever:', '["Salmonella typhi","Shigella","E. coli","Vibrio cholerae"]'::jsonb,0,'S. typhi (and paratyphi A/B/C) cause enteric fever.','easy'),
('microbiology','Negri bodies are seen in:', '["Polio","Rabies","Measles","HSV encephalitis"]'::jsonb,1,'Eosinophilic cytoplasmic inclusions in neurons; pathognomonic of rabies.','easy'),
('microbiology','MOA of penicillin:', '["Inhibits 30S ribosome","Inhibits 50S ribosome","Inhibits cell wall PBP","Inhibits DNA gyrase"]'::jsonb,2,'Beta-lactams bind PBPs and inhibit transpeptidation in cell wall synthesis.','easy'),
('microbiology','Drug of choice for Pseudomonas aeruginosa:', '["Vancomycin","Piperacillin-tazobactam","Cephalexin","Ampicillin"]'::jsonb,1,'Antipseudomonal beta-lactam (pip-tazo, cefepime, meropenem) +/- aminoglycoside.','medium'),
('microbiology','Classic finding of malaria peripheral smear:', '["Intracellular ring forms in RBC","Sickle cells","Howell-Jolly bodies","Heinz bodies"]'::jsonb,0,'Plasmodium ring trophozoites inside RBCs on Giemsa stain.','easy')
)
INSERT INTO public.questions (exam_id, subject_id, stem, options, correct_index, explanation, difficulty, source, approved)
SELECT 'neet_pg', s.id, q.stem, q.opts, q.ci, q.expl, q.diff, 'manual', true
FROM q_data q JOIN public.subjects s ON s.slug = q.slug AND s.exam_id='neet_pg'
WHERE NOT EXISTS (SELECT 1 FROM public.questions x WHERE x.stem = q.stem);

WITH t AS (SELECT id FROM public.tests WHERE title='Daily Quiz — Mixed Bag'),
ranked AS (
  SELECT q.id, ROW_NUMBER() OVER (PARTITION BY q.subject_id ORDER BY q.created_at) rn, s.slug
  FROM public.questions q JOIN public.subjects s ON s.id=q.subject_id WHERE q.exam_id='neet_pg'
),
picked AS (SELECT id, ROW_NUMBER() OVER (ORDER BY slug, rn) AS pos FROM ranked WHERE rn <= 2)
INSERT INTO public.test_questions (test_id, question_id, position)
SELECT t.id, p.id, p.pos FROM picked p, t
WHERE NOT EXISTS (SELECT 1 FROM public.test_questions tq WHERE tq.test_id=t.id AND tq.question_id=p.id);

WITH t AS (SELECT id FROM public.tests WHERE title='Subject Test — Pharmacology'),
qs AS (SELECT q.id, ROW_NUMBER() OVER (ORDER BY q.created_at) AS pos
       FROM public.questions q JOIN public.subjects s ON s.id=q.subject_id
       WHERE s.slug='pharmacology' AND q.exam_id='neet_pg')
INSERT INTO public.test_questions (test_id, question_id, position)
SELECT t.id, qs.id, qs.pos FROM qs, t
WHERE NOT EXISTS (SELECT 1 FROM public.test_questions tq WHERE tq.test_id=t.id AND tq.question_id=qs.id);

WITH t AS (SELECT id FROM public.tests WHERE title='Grand Test #1 — Full Pattern'),
qs AS (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS pos
       FROM public.questions WHERE exam_id='neet_pg' LIMIT 20)
INSERT INTO public.test_questions (test_id, question_id, position)
SELECT t.id, qs.id, qs.pos FROM qs, t
WHERE NOT EXISTS (SELECT 1 FROM public.test_questions tq WHERE tq.test_id=t.id AND tq.question_id=qs.id);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
