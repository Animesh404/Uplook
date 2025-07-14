#!/usr/bin/env python3
"""
Uplook Wellness API
Main entry point for the FastAPI application
"""

import uvicorn
from app.api.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 