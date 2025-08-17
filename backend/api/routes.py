import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from models import Case, CaseCreate, CaseResponse, CaseSummary, UploadResponse, ErrorResponse
from services.ai import ai_service
from services.storage import storage_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/cases/upload", response_model=UploadResponse)
async def upload_case_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload image and create new case"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file data
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Upload image
        image_url = await storage_service.upload_image(image_data, file.filename or "image.jpg")
        
        # Create case record
        case = Case(image_url=image_url)
        db.add(case)
        db.commit()
        db.refresh(case)
        
        logger.info(f"Created case {case.case_id} with image {image_url}")
        return UploadResponse(case_id=str(case.case_id), image_url=image_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "UPLOAD_FAILED",
                "message": "Failed to upload image"
            }
        })

@router.post("/cases/{case_id}/observations")
async def analyze_observations(
    case_id: str,
    db: Session = Depends(get_db)
):
    """Analyze image with Gemini and generate observations + questions"""
    try:
        # Get case
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Call Gemini AI service
        result = await ai_service.analyze_image_with_gemini(str(case.image_url))
        
        # Update case with observations and questions
        case.observations = result
        db.commit()
        
        logger.info(f"Generated observations for case {case_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Observations analysis failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "AI_ANALYSIS_FAILED",
                "message": "Failed to analyze image"
            }
        })

@router.post("/cases/{case_id}/answers")
async def submit_answers(
    case_id: str,
    answers: dict,
    db: Session = Depends(get_db)
):
    """Submit user answers to questions"""
    try:
        # Get case
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Update case with user answers
        case.user_answers = answers
        db.commit()
        db.refresh(case)
        
        logger.info(f"Updated answers for case {case_id}")
        return CaseResponse.from_orm(case)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Answer submission failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "ANSWER_SUBMISSION_FAILED", 
                "message": "Failed to submit answers"
            }
        })

@router.post("/cases/{case_id}/triage")
async def generate_triage(
    case_id: str,
    db: Session = Depends(get_db)
):
    """Generate triage summary using OpenAI"""
    try:
        # Get case
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        if case.observations is None or case.user_answers is None:
            raise HTTPException(status_code=400, detail="Case missing observations or answers")
        
        # Generate triage with OpenAI
        observations = case.observations.get('observations', {})
        triage_result = await ai_service.generate_triage_with_openai(
            observations, case.user_answers
        )
        
        # Update case with triage
        case.triage_summary = triage_result
        case.status = "closed"
        db.commit()
        
        logger.info(f"Generated triage for case {case_id}")
        return triage_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Triage generation failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "TRIAGE_FAILED",
                "message": "Failed to generate triage summary"
            }
        })

@router.get("/cases", response_model=List[CaseSummary])
async def list_cases(db: Session = Depends(get_db)):
    """List all cases with summaries"""
    try:
        cases = db.query(Case).order_by(Case.timestamp.desc()).all()
        
        summaries = []
        for case in cases:
            summary_line = "Analysis pending"
            if case.triage_summary is not None:
                summary_line = case.triage_summary.get('triage_summary', 'Analysis complete')[:100]
            
            summaries.append(CaseSummary(
                case_id=str(case.case_id),
                timestamp=case.timestamp,
                image_url=str(case.image_url),
                status=str(case.status or "open"),
                summary_line=summary_line
            ))
        
        return summaries
        
    except Exception as e:
        logger.error(f"List cases failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "LIST_FAILED",
                "message": "Failed to list cases"
            }
        })

@router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str, db: Session = Depends(get_db)):
    """Get full case details"""
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        return CaseResponse.from_orm(case)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get case failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": {
                "code": "GET_CASE_FAILED",
                "message": "Failed to retrieve case"
            }
        })
