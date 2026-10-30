// Copy below was run through cleverhumanizer.ai (Version 1, "best pick"),
// with light fixes where the rewrite changed the meaning.

export const person = {
  first: "Pankaj",
  last: "Sharma",
  full: "Pankaj Kumar Sharma",
  role: "Founder, CEO & Director",
  company: "DFORR Pvt. Ltd.",
  city: "Jaipur, Rajasthan",
  email: "pksmr.random@gmail.com",
  photo: "/pankaj.webp",
  tagline: ["Builder | Designer | Founder.", "Making places online where", "people show up for each other."],
};

export const socials = [
  { label: "GitHub", href: "https://github.com/PKSMR" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pankaj-sharma-807820324/" },
  { label: "X / Twitter", href: "https://x.com/PKSMR_2R/" },
];

export const about = {
  // words wrapped in * render in the italic serif
  statement: "*Founder* and systems architect of *living 3D worlds* that bring people back together.",
  body:
    "Pankaj Kumar Sharma, Founder, CEO & Director of DFORR Pvt. Ltd. Designer, coder, artist and architect. Currently focusing on creating Maya: immersive 3D worlds, multiverse battle engines, real-world AR lenses and personal AI companions.",
};

// DFORR section. Lines are short on purpose; numbers match founder.dforr.in.
export const dforr = {
  legal: "DFORR Pvt. Ltd.",
  lead: "DFORR is the company I started to build what comes after the endless feed.",
  born: "Born in Jaipur in 2026. Fully owned by its founder.",
  pillars: [
    { n: "01", title: "Persistent 3D Worlds", line: "Places you can actually visit, where a friend's voice carries the way it does in real life." },
    { n: "02", title: "Stadium-Scale Events", line: "Up to a million people at one concert, with afterparties for a thousand avatars." },
    { n: "03", title: "Utility AR Lenses", line: "Calibrate your body once and try on clothes that drape for real." },
    { n: "04", title: "Lifelong AI Companions", line: "A JARVIS or FRIDAY of your own that remembers your life." },
  ],
  facts: ["HQ Jaipur, Rajasthan", "Est. 2026", "100% founder owned", "Director & directing architect"],
  principles: ["No ads", "No tracking", "No addictive tricks"],
  open: "Open to seed partnerships and to licensing our spatial technology.",
};

export const projects = [
  {
    slug: "maya",
    disciplines: ["Spatial computing", "Real-time audio", "AI companions", "3D worlds"],
    name: "Maya Spatial",
    date: "2026",
    tag: "Spatial social world",
    text:
      "Maya replaces your feed with immersive 3D worlds. Attend concerts, tournaments and hang out with others, hearing their voices more clearly the closer you get. Plus an AI companion, FRIDAY, who remembers your life.",
    facts: ["1M attendee LiveKit SFU mesh", "15m inverse-square spatial audio", "Digital twin try-on"],
    images: ["/gallery/maya_card_01_stadium_stage.jpg", "/gallery/pillar_01_living_3d_worlds.jpg", "/gallery/maya_card_02_bedroom_sanctuary.jpg"],
  },
  {
    slug: "wishtara",
    disciplines: ["Simulation", "Game systems", "Data modelling"],
    name: "Wishtara",
    date: "2026",
    tag: "Lore battle engine",
    text:
      "Who would win in a fight between Goku and Superman? Wishtara uses maths to settle it. It scores how fast, durable, powerful and reality-bending a character is, across over a million characters.",
    facts: ["1,000,000+ characters", "Deterministic battle models", "Speed, durability, potency, hax"],
    images: ["/gallery/wishtara_01_goku_vs_superman_arena.jpg", "/gallery/wishtara_avatar_karna.jpg", "/gallery/wishtara_avatar_arjuna.jpg"],
  },
  {
    slug: "mahabhav",
    disciplines: ["Computer vision", "Optimisation", "Cryptography", "Logistics"],
    name: "MahaBhav",
    date: "SIH 2026",
    tag: "Computer vision & logistics",
    text:
      "Created for the grand finale of the Smart India Hackathon 2026. A phone camera and a coin grade produce at the mandi, a CP-SAT solver packs the trucks, and each lot gets an immutable passport.",
    facts: ["98.4/100 internal score", "Coin-calibrated CV grading", "CP-SAT truck bin packing"],
    images: ["/gallery/mahabhav_01_camera_coin_calibration.jpg", "/gallery/mahabhav_04_cpsat_truck_packing_diagram.jpg", "/gallery/mahabhav_05_cpsat_truck_full_saturation.jpg"],
  },
  {
    slug: "tingle",
    disciplines: ["Edge AI", "Voice", "Emergency tech", "WebAssembly"],
    name: "Tingle",
    date: "Bit N Build 2026",
    tag: "Edge emergency AI",
    text:
      "Emergency dispatch cannot wait for the cloud. Tingle uses tiny quantised models on the device to process distress calls in 23ms, with zero fake addresses.",
    facts: ["23ms offline voice inference", "0.00% coordinate hallucination", "ONNX + WebAssembly at the edge"],
    link: "https://tingle-sigma.vercel.app/",
    images: ["/gallery/tingle_live_command_deck.png"],
  },
  {
    slug: "roast",
    disciplines: ["Playful AI", "Cultural data", "Interaction design"],
    name: "Taste Roast",
    date: "2026",
    tag: "Playful AI",
    text:
      "A fun project. Taste Roast uses the Qloo cultural graph (250M+ books, films and albums) to find out what your tastes say about you, and roasts you gently for it.",
    facts: ["250M+ cultural entities", "8-axis affinity radar", "24 cultural archetypes"],
    images: ["/gallery/taste_01_cultural_radar_matrix.jpg", "/gallery/taste_02_brutal_satire_dossier.jpg"],
  },
  {
    slug: "dforr",
    disciplines: ["Company", "Systems architecture", "Leadership"],
    name: "DFORR",
    date: "Est. 2026",
    tag: "The company",
    text:
      "Founded in Jaipur in 2026. Fully founder owned. Designed to create the building blocks for a post-feed internet.",
    facts: ["Persistent 3D worlds", "Stadium-scale live events", "Utility AR + lifelong AI companions"],
    images: ["/gallery/pillar_02_lifelong_ai_companions.jpg", "/gallery/pillar_03_digital_twin.jpg", "/gallery/maya_card_03_zero_screenshots_privacy.jpg"],
  },
];

export const galleryImages = projects.flatMap((p) => p.images);

export const galleryStatement = "Each project helps people *save* a little more of their *time*.";

export const skills = {
  heading: "Founder of DFORR in Jaipur. Working across spatial computing, edge AI and the systems connecting them.",
  groups: [
    { name: "Spatial & 3D", items: ["Three.js", "WebGL", "Persistent 3D worlds", "Digital twins", "AR lenses", "Cloth drape physics"] },
    { name: "Real-time & Audio", items: ["LiveKit SFU", "WebRTC", "Web Audio HRTF", "Positional acoustics", "1M attendee mesh"] },
    { name: "Edge AI", items: ["Quantised local models", "ONNX Runtime", "WebAssembly", "Constrained decoding", "Speech & intent models"] },
    { name: "Vision & Optimisation", items: ["Computer vision grading", "Camera calibration", "CP-SAT", "Bin packing", "Cryptographic passports"] },
    { name: "Product & Frontend", items: ["React", "Next.js", "Tailwind", "Vercel", "Qloo embeddings"] },
    { name: "Company", items: ["Systems architecture", "Product design", "Art direction", "Executive leadership"] },
  ],
};

export const awards = [
  { org: "Bit N Build 2026", what: "Tingle", note: "National Champion, 1st Place AI for Good", date: "2026" },
  { org: "Smart India Hackathon", what: "MahaBhav", note: "National Grand Finale nominee", date: "2026" },
  { org: "SIH internal round", what: "MahaBhav", note: "98.4 / 100 score", date: "2026" },
  { org: "DFORR Pvt. Ltd.", what: "Jaipur", note: "Incorporated, 100% founder owned", date: "2026" },
];

export const contact = {
  lead:
    "We are open to seed partners and licensing our spatial technology. If you are working on anything similar, I'd love to chat.",
  quote: "Software should be like good architecture. Honest, unhurried, private and designed to create a sense of togetherness.",
};
