import base64
import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class GoogleServiceError(Exception):
    pass


def read_image(image: bytes, content_type: str) -> str:
    key = get_settings().google_vision_api_key
    if not key:
        raise GoogleServiceError("GOOGLE_VISION_API_KEY is not configured.")
    payload = {"requests": [{"image": {"content": base64.b64encode(image).decode()}, "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]}]}
    try:
        response = httpx.post(f"https://vision.googleapis.com/v1/images:annotate?key={key}", json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        error = data.get("responses", [{}])[0].get("error")
        if error:
            raise GoogleServiceError(error.get("message", "Google Vision error"))
        return data.get("responses", [{}])[0].get("fullTextAnnotation", {}).get("text", "")
    except (httpx.HTTPError, AttributeError, KeyError, IndexError, TypeError, ValueError) as exc:
        raise GoogleServiceError(f"Google Vision request failed: {exc}") from exc


def route(origin: str, destination: str, mode: str, avoid: str | None = None) -> dict:
    key = get_settings().google_maps_api_key
    if not key:
        raise GoogleServiceError("GOOGLE_MAPS_API_KEY is not configured.")
    params = {"origin": origin, "destination": destination, "mode": mode, "key": key}
    if avoid:
        params["avoid"] = avoid
    try:
        response = httpx.get("https://maps.googleapis.com/maps/api/directions/json", params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "OK":
            raise GoogleServiceError(data.get("error_message", data.get("status", "Google Maps error")))
        return {"routes": data.get("routes", []), "source": "google_maps"}
    except (httpx.HTTPError, AttributeError, KeyError, IndexError, ValueError, TypeError) as exc:
        raise GoogleServiceError(f"Google Maps request failed: {exc}") from exc
