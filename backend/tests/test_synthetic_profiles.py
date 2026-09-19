"""
Tests that validate the synthetic evaluation dataset itself.
These do NOT call external services — they check the dataset is well-formed.
"""

import pytest
from tests.synthetic_profiles import (
    DEV_PROFILES,
    DEV_EXTRA_PROFILES,
    HELD_OUT_PROFILES,
    ALL_DEV_PROFILES,
)

VALID_STATUSES = {"suggestion", "clarification", "conflict", "out_of_scope"}
VALID_SETTING_KEYS = {
    "simplify_text",
    "step_by_step",
    "read_aloud",
    "communication_support",
    "low_stimulation_interface",
    "task_breakdown",
    "navigation_support",
}
VALID_CATEGORIES = {
    "straightforward",
    "multi_need",
    "conflicting",
    "ambiguous",
    "ood",
    "negation",
}


@pytest.mark.parametrize(
    "profile",
    DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES,
    ids=[p["id"] for p in DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES],
)
def test_profile_is_well_formed(profile):
    assert profile["id"], "id must not be empty"
    assert profile["input"].strip(), "input must not be empty"
    assert profile["category"] in VALID_CATEGORIES, f"unknown category: {profile['category']}"
    assert profile["expected_status"] in VALID_STATUSES, f"unknown status: {profile['expected_status']}"
    for key in profile["expected_settings"]:
        assert key in VALID_SETTING_KEYS, f"unknown setting key: {key}"
    assert isinstance(profile["notes"], str)


def test_dev_profiles_count():
    assert len(DEV_PROFILES) == 20


def test_extra_profiles_count():
    assert len(DEV_EXTRA_PROFILES) == 6


def test_held_out_profiles_count():
    assert len(HELD_OUT_PROFILES) == 10


def test_all_ids_unique():
    all_profiles = DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES
    ids = [p["id"] for p in all_profiles]
    assert len(ids) == len(set(ids)), "Duplicate profile IDs found"


def test_held_out_not_in_dev():
    dev_ids = {p["id"] for p in ALL_DEV_PROFILES}
    for p in HELD_OUT_PROFILES:
        assert p["id"] not in dev_ids, f"Held-out profile {p['id']} found in dev set"


def test_negation_profiles_have_false_setting():
    """Negation profiles must have at least one expected setting = False."""
    negation = [
        p for p in DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES
        if p["category"] == "negation"
    ]
    for p in negation:
        assert any(v is False for v in p["expected_settings"].values()), (
            f"Negation profile {p['id']} has no expected False setting"
        )


def test_conflicting_profiles_expect_conflict_status():
    conflicting = [
        p for p in DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES
        if p["category"] == "conflicting"
    ]
    for p in conflicting:
        assert p["expected_status"] == "conflict", (
            f"Conflicting profile {p['id']} expects {p['expected_status']}, not 'conflict'"
        )


def test_ambiguous_profiles_expect_clarification():
    ambiguous = [
        p for p in DEV_PROFILES + DEV_EXTRA_PROFILES + HELD_OUT_PROFILES
        if p["category"] == "ambiguous"
    ]
    for p in ambiguous:
        assert p["expected_status"] == "clarification", (
            f"Ambiguous profile {p['id']} expects {p['expected_status']}, not 'clarification'"
        )
