"""
Integration tests for /api/profile/* routes.
LM Studio service is mocked throughout.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.server import app
from app.schemas.profile_schema import ProfileSuggestion, SettingSuggestion
from app.services.llm_service import LLMServiceError, LLMValidationError

client = TestClient(app)


def _suggestion(simplify_text_value: bool = True) -> ProfileSuggestion:
    return ProfileSuggestion(
        status="suggestion",
        simplify_text=SettingSuggestion(
            suggested_value=simplify_text_value,
            reason="User prefers short text.",
            evidence="I prefer shorter sentences",
        ),
    )


def _clarification() -> ProfileSuggestion:
    return ProfileSuggestion(
        status="clarification",
        message="Could you tell me more?",
    )


# ---------------------------------------------------------------------------
# POST /api/profile/suggest
# ---------------------------------------------------------------------------

class TestProfileSuggest:
    def test_returns_200_with_suggestion(self):
        with patch("app.routes.profile.suggest_profile", return_value=_suggestion()):
            resp = client.post(
                "/api/profile/suggest",
                json={"user_input": "I prefer shorter sentences."},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["suggestion"]["status"] == "suggestion"
        assert body["suggestion"]["simplify_text"]["suggested_value"] is True

    def test_returns_200_with_clarification(self):
        with patch("app.routes.profile.suggest_profile", return_value=_clarification()):
            resp = client.post(
                "/api/profile/suggest",
                json={"user_input": "Things are hard."},
            )
        assert resp.status_code == 200
        assert resp.json()["suggestion"]["status"] == "clarification"

    def test_returns_422_for_empty_input(self):
        resp = client.post("/api/profile/suggest", json={"user_input": ""})
        assert resp.status_code == 422

    def test_returns_422_for_missing_field(self):
        resp = client.post("/api/profile/suggest", json={})
        assert resp.status_code == 422

    def test_returns_422_for_too_long_input(self):
        resp = client.post(
            "/api/profile/suggest",
            json={"user_input": "x" * 2001},
        )
        assert resp.status_code == 422

    def test_returns_502_on_validation_error(self):
        with patch(
            "app.routes.profile.suggest_profile",
            side_effect=LLMValidationError("bad schema"),
        ):
            resp = client.post(
                "/api/profile/suggest",
                json={"user_input": "Some input"},
            )
        assert resp.status_code == 502

    def test_returns_503_on_service_error(self):
        with patch(
            "app.routes.profile.suggest_profile",
            side_effect=LLMServiceError("timeout"),
        ):
            resp = client.post(
                "/api/profile/suggest",
                json={"user_input": "Some input"},
            )
        assert resp.status_code == 503


# ---------------------------------------------------------------------------
# POST /api/profile/approve + GET /api/profile/{id}
# ---------------------------------------------------------------------------

class TestProfileApproveAndGet:
    def test_approve_returns_201_with_profile_id(self):
        resp = client.post(
            "/api/profile/approve",
            json={"approved_settings": {"simplify_text": True, "read_aloud": False}},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert "profile_id" in body
        assert body["settings"]["simplify_text"] is True

    def test_get_returns_saved_profile(self):
        # Save first
        save_resp = client.post(
            "/api/profile/approve",
            json={"approved_settings": {"task_breakdown": True}},
        )
        profile_id = save_resp.json()["profile_id"]

        # Retrieve
        get_resp = client.get(f"/api/profile/{profile_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["settings"]["task_breakdown"] is True

    def test_get_unknown_id_returns_404(self):
        resp = client.get("/api/profile/nonexistent-id")
        assert resp.status_code == 404

    def test_approve_rejects_invalid_setting_key(self):
        resp = client.post(
            "/api/profile/approve",
            json={"approved_settings": {"nonexistent_setting": True}},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
