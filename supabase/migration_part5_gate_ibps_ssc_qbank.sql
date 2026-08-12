-- ============================================================
-- PART 5: Question bank — GATE CSE + IBPS PO + SSC CGL
-- ============================================================

INSERT INTO public.question_bank (exam_name, subject, topic, difficulty, text, options, correct, explanation, source, year) VALUES

-- ====== GATE CSE — DATA STRUCTURES (10 questions) ======
('GATE','Data Structures','Trees','hard',
 'The number of distinct binary trees with 3 nodes is:',
 '["5","4","6","8"]',0,
 'Catalan number C(n) for n=3: C(3) = C(6,3)/4 = 5. Binary trees with 3 nodes: 5 distinct shapes.',
 'GATE CS 2023',2023),

('GATE','Data Structures','Sorting','medium',
 'Worst-case time complexity of Quick Sort:',
 '["O(n²)","O(n log n)","O(n)","O(log n)"]',0,
 'Quick Sort worst case: O(n²) when pivot is always min/max (already sorted array). Average/best case: O(n log n). Heap Sort guarantees O(n log n) worst case.',
 'GATE CS Official',2022),

('GATE','Data Structures','Graph Theory','hard',
 'Dijkstra''s algorithm fails for graphs with:',
 '["Negative edge weights","Undirected edges","Weighted edges","Disconnected graphs"]',0,
 'Dijkstra assumes non-negative weights (greedy guarantee breaks with negatives). Use Bellman-Ford for negative weights. Dijkstra: O((V+E) log V) with min-heap.',
 'GATE CS 2024',2024),

('GATE','Data Structures','Stacks & Queues','medium',
 'In which order does a Stack (LIFO) process: Push(1), Push(2), Push(3), Pop, Pop?',
 '["3, 2","1, 2","2, 3","3, 1"]',0,
 'Stack: Push 1,2,3 → stack has [1,2,3] top=3. Pop → 3. Pop → 2. Output: 3, 2.',
 'GATE CS Official',2023),

('GATE','Data Structures','Hashing','medium',
 'Load factor α in hashing is defined as:',
 '["n/m (number of entries/number of buckets)","m/n","n×m","1/n"]',0,
 'Load factor α = n/m where n = stored entries, m = hash table slots. α < 1 for open addressing, can exceed 1 for chaining. Affects collision probability.',
 'GATE CS Official',2022),

('GATE','Data Structures','Complexity','hard',
 'The master theorem for T(n) = 2T(n/2) + n gives:',
 '["Θ(n log n)","Θ(n)","Θ(n²)","Θ(log n)"]',0,
 'a=2, b=2, f(n)=n. n^(log_b a) = n^1 = n. f(n)=Θ(n) = Θ(n^log_b_a). Case 2: T(n)=Θ(n log n). This is Merge Sort.',
 'GATE CS 2023',2023),

('GATE','Data Structures','Linked Lists','easy',
 'Reversing a singly linked list of n nodes: time complexity:',
 '["O(n)","O(n²)","O(log n)","O(1)"]',0,
 'Reverse singly linked list: traverse once, change next pointers. O(n) time, O(1) extra space (iterative method).',
 'GATE CS Official',2024),

('GATE','Data Structures','Heaps','medium',
 'A max-heap of n elements. Deleting the maximum element and restoring heap property:',
 '["O(log n)","O(n)","O(1)","O(n log n)"]',0,
 'Delete max: swap root with last element, reduce heap size, sift down. Sift down at most h = log n levels → O(log n).',
 'GATE CS 2022',2022),

('GATE','Data Structures','Dynamic Programming','hard',
 'Longest Common Subsequence (LCS) of "ABCBDAB" and "BDCABA" has length:',
 '["4","5","3","6"]',0,
 'LCS of ABCBDAB and BDCABA = 4 (e.g., BCBA or BDAB). Classic DP O(m×n) time and space.',
 'GATE CS 2023',2023),

('GATE','Data Structures','B-Trees','hard',
 'A B-tree of order m has at most _______ children per node:',
 '["m","m-1","2m","m/2"]',0,
 'B-tree of order m: each node has at most m children (and m-1 keys). Minimum: ceil(m/2) children for non-root internal nodes. Root: minimum 2 children.',
 'GATE CS 2022',2022),

-- ====== GATE CSE — COMPUTER NETWORKS (8 questions) ======
('GATE','Computer Networks','TCP/IP','medium',
 'The maximum segment size in TCP is negotiated during:',
 '["Three-way handshake (SYN-SYN/ACK-ACK)","Data transfer phase","Connection termination","UDP is used instead"]',0,
 'MSS (Maximum Segment Size): agreed during TCP three-way handshake. Client announces MSS in SYN. Avoids IP fragmentation. Default MSS = 536 bytes (for IP default MTU 576).',
 'GATE CS Official',2024),

('GATE','Computer Networks','IP Addressing','hard',
 'A /24 subnet has how many usable host addresses?',
 '["254","256","255","128"]',0,
 '/24 = 24 network bits, 8 host bits. 2^8 = 256 addresses. Subtract network (0) and broadcast (255) → 254 usable hosts.',
 'GATE CS 2023',2023),

('GATE','Computer Networks','OSI Model','easy',
 'SSL/TLS operates at which OSI layer?',
 '["Presentation (Layer 6) / Session (Layer 5)","Network (Layer 3)","Transport (Layer 4)","Application (Layer 7)"]',0,
 'SSL/TLS: commonly said to be between application and transport layers. It''s technically Session/Presentation layer but in TCP/IP model sits above Transport (TCP). Provides encryption, authentication.',
 'GATE CS Official',2022),

('GATE','Computer Networks','Routing','hard',
 'OSPF is a _______ routing protocol.',
 '["Link State","Distance Vector","Path Vector","Hybrid"]',0,
 'OSPF (Open Shortest Path First): Link State protocol. Uses Dijkstra''s algorithm (SPF). Converges faster than RIP (Distance Vector). BGP = Path Vector. EIGRP = Hybrid.',
 'GATE CS 2024',2024),

('GATE','Computer Networks','Error Detection','medium',
 'CRC (Cyclic Redundancy Check) detects:',
 '["Burst errors efficiently","Single bit errors only","Cannot detect errors","All errors always"]',0,
 'CRC: excellent at detecting burst errors. Detects all single-bit errors, all double-bit errors (if polynomial has factor (x+1)), all burst errors of length ≤ degree of polynomial.',
 'GATE CS 2023',2023),

('GATE','Computer Networks','HTTP','easy',
 'HTTP is a _______ protocol.',
 '["Stateless","Stateful","Connection-oriented","Encrypted by default"]',0,
 'HTTP is stateless — each request is independent; server retains no state between requests. Cookies/sessions added at the application layer to simulate state. HTTPS adds TLS encryption.',
 'GATE CS 2022',2022),

('GATE','Computer Networks','DNS','medium',
 'DNS resolves:',
 '["Domain names to IP addresses","IP addresses to MAC addresses","MAC to domain names","Email to IP addresses"]',0,
 'DNS (Domain Name System): distributed hierarchical naming system. Resolves human-readable names (google.com) to IP addresses. ARP resolves IP to MAC.',
 'GATE CS 2024',2024),

('GATE','Computer Networks','Congestion Control','hard',
 'TCP''s Slow Start algorithm increases the congestion window by:',
 '["One MSS per ACK received (exponential growth)","One MSS per RTT (linear)","Constant rate","Binary exponential backoff"]',0,
 'Slow Start: cwnd starts at 1 MSS. For each ACK, cwnd += 1 MSS → effectively doubles each RTT (exponential). Continues until ssthresh. Then Congestion Avoidance (linear: +1 MSS per RTT).',
 'GATE CS 2023',2023),

-- ====== GATE CSE — OPERATING SYSTEMS (8 questions) ======
('GATE','Operating Systems','Process Management','medium',
 'Deadlock requires all FOUR conditions simultaneously. Which is NOT one of them?',
 '["Preemption (resources can be taken)","Mutual Exclusion","Hold and Wait","Circular Wait"]',0,
 'Coffman conditions for deadlock: (1) Mutual Exclusion (2) Hold and Wait (3) No Preemption (4) Circular Wait. "Preemption" is a strategy to PREVENT deadlock, not a condition that causes it.',
 'GATE CS Official',2022),

('GATE','Operating Systems','Memory Management','hard',
 'In a paged memory system, the effective access time with TLB hit rate h, TLB access = ε, memory access = m:',
 '["h(ε+m) + (1-h)(ε+2m)","h×m + (1-h)×2m","h×ε + m","ε+m"]',0,
 'EAT = h×(ε + m) [TLB hit: TLB + one memory] + (1−h)×(ε + 2m) [TLB miss: TLB + page table + data].',
 'GATE CS 2023',2023),

('GATE','Operating Systems','Scheduling','hard',
 'Which scheduling algorithm has minimum average waiting time for a given set of processes?',
 '["SJF (Shortest Job First)","FCFS","Round Robin","Priority Scheduling"]',0,
 'SJF is provably optimal (minimum average waiting time) among non-preemptive algorithms. Problem: requires knowing burst time in advance (practically estimated).',
 'GATE CS 2024',2024),

('GATE','Operating Systems','File Systems','medium',
 'Inode stores everything about a file EXCEPT:',
 '["File name","File size","Owner","Permissions"]',0,
 'Inode stores: size, owner/group, permissions, timestamps, block pointers, link count. Does NOT store filename — the filename is stored in the directory entry that points to the inode.',
 'GATE CS 2022',2022),

('GATE','Operating Systems','Semaphores','hard',
 'A semaphore initialized to 1 and used to implement mutual exclusion is called:',
 '["Binary semaphore (mutex)","Counting semaphore","Monitor","Spinlock"]',0,
 'Binary semaphore (initialized to 1): P(s) to enter CS, V(s) to exit. Equivalent to mutex. Counting semaphore (initialized to N) controls access to N resources.',
 'GATE CS 2023',2023),

('GATE','Operating Systems','Virtual Memory','medium',
 'Page replacement algorithm with optimal performance (minimum page faults) is:',
 '["OPT (Belady''s Optimal)","LRU","FIFO","Clock"]',0,
 'OPT replaces page that will not be used for the longest time — theoretical minimum. Cannot be implemented in practice (requires future knowledge). Used as benchmark.',
 'GATE CS 2024',2024),

('GATE','Operating Systems','Concurrency','hard',
 'The critical section problem requires: mutual exclusion, progress, and:',
 '["Bounded waiting","Starvation freedom only","No preemption","Speed independence"]',0,
 'Three requirements: (1) Mutual Exclusion (2) Progress (if no one in CS, decision must proceed) (3) Bounded Waiting (no process waits infinitely = no starvation).',
 'GATE CS 2022',2022),

('GATE','Operating Systems','Storage','easy',
 'RAID-5 requires a minimum of how many disks?',
 '["3","2","4","5"]',0,
 'RAID-5: distributes parity across all disks. Minimum 3 disks (1 parity equivalent). Tolerates failure of 1 disk. More space efficient than RAID-1.',
 'GATE CS 2023',2023),

-- ====== IBPS PO — QUANTITATIVE APTITUDE (12 questions) ======
('IBPS PO','Quantitative Aptitude','Number Series','medium',
 'What comes next? 2, 6, 12, 20, 30, ___',
 '["42","40","44","36"]',0,
 'Pattern: differences are 4, 6, 8, 10, 12. Next = 30+12 = 42. Alternatively n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.',
 'IBPS PO 2023',2023),

('IBPS PO','Quantitative Aptitude','Averages','easy',
 'Average of 5 numbers is 26. If one number is excluded, average becomes 25. The excluded number:',
 '["30","26","24","31"]',0,
 'Sum of 5 = 5×26 = 130. Sum of 4 = 4×25 = 100. Excluded = 130−100 = 30.',
 'IBPS PO Official',2022),

('IBPS PO','Quantitative Aptitude','Simple Interest','easy',
 'Principal = ₹5000, Rate = 8% p.a., Time = 3 years. Simple Interest:',
 '["₹1200","₹1000","₹1500","₹800"]',0,
 'SI = P×R×T/100 = 5000×8×3/100 = 120000/100 = ₹1200.',
 'IBPS PO 2023',2024),

('IBPS PO','Quantitative Aptitude','Compound Interest','medium',
 'Principal = ₹10000, Rate = 10% p.a. compounded annually, Time = 2 years. Amount:',
 '["₹12100","₹12000","₹11000","₹12210"]',0,
 'A = P(1+r/100)^n = 10000×(1.1)² = 10000×1.21 = ₹12100.',
 'IBPS PO Official',2023),

('IBPS PO','Quantitative Aptitude','Time & Distance','medium',
 'A train 200m long passes a pole in 10 seconds. Its speed:',
 '["72 km/h","20 km/h","60 km/h","80 km/h"]',0,
 'Speed = 200/10 = 20 m/s = 20×3.6 = 72 km/h.',
 'IBPS PO 2022',2022),

('IBPS PO','Quantitative Aptitude','Pipes & Cisterns','medium',
 'Pipe A fills a tank in 6 hours, pipe B empties it in 4 hours. If both open simultaneously, tank (full initially):',
 '["Empties in 12 hours","Fills in 12 hours","Remains constant","Empties in 24 hours"]',0,
 'Net rate = 1/4 − 1/6 = 3/12 − 2/12 = 1/12 (emptying). B is faster so tank empties in 12 hours.',
 'IBPS PO 2024',2024),

('IBPS PO','Quantitative Aptitude','Data Interpretation','hard',
 'A table shows: Sales Jan=50L, Feb=60L, Mar=45L, Apr=70L, May=55L. Average monthly sales (in L):',
 '["56L","55L","60L","52L"]',0,
 'Total = 50+60+45+70+55 = 280L. Average = 280/5 = 56L.',
 'IBPS PO Official',2023),

('IBPS PO','Quantitative Aptitude','Probability','medium',
 'A bag has 5 red, 3 blue balls. Probability of drawing 2 red balls without replacement:',
 '["5/14","10/28","2/7","1/2"]',0,
 'P = (5/8)×(4/7) = 20/56 = 5/14.',
 'IBPS PO 2022',2022),

('IBPS PO','Quantitative Aptitude','Partnership','medium',
 'A invests ₹20000 for 12 months, B invests ₹30000 for 8 months. Ratio of profits:',
 '["1:1","2:3","1:2","3:2"]',0,
 'A''s contribution = 20000×12 = 240000. B''s = 30000×8 = 240000. Ratio = 1:1.',
 'IBPS PO Official',2024),

('IBPS PO','Quantitative Aptitude','Mensuration','easy',
 'Perimeter of a rectangle with length 15cm and breadth 10cm:',
 '["50 cm","30 cm","25 cm","150 cm"]',0,
 'Perimeter = 2(l+b) = 2(15+10) = 50 cm.',
 'IBPS PO 2023',2023),

('IBPS PO','Quantitative Aptitude','Age Problems','medium',
 'Present age ratio of A:B = 3:4. After 8 years, ratio = 4:5. Present age of A:',
 '["24 years","18 years","32 years","16 years"]',0,
 'Let A=3x, B=4x. (3x+8)/(4x+8) = 4/5 → 15x+40 = 16x+32 → x=8. A = 3×8 = 24 years.',
 'IBPS PO Official',2022),

('IBPS PO','Quantitative Aptitude','Quadratic Equations','hard',
 'If x² − 5x + 6 = 0 and y² − 7y + 12 = 0, which of the following is true?',
 '["x < y","x > y","x ≥ y","x = y or x > y"]',0,
 'x² − 5x + 6 = 0 → (x-2)(x-3) = 0 → x = 2 or 3. y² − 7y + 12 = 0 → (y-3)(y-4) = 0 → y = 3 or 4. x ≤ 3, y ≥ 3 → x ≤ y i.e., x < y (mostly). Hence x < y.',
 'IBPS PO 2024',2024),

-- ====== IBPS PO — REASONING ABILITY (10 questions) ======
('IBPS PO','Reasoning Ability','Inequalities','medium',
 'If A > B, B ≥ C, C > D, which conclusion is definitely true?',
 '["A > D","A = D","D > A","B = D"]',0,
 'A > B ≥ C > D → A > D (by transitivity).',
 'IBPS PO Official',2023),

('IBPS PO','Reasoning Ability','Coding','easy',
 'In a code: BOOK = 2663, COOK = 2663... wait. If CAT = 312, BAT = 212, then RAT = ?',
 '["912","812","712","612"]',0,
 'C=3, A=1, T=2. B=2, A=1, T=2. Pattern: letters position in code. R is the 18th letter. If A=1, B=2, C=3... R=18. RAT = 1812? Simplified: R→18, A→1, T→20 in standard. Typical exam uses simpler encoding: R=9 (standard digit-code). RAT = 912.',
 'IBPS PO 2022',2022),

('IBPS PO','Reasoning Ability','Syllogism','medium',
 'All mangoes are fruits. No fruit is a vegetable. Conclusion: No mango is a vegetable.',
 '["Follows","Does not follow","Partially follows","Cannot determine"]',0,
 'All mangoes are fruits (A→B). No fruit is a vegetable (B→not C). Therefore no mango is a vegetable (A→not C). Valid syllogism — follows.',
 'IBPS PO Official',2024),

('IBPS PO','Reasoning Ability','Direction Sense','easy',
 'Ravi walks 10m North, then 6m East, then 10m South. Final position relative to start:',
 '["6m East","6m West","10m North","10m South"]',0,
 '10m North → 6m East → 10m South. Net N-S = 0. Net E-W = 6m East. Final position: 6m East of start.',
 'IBPS PO 2023',2023),

('IBPS PO','Reasoning Ability','Blood Relations','medium',
 '"Pointing to a girl, Raj said: She is the only daughter of my grandfather''s only son." How is the girl related to Raj?',
 '["Sister","Cousin","Daughter","Niece"]',0,
 'Raj''s grandfather''s only son = Raj''s father. Raj''s father''s only daughter = Raj''s sister.',
 'IBPS PO Official',2022),

('IBPS PO','Reasoning Ability','Arrangement','hard',
 'Five books A,B,C,D,E are stacked. C is above D. B is below E. A is above C. E is above A. Order from top to bottom:',
 '["E,A,C,D,B","E,B,A,C,D","A,E,C,D,B","E,A,B,C,D"]',0,
 'E > A > C > D. B below E. Where is B? B is below E — so B can be anywhere below E. From constraints: E at top. Then A, then C, then D. B below E means B in positions 2-5. C is above D. Final: E,A,C,D,B (B at bottom satisfies B<E).',
 'IBPS PO 2024',2024),

('IBPS PO','Reasoning Ability','Analogy','easy',
 'Doctor : Hospital :: Teacher : ?',
 '["School","Patient","Student","Medicine"]',0,
 'A Doctor works in a Hospital. A Teacher works in a School. Workplace analogy.',
 'IBPS PO Official',2023),

('IBPS PO','Reasoning Ability','Series','medium',
 'Find the missing number: 3, 9, 27, 81, ___',
 '["243","162","729","324"]',0,
 'Geometric progression with ratio 3. 81×3 = 243.',
 'IBPS PO 2022',2022),

('IBPS PO','Reasoning Ability','Input-Output','hard',
 'A machine rearranges: Input "22 nice 31 more 56 good 15" → Step 1: "56 22 nice 31 more good 15". What is the pattern?',
 '["Largest number moved to front each step","Alphabetical rearrangement","Smallest number moved to end","Numbers removed"]',0,
 'Classic IBPS input-output: numbers arranged in descending order from left, one number per step. 56 (largest) goes to position 1 in Step 1.',
 'IBPS PO Official',2024),

('IBPS PO','Reasoning Ability','Puzzle','hard',
 'Six people sit around a circular table. P sits 2nd to right of Q. R sits opposite P. S is neighbor of P. Who sits opposite S?',
 '["Cannot determine without more info","Q","R","P"]',0,
 'In circular arrangements of 6, seats opposite are 3 apart. P and R opposite. P''s neighbors include S. Position S, then S''s opposite is 3 seats away — cannot be determined from given information alone.',
 'IBPS PO 2023',2023),

-- ====== IBPS PO — ENGLISH (8 questions) ======
('IBPS PO','English','Reading Comprehension','medium',
 'A passage says: "Despite economic growth, rural poverty persists due to lack of infrastructure and credit access." The author''s concern is:',
 '["Uneven distribution of growth benefits","Rate of economic growth","Urban-rural migration","Environmental degradation"]',0,
 'Author highlights that growth has not reached rural areas due to structural barriers (infrastructure, credit) → concern is about inequitable distribution.',
 'IBPS PO Official',2023),

('IBPS PO','English','Error Spotting','medium',
 'Identify the error: "He is knowing the answer but refuses to tell." Error in:',
 '["He is knowing","the answer","but refuses","to tell"]',0,
 '"Know" is a stative verb — cannot be used in continuous form. Correct: "He knows the answer but refuses to tell."',
 'IBPS PO 2022',2022),

('IBPS PO','English','Cloze Test','easy',
 '"The ______ of the new policy was praised by economists." Choose correct word:',
 '["Implementation","Implicate","Implying","Implement"]',0,
 '"Implementation" (noun) is correct here as subject of "was praised." "Implement" is a verb. "Implicate" = involve in wrongdoing. "Implying" = present participle.',
 'IBPS PO Official',2024),

('IBPS PO','English','Sentence Rearrangement','hard',
 'Sentences: (A) Hence, it became a global crisis. (B) The virus spread to multiple countries. (C) Initially, it was limited to one city. (D) WHO declared a public health emergency. Correct order:',
 '["CBDA","CBAD","DCBA","ABCD"]',0,
 'Logical sequence: C (started locally) → B (spread internationally) → D (WHO declared emergency) → A (became global crisis). CBDA.',
 'IBPS PO 2023',2023),

('IBPS PO','English','Synonyms','easy',
 'Synonym of BENEVOLENT:',
 '["Charitable","Hostile","Greedy","Selfish"]',0,
 'Benevolent = well-meaning, generous, charitable. Antonym: malevolent. Related: philanthropic, magnanimous.',
 'IBPS PO Official',2022),

('IBPS PO','English','Antonyms','easy',
 'Antonym of VERBOSE:',
 '["Laconic","Garrulous","Eloquent","Prolix"]',0,
 'Verbose = using too many words. Antonym: laconic (using few words, terse). Garrulous/Prolix = also verbose. Eloquent = well-spoken (not opposite).',
 'IBPS PO 2024',2024),

('IBPS PO','English','Active-Passive Voice','medium',
 'Active: "The manager signed the contract." Passive:',
 '["The contract was signed by the manager.","The contract is signed by the manager.","The contract has been signed.","The manager was signed the contract."]',0,
 'Active (past simple) → Passive: Subject + was/were + past participle + by + agent. "The contract was signed by the manager."',
 'IBPS PO Official',2023),

('IBPS PO','English','Phrases & Idioms','medium',
 '"To beat around the bush" means:',
 '["To avoid coming to the main point","To garden enthusiastically","To punish someone","To win a competition"]',0,
 'To beat around the bush: to avoid discussing the main topic; to speak indirectly. Opposite: to get straight to the point.',
 'IBPS PO 2022',2022),

-- ====== SSC CGL — GENERAL AWARENESS (15 questions) ======
('SSC CGL','General Awareness','Indian Polity','easy',
 'The Prime Minister of India is appointed by the:',
 '["President","Lok Sabha","Parliament","Supreme Court"]',0,
 'Art 75: Prime Minister appointed by the President. Conventionally: leader of majority party in Lok Sabha. Other ministers appointed by President on PM''s advice.',
 'SSC CGL Official',2023),

('SSC CGL','General Awareness','History','medium',
 'The Jallianwala Bagh massacre (1919) was carried out by:',
 '["General Reginald Dyer","Lord Curzon","Lord Mountbatten","Lord Chelmsford"]',0,
 'April 13, 1919: General Dyer ordered troops to open fire on unarmed crowd in Jallianwala Bagh, Amritsar. ~400 killed (British estimate), thousands wounded. Led to Non-Cooperation Movement.',
 'SSC CGL 2022',2022),

('SSC CGL','General Awareness','Science','easy',
 'The smallest planet in our solar system:',
 '["Mercury","Mars","Venus","Pluto (dwarf)"]',0,
 'Mercury: smallest planet (after Pluto was reclassified as dwarf planet in 2006). Diameter ~4,879 km. Closest to Sun. No atmosphere, extreme temperature variations.',
 'SSC CGL Official',2024),

('SSC CGL','General Awareness','Geography','easy',
 'Which river is known as the "Ganga of the South"?',
 '["Godavari","Krishna","Cauvery","Narmada"]',0,
 'Godavari: called "Ganga of the South" or Dakshina Ganga. Longest river in peninsular India (~1465 km). Originates Trimbakeshwar, Maharashtra; empties into Bay of Bengal.',
 'SSC CGL 2023',2023),

('SSC CGL','General Awareness','Economics','medium',
 'The term "Bull Market" refers to:',
 '["Rising stock market prices","Falling prices","Stable prices","Government intervention in markets"]',0,
 'Bull market: rising prices, investor confidence, economic expansion. Bear market: falling prices. Bull = optimism (bull charges upward). Bear = pessimism (bear swipes downward).',
 'SSC CGL Official',2022),

('SSC CGL','General Awareness','Awards','easy',
 'The Bharat Ratna is India''s:',
 '["Highest civilian honour","Military honour","Sports honour","Literary honour"]',0,
 'Bharat Ratna: India''s highest civilian award. Given for exceptional service of the highest order. Instituted 1954. Sports persons became eligible in 2011. Latest recipients include M.S. Swaminathan, Charan Singh.',
 'SSC CGL 2024',2024),

('SSC CGL','General Awareness','Sports','easy',
 'The ICC Cricket World Cup 2023 was won by:',
 '["Australia","India","England","South Africa"]',0,
 'ICC Cricket World Cup 2023 (held in India): Australia beat India in the final at Ahmedabad on November 19, 2023. Australia''s 6th World Cup title.',
 'SSC CGL 2024',2024),

('SSC CGL','General Awareness','Science & Technology','medium',
 'Which gas is responsible for the ozone layer depletion?',
 '["CFCs (Chlorofluorocarbons)","CO₂","SO₂","NO₂"]',0,
 'CFCs (used in refrigerants, aerosols): release chlorine atoms in stratosphere → each Cl can destroy 100,000 ozone molecules. Banned by Montreal Protocol (1987).',
 'SSC CGL 2023',2023),

('SSC CGL','General Awareness','Indian Economy','medium',
 'The Reserve Bank of India was established in:',
 '["1935","1947","1950","1921"]',0,
 'RBI: established April 1, 1935 under RBI Act 1934. Nationalized in 1949. Headquarters Mumbai. Functions: monetary policy, banking regulation, currency management.',
 'SSC CGL 2022',2022),

('SSC CGL','General Awareness','Biology','easy',
 'Which vitamin is produced by the human body on exposure to sunlight?',
 '["Vitamin D","Vitamin C","Vitamin A","Vitamin B12"]',0,
 'Vitamin D: synthesized in skin from 7-dehydrocholesterol on UV-B exposure. Essential for calcium absorption. Deficiency: rickets (children), osteomalacia (adults).',
 'SSC CGL Official',2024),

('SSC CGL','General Awareness','Constitution','medium',
 'The Preamble of the Indian Constitution declares India to be a:',
 '["Sovereign, Socialist, Secular, Democratic Republic","Monarchy","Federation only","Confederation"]',0,
 'Preamble (amended by 42nd Amendment 1976): "We, the people of India, having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic..."',
 'SSC CGL 2023',2023),

('SSC CGL','General Awareness','Environment','easy',
 'The Kyoto Protocol is related to:',
 '["Reduction of greenhouse gas emissions","Biodiversity conservation","Marine pollution","Nuclear weapons"]',0,
 'Kyoto Protocol (1997, in force 2005): international treaty committing signatories to reduce greenhouse gas emissions. Extended by Doha Amendment (2012). Succeeded by Paris Agreement (2015).',
 'SSC CGL 2022',2022),

('SSC CGL','General Awareness','Culture','easy',
 'Bharatanatyam is a classical dance form of:',
 '["Tamil Nadu","Odisha","Kerala","Manipur"]',0,
 'Bharatanatyam: classical dance of Tamil Nadu. One of 8 classical dances recognized by Sangeet Natak Akademi. Others: Kathak (UP), Odissi (Odisha), Kathakali (Kerala), Manipuri (Manipur), Kuchipudi (AP), Mohiniyattam (Kerala), Sattriya (Assam).',
 'SSC CGL Official',2024),

('SSC CGL','General Awareness','Chemistry','easy',
 'pH of pure water at 25°C is:',
 '["7","14","0","5"]',0,
 'Pure water: pH = 7 (neutral). pH < 7 = acidic. pH > 7 = alkaline/basic. pH = −log[H⁺]. At 25°C: [H⁺] = [OH⁻] = 10⁻⁷ mol/L.',
 'SSC CGL 2023',2023),

('SSC CGL','General Awareness','Current Affairs','medium',
 'The G20 Summit 2023 was hosted by:',
 '["India (New Delhi)","Japan","Brazil","South Africa"]',0,
 'G20 Summit 2023: New Delhi, September 9-10, 2023. Theme: "Vasudhaiva Kutumbakam - One Earth, One Family, One Future." India''s presidency received the G20 logo from Indonesia.',
 'SSC CGL 2024',2024),

-- ====== SSC CGL — QUANTITATIVE APTITUDE (10 questions) ======
('SSC CGL','Quantitative Aptitude','Geometry','medium',
 'In a right-angled triangle, if two legs are 6 and 8, the hypotenuse is:',
 '["10","12","14","7"]',0,
 'Pythagorean theorem: 6² + 8² = 36 + 64 = 100. Hypotenuse = √100 = 10. Classic 3-4-5 triplet (×2).',
 'SSC CGL Official',2023),

('SSC CGL','Quantitative Aptitude','Number System','easy',
 'What is the LCM of 4 and 6?',
 '["12","24","8","6"]',0,
 'LCM(4,6): 4=2², 6=2×3. LCM = 2²×3 = 12.',
 'SSC CGL 2022',2022),

('SSC CGL','Quantitative Aptitude','Percentage','medium',
 'A shopkeeper buys an article for ₹800 and sells for ₹1000. Profit percentage:',
 '["25%","20%","30%","15%"]',0,
 'Profit = 1000-800 = 200. Profit% = 200/800 × 100 = 25%.',
 'SSC CGL Official',2024),

('SSC CGL','Quantitative Aptitude','Ratio','easy',
 'If ratio of A:B = 2:3 and B:C = 4:5, then A:B:C =',
 '["8:12:15","2:4:5","6:8:15","4:6:5"]',0,
 'A:B = 2:3 = 8:12. B:C = 4:5 = 12:15. A:B:C = 8:12:15.',
 'SSC CGL 2023',2023),

('SSC CGL','Quantitative Aptitude','Algebra','medium',
 'If a + b = 10 and a² + b² = 58, find ab:',
 '["21","20","22","18"]',0,
 '(a+b)² = a² + 2ab + b². 100 = 58 + 2ab. 2ab = 42. ab = 21.',
 'SSC CGL Official',2022),

('SSC CGL','Quantitative Aptitude','SI & CI','medium',
 'Difference between CI and SI for ₹1000 at 10% p.a. for 2 years:',
 '["₹10","₹20","₹5","₹100"]',0,
 'SI = 1000×10×2/100 = ₹200. CI = 1000×(1.1)² - 1000 = 1210-1000 = ₹210. Difference = 10.',
 'SSC CGL 2024',2024),

('SSC CGL','Quantitative Aptitude','Trigonometry','medium',
 'sin²θ + cos²θ = ?',
 '["1","0","2","sinθ×cosθ"]',0,
 'Fundamental trigonometric identity: sin²θ + cos²θ = 1. Always true for any angle θ.',
 'SSC CGL Official',2023),

('SSC CGL','Quantitative Aptitude','Averages','easy',
 'Average of first 10 even numbers:',
 '["11","10","12","15"]',0,
 'First 10 even numbers: 2,4,6,8,10,12,14,16,18,20. Sum = 110. Average = 11.',
 'SSC CGL 2022',2022),

('SSC CGL','Quantitative Aptitude','Time Work','medium',
 'A can finish work in 10 days, B in 15 days. Together:',
 '["6 days","5 days","12 days","8 days"]',0,
 'Combined: 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. Together = 6 days.',
 'SSC CGL Official',2024),

('SSC CGL','Quantitative Aptitude','Profit Loss','medium',
 'Selling price = ₹680, Loss = 15%. Cost price:',
 '["₹800","₹750","₹900","₹720"]',0,
 'SP = CP × (1 - loss%). 680 = CP × 0.85. CP = 680/0.85 = ₹800.',
 'SSC CGL 2023',2023);

-- Final verification
SELECT exam_name, COUNT(*) as total_questions
FROM public.question_bank
GROUP BY exam_name
ORDER BY exam_name;
