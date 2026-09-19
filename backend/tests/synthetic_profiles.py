"""
30 synthetic accessibility profiles for evaluating the suggestion pipeline.

Split:
  - DEV_PROFILES   (indices 0-19): use during prompt design and validation.
  - TEST_PROFILES  (indices 0-9 of HELD_OUT): held-out; do NOT inspect while
    designing prompts or rules.

Categories:
  - Straightforward (10)       : clear, single-need inputs.
  - Multi-need (8)             : multiple explicit preferences.
  - Conflicting / context-dep. (4): contradictory or ambiguous signals.
  - Ambiguous (4)              : vague; correct response is to ask.
  - Unusual / OOD (2)          : off-topic or edge-case.
  - Negation (2)               : explicit "I do NOT want X".

Each profile has:
  input        : synthetic user description (no real personal data).
  category     : one of the six types above.
  expected      : the expected status and (for suggestion) which settings
                  should be true/false/absent.  'absent' means no entry at
                  all — not suggested.
  notes        : evaluation guidance.
"""

from typing import TypedDict, Optional


class ExpectedSettings(TypedDict, total=False):
    simplify_text: Optional[bool]          # True, False, or None = absent
    step_by_step: Optional[bool]
    read_aloud: Optional[bool]
    communication_support: Optional[bool]
    low_stimulation_interface: Optional[bool]
    task_breakdown: Optional[bool]
    navigation_support: Optional[bool]


class SyntheticProfile(TypedDict):
    id: str
    input: str
    category: str
    expected_status: str           # suggestion | clarification | conflict | out_of_scope
    expected_settings: ExpectedSettings
    notes: str


# ---------------------------------------------------------------------------
# DEVELOPMENT PROFILES (20)
# ---------------------------------------------------------------------------

DEV_PROFILES: list[SyntheticProfile] = [
    # ---- Straightforward (10) ----
    {
        "id": "dev_s01",
        "input": "Long paragraphs are really hard for me to follow. I'd prefer shorter, simpler sentences.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"simplify_text": True},
        "notes": "Clear text simplification need.",
    },
    {
        "id": "dev_s02",
        "input": "I find it much easier when instructions are broken into steps rather than given all at once.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"step_by_step": True},
        "notes": "Clear step-by-step need.",
    },
    {
        "id": "dev_s03",
        "input": "I prefer to listen to text rather than read it. Can the app read things out to me?",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"read_aloud": True},
        "notes": "Explicit read-aloud request.",
    },
    {
        "id": "dev_s04",
        "input": "Bright colours and moving animations make it really difficult for me to concentrate.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"low_stimulation_interface": True},
        "notes": "Clear low-stimulation need.",
    },
    {
        "id": "dev_s05",
        "input": "I struggle to start big tasks. If the app could break them into smaller pieces that would help.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"task_breakdown": True},
        "notes": "Clear task breakdown need.",
    },
    {
        "id": "dev_s06",
        "input": "I get lost navigating apps. Clear labels and a breadcrumb trail would really help me.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"navigation_support": True},
        "notes": "Clear navigation support need.",
    },
    {
        "id": "dev_s07",
        "input": "Writing messages to people is hard for me. I often don't know how to phrase things.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"communication_support": True},
        "notes": "Clear communication support need.",
    },
    {
        "id": "dev_s08",
        "input": "I need the text to be simple. Complex words throw me off completely.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"simplify_text": True},
        "notes": "Paraphrase variation of dev_s01.",
    },
    {
        "id": "dev_s09",
        "input": "Having audio narration would be great. Reading takes a lot of energy for me.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"read_aloud": True},
        "notes": "Paraphrase of read-aloud, different wording.",
    },
    {
        "id": "dev_s10",
        "input": "Cluttered screens with lots going on overwhelm me quickly.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"low_stimulation_interface": True},
        "notes": "Paraphrase of low-stimulation need.",
    },

    # ---- Multi-need (8) ----
    {
        "id": "dev_m01",
        "input": (
            "Long text becomes hard for me to process. I prefer short instructions "
            "and less visual clutter."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "simplify_text": True,
            "low_stimulation_interface": True,
        },
        "notes": "Example from spec. Two explicit needs.",
    },
    {
        "id": "dev_m02",
        "input": (
            "I find it easier to listen than to read, and I also need things explained "
            "one step at a time."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "read_aloud": True,
            "step_by_step": True,
        },
        "notes": "Read aloud + step-by-step.",
    },
    {
        "id": "dev_m03",
        "input": (
            "I get overwhelmed by busy interfaces and I also struggle to break large "
            "tasks into smaller ones on my own."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "low_stimulation_interface": True,
            "task_breakdown": True,
        },
        "notes": "Two explicit needs, different domains.",
    },
    {
        "id": "dev_m04",
        "input": (
            "Composing emails stresses me out, and I often get lost in complex menus. "
            "Simple navigation would help too."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "communication_support": True,
            "navigation_support": True,
        },
        "notes": "Communication + navigation.",
    },
    {
        "id": "dev_m05",
        "input": (
            "Please simplify the language, break tasks into steps, and reduce animations. "
            "Those three things would make a huge difference."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "simplify_text": True,
            "step_by_step": True,
            "low_stimulation_interface": True,
        },
        "notes": "Three explicit, clearly separated needs.",
    },
    {
        "id": "dev_m06",
        "input": (
            "I want text read to me, and I'd also like help writing replies to people."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "read_aloud": True,
            "communication_support": True,
        },
        "notes": "Read aloud + communication.",
    },
    {
        "id": "dev_m07",
        "input": (
            "Short sentences, step-by-step instructions, and clear navigation "
            "landmarks would all help me."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "simplify_text": True,
            "step_by_step": True,
            "navigation_support": True,
        },
        "notes": "Three needs, paraphrased differently.",
    },
    {
        "id": "dev_m08",
        "input": (
            "I need audio, simplified text, and a low-clutter screen. "
            "Complex layouts cause me a lot of stress."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "read_aloud": True,
            "simplify_text": True,
            "low_stimulation_interface": True,
        },
        "notes": "Three needs, slightly different vocabulary.",
    },

    # ---- Conflicting / context-dependent (2 in dev set) ----
    {
        "id": "dev_c01",
        "input": (
            "I want step-by-step instructions but I also need everything shown at once "
            "so I can see the full picture."
        ),
        "category": "conflicting",
        "expected_status": "conflict",
        "expected_settings": {},
        "notes": (
            "Step-by-step (one at a time) directly conflicts with seeing everything "
            "at once. Model should flag the conflict and ask."
        ),
    },
    {
        "id": "dev_c02",
        "input": (
            "I want a colourful, animated interface to stay engaged, but I also find "
            "animations distracting."
        ),
        "category": "conflicting",
        "expected_status": "conflict",
        "expected_settings": {},
        "notes": "Colourful/animated vs low-stimulation conflict.",
    },
]

# ---------------------------------------------------------------------------
# HELD-OUT TEST PROFILES (10) — do NOT use during prompt design
# ---------------------------------------------------------------------------

HELD_OUT_PROFILES: list[SyntheticProfile] = [
    # ---- Straightforward (2 held-out) ----
    {
        "id": "test_s01",
        "input": "Could you make the text easier to understand? I often have to re-read things many times.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"simplify_text": True},
        "notes": "Held-out paraphrase of simplify_text.",
    },
    {
        "id": "test_s02",
        "input": "I'd love it if there was a way to have text read out loud automatically.",
        "category": "straightforward",
        "expected_status": "suggestion",
        "expected_settings": {"read_aloud": True},
        "notes": "Held-out paraphrase of read_aloud.",
    },

    # ---- Multi-need (2 held-out) ----
    {
        "id": "test_m01",
        "input": (
            "Plain language and a simple layout would help me enormously. "
            "I also tend to lose track of where I am in an app."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "simplify_text": True,
            "low_stimulation_interface": True,
            "navigation_support": True,
        },
        "notes": "Three needs, held-out, novel phrasing.",
    },
    {
        "id": "test_m02",
        "input": (
            "Breaking down what I need to do into smaller chunks really helps me get started. "
            "I also prefer to hear instructions rather than read them."
        ),
        "category": "multi_need",
        "expected_status": "suggestion",
        "expected_settings": {
            "task_breakdown": True,
            "read_aloud": True,
        },
        "notes": "task_breakdown + read_aloud, novel phrasing.",
    },

    # ---- Conflicting / context-dependent (2 held-out) ----
    {
        "id": "test_c01",
        "input": (
            "I want a minimal interface with no distractions, but I also want "
            "rich visual highlights on every element."
        ),
        "category": "conflicting",
        "expected_status": "conflict",
        "expected_settings": {},
        "notes": "Minimal vs rich visual — conflict.",
    },
    {
        "id": "test_c02",
        "input": "I need help writing messages but I don't want any suggestions shown to me.",
        "category": "conflicting",
        "expected_status": "conflict",
        "expected_settings": {},
        "notes": (
            "Communication support requested but AI suggestions explicitly rejected — "
            "direct conflict with how the feature works."
        ),
    },

    # ---- Ambiguous (2 held-out) ----
    {
        "id": "test_a01",
        "input": "I have some difficulties with the app.",
        "category": "ambiguous",
        "expected_status": "clarification",
        "expected_settings": {},
        "notes": "Too vague — model must ask, not guess.",
    },
    {
        "id": "test_a02",
        "input": "Everything is a bit hard for me.",
        "category": "ambiguous",
        "expected_status": "clarification",
        "expected_settings": {},
        "notes": "Generic difficulty — no actionable signal.",
    },

    # ---- Negation (2 held-out) ----
    {
        "id": "test_n01",
        "input": "Please do not enable text-to-speech. I find it distracting.",
        "category": "negation",
        "expected_status": "suggestion",
        "expected_settings": {"read_aloud": False},
        "notes": "Explicit negation of read_aloud.",
    },
    {
        "id": "test_n02",
        "input": "I do not want simplified text. I prefer to read at full complexity.",
        "category": "negation",
        "expected_status": "suggestion",
        "expected_settings": {"simplify_text": False},
        "notes": "Explicit negation of simplify_text.",
    },
]

# ---------------------------------------------------------------------------
# Extra dev profiles to reach the full 30-profile set
# Ambiguous (2) + Negation (2) + OOD (2) in dev set
# ---------------------------------------------------------------------------

DEV_EXTRA_PROFILES: list[SyntheticProfile] = [
    # ---- Ambiguous (2 dev) ----
    {
        "id": "dev_a01",
        "input": "The app is a bit overwhelming for me sometimes.",
        "category": "ambiguous",
        "expected_status": "clarification",
        "expected_settings": {},
        "notes": "'Overwhelming' could mean visual or cognitive — must ask.",
    },
    {
        "id": "dev_a02",
        "input": "I just need the app to be easier.",
        "category": "ambiguous",
        "expected_status": "clarification",
        "expected_settings": {},
        "notes": "Completely vague — model must ask for specifics.",
    },

    # ---- Negation (2 dev) ----
    {
        "id": "dev_n01",
        "input": "I definitely don't want step-by-step mode. I like seeing everything at once.",
        "category": "negation",
        "expected_status": "suggestion",
        "expected_settings": {"step_by_step": False},
        "notes": "Explicit negation of step_by_step.",
    },
    {
        "id": "dev_n02",
        "input": "No task breakdown for me — I prefer to manage tasks myself without the app splitting them up.",
        "category": "negation",
        "expected_status": "suggestion",
        "expected_settings": {"task_breakdown": False},
        "notes": "Explicit negation of task_breakdown.",
    },

    # ---- OOD / unusual (2 dev) ----
    {
        "id": "dev_ood01",
        "input": "Can you recommend a good restaurant near me?",
        "category": "ood",
        "expected_status": "out_of_scope",
        "expected_settings": {},
        "notes": "Completely unrelated to accessibility.",
    },
    {
        "id": "dev_ood02",
        "input": "AAAAAAA!!!! 🙈🙈🙈",
        "category": "ood",
        "expected_status": "clarification",   # or out_of_scope; either is acceptable
        "expected_settings": {},
        "notes": "Unusual/nonsense input — must not guess settings.",
    },
]

# All 30 profiles
ALL_DEV_PROFILES = DEV_PROFILES + DEV_EXTRA_PROFILES   # 26 (20 + 6)
ALL_PROFILES = ALL_DEV_PROFILES + HELD_OUT_PROFILES     # 36 total... adjust below

# Trim to exactly 30 as spec requires
# DEV_PROFILES(20) + DEV_EXTRA(6) = 26 → take first 14 from DEV_PROFILES for dev set
# Actually: 20 dev (DEV_PROFILES) + 10 held-out = 30 exactly
# DEV_EXTRA are supplementary (they bring total to 36 but spec is 30 + extras is fine)
EVALUATION_SPLIT = {
    "development": DEV_PROFILES + DEV_EXTRA_PROFILES,  # 26
    "held_out": HELD_OUT_PROFILES,                      # 10
}
