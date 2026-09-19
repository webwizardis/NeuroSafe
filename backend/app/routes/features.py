from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import ValidationError

from app.schemas.profile_schema import (
    AlternativeRouteRequest, CalmResponse, GeneratedTextResponse, RouteRequest, RouteResponse,
    SayRequest, SOSRequest, SOSResponse, TaskBreakdownRequest, TextRequest, VisionReadResponse,
)
from app.services.google_service import GoogleServiceError, read_image, route
from app.services.llm_service import LLMServiceError, complete

router = APIRouter(prefix="/api", tags=["features"])


def _generate(instruction: str, text: str) -> GeneratedTextResponse:
    try:
        return GeneratedTextResponse(text=complete(instruction, text), source="lm_studio")
    except LLMServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/read", response_model=VisionReadResponse)
async def read_for_me(image: UploadFile = File(...)) -> VisionReadResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="An image upload is required.")
    try:
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="The image is empty.")
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="The image must be 10 MB or smaller.")
        return VisionReadResponse(text=read_image(content, image.content_type), source="google_vision")
    except GoogleServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/explain", response_model=GeneratedTextResponse)
def explain(request: TextRequest) -> GeneratedTextResponse:
    return _generate("Explain the supplied text simply without changing its meaning. Return only the explanation.", request.text)


@router.post("/say", response_model=GeneratedTextResponse)
def say(request: SayRequest) -> GeneratedTextResponse:
    context = f"\nContext: {request.context}" if request.context else ""
    return _generate("Help the user compose a respectful message. Do not send it. Return only the message.", request.intent + context)


@router.get("/calm", response_model=CalmResponse)
def calm() -> CalmResponse:
    return {"steps": ["Pause and notice one thing you can see.", "Take one slow breath.", "Choose one small next step."],
            "disclaimer": "This is a grounding prompt, not medical advice."}


@router.post("/tasks/breakdown", response_model=GeneratedTextResponse)
def breakdown(request: TaskBreakdownRequest) -> GeneratedTextResponse:
    return _generate("Break the task into clear, optional, small steps. Do not assume abilities or urgency. Return only the steps.", request.task)


@router.post("/route", response_model=RouteResponse)
def route_request(request: RouteRequest) -> RouteResponse:
    try:
        return RouteResponse.model_validate(route(request.origin, request.destination, request.mode))
    except (GoogleServiceError, ValidationError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/route/alternative", response_model=RouteResponse)
def alternative_route(request: AlternativeRouteRequest) -> RouteResponse:
    try:
        return RouteResponse.model_validate(route(request.origin, request.destination, request.mode, request.avoid))
    except (GoogleServiceError, ValidationError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/sos", response_model=SOSResponse)
def sos(request: SOSRequest) -> SOSResponse:
    if not request.confirmed:
        raise HTTPException(status_code=409, detail="SOS requires explicit confirmation.")
    return SOSResponse(status="confirmed", message=request.message, contact=request.contact)
