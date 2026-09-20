import { BuiltInImage } from "../types";

export const BUILT_IN_IMAGES: BuiltInImage[] = [
  // ====================================================
  // 1. LONG TEXT OVERWHELM & READING DISRUPTION
  // ====================================================
  {
    id: "guide-reading-ruler",
    title: "Wall of Text Deconstructor & Reading Ruler",
    category: "text_overwhelm",
    badge: "Long Text Relief",
    icon: "📖",
    description:
      "A dedicated visual anchor demonstrating the 'Reading Ruler' technique: isolating a single line at a time, anchoring gaze on initial letters, and breaking intimidating unbroken blocks of text into 3-item bullet clusters.",
    plain_summary:
      "When long paragraphs turn into an intimidating wall of text, use a reading ruler to isolate one line at a time and highlight the first letters of each word.",
    sensory_prompt:
      "Cover the paragraph below with a card or finger. Read only one isolated sentence. Take a breath before moving down.",
    spoken_text:
      "Wall of Text Deconstruction. When text feels overwhelming, do not attempt to scan the whole page. Isolate a single line, anchor your gaze on the first three words, and group thoughts into three concise bullet points.",
    palette: {
      bg: "#1e1b18",
      fg: "#f7f0e6",
      accent: "#c4893b"
    },
    tags: ["text", "reading", "ruler", "adhd", "dyslexia", "focus"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reading Ruler and Text Chunking Guide">
      <rect width="600" height="360" rx="16" fill="#181512"/>
      <!-- Header -->
      <text x="300" y="38" text-anchor="middle" fill="#f7f0e6" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">
        READING RULER: BREAKING THE WALL OF TEXT
      </text>
      <text x="300" y="58" text-anchor="middle" fill="#c4893b" font-family="system-ui, -apple-system, sans-serif" font-size="12">
        Isolate one line • Anchor the first 3 letters • Stop visual crowding
      </text>

      <!-- Simulated Document Container -->
      <rect x="50" y="76" width="500" height="254" rx="10" fill="#24201c" stroke="#3b352e" stroke-width="1.5"/>

      <!-- Dimmed Background Lines (representing visual overwhelm) -->
      <g fill="#5e554a" opacity="0.35">
        <rect x="75" y="96" width="380" height="10" rx="4"/>
        <rect x="75" y="114" width="440" height="10" rx="4"/>
        <rect x="75" y="132" width="410" height="10" rx="4"/>
      </g>

      <!-- The Active Reading Ruler (High Contrast Focus Window) -->
      <rect x="65" y="152" width="470" height="48" rx="8" fill="#382e1f" stroke="#e8a84a" stroke-width="2.5"/>
      <circle cx="90" cy="176" r="6" fill="#e8a84a"/>
      <!-- High visibility isolated text -->
      <text x="110" y="181" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="15">
        FO<tspan fill="#f7f0e6" font-weight="500">CUS</tspan> ON<tspan fill="#f7f0e6" font-weight="500">LY</tspan> ON TH<tspan fill="#f7f0e6" font-weight="500">IS</tspan> SI<tspan fill="#f7f0e6" font-weight="500">NGLE</tspan> SE<tspan fill="#f7f0e6" font-weight="500">NTENCE</tspan> RI<tspan fill="#f7f0e6" font-weight="500">GHT</tspan> NO<tspan fill="#f7f0e6" font-weight="500">W</tspan>
      </text>
      <!-- Visual Ruler Markers -->
      <path d="M 65 152 L 65 200 M 535 152 L 535 200" stroke="#e8a84a" stroke-width="3"/>

      <!-- Dimmed Lines Below Ruler -->
      <g fill="#5e554a" opacity="0.35">
        <rect x="75" y="214" width="430" height="10" rx="4"/>
        <rect x="75" y="232" width="390" height="10" rx="4"/>
      </g>

      <!-- 3 Chunked Bullet Rule Reminder at Bottom -->
      <g transform="translate(75, 258)">
        <rect x="0" y="0" width="140" height="54" rx="8" fill="#1b1713" stroke="#c4893b" stroke-width="1"/>
        <text x="12" y="22" fill="#e8a84a" font-size="11" font-weight="700">STEP 1: CHUNK</text>
        <text x="12" y="40" fill="#f7f0e6" font-size="10">Max 3 bullets</text>

        <rect x="155" y="0" width="140" height="54" rx="8" fill="#1b1713" stroke="#c4893b" stroke-width="1"/>
        <text x="167" y="22" fill="#e8a84a" font-size="11" font-weight="700">STEP 2: BOLD</text>
        <text x="167" y="40" fill="#f7f0e6" font-size="10">Anchor words</text>

        <rect x="310" y="0" width="140" height="54" rx="8" fill="#1b1713" stroke="#c4893b" stroke-width="1"/>
        <text x="322" y="22" fill="#e8a84a" font-size="11" font-weight="700">STEP 3: PAUSE</text>
        <text x="322" y="40" fill="#f7f0e6" font-size="10">Breathe between</text>
      </g>
    </svg>`
  },
  {
    id: "card-wall-of-text",
    title: "Wall of Text Overwhelm AAC Card",
    category: "text_overwhelm",
    badge: "Non-Verbal AAC",
    icon: "💬",
    description:
      "A high-visibility card to show colleagues, teachers, or family when presented with dense, unbulleted messages that trigger cognitive freeze.",
    plain_summary:
      "Show this card to ask people to send bullet points instead of long, dense paragraphs of text.",
    sensory_prompt:
      "Card message: 'This is a wall of text. My working memory cannot process dense paragraphs right now. Please summarize in 2–3 short bullet points. Thank you.'",
    spoken_text:
      "Notice: Wall of text overwhelm. My working memory is full and cannot unpack dense paragraphs right now. Please send a summary in two or three short bullet points.",
    palette: {
      bg: "#16212b",
      fg: "#ffffff",
      accent: "#5299b8"
    },
    tags: ["text", "aac", "overwhelm", "bullets", "communication"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wall of Text Overwhelm AAC Card">
      <rect width="600" height="360" rx="16" fill="#121b23"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#1c2a36" stroke="#68b4d6" stroke-width="2.5" stroke-dasharray="8,4"/>
      <!-- Icon Graphic -->
      <g fill="#68b4d6">
        <rect x="250" y="55" width="100" height="12" rx="6"/>
        <rect x="235" y="75" width="130" height="12" rx="6"/>
        <rect x="245" y="95" width="110" height="12" rx="6"/>
        <circle cx="300" cy="130" r="16" fill="#e75b5b"/>
        <text x="300" y="136" text-anchor="middle" fill="#fff" font-weight="900" font-size="18">✕</text>
      </g>
      <!-- Text Statements -->
      <text x="300" y="185" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="0.04em">
        WALL OF TEXT OVERWHELM
      </text>
      <text x="300" y="222" text-anchor="middle" fill="#68b4d6" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="16">
        My working memory cannot process dense paragraphs right now.
      </text>
      <text x="300" y="258" text-anchor="middle" fill="#dbeef8" font-family="system-ui, -apple-system, sans-serif" font-size="15">
        👉 Please summarize into 2–3 short, numbered bullet points.
      </text>
      <rect x="180" y="286" width="240" height="30" rx="15" fill="#121b23"/>
      <text x="300" y="306" text-anchor="middle" fill="#68b4d6" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700">
        NEURODIVERGENT COGNITIVE ACCESS
      </text>
    </svg>`
  },

  // ====================================================
  // 2. DIGITAL SCREENS & GLARE / SENSORY OVERLOAD
  // ====================================================
  {
    id: "guide-screen-fatigue",
    title: "Digital Screen Reset & 20-20-20 Sanctuary",
    category: "screen_fatigue",
    badge: "Screen Relief",
    icon: "🖥️",
    description:
      "A visual antidote to digital monitor glare, fluorescent PWM flicker, and dry-eye strain. Guides the 20-20-20 distance reset, screen color warmth shift, and palming darkness rest.",
    plain_summary:
      "Rest your eyes from screens: Every 20 minutes, look 20 feet away for 20 seconds. Cup your warm palms over your closed eyes for soothing complete darkness.",
    sensory_prompt:
      "Gently cup warm palms over your closed eyes without pressing the eyeballs. Bask in 30 seconds of pure, pitch-black darkness.",
    spoken_text:
      "Digital Screen Reset. Rest your eyes from monitors and phones. Every twenty minutes, look twenty feet into the distance for twenty seconds. Warm your palms together and place them gently over your closed eyes to give your optic nerve total darkness.",
    palette: {
      bg: "#1a1622",
      fg: "#eeddfa",
      accent: "#9b76c9"
    },
    tags: ["screen", "eyes", "glare", "headache", "rest", "autism"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Digital Screen Reset and Eye Sanctuary Guide">
      <defs>
        <radialGradient id="screenWarmth" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#472847" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#14111c" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="600" height="360" rx="16" fill="url(#screenWarmth)"/>
      <text x="300" y="38" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">
        DIGITAL SCREEN RESET & OPTIC RELIEF
      </text>
      <text x="300" y="58" text-anchor="middle" fill="#b996e8" font-family="system-ui, -apple-system, sans-serif" font-size="12">
        Zero blue glare • 20-20-20 distance anchor • Palming darkness rest
      </text>

      <!-- 3 Visual Pillars -->
      <g transform="translate(45, 80)">
        <!-- Card 1: 20-20-20 Rule -->
        <rect x="0" y="0" width="155" height="240" rx="12" fill="#241d30" stroke="#7e59b3" stroke-width="1.5"/>
        <circle cx="77" cy="45" r="28" fill="#352947"/>
        <text x="77" y="52" text-anchor="middle" font-size="24">👁️</text>
        <text x="77" y="95" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">20-20-20 Reset</text>
        <text x="77" y="125" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Every 20 mins</text>
        <text x="77" y="145" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Look 20 feet away</text>
        <text x="77" y="165" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">For 20 seconds</text>
        <rect x="20" y="195" width="115" height="26" rx="13" fill="#14111c"/>
        <text x="77" y="212" text-anchor="middle" fill="#b996e8" font-size="10" font-weight="700">UNCLENCH EYES</text>

        <!-- Card 2: Palming Darkness -->
        <rect x="175" y="0" width="155" height="240" rx="12" fill="#241d30" stroke="#7e59b3" stroke-width="1.5"/>
        <circle cx="252" cy="45" r="28" fill="#352947"/>
        <text x="252" y="52" text-anchor="middle" font-size="24">🤲</text>
        <text x="252" y="95" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">Palming Rest</text>
        <text x="252" y="125" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Rub warm hands</text>
        <text x="252" y="145" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Cup over eyes</text>
        <text x="252" y="165" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Bask in dark</text>
        <rect x="195" y="195" width="115" height="26" rx="13" fill="#14111c"/>
        <text x="252" y="212" text-anchor="middle" fill="#b996e8" font-size="10" font-weight="700">OPTIC SHIELD</text>

        <!-- Card 3: Screen Warmth Adjustment -->
        <rect x="350" y="0" width="155" height="240" rx="12" fill="#241d30" stroke="#7e59b3" stroke-width="1.5"/>
        <circle cx="427" cy="45" r="28" fill="#352947"/>
        <text x="427" y="52" text-anchor="middle" font-size="24">🌙</text>
        <text x="427" y="95" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">Amber Filter</text>
        <text x="427" y="125" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Shift to 2700K</text>
        <text x="427" y="145" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Drop to 40% light</text>
        <text x="427" y="165" text-anchor="middle" fill="#eeddfa" font-family="system-ui, -apple-system, sans-serif" font-size="11">Soft matte UI</text>
        <rect x="370" y="195" width="115" height="26" rx="13" fill="#14111c"/>
        <text x="427" y="212" text-anchor="middle" fill="#b996e8" font-size="10" font-weight="700">ZERO GLOW</text>
      </g>
    </svg>`
  },
  {
    id: "card-screen-break",
    title: "Screen Sensory Break Needed Card",
    category: "screen_fatigue",
    badge: "Non-Verbal AAC",
    icon: "📵",
    description:
      "A card to inform others that you are stepping away from displays, phones, and monitors due to visual sensory overload or migraine onset.",
    plain_summary:
      "Show this card when screen glare, notifications, or monitor light are causing headaches or sensory shutdown.",
    sensory_prompt:
      "Card message: 'Stepping away from digital screens for 15–30 minutes due to eye fatigue and sensory overload. Will reply once rested.'",
    spoken_text:
      "Notice: Digital screen break active. I am experiencing screen-induced eye fatigue or sensory overload. I am stepping away from monitors and phones for a short rest.",
    palette: {
      bg: "#1b2721",
      fg: "#e8f5ee",
      accent: "#4ea379"
    },
    tags: ["screen", "break", "offline", "aac", "photophobia"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Digital Screen Break AAC Card">
      <rect width="600" height="360" rx="16" fill="#15211b"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#1e332a" stroke="#68c297" stroke-width="2.5"/>
      <!-- Screen Off Graphic -->
      <rect x="230" y="55" width="140" height="90" rx="8" fill="#101915" stroke="#68c297" stroke-width="3"/>
      <line x1="280" y1="145" x2="320" y2="145" stroke="#68c297" stroke-width="4"/>
      <line x1="265" y1="165" x2="335" y2="165" stroke="#68c297" stroke-width="4"/>
      <circle cx="300" cy="100" r="14" fill="#2d4a3d"/>
      <path d="M 294 94 L 306 106 M 306 94 L 294 106" stroke="#68c297" stroke-width="3"/>
      <!-- Text -->
      <text x="300" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="0.04em">
        DIGITAL SCREEN BREAK
      </text>
      <text x="300" y="246" text-anchor="middle" fill="#68c297" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="16">
        Stepping away from monitors, phones, and bright pixels.
      </text>
      <text x="300" y="278" text-anchor="middle" fill="#e8f5ee" font-family="system-ui, -apple-system, sans-serif" font-size="14">
        Giving visual sensory system 20 minutes of calm darkness.
      </text>
      <rect x="190" y="300" width="220" height="26" rx="13" fill="#15211b"/>
      <text x="300" y="317" text-anchor="middle" fill="#68c297" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">
        RECHARGING OPTIC NERVE
      </text>
    </svg>`
  },
  {
    id: "guide-doomscroll-interrupt",
    title: "Screen Doomscroll & Dopamine Loop Interrupt",
    category: "screen_fatigue",
    badge: "ADHD Screen Loop",
    icon: "🛑",
    description:
      "An authentic ADHD pattern interrupt for when you are trapped in an infinite scrolling loop or hyperfocus screen lock despite wanting to stop.",
    plain_summary:
      "A visual stop sign to snap out of infinite scroll: Put phone face down, feel your feet on the floor, stretch fingers, and drink water.",
    sensory_prompt:
      "Place your device face-down right now. Do not look at the glass. Push your heels firmly into the ground. Breathe.",
    spoken_text:
      "Pattern Interrupt: Break the screen loop. You are caught in a dopamine scroll loop. Place your device face down right now. Look up at the ceiling. Wiggle your toes. You did not miss anything important. You are here in the real room.",
    palette: {
      bg: "#261520",
      fg: "#ffecf2",
      accent: "#d94168"
    },
    tags: ["doomscroll", "adhd", "dopamine", "phone", "loop", "trap"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Screen Doomscroll Pattern Interrupt">
      <rect width="600" height="360" rx="16" fill="#21101b"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#2d1725" stroke="#f0567f" stroke-width="2.5"/>
      <!-- Stop Sign Graphic -->
      <polygon points="300,50 340,65 355,105 340,145 300,160 260,145 245,105 260,65" fill="#e03661"/>
      <text x="300" y="114" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20">
        STOP
      </text>
      <!-- Title -->
      <text x="300" y="195" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" letter-spacing="0.04em">
        PATTERN INTERRUPT: BREAK THE LOOP
      </text>
      <text x="300" y="225" text-anchor="middle" fill="#f0567f" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        You are stuck in an infinite screen scroll lock.
      </text>

      <!-- 4 Immediate Physical Actions -->
      <g transform="translate(60, 248)">
        <rect x="0" y="0" width="110" height="64" rx="8" fill="#180c14" stroke="#f0567f" stroke-width="1"/>
        <text x="55" y="25" text-anchor="middle" font-size="18">📱⬇️</text>
        <text x="55" y="48" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Phone Face Down</text>

        <rect x="125" y="0" width="110" height="64" rx="8" fill="#180c14" stroke="#f0567f" stroke-width="1"/>
        <text x="180" y="25" text-anchor="middle" font-size="18">🦶</text>
        <text x="180" y="48" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Feet on Floor</text>

        <rect x="250" y="0" width="110" height="64" rx="8" fill="#180c14" stroke="#f0567f" stroke-width="1"/>
        <text x="305" y="25" text-anchor="middle" font-size="18">💧</text>
        <text x="305" y="48" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Sip Cold Water</text>

        <rect x="375" y="0" width="110" height="64" rx="8" fill="#180c14" stroke="#f0567f" stroke-width="1"/>
        <text x="430" y="25" text-anchor="middle" font-size="18">🌿</text>
        <text x="430" y="48" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Look Up at Sky</text>
      </g>
    </svg>`
  },
  {
    id: "guide-fluorescent-glare",
    title: "Fluorescent Buzz & Glare Shield",
    category: "screen_fatigue",
    badge: "Sensory Photophobia",
    icon: "💡",
    description:
      "A sensory guide for handling overhead fluorescent light buzz, 60Hz flicker, and harsh office monitor reflections.",
    plain_summary:
      "Ways to reduce photophobic distress: Wear tinted glasses or a baseball cap, use warm desk lamps instead of overhead lighting, and set screens to 40% brightness.",
    sensory_prompt:
      "Notice the tension in your brow. Lower overhead fluorescent lights if possible, or shade your eyes with a soft visor or brimmed hat.",
    spoken_text:
      "Fluorescent and Monitor Glare Shield. Overhead fluorescent tubes flicker sixty times a second, draining autistic and ADHD energy reserves. Shield your eyes with tinted lenses or a visor, tilt monitors away from direct light, and soften screen contrast.",
    palette: {
      bg: "#241f17",
      fg: "#fcefdc",
      accent: "#ab8532"
    },
    tags: ["fluorescent", "flicker", "glare", "autism", "migraine", "sensory"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fluorescent Buzz and Glare Shield Guide">
      <rect width="600" height="360" rx="16" fill="#1f1a12"/>
      <text x="300" y="38" text-anchor="middle" fill="#fcefdc" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">
        FLUORESCENT LIGHT & GLINT SHIELD
      </text>
      <text x="300" y="58" text-anchor="middle" fill="#d4aa48" font-family="system-ui, -apple-system, sans-serif" font-size="12">
        Mute the 60Hz ballast hum • Block overhead spikes • Soften reflections
      </text>

      <!-- 3 Shields in a Row -->
      <g transform="translate(45, 80)">
        <rect x="0" y="0" width="155" height="235" rx="12" fill="#2d261b" stroke="#ba9038" stroke-width="1.5"/>
        <text x="77" y="55" text-anchor="middle" font-size="32">🧢</text>
        <text x="77" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">Physical Brim</text>
        <text x="77" y="130" text-anchor="middle" fill="#fcefdc" font-size="11">Cap or hoodie visor</text>
        <text x="77" y="152" text-anchor="middle" fill="#fcefdc" font-size="11">Cuts 90% of overhead</text>
        <text x="77" y="174" text-anchor="middle" fill="#fcefdc" font-size="11">fluorescent glare</text>
        <rect x="25" y="195" width="105" height="24" rx="12" fill="#19150d"/>
        <text x="77" y="211" text-anchor="middle" fill="#d4aa48" font-size="10" font-weight="700">INSTANT RELIEF</text>

        <rect x="175" y="0" width="155" height="235" rx="12" fill="#2d261b" stroke="#ba9038" stroke-width="1.5"/>
        <text x="252" y="55" text-anchor="middle" font-size="32">🕶️</text>
        <text x="252" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">FL-41 Tint Lenses</text>
        <text x="252" y="130" text-anchor="middle" fill="#fcefdc" font-size="11">Rose or amber tint</text>
        <text x="252" y="152" text-anchor="middle" fill="#fcefdc" font-size="11">Filters 480-520nm</text>
        <text x="252" y="174" text-anchor="middle" fill="#fcefdc" font-size="11">Blocks flicker ache</text>
        <rect x="200" y="195" width="105" height="24" rx="12" fill="#19150d"/>
        <text x="252" y="211" text-anchor="middle" fill="#d4aa48" font-size="10" font-weight="700">MIGRAINE BLOCK</text>

        <rect x="350" y="0" width="155" height="235" rx="12" fill="#2d261b" stroke="#ba9038" stroke-width="1.5"/>
        <text x="427" y="55" text-anchor="middle" font-size="32">🕯️</text>
        <text x="427" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14">Warm Point Light</text>
        <text x="427" y="130" text-anchor="middle" fill="#fcefdc" font-size="11">Indirect desk lamp</text>
        <text x="427" y="152" text-anchor="middle" fill="#fcefdc" font-size="11">Soft incandescent or</text>
        <text x="427" y="174" text-anchor="middle" fill="#fcefdc" font-size="11">2200K sunset bulb</text>
        <rect x="375" y="195" width="105" height="24" rx="12" fill="#19150d"/>
        <text x="427" y="211" text-anchor="middle" fill="#d4aa48" font-size="10" font-weight="700">COZY SANCTUARY</text>
      </g>
    </svg>`
  },

  // ====================================================
  // 3. ADHD EXECUTIVE FUNCTION & INITIATION PARALYSIS
  // ====================================================
  {
    id: "guide-initiation-friction",
    title: "The 2-Minute First Slice (Overcoming Task Paralysis)",
    category: "executive_adhd",
    badge: "ADHD Executive Function",
    icon: "⚡",
    description:
      "A visual guide for deconstructing the 'Wall of Awful'—the emotional and executive freeze that prevents starting a task. Shrinks the task to a micro-action.",
    plain_summary:
      "Do not attempt the entire task. Only commit to doing the first 2 minutes or opening the file. You have full permission to stop after that.",
    sensory_prompt:
      "Shrink the task: instead of 'clean the entire room', pick up literally ONE sock. Instead of 'write report', write only the title.",
    spoken_text:
      "The Two Minute First Slice. Task initiation paralysis is an executive function obstacle, not laziness. Lower the bar until it feels ridiculously easy. Commit only to the first physical action, like opening the document. You can stop after two minutes.",
    palette: {
      bg: "#18261e",
      fg: "#eaf5ee",
      accent: "#48996b"
    },
    tags: ["adhd", "initiation", "paralysis", "executive", "friction", "start"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Task Initiation and 2-Minute Slice Guide">
      <rect width="600" height="360" rx="16" fill="#121e17"/>
      <text x="300" y="38" text-anchor="middle" fill="#eaf5ee" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">
        OVERCOMING THE WALL OF AWFUL: 2-MINUTE SLICE
      </text>
      <text x="300" y="58" text-anchor="middle" fill="#58b380" font-family="system-ui, -apple-system, sans-serif" font-size="12">
        Initiation freeze is neurological friction • Shrink the task until resistance is zero
      </text>

      <!-- Before vs After Visual -->
      <g transform="translate(45, 80)">
        <!-- The Daunting Mountain (Left) -->
        <rect x="0" y="0" width="240" height="235" rx="12" fill="#241919" stroke="#993d3d" stroke-width="1.5"/>
        <text x="120" y="35" text-anchor="middle" fill="#fca4a4" font-weight="800" font-size="14">THE ENTIRE TASK (PARALYZING)</text>
        <path d="M 40 180 L 120 70 L 200 180 Z" fill="#382222" stroke="#d95d5d" stroke-width="2"/>
        <text x="120" y="135" text-anchor="middle" fill="#ffb8b8" font-size="28">🏔️</text>
        <text x="120" y="165" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">"Clean whole room"</text>
        <text x="120" y="210" text-anchor="middle" fill="#ffb8b8" font-size="11">Result: Guilt, freeze, scrolling</text>

        <!-- The 2-Minute Slice (Right) -->
        <rect x="270" y="0" width="240" height="235" rx="12" fill="#182d22" stroke="#58b380" stroke-width="2"/>
        <text x="390" y="35" text-anchor="middle" fill="#8cedb6" font-weight="800" font-size="14">THE 2-MINUTE SLICE (ZERO FRICTION)</text>
        <circle cx="390" cy="115" r="45" fill="#264736" stroke="#58b380" stroke-width="2"/>
        <text x="390" y="125" text-anchor="middle" font-size="34">🧦</text>
        <text x="390" y="175" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="800">"Pick up 1 single sock"</text>
        <text x="390" y="200" text-anchor="middle" fill="#a4e8c1" font-size="11">Permission to stop after 120 secs</text>
        <text x="390" y="220" text-anchor="middle" fill="#58b380" font-size="10" font-weight="700">MOMENTUM UNLOCKED 🌱</text>
      </g>
    </svg>`
  },
  {
    id: "card-deep-focus",
    title: "Deep Focus Flow Card",
    category: "executive_adhd",
    badge: "Non-Verbal AAC",
    icon: "🎯",
    description:
      "A peaceful green indicator to preserve hyperfocus or deep flow states, preventing cognitive context switching.",
    plain_summary:
      "Place this card on your desk or show it to coworkers to protect your flow state without being rude.",
    sensory_prompt:
      "Card message: 'In deep focus flow. Please send a written message or wait unless it is an urgent emergency.'",
    spoken_text:
      "Notice: Deep focus flow state active. Interrupting will break my concentration train. Please send an email or text message unless urgent.",
    palette: {
      bg: "#142823",
      fg: "#daf2e9",
      accent: "#2f7a62"
    },
    tags: ["focus", "adhd", "flow", "aac", "work"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deep Focus Flow Card">
      <rect width="600" height="360" rx="16" fill="#142823"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#1a362f" stroke="#7ad9b5" stroke-width="2"/>
      <!-- Concentric Focus Rings -->
      <circle cx="300" cy="115" r="45" fill="none" stroke="#7ad9b5" stroke-width="4" stroke-dasharray="6,4"/>
      <circle cx="300" cy="115" r="28" fill="none" stroke="#7ad9b5" stroke-width="4"/>
      <circle cx="300" cy="115" r="12" fill="#7ad9b5"/>
      <!-- Text -->
      <text x="300" y="205" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24">
        DEEP FOCUS FLOW
      </text>
      <text x="300" y="242" text-anchor="middle" fill="#7ad9b5" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16">
        Please do not interrupt.
      </text>
      <text x="300" y="272" text-anchor="middle" fill="#daf2e9" font-family="system-ui, -apple-system, sans-serif" font-size="14">
        Kindly leave a written note or message for later.
      </text>
      <rect x="220" y="298" width="160" height="24" rx="12" fill="#142823"/>
      <text x="300" y="314" text-anchor="middle" fill="#7ad9b5" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">
        FOCUS TIME PROTECTED
      </text>
    </svg>`
  },

  // ====================================================
  // 4. AUTISTIC SENSORY & NON-VERBAL AAC CARDS
  // ====================================================
  {
    id: "card-sensory-overload",
    title: "Sensory Overload Visual Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "🎧",
    description:
      "A high-contrast, clear AAC communication card designed to be held up or shown on screen to communicate sensory distress without needing speech.",
    plain_summary:
      "Show this card to let people know you are overwhelmed by sound or lights and need a quiet moment.",
    sensory_prompt:
      "Card message: 'I am experiencing sensory overload. Please speak quietly or give me space to recover. Thank you.'",
    spoken_text:
      "Notice for those nearby: I am currently experiencing sensory overload. Loud sounds, bright lights, or complex questions are difficult right now. Please lower volume or give me a quiet moment. Thank you for your patience.",
    palette: {
      bg: "#18322f",
      fg: "#ffffff",
      accent: "#216b54"
    },
    tags: ["aac", "overload", "communication", "nonverbal", "card"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sensory Overload AAC Card">
      <rect width="600" height="360" rx="16" fill="#18322f"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#21453f" stroke="#d7ede1" stroke-width="2" stroke-dasharray="6,4"/>
      <!-- Headphone Graphic -->
      <g fill="none" stroke="#d7ede1" stroke-width="8" stroke-linecap="round">
        <path d="M240 130 A 60 60 0 0 1 360 130"/>
        <rect x="228" y="125" width="24" height="42" rx="10" fill="#d7ede1" stroke="none"/>
        <rect x="348" y="125" width="24" height="42" rx="10" fill="#d7ede1" stroke="none"/>
      </g>
      <!-- Card Text -->
      <text x="300" y="215" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" letter-spacing="0.04em">
        SENSORY OVERLOAD
      </text>
      <text x="300" y="250" text-anchor="middle" fill="#d7ede1" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16">
        I am experiencing sensory fatigue.
      </text>
      <text x="300" y="280" text-anchor="middle" fill="#eef7f2" font-family="system-ui, -apple-system, sans-serif" font-size="14">
        Please speak softly or allow me quiet time to reset.
      </text>
      <rect x="220" y="300" width="160" height="24" rx="12" fill="#18322f"/>
      <text x="300" y="316" text-anchor="middle" fill="#d7ede1" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">
        NEUROSAFE AAC CARD
      </text>
    </svg>`
  },
  {
    id: "card-auditory-delay",
    title: "Auditory Processing Delay AAC Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "👂",
    description:
      "An AAC card explaining auditory processing delays common in autistic and ADHD individuals, requesting written follow-ups or subtitles.",
    plain_summary:
      "Show this card when spoken words sound like static or background noise makes it impossible to comprehend speech.",
    sensory_prompt:
      "Card message: 'I have an auditory processing delay. Spoken words take extra time to decode. Please send key points in writing or repeat slowly.'",
    spoken_text:
      "Notice: Auditory Processing Delay. In noisy rooms or when fatigued, spoken words take extra time for my brain to decode. Please provide written instructions or key bullet points.",
    palette: {
      bg: "#131e2b",
      fg: "#def0fa",
      accent: "#3b8ab8"
    },
    tags: ["auditory", "apd", "aac", "subtitles", "written", "autism"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Auditory Processing Delay AAC Card">
      <rect width="600" height="360" rx="16" fill="#101924"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#18293b" stroke="#5cb3e3" stroke-width="2.5"/>
      <!-- Ear & Sound Waves Graphic -->
      <g fill="none" stroke="#5cb3e3" stroke-width="4" stroke-linecap="round">
        <path d="M 285 85 Q 260 85 260 115 Q 260 145 285 145 Q 295 145 295 130 Q 295 120 280 120"/>
        <path d="M 315 95 Q 330 115 315 135"/>
        <path d="M 330 85 Q 355 115 330 145"/>
      </g>
      <!-- Card Text -->
      <text x="300" y="195" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" letter-spacing="0.04em">
        AUDITORY PROCESSING DELAY
      </text>
      <text x="300" y="232" text-anchor="middle" fill="#5cb3e3" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        My brain needs extra time to translate speech into meaning.
      </text>
      <text x="300" y="265" text-anchor="middle" fill="#def0fa" font-family="system-ui, -apple-system, sans-serif" font-size="14">
        Writing it down or giving short written bullets helps me 100% more.
      </text>
      <rect x="175" y="295" width="250" height="28" rx="14" fill="#101924"/>
      <text x="300" y="313" text-anchor="middle" fill="#5cb3e3" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">
        PLEASE PROVIDE WRITTEN BULLETS
      </text>
    </svg>`
  },
  {
    id: "card-low-spoons",
    title: "Low Energy / Processing Time Card",
    category: "aac_card",
    badge: "Non-Verbal AAC",
    icon: "🔋",
    description:
      "A gentle visual card to indicate depleted cognitive energy, spoon deficit, or need for reduced demand.",
    plain_summary:
      "Show this card when your energy battery is low so others know you can't engage in long conversations right now.",
    sensory_prompt:
      "Card message: 'My energy battery is low. I am listening, but I need extra processing time to respond.'",
    spoken_text:
      "Card text: Low energy and limited spoons right now. I am listening and understand, but my processing speed is slow. Please be gentle and allow me extra time to respond.",
    palette: {
      bg: "#2b2a1a",
      fg: "#fdf8dc",
      accent: "#a3952f"
    },
    tags: ["aac", "energy", "spoons", "battery", "communication"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Low Energy AAC Card">
      <rect width="600" height="360" rx="16" fill="#242217"/>
      <rect x="16" y="16" width="568" height="328" rx="12" fill="#332f1f" stroke="#e8d98d" stroke-width="2"/>
      <!-- Battery Graphic -->
      <rect x="240" y="85" width="110" height="58" rx="10" fill="none" stroke="#e8d98d" stroke-width="5"/>
      <rect x="352" y="104" width="8" height="20" rx="3" fill="#e8d98d"/>
      <rect x="248" y="93" width="30" height="42" rx="6" fill="#e8d98d"/>
      <!-- Text -->
      <text x="300" y="195" text-anchor="middle" fill="#fdf8dc" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24">
        LOW SPOONS / ENERGY
      </text>
      <text x="300" y="235" text-anchor="middle" fill="#e8d98d" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16">
        Need extra processing time.
      </text>
      <text x="300" y="265" text-anchor="middle" fill="#fdf8dc" font-family="system-ui, -apple-system, sans-serif" font-size="14">
        I hear you, but writing or speaking takes effort right now.
      </text>
      <rect x="200" y="295" width="200" height="26" rx="13" fill="#242217"/>
      <text x="300" y="312" text-anchor="middle" fill="#e8d98d" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">
        PATIENCE APPRECIATED
      </text>
    </svg>`
  },

  // ====================================================
  // 5. SOMATIC REGULATION & BREATH PACERS
  // ====================================================
  {
    id: "guide-box-breathing",
    title: "Box Breathing 4-4-4-4 Visual Pacer",
    category: "regulation",
    badge: "Regulation Guide",
    icon: "🫁",
    description:
      "A structured 4-sided breathing diagram guiding equal 4-second intervals: Inhale, Hold, Exhale, and Rest to down-regulate the sympathetic nervous system.",
    plain_summary:
      "Follow the square: Breathe in for 4, hold for 4, breathe out for 4, rest for 4. Repeat 3 times to reset.",
    sensory_prompt:
      "Look at each edge of the box. Count slowly: 1... 2... 3... 4. Notice how your pulse slows down.",
    spoken_text:
      "Box Breathing Guide. Side one: Inhale calmly through the nose for 4 seconds. Side two: Gently hold the air for 4 seconds. Side three: Slowly exhale through the mouth for 4 seconds. Side four: Rest in stillness for 4 seconds.",
    palette: {
      bg: "#182c30",
      fg: "#d8f2f5",
      accent: "#377580"
    },
    tags: ["breathing", "regulation", "vagus", "anxiety", "guide"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Box Breathing Visual Guide">
      <rect width="600" height="360" rx="16" fill="#132326"/>
      <!-- Central Square Box -->
      <rect x="180" y="70" width="240" height="200" rx="16" fill="#1a3035" stroke="#71c0cd" stroke-width="4"/>
      <!-- Corner Highlights -->
      <circle cx="180" cy="70" r="7" fill="#71c0cd"/>
      <circle cx="420" cy="70" r="7" fill="#71c0cd"/>
      <circle cx="420" cy="270" r="7" fill="#71c0cd"/>
      <circle cx="180" cy="270" r="7" fill="#71c0cd"/>
      <!-- Labels on 4 sides -->
      <text x="300" y="52" text-anchor="middle" fill="#71c0cd" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        1. INHALE (4 SEC) ⬆️
      </text>
      <text x="445" y="175" text-anchor="start" fill="#71c0cd" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        2. HOLD (4 SEC) ⏸️
      </text>
      <text x="300" y="302" text-anchor="middle" fill="#71c0cd" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        3. EXHALE (4 SEC) ⬇️
      </text>
      <text x="155" y="175" text-anchor="end" fill="#71c0cd" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15">
        4. REST (4 SEC) 🌿
      </text>
      <!-- Center Affirmation -->
      <text x="300" y="160" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20">
        4 × 4 × 4 × 4
      </text>
      <text x="300" y="188" text-anchor="middle" fill="#a4dfe8" font-family="system-ui, -apple-system, sans-serif" font-size="13">
        Vagus Nerve Reset Pace
      </text>
      <!-- Footer -->
      <text x="300" y="338" text-anchor="middle" fill="#71c0cd" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">
        Repeat for 3 to 5 smooth cycles
      </text>
    </svg>`
  },
  {
    id: "guide-54321-grounding",
    title: "5-4-3-2-1 Sensory Grounding Board",
    category: "regulation",
    badge: "Regulation Guide",
    icon: "🖐️",
    description:
      "A visual reference anchor board for the classical 5-4-3-2-1 grounding technique, breaking anxiety loops through physical presence.",
    plain_summary:
      "Look around you and name: 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    sensory_prompt:
      "Scan your current room right now. Spot 5 different colors or textures. Touch your clothes or chair. Listen for background humming.",
    spoken_text:
      "5-4-3-2-1 Grounding Method. Step 5: Acknowledge five things you can see around you. Step 4: Touch four distinct textures nearby. Step 3: Listen for three quiet sounds. Step 2: Notice two scents in the air. Step 1: Notice one taste or take a sip of cool water.",
    palette: {
      bg: "#241f30",
      fg: "#ebdffa",
      accent: "#765fa3"
    },
    tags: ["54321", "grounding", "anxiety", "sensory", "mindfulness"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="5-4-3-2-1 Grounding Board">
      <rect width="600" height="360" rx="16" fill="#1b1724"/>
      <text x="300" y="44" text-anchor="middle" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20">
        5-4-3-2-1 SENSORY GROUNDING
      </text>
      <!-- 5 Step Columns / Rows -->
      <g transform="translate(40, 65)">
        <rect x="0" y="0" width="520" height="46" rx="10" fill="#2a2238" stroke="#9d84cf" stroke-width="1.5"/>
        <text x="24" y="30" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">5</text>
        <text x="55" y="29" fill="#9d84cf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">SEE</text>
        <text x="110" y="29" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13">Notice 5 distinct objects, colors, or shadows</text>

        <rect x="0" y="54" width="520" height="46" rx="10" fill="#2a2238" stroke="#9d84cf" stroke-width="1.5"/>
        <text x="24" y="84" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">4</text>
        <text x="55" y="83" fill="#9d84cf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">FEEL</text>
        <text x="110" y="83" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13">Touch 4 physical textures (fabric, desk, hair, ring)</text>

        <rect x="0" y="108" width="520" height="46" rx="10" fill="#2a2238" stroke="#9d84cf" stroke-width="1.5"/>
        <text x="24" y="138" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">3</text>
        <text x="55" y="137" fill="#9d84cf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">HEAR</text>
        <text x="110" y="137" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13">Listen for 3 background sounds (fan, breathing, traffic)</text>

        <rect x="0" y="162" width="520" height="46" rx="10" fill="#2a2238" stroke="#9d84cf" stroke-width="1.5"/>
        <text x="24" y="192" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">2</text>
        <text x="55" y="191" fill="#9d84cf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">SMELL</text>
        <text x="110" y="191" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13">Identify 2 subtle scents around you</text>

        <rect x="0" y="216" width="520" height="46" rx="10" fill="#2a2238" stroke="#9d84cf" stroke-width="1.5"/>
        <text x="24" y="246" fill="#ebdffa" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">1</text>
        <text x="55" y="245" fill="#9d84cf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">TASTE</text>
        <text x="110" y="245" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13">Take 1 mindful sip of water or notice your breath</text>
      </g>
    </svg>`
  },

  // ====================================================
  // 6. LOW-DEMAND ROUTINES
  // ====================================================
  {
    id: "routine-morning-reset",
    title: "Gentle Morning Micro-Routines",
    category: "routine",
    badge: "Visual Routine",
    icon: "☀️",
    description:
      "A low-demand visual sequence for easing into the day without executive overload or rush panic.",
    plain_summary:
      "Step 1: Drink a glass of water. Step 2: Open blinds for natural light. Step 3: Medication / breakfast. Step 4: Pick one tiny task.",
    sensory_prompt:
      "Do not look at emails or social media yet. Give your brain 10 quiet minutes to wake up at its own natural pace.",
    spoken_text:
      "Gentle Morning Routine. Step one: Drink a full glass of cool water. Step two: Welcome soft natural daylight. Step three: Take any morning medications with nutrition. Step four: Celebrate being here.",
    palette: {
      bg: "#2b2318",
      fg: "#fdedd6",
      accent: "#bd7f28"
    },
    tags: ["morning", "routine", "adhd", "executive", "habits"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Morning Micro-Routine Visual">
      <rect width="600" height="360" rx="16" fill="#1f1810"/>
      <text x="300" y="44" text-anchor="middle" fill="#fdedd6" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20">
        GENTLE MORNING ROUTINE
      </text>
      <!-- 4 Visual Steps in Cards -->
      <g transform="translate(30, 75)">
        <rect x="0" y="0" width="120" height="230" rx="12" fill="#2d2216" stroke="#e3a74b" stroke-width="1.5"/>
        <text x="60" y="34" text-anchor="middle" fill="#e3a74b" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">1</text>
        <text x="60" y="80" text-anchor="middle" font-size="34">💧</text>
        <text x="60" y="130" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">Hydrate</text>
        <text x="60" y="160" text-anchor="middle" fill="#fdedd6" font-family="system-ui, -apple-system, sans-serif" font-size="11">Cool glass of water</text>

        <rect x="140" y="0" width="120" height="230" rx="12" fill="#2d2216" stroke="#e3a74b" stroke-width="1.5"/>
        <text x="200" y="34" text-anchor="middle" fill="#e3a74b" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">2</text>
        <text x="200" y="80" text-anchor="middle" font-size="34">🌤️</text>
        <text x="200" y="130" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">Soft Light</text>
        <text x="200" y="160" text-anchor="middle" fill="#fdedd6" font-family="system-ui, -apple-system, sans-serif" font-size="11">Open curtains slowly</text>

        <rect x="280" y="0" width="120" height="230" rx="12" fill="#2d2216" stroke="#e3a74b" stroke-width="1.5"/>
        <text x="340" y="34" text-anchor="middle" fill="#e3a74b" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">3</text>
        <text x="340" y="80" text-anchor="middle" font-size="34">💊</text>
        <text x="340" y="130" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">Nourish</text>
        <text x="340" y="160" text-anchor="middle" fill="#fdedd6" font-family="system-ui, -apple-system, sans-serif" font-size="11">Meds & easy snack</text>

        <rect x="420" y="0" width="120" height="230" rx="12" fill="#2d2216" stroke="#e3a74b" stroke-width="1.5"/>
        <text x="480" y="34" text-anchor="middle" fill="#e3a74b" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">4</text>
        <text x="480" y="80" text-anchor="middle" font-size="34">🌱</text>
        <text x="480" y="130" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14">1 Small Step</text>
        <text x="480" y="160" text-anchor="middle" fill="#fdedd6" font-family="system-ui, -apple-system, sans-serif" font-size="11">Pick one micro task</text>
      </g>
    </svg>`
  },

  // ====================================================
  // 7. CALMING SANCTUARY SCENES
  // ====================================================
  {
    id: "quiet-forest",
    title: "Serene Pine Forest Clearing",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌲",
    description:
      "A peaceful clearing surrounded by tall evergreens with soft morning mist rolling between the trunks. Filtered emerald light warms the mossy forest floor with zero harsh glare.",
    plain_summary:
      "A calm green forest with soft light, gentle trees, and fresh mountain air to help settle an overwhelmed nervous system.",
    sensory_prompt:
      "Grounding exercise: Take 3 deep breaths. Imagine the scent of damp cedar, cool pine needles underfoot, and the quiet rustle of high branches.",
    spoken_text:
      "Serene Pine Forest Clearing. Soft morning mist settles between tall cedar trees. Dappled sunlight rests gently on the emerald moss without harsh glare. Breathe in calm, breathe out tension.",
    palette: {
      bg: "#1b332b",
      fg: "#d7ede1",
      accent: "#438b72"
    },
    tags: ["nature", "trees", "calm", "green", "grounding"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Serene Pine Forest Clearing">
      <defs>
        <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#142620"/>
          <stop offset="60%" stop-color="#214036"/>
          <stop offset="100%" stop-color="#345c4f"/>
        </linearGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#d7ede1" stop-opacity="0.12"/>
          <stop offset="50%" stop-color="#d7ede1" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#d7ede1" stop-opacity="0.12"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#forestSky)"/>
      <circle cx="300" cy="110" r="75" fill="#e8f4ed" opacity="0.18" filter="blur(10px)"/>
      <path d="M0 240 Q150 180 320 220 T600 210 L600 360 L0 360 Z" fill="#1b332b" opacity="0.7"/>
      <path d="M0 260 Q180 210 360 250 T600 240 L600 360 L0 360 Z" fill="#152b24"/>
      <polygon points="120,130 90,190 150,190" fill="#1b382e" opacity="0.5"/>
      <polygon points="180,110 145,180 215,180" fill="#1e3f34" opacity="0.6"/>
      <polygon points="240,140 210,200 270,200" fill="#1b382e" opacity="0.5"/>
      <polygon points="360,115 325,185 395,185" fill="#1e3f34" opacity="0.6"/>
      <polygon points="430,130 400,190 460,190" fill="#1b382e" opacity="0.5"/>
      <polygon points="500,110 465,180 535,180" fill="#1e3f34" opacity="0.6"/>
      <rect x="0" y="190" width="600" height="40" fill="url(#mist)"/>
      <g fill="#0e1f1a">
        <polygon points="80,140 50,220 110,220"/>
        <polygon points="80,180 40,260 120,260"/>
        <polygon points="80,220 30,310 130,310"/>
        <rect x="73" y="310" width="14" height="40" fill="#091411"/>
      </g>
      <g fill="#12241f">
        <polygon points="480,120 445,210 515,210"/>
        <polygon points="480,170 435,260 525,260"/>
        <polygon points="480,210 420,310 540,310"/>
        <rect x="473" y="310" width="14" height="40" fill="#091411"/>
      </g>
      <ellipse cx="300" cy="330" rx="220" ry="40" fill="#25473c"/>
      <ellipse cx="300" cy="340" rx="160" ry="25" fill="#30594b"/>
      <circle cx="210" cy="240" r="3" fill="#eef7f2" opacity="0.6"/>
      <circle cx="280" cy="220" r="2.5" fill="#eef7f2" opacity="0.7"/>
      <circle cx="340" cy="250" r="3" fill="#eef7f2" opacity="0.6"/>
      <circle cx="390" cy="230" r="2" fill="#eef7f2" opacity="0.5"/>
    </svg>`
  },
  {
    id: "gentle-ocean",
    title: "Tranquil Pastel Ocean Horizon",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌊",
    description:
      "A quiet shoreline where calm, low-amplitude waves lap against fine wet sand. Soft twilight blues and sage teals provide an even, soothing visual rhythm.",
    plain_summary:
      "A wide, quiet sea with gentle waves. The steady, predictable rhythm helps quiet racing thoughts.",
    sensory_prompt:
      "Breathing exercise: Inhale as the gentle foam washes up on the shore. Exhale as the water smoothly recedes back into the blue expanse.",
    spoken_text:
      "Tranquil Pastel Ocean Horizon. Flat, calm waves roll rhythmically against the shore. A soft evening breeze across the open horizon creates steady, comforting stillness.",
    palette: {
      bg: "#162833",
      fg: "#d6eaf5",
      accent: "#3a738c"
    },
    tags: ["ocean", "water", "waves", "blue", "horizon"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tranquil Pastel Ocean Horizon">
      <defs>
        <linearGradient id="oceanSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#12212b"/>
          <stop offset="60%" stop-color="#244152"/>
          <stop offset="100%" stop-color="#416b7f"/>
        </linearGradient>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3845"/>
          <stop offset="100%" stop-color="#0f1d24"/>
        </linearGradient>
      </defs>
      <rect width="600" height="220" fill="url(#oceanSky)"/>
      <circle cx="300" cy="180" r="40" fill="#f0ede1" opacity="0.3"/>
      <circle cx="300" cy="180" r="24" fill="#faf6eb" opacity="0.5"/>
      <rect y="210" width="600" height="150" fill="url(#seaGrad)"/>
      <path d="M0 230 Q 150 225 300 230 T 600 230" fill="none" stroke="#6b9cb3" stroke-width="2" opacity="0.4"/>
      <path d="M0 250 Q 150 244 300 250 T 600 250" fill="none" stroke="#87b6cc" stroke-width="2.5" opacity="0.45"/>
      <path d="M0 275 Q 150 268 300 275 T 600 275" fill="none" stroke="#a4d1e6" stroke-width="3" opacity="0.5"/>
      <path d="M0 305 Q 150 297 300 305 T 600 305" fill="none" stroke="#c4e7f7" stroke-width="3.5" opacity="0.6"/>
      <path d="M0 330 Q 200 320 400 332 T 600 330 L 600 360 L 0 360 Z" fill="#2d4239" opacity="0.6"/>
      <path d="M0 338 Q 220 330 420 340 T 600 338" fill="none" stroke="#e8f6fc" stroke-width="3" stroke-dasharray="14,6" opacity="0.8"/>
    </svg>`
  },
  {
    id: "rainy-sanctuary",
    title: "Raindrops on Warm Window",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🌧️",
    description:
      "Looking out through a clean window pane covered in smooth raindrops. In the background, muted warm cafe lights glow softly against misty gray afternoon rain.",
    plain_summary:
      "A quiet indoor sanctuary shielded from outside noise while rain falls peacefully against the glass.",
    sensory_prompt:
      "Focus on the sound of steady rain: white noise shielding you from demanding social sensory inputs. You are safe inside.",
    spoken_text:
      "Raindrops on Warm Window. Outside, gentle rain washes the world clean with quiet, white-noise patter. Inside, warm shelter and comforting quiet envelop you.",
    palette: {
      bg: "#1c242a",
      fg: "#d9e3ea",
      accent: "#4c667a"
    },
    tags: ["rain", "window", "cozy", "indoor", "shelter"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Raindrops on Warm Window">
      <defs>
        <linearGradient id="rainBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#161e24"/>
          <stop offset="50%" stop-color="#25323d"/>
          <stop offset="100%" stop-color="#1d262d"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#rainBg)"/>
      <circle cx="120" cy="100" r="45" fill="#f0ca86" opacity="0.15"/>
      <circle cx="220" cy="180" r="35" fill="#bfe3d5" opacity="0.12"/>
      <circle cx="480" cy="120" r="55" fill="#f0ca86" opacity="0.18"/>
      <circle cx="380" cy="220" r="40" fill="#9bc4b3" opacity="0.14"/>
      <rect x="296" y="0" width="8" height="360" fill="#0e1418" opacity="0.8"/>
      <rect x="0" y="176" width="600" height="8" fill="#0e1418" opacity="0.8"/>
      <g fill="#c8e2f0" opacity="0.6">
        <ellipse cx="60" cy="70" rx="3" ry="7"/>
        <ellipse cx="85" cy="140" rx="2.5" ry="5"/>
        <ellipse cx="140" cy="50" rx="3.5" ry="9"/>
        <ellipse cx="180" cy="120" rx="2" ry="4"/>
        <ellipse cx="230" cy="80" rx="3" ry="8"/>
        <ellipse cx="260" cy="150" rx="2.5" ry="6"/>
        <ellipse cx="340" cy="90" rx="3" ry="7"/>
        <ellipse cx="370" cy="60" rx="2.5" ry="5"/>
        <ellipse cx="430" cy="110" rx="3.5" ry="9"/>
        <ellipse cx="520" cy="80" rx="2.5" ry="6"/>
        <ellipse cx="550" cy="140" rx="3" ry="7"/>
        <ellipse cx="70" cy="240" rx="3" ry="8"/>
        <ellipse cx="130" cy="290" rx="2.5" ry="6"/>
        <ellipse cx="200" cy="230" rx="3" ry="7"/>
        <ellipse cx="250" cy="310" rx="2" ry="5"/>
        <ellipse cx="350" cy="260" rx="3.5" ry="9"/>
        <ellipse cx="410" cy="300" rx="2.5" ry="6"/>
        <ellipse cx="490" cy="240" rx="3" ry="7"/>
        <ellipse cx="540" cy="290" rx="2" ry="4"/>
      </g>
    </svg>`
  },
  {
    id: "cozy-hearth",
    title: "Warm Fireside & Knitted Hearth",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "🔥",
    description:
      "A soft, crackling hearth fire glowing with warm amber embers. Flanked by deep forest green walls and a soft woven wool throw for deep pressure comfort.",
    plain_summary:
      "Gentle warmth, soft amber light, and no sudden loud sounds. A comforting sanctuary to reset after social exhaustion.",
    sensory_prompt:
      "Imagine wrapping yourself in a heavy, comforting wool blanket while warmth soothes tense shoulder muscles.",
    spoken_text:
      "Warm Fireside and Knitted Hearth. Gentle golden embers crackle with steady, comforting warmth. Soft blankets provide comforting weight. Relax your shoulders and breathe slowly.",
    palette: {
      bg: "#2b1e16",
      fg: "#fce9da",
      accent: "#a85e33"
    },
    tags: ["fireplace", "warmth", "cozy", "amber", "hearth"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warm Fireside & Knitted Hearth">
      <defs>
        <radialGradient id="fireGlow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="#fa9d43" stop-opacity="0.9"/>
          <stop offset="30%" stop-color="#df6726" stop-opacity="0.5"/>
          <stop offset="70%" stop-color="#542513" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#1e140e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="600" height="360" fill="#1c140f"/>
      <path d="M160 360 L160 160 Q300 80 440 160 L440 360 Z" fill="#2d1f18"/>
      <path d="M190 360 L190 180 Q300 120 410 180 L410 360 Z" fill="#140c07"/>
      <circle cx="300" cy="270" r="180" fill="url(#fireGlow)"/>
      <g fill="#422e20">
        <rect x="230" y="290" width="140" height="24" rx="10" transform="rotate(-12 300 300)"/>
        <rect x="230" y="290" width="140" height="24" rx="10" transform="rotate(14 300 300)"/>
      </g>
      <path d="M300 180 Q330 240 300 280 Q270 240 300 180 Z" fill="#fed87b"/>
      <path d="M280 210 Q310 260 280 290 Q260 250 280 210 Z" fill="#f8892f"/>
      <path d="M320 220 Q340 260 320 290 Q300 255 320 220 Z" fill="#e2571e"/>
      <circle cx="280" cy="250" r="3" fill="#ffe9a0"/>
      <circle cx="320" cy="245" r="2.5" fill="#ffe9a0"/>
      <circle cx="295" cy="230" r="2" fill="#fff"/>
      <circle cx="310" cy="210" r="2" fill="#ffd066"/>
    </svg>`
  },
  {
    id: "starlit-sky",
    title: "Deep Cosmos & Starlit Meadow",
    category: "grounding",
    badge: "Sensory Grounding",
    icon: "✨",
    description:
      "A velvet night sky filled with gentle, non-flickering distant stars and soft indigo nebulae arching over a quiet meadow.",
    plain_summary:
      "Deep night sky with soft star fields. Expansive, peaceful space to relieve feelings of sensory crowding.",
    sensory_prompt:
      "Take comfort in how vast and quiet the night sky is. You do not need to perform or explain anything right now.",
    spoken_text:
      "Deep Cosmos and Starlit Meadow. The velvet indigo sky holds millions of quiet stars. The world is resting. There are no expectations on you here.",
    palette: {
      bg: "#0d131f",
      fg: "#e0e8fc",
      accent: "#2c467a"
    },
    tags: ["stars", "night", "sky", "space", "quiet"],
    svg: `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deep Cosmos & Starlit Meadow">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#070b13"/>
          <stop offset="60%" stop-color="#121a2c"/>
          <stop offset="100%" stop-color="#1f283c"/>
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#nightSky)"/>
      <ellipse cx="320" cy="120" rx="180" ry="60" fill="#394269" opacity="0.22" filter="blur(20px)"/>
      <path d="M470 70 A 24 24 0 0 0 494 94 A 20 20 0 1 1 470 70 Z" fill="#e8eeff" opacity="0.75"/>
      <g fill="#e8f0fe">
        <circle cx="80" cy="60" r="1.5" opacity="0.8"/>
        <circle cx="120" cy="110" r="2" opacity="0.9"/>
        <circle cx="170" cy="40" r="1.2" opacity="0.6"/>
        <circle cx="210" cy="90" r="2.2" opacity="0.85"/>
        <circle cx="260" cy="50" r="1.5" opacity="0.7"/>
        <circle cx="310" cy="80" r="2" opacity="0.9"/>
        <circle cx="360" cy="35" r="1.2" opacity="0.5"/>
        <circle cx="410" cy="75" r="2.5" opacity="0.9"/>
        <circle cx="440" cy="120" r="1.5" opacity="0.7"/>
        <circle cx="520" cy="55" r="2" opacity="0.8"/>
        <circle cx="560" cy="100" r="1.5" opacity="0.6"/>
        <circle cx="150" cy="160" r="1.8" opacity="0.75"/>
        <circle cx="290" cy="150" r="1.2" opacity="0.6"/>
        <circle cx="380" cy="170" r="2" opacity="0.8"/>
      </g>
      <path d="M0 260 L90 200 L220 250 L340 180 L460 250 L600 190 L600 360 L0 360 Z" fill="#0a0f17"/>
      <ellipse cx="300" cy="340" rx="320" ry="35" fill="#070c12"/>
    </svg>`
  }
];
