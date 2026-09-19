import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.schemas.profile_schema import (
    ApproveProfileRequest, ProfileSuggestRequest, ProfileSuggestResponse, SavedProfile,
)
from app.services.llm_service import LLMServiceError, LLMValidationError, suggest_profile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/profile", tags=["profile"])
_profiles: dict[str, SavedProfile] = {}


@router.post("/suggest", response_model=ProfileSuggestResponse)
def suggest(request: ProfileSuggestRequest) -> ProfileSuggestResponse:
    try:
        return ProfileSuggestResponse(suggestion=suggest_profile(request.user_input))
    except LLMValidationError as exc:
        raise HTTPException(status_code=502, detail=f"AI returned invalid structured output: {exc}") from exc
    except LLMServiceError as exc:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {exc}") from exc


@router.post("/approve", response_model=SavedProfile, status_code=status.HTTP_201_CREATED)
def approve(request: ApproveProfileRequest) -> SavedProfile:
    profile = SavedProfile(
        profile_id=str(uuid.uuid4()),
        settings=dict(request.approved_settings),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    _profiles[profile.profile_id] = profile
    return profile


@router.get("/{profile_id}", response_model=SavedProfile)
def get_profile(profile_id: str) -> SavedProfile:
    profile = _profiles.get(profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found.")
    return profile
