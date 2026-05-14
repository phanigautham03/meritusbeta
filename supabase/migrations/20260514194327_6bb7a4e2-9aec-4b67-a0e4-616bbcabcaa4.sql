
-- =========================================================
-- MOCK TESTS
-- =========================================================
CREATE TABLE public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  num_questions INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  subject TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock_tests read all auth" ON public.mock_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "mock_tests admin write" ON public.mock_tests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- MENTOR PROFILES
-- =========================================================
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_cleared TEXT,
  rank_achieved TEXT,
  institution TEXT,
  price_per_session INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  specialisation_tags TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentors read active" ON public.mentor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "mentors admin write" ON public.mentor_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- STUDY TOPICS
-- =========================================================
CREATE TABLE public.study_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_name, subject, topic_name)
);
ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics read all" ON public.study_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "topics admin write" ON public.study_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- USER STREAKS (one row per user)
-- =========================================================
CREATE TABLE public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks self read" ON public.user_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "streaks self write" ON public.user_streaks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- USER EXAMS (target exams a student is preparing for)
-- =========================================================
CREATE TABLE public.user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  target_date DATE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, exam_name)
);
ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_exams self all" ON public.user_exams FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- TOPIC REVISIONS (forget meter)
-- =========================================================
CREATE TABLE public.topic_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.study_topics(id) ON DELETE CASCADE,
  retention_score INTEGER NOT NULL DEFAULT 100 CHECK (retention_score BETWEEN 0 AND 100),
  last_revised_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  times_revised INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, topic_id)
);
ALTER TABLE public.topic_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revisions self all" ON public.topic_revisions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- TEST ATTEMPTS — add link to mock_tests (keeps existing test_id)
-- =========================================================
ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL;
ALTER TABLE public.test_attempts ALTER COLUMN test_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS test_attempts_mock_test_id_idx ON public.test_attempts(mock_test_id);

-- =========================================================
-- PROFILES — add leaderboard / display columns
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS merit_points INTEGER NOT NULL DEFAULT 0;

-- =========================================================
-- LEADERBOARD VIEW
-- =========================================================
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = on) AS
SELECT
  ROW_NUMBER() OVER (ORDER BY p.merit_points DESC NULLS LAST, p.created_at ASC)::INTEGER AS rank,
  p.id AS user_id,
  COALESCE(p.first_name, p.display_name, 'Student') AS first_name,
  p.city,
  p.merit_points,
  COALESCE(s.current_streak, 0) AS current_streak
FROM public.profiles p
LEFT JOIN public.user_streaks s ON s.user_id = p.id;

GRANT SELECT ON public.leaderboard TO authenticated, anon;

-- =========================================================
-- SEED: MOCK TESTS (8)
-- =========================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, questions) VALUES
('JEE Main','JEE Main 2024 – Physics Full Test','Covers mechanics, thermodynamics, optics and electromagnetism with PYQs from 2023–24.',5,60,'hard','Physics','[{"id":1,"text":"A body of mass 1 kg is thrown upward with velocity 20 m/s. It comes to rest after attaining height 18 m. How much energy is lost due to air friction? (g=10 m/s²)","options":["20 J","30 J","40 J","10 J"],"correct":0,"explanation":"KE at start = ½mv² = 200 J. PE gained = mgh = 180 J. Energy lost = 200−180 = 20 J.","subject":"Physics","topic":"Work, Energy and Power","source":"NCERT Class 11","year":2023},{"id":2,"text":"A particle executes SHM of amplitude A. Distance from mean position when KE equals PE is:","options":["A/√2","A/2","A√2","A/4"],"correct":0,"explanation":"KE=PE → ½mω²(A²−x²)=½mω²x² → x=A/√2","subject":"Physics","topic":"Oscillations","source":"NCERT Class 11","year":2024},{"id":3,"text":"Two resistances R₁=100Ω and R₂=200Ω are in parallel. Ratio of thermal energy in R₁ to R₂ is:","options":["2:1","1:4","4:1","1:2"],"correct":0,"explanation":"In parallel, V same. P=V²/R. P₁/P₂=R₂/R₁=200/100=2:1.","subject":"Physics","topic":"Current Electricity","source":"NCERT Class 12","year":2023},{"id":4,"text":"A ray passes through equilateral prism. Angle of incidence = angle of emergence = (3/4)×angle of prism. Angle of minimum deviation is:","options":["45°","30°","15°","60°"],"correct":1,"explanation":"A=60°, i=e=45°, δ=2i−A=90°−60°=30°","subject":"Physics","topic":"Ray Optics","source":"NCERT Class 12","year":2022},{"id":5,"text":"In photoelectric effect, stopping potential depends on: 1.Frequency of light 2.Intensity 3.Nature of metal","options":["1 and 3 only","1, 2 and 3","1 and 2 only","2 and 3 only"],"correct":0,"explanation":"Stopping potential eV₀=hν−φ depends on frequency and work function (nature of metal). Not on intensity.","subject":"Physics","topic":"Dual Nature of Radiation","source":"NCERT Class 12","year":2024}]'::jsonb),
('JEE Main','JEE Main – Chemistry: Organic and Inorganic','Periodic table trends, chemical bonding, organic reactions, name reactions.',5,45,'medium','Chemistry','[{"id":1,"text":"Which of the following has the maximum bond angle?","options":["H₂O","NH₃","CH₄","BF₃"],"correct":3,"explanation":"BF₃ has sp² hybridisation with no lone pairs → 120°. CH₄=109.5°, NH₃=107°, H₂O=104.5°","subject":"Chemistry","topic":"Chemical Bonding","source":"NCERT Class 11","year":2024},{"id":2,"text":"Cannizzaro reaction is given by which aldehyde?","options":["HCHO","CH₃CHO","C₂H₅CHO","CH₃COCH₃"],"correct":0,"explanation":"Cannizzaro occurs with aldehydes having no α-H. HCHO has no α-H → undergoes self-redox in strong base.","subject":"Chemistry","topic":"Aldehydes and Ketones","source":"NCERT Class 12","year":2023},{"id":3,"text":"IUPAC name of CH₃−CH(OH)−CH₂−COOH is:","options":["3-hydroxybutanoic acid","2-hydroxybutanoic acid","β-hydroxybutyric acid","3-methylpropanoic acid"],"correct":0,"explanation":"4-carbon chain, COOH at C1, OH at C3 → 3-hydroxybutanoic acid.","subject":"Chemistry","topic":"Nomenclature","source":"NCERT Class 11","year":2022},{"id":4,"text":"Which is NOT a characteristic of transition elements?","options":["They always form coloured compounds","They exhibit variable oxidation states","They form complex compounds","They act as catalysts"],"correct":0,"explanation":"Sc³⁺ and Ti⁴⁺ are colourless (no unpaired d electrons). Transition elements do NOT always form coloured compounds.","subject":"Chemistry","topic":"d and f Block Elements","source":"NCERT Class 12","year":2024},{"id":5,"text":"Molarity of solution: 40g of NaOH (M=40) dissolved to make 2L:","options":["0.5 M","1 M","2 M","0.25 M"],"correct":0,"explanation":"Molarity = (40/40)/2 = 0.5 M","subject":"Chemistry","topic":"Solutions","source":"NCERT Class 12","year":2023}]'::jsonb),
('NEET','NEET 2024 – Biology: Human Physiology','Nervous system, digestion, respiration, circulation, excretion — NTA pattern.',5,50,'medium','Biology','[{"id":1,"text":"Correct sequence in human alimentary canal?","options":["Mouth→Oesophagus→Stomach→Small intestine→Large intestine","Mouth→Pharynx→Oesophagus→Duodenum→Stomach","Mouth→Stomach→Oesophagus→Small intestine→Large intestine","Mouth→Oesophagus→Duodenum→Stomach→Ileum"],"correct":0,"explanation":"Correct: Mouth→Pharynx→Oesophagus→Stomach→Duodenum→Jejunum→Ileum→Caecum→Colon→Rectum→Anus","subject":"Biology","topic":"Digestion and Absorption","source":"NCERT Class 11","year":2024},{"id":2,"text":"Which hormone is responsible for fight or flight response?","options":["Adrenaline (Epinephrine)","Cortisol","Thyroxine","Aldosterone"],"correct":0,"explanation":"Adrenaline from adrenal medulla triggers fight-or-flight: increases heart rate, BP, glucose.","subject":"Biology","topic":"Chemical Coordination","source":"NCERT Class 11","year":2023},{"id":3,"text":"Tidal volume refers to:","options":["Volume inspired or expired with each normal breath","Maximum volume that can be inspired","Volume remaining after maximum expiration","Maximum volume that can be expired forcibly"],"correct":0,"explanation":"Tidal Volume ≈ 500 mL. Volume per normal breath during quiet breathing.","subject":"Biology","topic":"Breathing and Exchange of Gases","source":"NCERT Class 11","year":2022},{"id":4,"text":"Bowman''s capsule is part of which structure?","options":["Nephron (Malpighian body)","Loop of Henle","Collecting duct","Ureter"],"correct":0,"explanation":"Bowman''s capsule + glomerulus = renal corpuscle (Malpighian body). Glomerular filtration occurs here.","subject":"Biology","topic":"Excretion","source":"NCERT Class 11","year":2024},{"id":5,"text":"Antibodies are produced by:","options":["Plasma cells (activated B-lymphocytes)","T-lymphocytes","Macrophages","Natural killer cells"],"correct":0,"explanation":"Antibodies (immunoglobulins) produced by plasma cells — differentiated B-lymphocytes activated by antigens.","subject":"Biology","topic":"Human Health and Disease","source":"NCERT Class 12","year":2023}]'::jsonb),
('NEET','NEET 2024 – Chemistry: Physical Chemistry','Atomic structure, thermodynamics, chemical kinetics, equilibrium.',5,45,'medium','Chemistry','[{"id":1,"text":"Energy required to remove electron from hydrogen atom ground state (energy = −13.6 eV):","options":["13.6 eV","6.8 eV","27.2 eV","−13.6 eV"],"correct":0,"explanation":"Ionisation energy = |−13.6| = 13.6 eV.","subject":"Chemistry","topic":"Structure of Atom","source":"NCERT Class 11","year":2023},{"id":2,"text":"For a first-order reaction, the half-life period is:","options":["Independent of initial concentration","Directly proportional to initial concentration","Inversely proportional to initial concentration","Proportional to square of initial concentration"],"correct":0,"explanation":"t½=0.693/k. Depends only on rate constant k, not concentration.","subject":"Chemistry","topic":"Chemical Kinetics","source":"NCERT Class 12","year":2024},{"id":3,"text":"Which of the following is an extensive property?","options":["Volume","Density","Temperature","Viscosity"],"correct":0,"explanation":"Extensive properties depend on amount: Volume, mass, enthalpy. Density, temperature, pressure are intensive.","subject":"Chemistry","topic":"Thermodynamics","source":"NCERT Class 11","year":2022},{"id":4,"text":"N₂+3H₂⇌2NH₃. If pressure increases, equilibrium shifts to:","options":["Right (towards NH₃)","Left (towards N₂ and H₂)","No shift","Cannot be determined"],"correct":0,"explanation":"Le Chatelier: Increased pressure → shift to fewer moles of gas. Left=4 moles, Right=2 moles → shifts RIGHT.","subject":"Chemistry","topic":"Equilibrium","source":"NCERT Class 11","year":2024},{"id":5,"text":"Gas produced when sodium reacts with water:","options":["Hydrogen (H₂)","Oxygen (O₂)","Sodium oxide","Hydrogen peroxide"],"correct":0,"explanation":"2Na+2H₂O→2NaOH+H₂↑","subject":"Chemistry","topic":"s-Block Elements","source":"NCERT Class 11","year":2023}]'::jsonb),
('UPSC','UPSC Prelims 2024 – General Studies Paper I','Indian polity, history, geography, economy, environment — UPSC CSE pattern.',5,60,'hard','General Studies','[{"id":1,"text":"Which are included in Directive Principles of State Policy? 1.Equal justice & free legal aid 2.Workers participation in management 3.Equal pay for equal work","options":["1 and 3 only","2 and 3 only","1, 2 and 3","1 and 2 only"],"correct":2,"explanation":"All three are DPSPs: Article 39A (equal justice), Article 43A (workers participation), Article 39(d) (equal pay).","subject":"Polity","topic":"Directive Principles","source":"Constitution of India","year":2023},{"id":2,"text":"Which mountain passes are in Ladakh? 1.Chang La 2.Khardung La 3.Nathu La","options":["1 and 2 only","3 only","1, 2 and 3","2 and 3 only"],"correct":0,"explanation":"Chang La and Khardung La are in Ladakh. Nathu La is in Sikkim.","subject":"Geography","topic":"Physical Features of India","source":"NCERT Class 11","year":2023},{"id":3,"text":"The term Jalmarg Vikas refers to:","options":["Inland waterways development project","National water grid","Rainwater harvesting scheme","River interlinking project"],"correct":0,"explanation":"Jalmarg Vikas focuses on National Waterway-1 (Ganga river) navigability development.","subject":"Economy","topic":"Infrastructure","source":"Ministry of Ports","year":2024},{"id":4,"text":"Which are ecologically sensitive areas under Environment Protection Act 1986? 1.Tiger reserves 2.Biodiversity hotspots 3.Biosphere reserves","options":["1 only","2 and 3 only","1 and 3 only","1, 2 and 3"],"correct":3,"explanation":"All three can be declared eco-sensitive zones under EPA 1986.","subject":"Environment","topic":"Biodiversity and Conservation","source":"MoEFCC","year":2022},{"id":5,"text":"Mission Indradhanush is related to:","options":["Universal Immunisation Programme","Digital literacy","Clean Ganga Mission","Solar energy targets"],"correct":0,"explanation":"Mission Indradhanush (2014) aims to immunise children under 2 years and pregnant women with all available vaccines.","subject":"Health","topic":"Government Schemes","source":"Ministry of Health","year":2023}]'::jsonb),
('IBPS PO','IBPS PO 2024 – Quantitative Aptitude','Number series, data interpretation, simplification, ratio & proportion.',5,40,'medium','Quantitative Aptitude','[{"id":1,"text":"A train 240m long passes a pole in 24 seconds and a platform in 52 seconds. Length of platform?","options":["280 m","240 m","360 m","320 m"],"correct":0,"explanation":"Speed=240/24=10 m/s. Distance in 52s=520m=train+platform. Platform=520−240=280m.","subject":"Quantitative Aptitude","topic":"Time Speed Distance","source":"IBPS PO 2023","year":2023},{"id":2,"text":"A:B=2:3 and B:C=4:5, then A:B:C=?","options":["8:12:15","2:3:5","4:6:10","6:9:15"],"correct":0,"explanation":"Make B equal: A:B=8:12, B:C=12:15. Combined A:B:C=8:12:15.","subject":"Quantitative Aptitude","topic":"Ratio and Proportion","source":"IBPS PO 2022","year":2022},{"id":3,"text":"A sum doubles at compound interest in 3 years. In how many years will it become 8 times?","options":["9 years","6 years","12 years","8 years"],"correct":0,"explanation":"Doubles in 3 years: (1+r)³=2. For 8=2³: n=9 years.","subject":"Quantitative Aptitude","topic":"Compound Interest","source":"IBPS PO 2024","year":2024},{"id":4,"text":"Next number in series: 2, 6, 12, 20, 30, ?","options":["42","40","36","44"],"correct":0,"explanation":"Pattern: n(n+1). Next is 6×7=42. Differences: 4,6,8,10,12.","subject":"Quantitative Aptitude","topic":"Number Series","source":"IBPS PO 2023","year":2023},{"id":5,"text":"Shopkeeper sells at 20% profit. Cost price ₹1500. Selling price?","options":["₹1800","₹1700","₹1750","₹1900"],"correct":0,"explanation":"SP=CP×1.2=1500×1.2=₹1800","subject":"Quantitative Aptitude","topic":"Profit and Loss","source":"IBPS PO 2022","year":2022}]'::jsonb),
('CAT','CAT 2024 – Verbal Ability & Reading Comprehension','Para-jumbles, critical reasoning, reading comprehension — IIM CAT pattern.',5,40,'hard','Verbal Ability','[{"id":1,"text":"Most logical order: P:Brain has 100 billion neurons. Q:Each neuron connects with thousands. R:This creates unimaginable complexity. S:Yet this gives rise to thought and consciousness.","options":["PQRS","QPRS","PRQS","SQRP"],"correct":0,"explanation":"P introduces neurons→Q describes connections→R describes complexity→S philosophical conclusion.","subject":"Verbal Ability","topic":"Para-jumbles","source":"CAT 2023","year":2023},{"id":2,"text":"Word closest in meaning to SANGUINE:","options":["Optimistic","Melancholic","Aggressive","Indifferent"],"correct":0,"explanation":"Sanguine means optimistic or positive, especially in difficult situations.","subject":"Verbal Ability","topic":"Vocabulary","source":"CAT 2022","year":2022},{"id":3,"text":"Sentence with grammatical error: A)Committee has submitted its report B)Neither of the students have submitted C)Jury is divided in its opinion D)Each of the players has been informed","options":["B","A","C","D"],"correct":0,"explanation":"Neither takes singular verb. Should be: Neither of the students HAS submitted.","subject":"Verbal Ability","topic":"Grammar","source":"CAT 2024","year":2024},{"id":4,"text":"EPHEMERAL most closely means:","options":["Short-lived","Eternal","Powerful","Mysterious"],"correct":0,"explanation":"Ephemeral = lasting for a very short time. Antonym: eternal.","subject":"Verbal Ability","topic":"Vocabulary","source":"CAT 2023","year":2023},{"id":5,"text":"The scientist''s discovery was so _____ that it completely transformed our understanding of the universe.","options":["paradigm-shifting","incremental","rudimentary","conventional"],"correct":0,"explanation":"Paradigm-shifting = causing fundamental change in approach — fits perfectly here.","subject":"Verbal Ability","topic":"Vocabulary in Context","source":"CAT 2022","year":2022}]'::jsonb),
('GATE','GATE 2024 – Computer Science: Data Structures & Algorithms','Arrays, trees, graphs, sorting, dynamic programming — GATE CSE pattern.',5,45,'hard','Computer Science','[{"id":1,"text":"Time complexity of building a heap from array of n elements?","options":["O(n)","O(n log n)","O(log n)","O(n²)"],"correct":0,"explanation":"Floyd''s bottom-up heapification runs in O(n), not O(n log n).","subject":"CS","topic":"Heap and Priority Queue","source":"GATE 2023","year":2023},{"id":2,"text":"Which sorting algorithm is stable AND has O(n log n) worst-case?","options":["Merge sort","Quick sort","Heap sort","Shell sort"],"correct":0,"explanation":"Merge sort is stable and O(n log n) always. Quick sort has O(n²) worst case; Heap sort is O(n log n) but unstable.","subject":"CS","topic":"Sorting Algorithms","source":"GATE 2022","year":2022},{"id":3,"text":"In a BST, worst-case time for search, insert, delete?","options":["O(n)","O(log n)","O(1)","O(n log n)"],"correct":0,"explanation":"Worst case = skewed BST (degenerated linked list) → O(n).","subject":"CS","topic":"Binary Search Trees","source":"GATE 2024","year":2024},{"id":4,"text":"Which can be solved using Dynamic Programming? 1.LCS 2.0/1 Knapsack 3.N-Queens 4.Fibonacci","options":["1, 2 and 4","1 and 2 only","3 and 4 only","1, 2, 3 and 4"],"correct":0,"explanation":"LCS, Knapsack, Fibonacci have optimal substructure+overlapping subproblems. N-Queens uses backtracking.","subject":"CS","topic":"Dynamic Programming","source":"GATE 2023","year":2023},{"id":5,"text":"Dijkstra''s algorithm fails when:","options":["There are negative weight edges","Graph is disconnected","Graph has cycles","There are parallel edges"],"correct":0,"explanation":"Dijkstra assumes non-negative weights. Use Bellman-Ford for negative edges.","subject":"CS","topic":"Graph Algorithms","source":"GATE 2022","year":2022}]'::jsonb);

-- =========================================================
-- SEED: MENTORS (6)
-- =========================================================
INSERT INTO public.mentor_profiles (name, exam_cleared, rank_achieved, institution, price_per_session, rating, sessions_count, specialisation_tags, bio, is_active) VALUES
('Arjun Mehta','JEE Advanced 2022','AIR 47','IIT Bombay (B.Tech CSE)',499,4.9,312,ARRAY['JEE Main','JEE Advanced','Mathematics','Physics'],'AIR 47 in JEE Advanced 2022. Now at IIT Bombay CSE. I specialise in problem-solving shortcuts for JEE Maths and Physics. Cracked every section in the first attempt with a focus on concepts over rote learning.',true),
('Priya Sharma','NEET 2021','AIR 312','AIIMS Delhi (MBBS)',699,4.8,487,ARRAY['NEET','Biology','Chemistry'],'AIIMS Delhi MBBS student. NEET 2021 AIR 312 with 698/720. Biology specialist — I can help you score 350+ in Biology alone. My targeted revision strategy reduces preparation time by 40%.',true),
('Vikram Nair','UPSC CSE 2020','IAS AIR 89','LBSNAA Mussoorie',999,4.9,203,ARRAY['UPSC','GS Paper I','GS Paper II','Essay'],'IAS Officer, UPSC CSE 2020 AIR 89. Currently at LBSNAA. Mentored 20+ candidates who cleared Mains and Interview. Specialises in answer writing and current affairs integration.',true),
('Ananya Krishnan','IBPS PO 2022','Selected — Punjab National Bank','Punjab National Bank Mumbai',299,4.7,156,ARRAY['IBPS PO','SBI PO','Quantitative Aptitude','Reasoning'],'Cleared SBI Clerk, IBPS Clerk, and IBPS PO in the same year. Expertise in Quant shortcuts and Reasoning puzzles. Average student score improvement: 18 marks in 4 weeks.',true),
('Rohan Gupta','CAT 2023','99.4 Percentile','IIM Ahmedabad (MBA 2024)',799,4.8,91,ARRAY['CAT','XAT','GMAT','Verbal Ability','DILR'],'IIM Ahmedabad MBA. CAT 2023 — VARC 99.8, DILR 99.1, QA 98.7. I teach the reading framework that gets you 99+ in VARC without memorising vocabulary lists.',true),
('Sneha Patel','GATE CSE 2023','AIR 156','IIT Madras (M.Tech CSE)',399,4.6,78,ARRAY['GATE','GATE CSE','Data Structures','Algorithms','Operating Systems'],'GATE CSE 2023 AIR 156. IIT Madras M.Tech. Specialises in DS, Algorithms, OS, DBMS — the 4 subjects that determine your GATE rank.',true);

-- =========================================================
-- SEED: STUDY TOPICS (65)
-- =========================================================
INSERT INTO public.study_topics (exam_name, subject, topic_name) VALUES
('JEE Main','Physics','Laws of Motion'),('JEE Main','Physics','Work, Energy and Power'),('JEE Main','Physics','Rotational Motion'),('JEE Main','Physics','Gravitation'),('JEE Main','Physics','Thermodynamics'),('JEE Main','Physics','Waves and Sound'),('JEE Main','Physics','Current Electricity'),('JEE Main','Physics','Electromagnetic Induction'),('JEE Main','Physics','Ray Optics'),('JEE Main','Physics','Modern Physics and Dual Nature'),
('JEE Main','Chemistry','Atomic Structure'),('JEE Main','Chemistry','Chemical Bonding and Molecular Structure'),('JEE Main','Chemistry','Chemical Equilibrium'),('JEE Main','Chemistry','Organic Chemistry Basics'),('JEE Main','Chemistry','Electrochemistry'),('JEE Main','Chemistry','Coordination Compounds'),
('JEE Main','Mathematics','Quadratic Equations'),('JEE Main','Mathematics','Trigonometry'),('JEE Main','Mathematics','Calculus — Limits and Derivatives'),('JEE Main','Mathematics','Integration'),('JEE Main','Mathematics','Vectors and 3D Geometry'),('JEE Main','Mathematics','Probability'),
('NEET','Biology','Cell Biology and Cell Division'),('NEET','Biology','Genetics and Evolution'),('NEET','Biology','Human Physiology'),('NEET','Biology','Plant Physiology'),('NEET','Biology','Ecology and Environment'),('NEET','Biology','Reproduction in Organisms'),('NEET','Biology','Biotechnology and its Applications'),('NEET','Biology','Biomolecules'),
('UPSC','Polity','Fundamental Rights and Duties'),('UPSC','Polity','Directive Principles of State Policy'),('UPSC','Polity','Parliament and Legislation'),('UPSC','Polity','Judiciary and Supreme Court'),('UPSC','History','Freedom Movement — 1857 to 1947'),('UPSC','History','Ancient Indian History'),('UPSC','History','Medieval Indian History'),('UPSC','Geography','Physical Geography of India'),('UPSC','Geography','Indian Rivers and Water Bodies'),('UPSC','Economy','Indian Economy and Planning'),('UPSC','Environment','Biodiversity and Conservation'),('UPSC','Current Affairs','Government Schemes 2024'),
('IBPS PO','Quantitative Aptitude','Number Series'),('IBPS PO','Quantitative Aptitude','Data Interpretation'),('IBPS PO','Quantitative Aptitude','Compound Interest and Simple Interest'),('IBPS PO','Reasoning','Puzzles and Seating Arrangement'),('IBPS PO','Reasoning','Syllogisms'),('IBPS PO','English','Reading Comprehension'),('IBPS PO','English','Error Spotting and Sentence Correction'),
('GATE','CS','Data Structures'),('GATE','CS','Algorithms and Complexity'),('GATE','CS','Operating Systems'),('GATE','CS','Database Management Systems'),('GATE','CS','Computer Networks'),('GATE','CS','Theory of Computation'),('GATE','CS','Digital Logic'),
('CAT','Verbal Ability','Reading Comprehension'),('CAT','Verbal Ability','Para-jumbles and Para-summary'),('CAT','DILR','Data Interpretation — Tables and Graphs'),('CAT','DILR','Logical Reasoning — Puzzles'),('CAT','QA','Arithmetic — Percentages and Profit-Loss'),('CAT','QA','Algebra and Functions'),
('SSC CGL','Quantitative Aptitude','Geometry and Mensuration'),('SSC CGL','Quantitative Aptitude','Number System'),('SSC CGL','English','Idioms and Phrases'),('SSC CGL','General Awareness','History and Culture')
ON CONFLICT (exam_name, subject, topic_name) DO NOTHING;
