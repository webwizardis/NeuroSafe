import json
import logging
import re
from typing import Any

import httpx
from pydantic import ValidationError

from app.config import get_settings
from app.schemas.profile_schema import ProfileSuggestion

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    pass


class LLMValidationError(LLMServiceError):
    pass


def _json_text(raw: str) -> str:
    raw = raw.strip()
    match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", raw, flags=re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else raw


def complete(system_prompt: str, user_text: str, *, json_mode: bool = False) -> str:
    settings = get_settings()
    if not settings.llm_model:
        raise LLMServiceError("LLM_MODEL is not configured.")
    payload = {
        "model": settings.llm_model,
        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_text}],
        "temperature": 0.2,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    try:
        response = httpx.post(
            f"{settings.llm_base_url.rstrip('/')}/chat/completions",
            json=payload,
            timeout=settings.llm_timeout_seconds,
        )
        response.raise_for_status()
        data: Any = response.json()
        content = data["choices"][0]["message"]["content"]
        if not isinstance(content, str) or not content.strip():
            raise ValueError("LM Studio returned empty or non-text content")
        return content
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
        logger.exception("LM Studio request failed")
        raise LLMServiceError(f"LM Studio request failed: {exc}") from exc


PROFILE_SYSTEM_PROMPT = """You are an accessibility settings assistant. Never diagnose or infer ADHD,
autism, or any condition. Use only explicit functional preferences. Suggestions require user approval.
Respect negation. If unclear ask one focused question; if contradictory report conflict; unrelated input is
out_of_scope. Do not invent evidence or confidence. Return JSON with status, optional message, and optional
settings: simplify_text, step_by_step, read_aloud, communication_support, low_stimulation_interface,
task_breakdown, navigation_support. Each setting has suggested_value, reason, evidence."""


def suggest_profile(user_input: str) -> ProfileSuggestion:
    raw = _json_text(complete(PROFILE_SYSTEM_PROMPT, user_input, json_mode=True))
    try:
        return ProfileSuggestion.model_validate(json.loads(raw))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise LLMValidationError(f"invalid profile JSON: {exc}") from exc
