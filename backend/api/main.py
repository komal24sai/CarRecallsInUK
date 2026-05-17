# FastAPI API Endpoint: IsThisCarSafe Report Access
# Exposes prediction data based on user subscription levels.

import re
import time
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from backend.pipelines.gold_vehicle_report import get_vehicle_maintenance_report

app = FastAPI(
    title="IsThisCarSafe API",
    description="UK Vehicle Safety & Maintenance Prediction Engine Gateway",
    version="1.0.0"
)

# Simulated in-memory Redis fallback cache and rate limit tracker
CACHE_STORE = {}
RATE_LIMIT_STORE = {}

# UK License Plate formats (Current, Prefix, Suffix, and Dateless styles)
UK_PLATE_REGEX = re.compile(
    r"^([A-Z]{2}[0-9]{2}\s?[A-Z]{3}|[A-Z][0-9]{1,3}\s?[A-Z]{3}|[A-Z]{3}[0-9]{1,3}[A-Z]?|[0-9]{1,4}[A-Z]{1,2}|[A-Z]{1,2}[0-9]{1,4})$",
    re.IGNORECASE
)

def check_rate_limit(client_ip: str, is_paid: bool) -> bool:
    current_time = time.time()
    limit = 100 if is_paid else 10  # 100/min for paid, 10/min for free
    
    # Initialize tracker for client IP
    if client_ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[client_ip] = []
        
    # Clean up logs older than 60 seconds
    RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if current_time - t < 60]
    
    # Check threshold limit
    if len(RATE_LIMIT_STORE[client_ip]) >= limit:
        return False
        
    # Log current hit
    RATE_LIMIT_STORE[client_ip].append(current_time)
    return True

@app.get("/api/report/{registration}")
async def get_report(
    registration: str,
    request: Request,
    x_stripe_customer_id: Optional[str] = Header(None)
):
    client_ip = request.client.host
    is_paid = bool(x_stripe_customer_id and len(x_stripe_customer_id.strip()) > 0)

    # 1. Rate Limiting Verification
    if not check_rate_limit(client_ip, is_paid):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Paid accounts receive up to 100 requests per minute."
        )

    # 2. UK Registration Format Validation
    sanitized_reg = registration.replace(" ", "").upper()
    if not UK_PLATE_REGEX.match(sanitized_reg):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UK registration format. Acceptable forms include: AB12 CDE or A123 BCD."
        )

    # 3. Retrieve Cache (Try Redis / Local fallback)
    cache_key = f"report:{sanitized_reg}"
    current_time = time.time()
    
    if cache_key in CACHE_STORE:
        cached_data, timestamp = CACHE_STORE[cache_key]
        # Check if the cache is still valid (less than 24 hours old)
        if current_time - timestamp < 86400:
            full_report = cached_data
        else:
            full_report = get_vehicle_maintenance_report(sanitized_reg)
            CACHE_STORE[cache_key] = (full_report, current_time)
    else:
        full_report = get_vehicle_maintenance_report(sanitized_reg)
        CACHE_STORE[cache_key] = (full_report, current_time)

    # 4. Filter and Return Payload Based on Account Tier
    if is_paid:
        # Full Predictive Analytics Report
        return JSONResponse(content=full_report)
    else:
        # Free Tier: Basic MOT status & Recall counts only
        free_report = {
            "registration": full_report["registration"],
            "mot_due_date": full_report["mot_due_date"],
            "months_to_mot": full_report["months_to_mot"],
            "advisory_count": len(full_report["advisory_risks"]),
            "outstanding_recalls": 0,  # Table stakes recall counts
            "message": "Upgrade to our premium report (£2.99) to unlock predicted part failures, cost estimates, and urgency ratings."
        }
        return JSONResponse(content=free_report)

if __name__ == "__main__":
    import uvicorn
    # Start the API gateway
    uvicorn.run(app, host="0.0.0.0", port=8000)
