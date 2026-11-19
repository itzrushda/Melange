/**
 * Melange '26 - Inter-Collegiate Annual Mega Fest
 * Core Data Models & Initial Mock State
 * Zones:
 * 1. Creative Zone: Editing (on-the-spot role photo edit), VFX Challenge, Graffiti Canvas, Pixel UI/UX
 * 2. Thinking Zone: Debate (topic revealed on-the-spot), MasterMind Quiz, Crisis Case Study
 * 3. Entertainment Zone: Dance, Singing, Stand-Up Comedy & Roast
 * 4. Discover Zone: Treasure Hunt, Locked Vault Escape Room, Robo Traversal
 */

const MELANGE_DATA = {
  festival: {
    name: "MELANGE '26",
    tagline: "The Symphony of Talents",
    edition: "18th National Inter-Collegiate Edition",
    dates: "March 20 - 22, 2026",
    venue: "Main Campus, Central Quadrangle & Arenas",
    emergencyHelpline: "+91 98230 44555",
    totalPrizePool: "₹5,00,000",
    overallTrophy: "Melange Rolling Cup 2026"
  },

  adminCredentials: {
    adminCode: "ADMIN-MELANGE",
    pin: "9999",
    name: "Central Fest Directorate",
    role: "Super Admin"
  },

  // 4 USER-SPECIFIED ZONES
  zones: [
    {
      id: "creative",
      number: "Zone 01",
      name: "Creative Zone",
      subtitle: "Role Editing, CineVFX Studio, Graffiti & Photography",
      icon: "palette",
      themeColor: "#ec4899", // Rose Pink
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.22), rgba(219, 39, 119, 0.08))",
      venue: "Digital Media Hub & Design Quadrangle",
      headCoordinator: "Prof. Ananya Sen & Rohan V. (+91 98111 22334)",
      description: "On-the-spot photo manipulation for assigned roles, live cinematic VFX compositing, urban wall graffiti, and street photography."
    },
    {
      id: "thinking",
      number: "Zone 02",
      name: "Thinking Zone",
      subtitle: "On-the-Spot Debate, Chanakya Mega Quiz & Mock Press",
      icon: "brain",
      themeColor: "#38bdf8", // Electric Cyan / Sky
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      bgGradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(14, 165, 233, 0.08))",
      venue: "Chanakya Senate Hall & Ramanujan Hall",
      headCoordinator: "Dr. Arvind Joshi & Sneha K. (+91 98222 33445)",
      description: "Extempore parliamentary debate with motions unveiled on the spot, national business quizzes, and crisis press conference defense."
    },
    {
      id: "entertainment",
      number: "Zone 03",
      name: "Entertainment Zone",
      subtitle: "Mega Dance Battle, Acoustic Singing & Nukkad Natak",
      icon: "masks-theater",
      themeColor: "#8b5cf6", // Royal Violet
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(124, 58, 237, 0.08))",
      venue: "Grand Open Air Amphitheatre",
      headCoordinator: "Dr. Sunita Kapoor & Tanmay Joshi (+91 98333 44556)",
      description: "Electrifying dance battle knockouts, acoustic unplugged singing duels, and passionate street theatre drama under the main spotlights."
    },
    {
      id: "discover",
      number: "Zone 04",
      name: "Discover Zone",
      subtitle: "Treasure Hunt, CSI Mystery Solving & Campus Decathlon",
      icon: "compass",
      themeColor: "#10b981", // Emerald Green
      image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.08))",
      venue: "40-Acre Campus Grounds & Central Plaza",
      headCoordinator: "Prof. R. Rathore & Samrat Patil (+91 98444 55667)",
      description: "Cryptic campus-wide treasure hunts across 40 acres, forensic mystery crime investigations, and high-energy decathlon challenges."
    }
  ],

  // EXACT ACTIVITIES REQUESTED (COLLEGE FEST FOCUSED - NON-GAMING)
  events: [
    // -------------------------------------------------------------
    // ZONE 1: CREATIVE ZONE (4 Activities)
    // -------------------------------------------------------------
    {
      id: "creative-editing",
      zoneId: "creative",
      title: "RolePlay Photo Editing",
      tag: "On-the-Spot Role Photo Editing",
      badge: "Flagship Creative",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 1 - 10:30 AM to 01:00 PM",
      day: "Day 1",
      time: "10:30 AM",
      venue: "Media Studio 1 (iMac Lab)",
      minMembers: 1,
      maxMembers: 2,
      pointsFirst: 100,
      pointsSecond: 65,
      pointsThird: 35,
      prizePool: "₹25,000",
      status: "OPEN",
      description: "On-the-spot photo manipulation contest. Organizers provide raw high-resolution portraits and announce secret character roles (e.g. Cyberpunk Diplomat, Mythological Royalty, Retro Noir Detective) on location. Editors must composite, retouch, and grade the assigned role within 90 minutes.",
      rules: [
        "Raw source photos and role prompts provided on-the-spot at 10:30 AM.",
        "Editing software permitted: Adobe Photoshop, Lightroom, Affinity Photo.",
        "Internet access restricted to royalty-free asset libraries (Pexels/Unsplash).",
        "Submission must include PSD/TIFF with intact visible layers."
      ],
      judgingCriteria: ["Role Representation Accuracy (35%)", "Lighting & Blending Integration (30%)", "Color Grading & Texture (20%)", "Speed & Layer Cleanliness (15%)"],
      coordinator: "Pranati Nambiar (+91 98210 11001)"
    },
    {
      id: "creative-vfx",
      zoneId: "creative",
      title: "CineVFX Studio",
      tag: "Live VFX & Video Compositing Duel",
      badge: "Cinematic Arts",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 2 - 11:00 AM to 03:00 PM",
      day: "Day 2",
      time: "11:00 AM",
      venue: "Tesla VFX Suite (Hall B)",
      minMembers: 1,
      maxMembers: 3,
      pointsFirst: 110,
      pointsSecond: 70,
      pointsThird: 40,
      prizePool: "₹35,000",
      status: "OPEN",
      description: "Live visual effects duel. Teams receive raw green-screen video footage and raw plates. Add 3D elements, magic spells, laser blast impacts, camera tracking, and atmospheric smoke/fire composites.",
      rules: [
        "Raw 4K footage assets delivered via high-speed local server.",
        "Permitted tools: After Effects, Nuke, Blender, DaVinci Fusion.",
        "Final export: 1080p MP4/ProRes under 30 seconds.",
        "Render deadline is 03:00 PM sharp."
      ],
      judgingCriteria: ["Compositing Realism (35%)", "Camera & Motion Tracking (25%)", "Color Match & Sound Integration (20%)", "Creativity & Detail (20%)"],
      coordinator: "Kabir Roy (+91 98210 11002)"
    },
    {
      id: "creative-graffiti",
      zoneId: "creative",
      title: "Canvas & Wall Graffiti",
      tag: "Live Mural & Spray Art Exhibition",
      badge: "Street Art",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 1 - 02:00 PM to 05:00 PM",
      day: "Day 1",
      time: "02:00 PM",
      venue: "Art Quadrangle Wall Alley",
      minMembers: 1,
      maxMembers: 3,
      pointsFirst: 80,
      pointsSecond: 50,
      pointsThird: 25,
      prizePool: "₹20,000",
      status: "OPEN",
      description: "Transform 8x6 ft blank urban boards into striking street art murals celebrating the fest theme 'The Neon Renaissance'.",
      rules: [
        "Time limit: 2 hours 30 minutes.",
        "Spray cans, acrylics, and masking tape provided.",
        "Stencils must be hand-cut on-site.",
        "No offensive or political symbols permitted."
      ],
      judgingCriteria: ["Visual Creativity (40%)", "Color Depth & Blending (30%)", "Theme Concept (20%)", "Cleanliness (10%)"],
      coordinator: "Natasha Singhania (+91 98210 11003)"
    },
    {
      id: "creative-photo",
      zoneId: "creative",
      title: "Candid Frames: Street Photography",
      tag: "Theme-based Campus Photo Walk",
      badge: "Photography",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 3 - 10:00 AM to 01:00 PM",
      day: "Day 3",
      time: "10:00 AM",
      venue: "Central Amphitheatre & Campus Lawns",
      minMembers: 1,
      maxMembers: 2,
      pointsFirst: 80,
      pointsSecond: 50,
      pointsThird: 25,
      prizePool: "₹20,000",
      status: "OPEN",
      description: "Capture the vibrant soul, candid emotions, and architectural elegance of Melange fest. Photographers receive 3 secret prompts at 10 AM. Submit a 5-photo narrative series by 1 PM sharp.",
      rules: [
        "Prompts revealed at start time at Central Desk.",
        "DSLR, Mirrorless, or Pro Smartphone cameras allowed.",
        "Only basic color grading and contrast adjustments permitted. No generative AI.",
        "Submit EXIF intact original files."
      ],
      judgingCriteria: ["Storytelling Narrative (40%)", "Composition & Framing (30%)", "Lighting & Texture (20%)", "Originality (10%)"],
      coordinator: "Meenakshi Das (+91 98210 11004)"
    },

    // -------------------------------------------------------------
    // ZONE 2: THINKING ZONE (3 Activities)
    // -------------------------------------------------------------
    {
      id: "thinking-debate",
      zoneId: "thinking",
      title: "War of Words: On-the-Spot Debate",
      tag: "Oxford Motion Revealed On-the-Spot",
      badge: "Flagship Oratory",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 2 - 10:00 AM to 02:00 PM",
      day: "Day 2",
      time: "10:00 AM",
      venue: "Ramanujan Conference Auditorium",
      minMembers: 2,
      maxMembers: 2,
      pointsFirst: 100,
      pointsSecond: 65,
      pointsThird: 35,
      prizePool: "₹25,000",
      status: "OPEN",
      description: "Oxford-style parliamentary debate where the provocative motion is kept top secret and revealed on the spot. Teams receive 15 minutes of unassisted prep time before taking the podium for constructives, POIs, and cross-rebuttals.",
      rules: [
        "Motion topic drawn live by GS representatives 15 mins prior.",
        "Format: 4 mins opening speech, 2 mins rebuttal, 1.5 mins summary.",
        "Points of Information (POIs) allowed between 1st and 3rd minute.",
        "Electronic research devices are impounded during prep."
      ],
      judgingCriteria: ["Argument Logical Rigor (35%)", "Rebuttal Precision (30%)", "Diction & Oratory Poise (20%)", "POI Handling (15%)"],
      coordinator: "Swati Narang (+91 98210 22001)"
    },
    {
      id: "thinking-quiz",
      zoneId: "thinking",
      title: "Chanakya: National Mega Quiz",
      tag: "General Knowledge & Business Trivia",
      badge: "Brain Battle",
      image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 1 - 11:30 AM to 02:30 PM",
      day: "Day 1",
      time: "11:30 AM",
      venue: "Chanakya Senate Hall",
      minMembers: 2,
      maxMembers: 3,
      pointsFirst: 90,
      pointsSecond: 60,
      pointsThird: 30,
      prizePool: "₹25,000",
      status: "OPEN",
      description: "High-octane collegiate general, tech, and corporate business quiz. Features audio-visual connect rounds, pounce & bounce buzzer mechanics, and cryptic trivia.",
      rules: [
        "Round 1: Written prelims (25 questions) - Top 6 teams qualify for on-stage finals.",
        "Round 2: Audio-visual connect clues with Pounce & Bounce scoring.",
        "Round 3: Rapid Fire buzzer duel with negative marks for incorrect guesses.",
        "Quizmaster's ruling is binding and final."
      ],
      judgingCriteria: ["Quiz Score", "Pounce Accuracy", "Buzzer Speed"],
      coordinator: "Gaurav Sen (+91 98210 22002)"
    },
    {
      id: "thinking-mockpress",
      zoneId: "thinking",
      title: "Mock Press & Crisis PR Management",
      tag: "High-Pressure Press Conference Defense",
      badge: "Strategy Elite",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 3 - 10:00 AM to 01:30 PM",
      day: "Day 3",
      time: "10:00 AM",
      venue: "Executive Boardroom (Level 4)",
      minMembers: 2,
      maxMembers: 4,
      pointsFirst: 90,
      pointsSecond: 55,
      pointsThird: 25,
      prizePool: "₹20,000",
      status: "OPEN",
      description: "Participants represent high-profile personalities, CEOs, or government spokespersons caught in a sudden national PR crisis. Face aggressive cross-questioning from student journalists and defend corporate policy live.",
      rules: [
        "Crisis dossier handed over 45 minutes before conference.",
        "Opening statement: 2 minutes maximum.",
        "Press grilling: 8 minutes intense Q&A from panel and audience journalists.",
        "Professional business attire mandatory."
      ],
      judgingCriteria: ["Presence of Mind (35%)", "Diplomatic Communication (30%)", "Crisis Defense Viability (20%)", "Confidence under Fire (15%)"],
      coordinator: "Ridhima Jain (+91 98210 22003)"
    },

    // -------------------------------------------------------------
    // ZONE 3: ENTERTAINMENT ZONE (3 Activities)
    // -------------------------------------------------------------
    {
      id: "entertainment-dance",
      zoneId: "entertainment",
      title: "Rhythm Clash: Mega Dance Battle",
      tag: "Solo, Duet & Synchronized Group Dance",
      badge: "Grand Showstopper",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 2 - 06:00 PM to 09:30 PM",
      day: "Day 2",
      time: "06:00 PM",
      venue: "Open Air Amphitheatre (Main Stage)",
      minMembers: 4,
      maxMembers: 14,
      pointsFirst: 120,
      pointsSecond: 80,
      pointsThird: 40,
      prizePool: "₹50,000",
      status: "OPEN",
      description: "Massive synchronized choreography championship. Electrifying flips, smooth transitions, and high-energy stage presence across Western, Hip-Hop, and Folk.",
      rules: [
        "Performance window: 8 to 10 minutes total.",
        "Audio tracks delivered to Sound Desk via USB 2 hours prior.",
        "No live fire, fluids, or dangerous props.",
        "Costume synchronization graded meticulously."
      ],
      judgingCriteria: ["Choreography & Formations (35%)", "Synchronization & Energy (30%)", "Theme & Costumes (20%)", "Stage Presence (15%)"],
      coordinator: "Meghna Roy (+91 98210 33001)"
    },
    {
      id: "entertainment-singing",
      zoneId: "entertainment",
      title: "Voice of Melange: Acoustic Unplugged",
      tag: "Solo & Duet Vocal Showdown",
      badge: "Vocal Spotlight",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 1 - 02:30 PM to 05:30 PM",
      day: "Day 1",
      time: "02:30 PM",
      venue: "Nirvana Acoustic Music Hall",
      minMembers: 1,
      maxMembers: 2,
      pointsFirst: 90,
      pointsSecond: 60,
      pointsThird: 30,
      prizePool: "₹25,000",
      status: "OPEN",
      description: "Pitch-perfect vocal showdown across Bollywood Classics, Indie Pop, Western Acoustic, or Semi-Classical melodies under warm stage spotlights.",
      rules: [
        "Performance slot: 4 to 5 minutes.",
        "Live acoustic accompanist (Guitar/Keys) or karaoke track allowed.",
        "Original compositions earn +5 bonus marks.",
        "Impromptu scale testing round for top finalists."
      ],
      judgingCriteria: ["Pitch & Sur (35%)", "Vocal Range & Texture (30%)", "Taal / Rhythm (20%)", "Emotional Impact (15%)"],
      coordinator: "Armaan Sheikh (+91 98210 33002)"
    },
    {
      id: "entertainment-nukkad",
      zoneId: "entertainment",
      title: "Nukkad Natak: Street Play & Drama",
      tag: "Social Awareness & Theatrical Showcase",
      badge: "Street Theatre",
      image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 3 - 03:00 PM to 06:00 PM",
      day: "Day 3",
      time: "03:00 PM",
      venue: "Central Quadrangle Roundabout",
      minMembers: 6,
      maxMembers: 16,
      pointsFirst: 100,
      pointsSecond: 65,
      pointsThird: 35,
      prizePool: "₹30,000",
      status: "OPEN",
      description: "Resonating daflis, rhythmic dholaks, and powerful chorus chants. Teams perform high-energy street theatre tackling contemporary societal themes, civic dilemmas, and student life.",
      rules: [
        "Time limit: 12 minutes empty stage to exit.",
        "Only acoustic instruments allowed (Dafli, Dholak, Harmonium, Flute). No electronic mics.",
        "Script must be original or appropriately credited.",
        "Performance must maintain respectful discourse."
      ],
      judgingCriteria: ["Script Content & Theme (35%)", "Vocal Projection & Chants (30%)", "Formations & Energy (20%)", "Crowd Engagement (15%)"],
      coordinator: "Bhavna Trivedi (+91 98210 33003)"
    },

    // -------------------------------------------------------------
    // ZONE 4: DISCOVER ZONE (3 Activities)
    // -------------------------------------------------------------
    {
      id: "discover-treasure",
      zoneId: "discover",
      title: "The Grand Campus Treasure Hunt",
      tag: "40-Acre Clue Deciphering & Geo-Trail",
      badge: "Flagship Quest",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 2 - 01:00 PM to 05:00 PM",
      day: "Day 2",
      time: "01:00 PM",
      venue: "Central Fountain Plaza (Start Point)",
      minMembers: 3,
      maxMembers: 4,
      pointsFirst: 100,
      pointsSecond: 65,
      pointsThird: 35,
      prizePool: "₹30,000",
      status: "OPEN",
      description: "Decipher cipher envelopes, locate hidden physical checkpoints, solve historical campus riddles, and race across 40 acres to retrieve the Master Relic token.",
      rules: [
        "First riddle envelope distributed at Central Fountain at 01:00 PM sharp.",
        "Checkpoints verified via physical stamp seals and numeric codekeys.",
        "No motor vehicles or outside assistance permitted. Walking and running only.",
        "First squad to submit the Master Relic token to Central Desk wins."
      ],
      judgingCriteria: ["Total Checkpoints Cleared", "Overall Elapsed Time", "Hint Penalties"],
      coordinator: "Aakash Varma (+91 98210 44001)"
    },
    {
      id: "discover-csi",
      zoneId: "discover",
      title: "CSI: Crime Scene Mystery",
      tag: "Forensic Clue Deduction & Interrogation",
      badge: "Mystery Solving",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 1 - 10:00 AM to 04:00 PM",
      day: "Day 1",
      time: "10:00 AM",
      venue: "Heritage Senate Chamber (Room 105)",
      minMembers: 2,
      maxMembers: 4,
      pointsFirst: 85,
      pointsSecond: 55,
      pointsThird: 25,
      prizePool: "₹20,000",
      status: "OPEN",
      description: "Step into an intricate staged mystery chamber. Examine mock forensic evidence, analyze witness alibis, decode secret cipher letters, and submit the final indictment report before time expires.",
      rules: [
        "Time limit: 40 minutes per squad in the investigation zone.",
        "Squads may question the 2 on-site suspect actors for up to 5 minutes.",
        "Final dossier submission with motive, weapon, and opportunity required.",
        "Tampering with physical evidence leads to disqualification."
      ],
      judgingCriteria: ["Deduction Accuracy (40%)", "Evidence Interpretation (30%)", "Time Elapsed (20%)", "Final Report Coherence (10%)"],
      coordinator: "Sameer Sheikh (+91 98210 44002)"
    },
    {
      id: "discover-quest",
      zoneId: "discover",
      title: "Campus Quest: Decathlon Relay",
      tag: "High-Energy Relay & Task Decathlon",
      badge: "Campus Challenge",
      image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=700&q=80",
      schedule: "Day 3 - 11:00 AM to 03:00 PM",
      day: "Day 3",
      time: "11:00 AM",
      venue: "Main Athletic Arena & Lawns",
      minMembers: 3,
      maxMembers: 4,
      pointsFirst: 85,
      pointsSecond: 55,
      pointsThird: 25,
      prizePool: "₹20,000",
      status: "OPEN",
      description: "A fast-paced outdoor team decathlon featuring 10 creative relay challenges: puzzle tangrams, blindfold navigation, ping-pong bounce runs, rope crossovers, and human knot untangling.",
      rules: [
        "Squads race concurrently in timed heats of 4 teams.",
        "All team members must participate in at least two obstacle tasks.",
        "Penalty time added for dropped items or out-of-boundary steps.",
        "Fastest aggregate time across all 10 stations takes the gold."
      ],
      judgingCriteria: ["Total Course Time", "Task Completion Accuracy", "Team Coordination"],
      coordinator: "Rishi Chawla (+91 98210 44003)"
    }
  ],

  // Authorized Colleges whose General Secretaries can login
  colleges: [
    {
      id: "coep",
      name: "COEP Technological University",
      shortCode: "COEP",
      city: "Pune",
      gsName: "Priya Deshmukh",
      gsDesignation: "Gymkhana General Secretary",
      gsCode: "GS-COEP-2026",
      pin: "2345",
      email: "gs.gymkhana@coeptech.ac.in",
      phone: "+91 98231 10022",
      badgeColor: "#3b82f6",
      contingentSize: 42,
      basePoints: 340,
      avatar: "🏛️"
    },
    {
      id: "mit",
      name: "MIT World Peace University",
      shortCode: "MIT-WPU",
      city: "Pune",
      gsName: "Aryan Sharma",
      gsDesignation: "President & General Secretary",
      gsCode: "GS-MIT-2026",
      pin: "1234",
      email: "gs.council@mitwpu.edu.in",
      phone: "+91 98232 20033",
      badgeColor: "#8b5cf6",
      contingentSize: 38,
      basePoints: 310,
      avatar: "🕊️"
    },
    {
      id: "xav",
      name: "St. Xavier's College (Autonomous)",
      shortCode: "XAV-MUM",
      city: "Mumbai",
      gsName: "Rohan Mehta",
      gsDesignation: "Cultural Affairs Secretary",
      gsCode: "GS-XAV-2026",
      pin: "3456",
      email: "cultural.gs@xaviers.edu",
      phone: "+91 98233 30044",
      badgeColor: "#ec4899",
      contingentSize: 35,
      basePoints: 290,
      avatar: "🎭"
    },
    {
      id: "bits",
      name: "BITS Pilani (Goa Campus)",
      shortCode: "BITS-GOA",
      city: "Goa",
      gsName: "Ananya Iyer",
      gsDesignation: "Council General Secretary",
      gsCode: "GS-BITS-2026",
      pin: "4567",
      email: "gsec.council@goa.bits-pilani.ac.in",
      phone: "+91 98234 40055",
      badgeColor: "#f59e0b",
      contingentSize: 40,
      basePoints: 360,
      avatar: "⚡"
    },
    {
      id: "iitb",
      name: "Indian Institute of Technology Bombay",
      shortCode: "IIT-BOMBAY",
      city: "Mumbai",
      gsName: "Kabir Verma",
      gsDesignation: "General Secretary Technical Affairs",
      gsCode: "GS-IITB-2026",
      pin: "5678",
      email: "gseca@iitb.ac.in",
      phone: "+91 98235 50066",
      badgeColor: "#10b981",
      contingentSize: 30,
      basePoints: 385,
      avatar: "🔬"
    },
    {
      id: "srcc",
      name: "Shri Ram College of Commerce",
      shortCode: "SRCC-DU",
      city: "Delhi",
      gsName: "Tanvi Kapoor",
      gsDesignation: "Students' Union General Secretary",
      gsCode: "GS-SRCC-2026",
      pin: "6789",
      email: "su.gsec@srcc.du.ac.in",
      phone: "+91 98236 60077",
      badgeColor: "#06b6d4",
      contingentSize: 28,
      basePoints: 260,
      avatar: "📊"
    }
  ],

  // Initial student participants entered by College GSs
  initialStudents: [
    {
      studentId: "STU-COEP-101",
      collegeId: "coep",
      name: "Aditya Patil",
      rollNo: "112103045",
      dept: "Computer Engg",
      year: "3rd Year",
      phone: "+91 98901 12345",
      email: "aditya.coep@gmail.com",
      assignedEventId: "creative-editing",
      teamName: "COEP Visual Wizards",
      role: "Solo Competitor"
    },
    {
      studentId: "STU-COEP-102",
      collegeId: "coep",
      name: "Siddhi Kulkarni",
      rollNo: "112103088",
      dept: "Instrumentation",
      year: "3rd Year",
      phone: "+91 98901 99887",
      email: "siddhi.k@gmail.com",
      assignedEventId: "thinking-debate",
      teamName: "COEP Orators",
      role: "Team Leader"
    },
    {
      studentId: "STU-COEP-103",
      collegeId: "coep",
      name: "Neha Shinde",
      rollNo: "112204012",
      dept: "Mechanical",
      year: "2nd Year",
      phone: "+91 98902 23456",
      email: "neha.shinde@gmail.com",
      assignedEventId: "entertainment-dance",
      teamName: "Aura Crew COEP",
      role: "Team Leader"
    },
    {
      studentId: "STU-COEP-104",
      collegeId: "coep",
      name: "Manish Gaikwad",
      rollNo: "112002019",
      dept: "Electrical",
      year: "4th Year",
      phone: "+91 98903 34567",
      email: "manish.g@gmail.com",
      assignedEventId: "discover-treasure",
      teamName: "COEP Cryptic Seekers",
      role: "Team Leader"
    },
    {
      studentId: "STU-MIT-101",
      collegeId: "mit",
      name: "Kunal Bansal",
      rollNo: "MIT-22-901",
      dept: "Animation & VFX",
      year: "3rd Year",
      phone: "+91 98904 45678",
      email: "kunal.b@mitwpu.edu.in",
      assignedEventId: "creative-vfx",
      teamName: "MIT CineForge",
      role: "Team Leader"
    }
  ],

  // Initial pre-registered sample entries for realistic fest atmosphere
  initialRegistrations: [
    {
      registrationId: "REG-COEP-001",
      collegeId: "coep",
      eventId: "creative-editing",
      teamName: "COEP Visual Wizards",
      teamLeader: "Aditya Patil",
      contactPhone: "+91 98901 12345",
      members: ["Aditya Patil (Roll: 112103045)"],
      registeredAt: "2026-03-18 14:20",
      status: "CONFIRMED",
      slotNumber: "SLOT-04",
      pointsAwarded: 15
    },
    {
      registrationId: "REG-COEP-002",
      collegeId: "coep",
      eventId: "thinking-debate",
      teamName: "COEP Orators",
      teamLeader: "Siddhi Kulkarni",
      contactPhone: "+91 98901 99887",
      members: ["Siddhi Kulkarni (Roll: 112103088)", "Tanmay Bhalerao"],
      registeredAt: "2026-03-18 15:30",
      status: "CONFIRMED",
      slotNumber: "SLOT-02",
      pointsAwarded: 15
    },
    {
      registrationId: "REG-COEP-003",
      collegeId: "coep",
      eventId: "entertainment-dance",
      teamName: "Aura Crew COEP",
      teamLeader: "Neha Shinde",
      contactPhone: "+91 98902 23456",
      members: ["Neha Shinde (Roll: 112204012)", "Varun Kale", "Pooja Gore", "Omkar Joshi"],
      registeredAt: "2026-03-18 16:45",
      status: "CONFIRMED",
      slotNumber: "SLOT-08",
      pointsAwarded: 15
    },
    {
      registrationId: "REG-COEP-004",
      collegeId: "coep",
      eventId: "discover-treasure",
      teamName: "COEP Cryptic Seekers",
      teamLeader: "Manish Gaikwad",
      contactPhone: "+91 98903 34567",
      members: ["Manish Gaikwad (Roll: 112002019)", "Abhay Deshmukh", "Nikhil More"],
      registeredAt: "2026-03-18 18:10",
      status: "CONFIRMED",
      slotNumber: "SLOT-01",
      pointsAwarded: 15
    },
    {
      registrationId: "REG-MIT-001",
      collegeId: "mit",
      eventId: "creative-vfx",
      teamName: "MIT CineForge",
      teamLeader: "Kunal Bansal",
      contactPhone: "+91 98904 45678",
      members: ["Kunal Bansal (Roll: MIT-22-901)", "Rajat Arora"],
      registeredAt: "2026-03-19 10:15",
      status: "CONFIRMED",
      slotNumber: "SLOT-03",
      pointsAwarded: 15
    }
  ],

  // Live announcements created by Admin
  announcements: [
    {
      id: "ann-1",
      time: "10 mins ago",
      zone: "Central Desk",
      title: "GS Briefing Today at Senate Hall 4:30 PM",
      body: "All College General Secretaries must collect the official slot cards and physical event reliquaries.",
      urgent: true
    },
    {
      id: "ann-2",
      time: "30 mins ago",
      zone: "Thinking Zone",
      title: "On-the-Spot Debate Motion Draw Sequence",
      body: "Motions will be drawn by college GS 15 minutes prior to the first preliminary bracket.",
      urgent: false
    },
    {
      id: "ann-3",
      time: "1 hour ago",
      zone: "Creative Zone",
      title: "RolePlay Photo Editing Lab Stations Assigned",
      body: "Editing iMac suites are configured with Photoshop & Lightroom. Bring student ID badges.",
      urgent: false
    }
  ]
};

// Storage helper with Admin and Student persistence
const StorageManager = {
  KEYS: {
    COLLEGES: "melange_colleges_v4",
    STUDENTS: "melange_students_v4",
    REGISTRATIONS: "melange_registrations_v4",
    ACTIVE_SESSION: "melange_active_gs_v4",
    ANNOUNCEMENTS: "melange_announcements_v4",
    IS_ADMIN: "melange_is_admin_v4"
  },

  init() {
    if (!localStorage.getItem(this.KEYS.COLLEGES)) {
      localStorage.setItem(this.KEYS.COLLEGES, JSON.stringify(MELANGE_DATA.colleges));
    }
    if (!localStorage.getItem(this.KEYS.STUDENTS)) {
      localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(MELANGE_DATA.initialStudents));
    }
    if (!localStorage.getItem(this.KEYS.REGISTRATIONS)) {
      localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(MELANGE_DATA.initialRegistrations));
    }
    if (!localStorage.getItem(this.KEYS.ANNOUNCEMENTS)) {
      localStorage.setItem(this.KEYS.ANNOUNCEMENTS, JSON.stringify(MELANGE_DATA.announcements));
    }
  },

  getColleges() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.COLLEGES)) || MELANGE_DATA.colleges;
    } catch (e) {
      return MELANGE_DATA.colleges;
    }
  },

  saveColleges(colleges) {
    localStorage.setItem(this.KEYS.COLLEGES, JSON.stringify(colleges));
  },

  getStudents() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.STUDENTS)) || MELANGE_DATA.initialStudents;
    } catch (e) {
      return MELANGE_DATA.initialStudents;
    }
  },

  saveStudents(students) {
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
  },

  getRegistrations() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.REGISTRATIONS)) || MELANGE_DATA.initialRegistrations;
    } catch (e) {
      return MELANGE_DATA.initialRegistrations;
    }
  },

  saveRegistrations(registrations) {
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(registrations));
  },

  getAnnouncements() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ANNOUNCEMENTS)) || MELANGE_DATA.announcements;
    } catch (e) {
      return MELANGE_DATA.announcements;
    }
  },

  saveAnnouncements(ann) {
    localStorage.setItem(this.KEYS.ANNOUNCEMENTS, JSON.stringify(ann));
  },

  getActiveSession() {
    try {
      const data = localStorage.getItem(this.KEYS.ACTIVE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setActiveSession(college) {
    localStorage.setItem(this.KEYS.ACTIVE_SESSION, JSON.stringify(college));
  },

  clearActiveSession() {
    localStorage.removeItem(this.KEYS.ACTIVE_SESSION);
  },

  isAdminMode() {
    return localStorage.getItem(this.KEYS.IS_ADMIN) === "true";
  },

  setAdminMode(val) {
    localStorage.setItem(this.KEYS.IS_ADMIN, val ? "true" : "false");
  },

  resetAllData() {
    localStorage.removeItem(this.KEYS.COLLEGES);
    localStorage.removeItem(this.KEYS.STUDENTS);
    localStorage.removeItem(this.KEYS.REGISTRATIONS);
    localStorage.removeItem(this.KEYS.ACTIVE_SESSION);
    localStorage.removeItem(this.KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(this.KEYS.IS_ADMIN);
    this.init();
  }
};
