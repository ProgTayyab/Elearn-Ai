from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="NeuralLearn ML Service")


class RiskPredictionInput(BaseModel):
    progress: float = Field(ge=0, le=1)
    avgScore: float = Field(ge=0, le=100)
    studyMinutes: int = Field(ge=0)
    streak: int = Field(ge=0)


class RiskPredictionOutput(BaseModel):
    riskScore: float
    riskLevel: str
    confidence: float
    factors: list[str]


def _predict_risk(payload: RiskPredictionInput) -> RiskPredictionOutput:
    # Weighted heuristic to emulate a lightweight model prediction.
    risk_score = (
        (1 - payload.progress) * 0.45
        + ((100 - payload.avgScore) / 100) * 0.35
        + (1 / (1 + (payload.studyMinutes / 300))) * 0.12
        + (1 / (1 + payload.streak)) * 0.08
    )

    risk_score = max(0.0, min(1.0, risk_score))

    if risk_score >= 0.67:
        risk_level = "High"
    elif risk_score >= 0.4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    factors = []
    if payload.progress < 0.4:
        factors.append("Low module completion progress")
    if payload.avgScore < 65:
        factors.append("Low recent quiz scores")
    if payload.studyMinutes < 120:
        factors.append("Low study time")
    if payload.streak < 3:
        factors.append("Short study streak")
    if not factors:
        factors.append("Consistent learning indicators")

    confidence = 0.65 + min(0.3, abs(risk_score - 0.5))

    return RiskPredictionOutput(
        riskScore=round(risk_score, 3),
        riskLevel=risk_level,
        confidence=round(confidence, 3),
        factors=factors,
    )


@app.get("/")
async def root():
    return {"message": "NeuralLearn ML Service is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict/risk", response_model=RiskPredictionOutput)
async def predict_risk(payload: RiskPredictionInput):
    return _predict_risk(payload)
