import logging
from typing import Dict, Any

def create_error_response(code: str, message: str) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        "error": {
            "code": code,
            "message": message
        }
    }

def setup_logging():
    """Setup structured logging for Cloud Run"""
    logging.basicConfig(
        level=logging.INFO,
        format='{"severity": "%(levelname)s", "message": "%(message)s", "timestamp": "%(asctime)s"}',
        datefmt='%Y-%m-%dT%H:%M:%S'
    )
