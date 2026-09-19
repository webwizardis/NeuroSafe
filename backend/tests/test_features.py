from unittest.mock import patch

from fastapi.testclient import TestClient

from app.server import app
from app.services.google_service import GoogleServiceError
from app.services.llm_service import LLMServiceError

client = TestClient(app)


def test_read_uses_google_vision_without_retaining_image():
    with patch("app.routes.features.read_image", return_value="Hello") as mocked:
        response = client.post("/api/read", files={"image": ("note.png", b"bytes", "image/png")})
    assert response.status_code == 200
    assert response.json() == {"text": "Hello", "source": "google_vision"}
    mocked.assert_called_once()


def test_read_rejects_non_image():
    response = client.post("/api/read", files={"image": ("note.txt", b"bytes", "text/plain")})
    assert response.status_code == 415


def test_explain_and_say_delegate_to_lm_studio():
    with patch("app.routes.features.complete", return_value="short answer") as complete:
        assert client.post("/api/explain", json={"text": "A long explanation"}).status_code == 200
        assert client.post("/api/say", json={"intent": "Ask for a break"}).status_code == 200
    assert complete.call_count == 2


def test_llm_feature_reports_unavailable():
    with patch("app.routes.features.complete", side_effect=LLMServiceError("offline")):
        response = client.post("/api/tasks/breakdown", json={"task": "Pack a bag"})
    assert response.status_code == 503


def test_calm_is_non_diagnostic():
    response = client.get("/api/calm")
    assert response.status_code == 200
    assert response.json()["steps"]


def test_routes_use_google_maps():
    expected = {"routes": [{"summary": "quiet"}], "source": "google_maps"}
    with patch("app.routes.features.route", return_value=expected) as route:
        response = client.post("/api/route", json={"origin": "A", "destination": "B"})
        alternative = client.post(
            "/api/route/alternative",
            json={"origin": "A", "destination": "B", "avoid": "highways"},
        )
    assert response.json() == expected
    assert alternative.json() == expected
    assert route.call_count == 2


def test_google_errors_are_explicit():
    with patch("app.routes.features.route", side_effect=GoogleServiceError("no key")):
        response = client.post("/api/route", json={"origin": "A", "destination": "B"})
    assert response.status_code == 503


def test_sos_requires_confirmation_and_does_not_auto_trigger():
    response = client.post("/api/sos", json={"message": "I need help"})
    assert response.status_code == 409
    confirmed = client.post("/api/sos", json={"message": "I need help", "confirmed": True})
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "confirmed"


def test_feature_request_validation():
    assert client.post("/api/explain", json={"text": ""}).status_code == 422
    assert client.post("/api/route", json={"origin": "A"}).status_code == 422
    assert client.post("/api/say", json={"intent": ""}).status_code == 422
