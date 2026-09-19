"""
Tests for Pydantic schemas.
No external calls; no real personal data.
"""

import pytest
from pydantic import ValidationError

from app.schemas.profile_schema import (
    ProfileSuggestion,
    SettingSuggestion,
    ProfileSuggestRequest,
    ApproveProfileRequest,
)


# ---------------------------------------------------------------------------
# SettingSuggestion
# ---------------------------------------------------------------------------

class TestSettingSuggestion:
    def test_valid(self):
        s = SettingSuggestion(
            suggested_value=True,
            reason="User mentioned difficulty with long text.",
            evidence="'Long text becomes hard for me to process'",
        )
        assert s.suggested_value is True

    def test_missing_reason_raises(self):
        with pytest.raises(ValidationError):
            SettingSuggestion(suggested_value=True, evidence="some evidence")

    def test_empty_reason_raises(self):
        with pytest.raises(ValidationError):
            SettingSuggestion(suggested_value=True, reason="", evidence="some evidence")


# ---------------------------------------------------------------------------
# ProfileSuggestion
# ---------------------------------------------------------------------------

class TestProfileSuggestion:
    def test_suggestion_status_no_message_needed(self):
        p = ProfileSuggestion(
            status="suggestion",
            simplify_text=SettingSuggestion(
                suggested_value=True,
                reason="User prefers short text.",
                evidence="'I prefer shorter sentences'",
            ),
        )
        assert p.status == "suggestion"
        assert p.simplify_text is not None

    def test_clarification_status(self):
        p = ProfileSuggestion(
            status="clarification",
            message="Could you tell me more about what makes the app difficult for you?",
        )
        assert p.status == "clarification"
        assert p.message is not None

    def test_conflict_status(self):
        p = ProfileSuggestion(
            status="conflict",
            message="You mentioned wanting step-by-step mode but also seeing everything at once — these conflict.",
        )
        assert p.status == "conflict"

    def test_out_of_scope_status(self):
        p = ProfileSuggestion(status="out_of_scope", message="This request is not related to accessibility settings.")
        assert p.status == "out_of_scope"

    def test_invalid_status_raises(self):
        with pytest.raises(ValidationError):
            ProfileSuggestion(status="unknown_status")

    def test_all_settings_none(self):
        p = ProfileSuggestion(status="suggestion")
        assert p.simplify_text is None
        assert p.task_breakdown is None

    def test_model_validate_from_dict(self):
        data = {
            "status": "suggestion",
            "simplify_text": {
                "suggested_value": True,
                "reason": "Prefers plain language.",
                "evidence": "short text",
            },
            "step_by_step": None,
            "read_aloud": None,
            "communication_support": None,
            "low_stimulation_interface": None,
            "task_breakdown": None,
            "navigation_support": None,
        }
        p = ProfileSuggestion.model_validate(data)
        assert p.simplify_text.suggested_value is True


# ---------------------------------------------------------------------------
# ProfileSuggestRequest
# ---------------------------------------------------------------------------

class TestProfileSuggestRequest:
    def test_valid(self):
        r = ProfileSuggestRequest(user_input="I prefer short sentences.")
        assert r.user_input == "I prefer short sentences."

    def test_empty_raises(self):
        with pytest.raises(ValidationError):
            ProfileSuggestRequest(user_input="")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValidationError):
            ProfileSuggestRequest(user_input="   ")

    def test_too_long_raises(self):
        with pytest.raises(ValidationError):
            ProfileSuggestRequest(user_input="x" * 2001)


# ---------------------------------------------------------------------------
# ApproveProfileRequest
# ---------------------------------------------------------------------------

class TestApproveProfileRequest:
    def test_valid(self):
        r = ApproveProfileRequest(
            approved_settings={"simplify_text": True, "read_aloud": False}
        )
        assert r.approved_settings["simplify_text"] is True

    def test_invalid_key_raises(self):
        with pytest.raises(ValidationError):
            ApproveProfileRequest(approved_settings={"unknown_setting": True})
