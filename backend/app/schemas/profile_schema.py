from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

SettingName = Literal[
    "simplify_text", "step_by_step", "read_aloud", "communication_support",
    "low_stimulation_interface", "task_breakdown", "navigation_support",
]


class SettingSuggestion(BaseModel):
    suggested_value: bool
    reason: str = Field(min_length=1, max_length=500)
    evidence: str = Field(min_length=1, max_length=1000)


class ProfileSuggestion(BaseModel):
    status: Literal["suggestion", "clarification", "conflict", "out_of_scope"]
    message: Optional[str] = Field(None, max_length=1000)
    simplify_text: Optional[SettingSuggestion] = None
    step_by_step: Optional[SettingSuggestion] = None
    read_aloud: Optional[SettingSuggestion] = None
    communication_support: Optional[SettingSuggestion] = None
    low_stimulation_interface: Optional[SettingSuggestion] = None
    task_breakdown: Optional[SettingSuggestion] = None
    navigation_support: Optional[SettingSuggestion] = None


class ProfileSuggestRequest(BaseModel):
    user_input: str = Field(min_length=1, max_length=2000)

    @field_validator("user_input")
    @classmethod
    def non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("user_input must not be blank")
        return value


class ProfileSuggestResponse(BaseModel):
    suggestion: ProfileSuggestion


class ApproveProfileRequest(BaseModel):
    approved_settings: dict[SettingName, bool] = Field(min_length=1)


class SavedProfile(BaseModel):
    profile_id: str
    settings: dict[str, bool]
    created_at: str


class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)

    @field_validator("text")
    @classmethod
    def non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class SayRequest(BaseModel):
    intent: str = Field(min_length=1, max_length=1000)
    context: Optional[str] = Field(None, max_length=5000)

    @field_validator("intent")
    @classmethod
    def intent_non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("intent must not be blank")
        return value


class TaskBreakdownRequest(BaseModel):
    task: str = Field(min_length=1, max_length=3000)

    @field_validator("task")
    @classmethod
    def task_non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("task must not be blank")
        return value


class RouteRequest(BaseModel):
    origin: str = Field(min_length=1, max_length=500)
    destination: str = Field(min_length=1, max_length=500)
    mode: Literal["walking", "driving", "transit", "bicycling"] = "walking"

    @field_validator("origin", "destination")
    @classmethod
    def location_non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("location must not be blank")
        return value


class AlternativeRouteRequest(RouteRequest):
    avoid: Optional[Literal["highways", "tolls", "ferries"]] = None


class SOSRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    contact: Optional[str] = Field(None, max_length=200)
    confirmed: bool = False


class VisionReadResponse(BaseModel):
    text: str
    source: Literal["google_vision"]


class GeneratedTextResponse(BaseModel):
    text: str
    source: Literal["lm_studio"]


class RouteResponse(BaseModel):
    routes: list[dict]
    source: Literal["google_maps"]


class CalmResponse(BaseModel):
    steps: list[str]
    disclaimer: str


class SOSResponse(BaseModel):
    status: Literal["confirmed"]
    message: str
    contact: Optional[str] = None
