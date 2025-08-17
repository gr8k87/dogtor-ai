from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal
import uuid
from datetime import datetime

Base = declarative_base()

class Case(Base):
    __tablename__ = "cases"
    
    case_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    image_url = Column(String, nullable=False)
    observations = Column(JSON, nullable=True)
    user_answers = Column(JSON, nullable=True)
    triage_summary = Column(JSON, nullable=True)
    status = Column(String, default="open")
    vet_shared = Column(Boolean, default=False)

# Pydantic models for API
class Observations(BaseModel):
    consistency: Literal["loose", "formed", "hard", "watery", "unknown"] = "unknown"
    color: Literal["brown", "yellow", "green", "black", "red", "tan", "unknown"] = "unknown"
    mucus: bool = False
    blood: Literal["none", "specks", "streaks", "visible"] = "none"
    foreign_material: Literal["none", "grass", "plastic", "undigested_food", "unknown"] = "none"
    notes: str = ""

class Question(BaseModel):
    id: str
    type: Literal["number", "select", "text"]
    label: str
    required: bool = False
    options: Optional[List[str]] = None

class GeminiResponse(BaseModel):
    observations: Observations
    questions: List[Question]

class TriageSummary(BaseModel):
    triage_summary: str
    possible_causes: List[str]
    recommended_actions: List[str]
    urgency_level: Literal["Low", "Moderate", "High"]

class CaseCreate(BaseModel):
    image_url: str

class CaseUpdate(BaseModel):
    observations: Optional[Dict] = None
    user_answers: Optional[Dict] = None
    triage_summary: Optional[Dict] = None
    status: Optional[str] = None
    vet_shared: Optional[bool] = None

class CaseResponse(BaseModel):
    case_id: str
    timestamp: datetime
    image_url: str
    observations: Optional[Dict] = None
    user_answers: Optional[Dict] = None
    triage_summary: Optional[Dict] = None
    status: str
    vet_shared: bool

    class Config:
        from_attributes = True

class CaseSummary(BaseModel):
    case_id: str
    timestamp: datetime
    image_url: str
    status: str
    summary_line: str

class ErrorResponse(BaseModel):
    error: Dict[str, str]

class UploadResponse(BaseModel):
    case_id: str
    image_url: str
