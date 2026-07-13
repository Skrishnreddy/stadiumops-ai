import time
import logging
from typing import Dict, List
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from backend.app.core.config import settings
from backend.app.core.exceptions import RateLimitExceededException

logger = logging.getLogger("stadiumops")

# Simple IP-based sliding window rate limiter
class RateLimiter:
    def __init__(self, limit: int, window: int = 60):
        self.limit = limit
        self.window = window
        self.requests: Dict[str, List[float]] = {}

    def is_allowed(self, ip: str) -> bool:
        current_time = time.time()
        # Initialise if not present
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Filter out old requests outside the sliding window
        self.requests[ip] = [t for t in self.requests[ip] if current_time - t < self.window]
        
        # Check rate limit
        if len(self.requests[ip]) >= self.limit:
            return False
        
        self.requests[ip].append(current_time)
        return True

rate_limiter = RateLimiter(limit=settings.RATE_LIMIT_PER_MINUTE)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        
        # Add secure response headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response


class RateLimitingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Bypass rate limit check for health endpoint to prevent synthetic monitor failures
        if request.url.path == "/api/health":
            return await call_next(request)

        # Resolve client IP behind reverse proxies (like Render's load balancer)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown-ip"
        
        if not rate_limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit hit for IP: {client_ip} on path {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
            
        return await call_next(request)
